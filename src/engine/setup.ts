import type { ContentBundle } from './content/load.js';
import { Rng } from './rng.js';
import { applyStatEffects, clampStat } from './state.js';
import { applyStartTalents, evaluateThresholdTalents, initDormantTalents, validateTalentSelection } from './talents.js';
import {
  ALL_STATS,
  SPECIES_IDS,
  VISIBLE_STATS,
  type RunSetup,
  type RunState,
  type SpeciesId,
  type VisibleStat,
} from './types.js';

/**
 * Setup flow. Contract section 5, in the authoritative order:
 *
 *   1. create/reincarnate run seed
 *   2. roll one species
 *   3. draft 10 distinct talents
 *   4. choose exactly 3 talents
 *   5. allocate starting visible attributes
 *   6. apply species modifiers
 *   7. apply unconditional/start talent effects
 *   8. evaluate dormant threshold talents until stable
 *   9. begin life at age 0
 *
 * Steps 2-5 are the only player decisions in the game. In headless simulation
 * they are made by a seeded policy so a run is fully described by its seed plus
 * its scenario.
 */

export const TALENT_DRAFT_SIZE = 10;
export const TALENT_CHOICE_SIZE = 3;

export type AllocationPolicy =
  | { kind: 'seeded_random' }
  | { kind: 'even' }
  | { kind: 'explicit'; allocation: Record<VisibleStat, number> };

export type SpeciesPolicy = { kind: 'seeded_random' } | { kind: 'fixed'; species: SpeciesId };

export type TalentPolicy =
  | { kind: 'none' }
  | { kind: 'seeded_random_compatible' }
  | { kind: 'fixed'; talents: string[] };

export interface SetupPolicy {
  species: SpeciesPolicy;
  talents: TalentPolicy;
  allocation: AllocationPolicy;
  /** Completed prior-run event IDs, exposed to AEVT. */
  priorRunEventIds?: string[];
  reincarnationCount?: number;
  achievements?: string[];
}

export class SetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SetupError';
  }
}

function rollSpecies(rng: Rng, policy: SpeciesPolicy): SpeciesId {
  if (policy.kind === 'fixed') return policy.species;
  return rng.pick(SPECIES_IDS);
}

/** Draft 10 distinct talents. Uniform because meta/rarity draw weights are not frozen. */
export function draftTalents(rng: Rng, content: ContentBundle, size = TALENT_DRAFT_SIZE): string[] {
  const pool = [...content.talents.keys()].sort();
  if (pool.length < size) throw new SetupError(`talent registry has fewer than ${size} talents`);
  return rng.shuffled(pool).slice(0, size);
}

/**
 * Picks `count` mutually compatible talents from the draft. Walks the drafted
 * order and skips any talent incompatible with one already taken, which is the
 * behaviour an auto-picking player would have.
 */
export function chooseCompatibleTalents(
  content: ContentBundle,
  drafted: readonly string[],
  count = TALENT_CHOICE_SIZE,
): string[] {
  const chosen: string[] = [];
  for (const id of drafted) {
    if (chosen.length >= count) break;
    const talent = content.talents.get(id);
    if (!talent) continue;
    if (talent.incompatibleWith.some((other) => chosen.includes(other))) continue;
    chosen.push(id);
  }
  if (chosen.length < count) {
    throw new SetupError(`could not choose ${count} compatible talents from draft [${drafted.join(', ')}]`);
  }
  return chosen;
}

/**
 * Distributes the species' free allocation points across the five visible stats
 * within the configured 0-10 pre-modifier range.
 */
export function allocateStats(
  rng: Rng,
  content: ContentBundle,
  points: number,
  policy: AllocationPolicy,
): Record<VisibleStat, number> {
  const range = content.adapters.engineRules.startingAllocationRange;
  const allocation: Record<VisibleStat, number> = { CHR: range.min, INT: range.min, STR: range.min, MNY: range.min, SPR: range.min };

  if (policy.kind === 'explicit') {
    const total = VISIBLE_STATS.reduce((sum, stat) => sum + policy.allocation[stat], 0);
    if (total !== points) {
      throw new SetupError(`explicit allocation totals ${total}, expected ${points}`);
    }
    for (const stat of VISIBLE_STATS) {
      const value = policy.allocation[stat];
      if (value < range.min || value > range.max) {
        throw new SetupError(`explicit allocation ${stat}=${value} outside ${range.min}-${range.max}`);
      }
      allocation[stat] = value;
    }
    return allocation;
  }

  const capacity = VISIBLE_STATS.length * (range.max - range.min);
  const budget = points - VISIBLE_STATS.length * range.min;
  if (budget < 0 || budget > capacity) {
    throw new SetupError(`${points} allocation points cannot fit in ${VISIBLE_STATS.length} stats of ${range.min}-${range.max}`);
  }

  if (policy.kind === 'even') {
    let remaining = budget;
    // Deterministic round-robin so `even` is reproducible without the RNG.
    while (remaining > 0) {
      for (const stat of VISIBLE_STATS) {
        if (remaining === 0) break;
        if (allocation[stat] >= range.max) continue;
        allocation[stat] += 1;
        remaining -= 1;
      }
    }
    return allocation;
  }

  let remaining = budget;
  while (remaining > 0) {
    const open = VISIBLE_STATS.filter((stat) => allocation[stat] < range.max);
    const stat = rng.pick(open);
    allocation[stat] += 1;
    remaining -= 1;
  }
  return allocation;
}

function resolveRegisteredSpecies(rng: Rng, content: ContentBundle, species: SpeciesId, talents: readonly string[]): string {
  let registered: string = species;
  // Deterministic order so two talents with rules cannot race.
  for (const id of [...talents].sort()) {
    const rule = content.adapters.talentAdapters[id]?.registeredSpeciesRule;
    if (!rule) continue;
    if (rule === 'UNREGISTERED') {
      registered = 'UNREGISTERED';
    } else if (rule === 'SEEDED_OTHER_SPECIES') {
      const others = SPECIES_IDS.filter((s) => s !== species);
      registered = rng.pick(others);
    }
  }
  return registered;
}

export function emptyDiagnostics(): RunState['diagnostics'] {
  return {
    fallbackYears: [],
    priorityCollisionAges: [],
    displacementCount: 0,
    expiredSchedules: [],
    coverageDefectAges: [],
    emergencyReuseAges: [],
    talentActivations: [],
    firstManifestationFamily: null,
    firstManifestationAge: null,
    manifestationFamilies: [],
    firstHintFamily: null,
    firstHintAge: null,
    hintFamilies: [],
    commitmentAge: null,
    routeEntries: [],
    routeClimaxes: [],
  };
}

export interface SetupResult {
  state: RunState;
  setup: RunSetup;
  /** RNG positioned after setup; the annual loop continues from here. */
  rng: Rng;
}

export function createRun(seed: string, content: ContentBundle, policy: SetupPolicy): SetupResult {
  // Step 1: run seed.
  const rng = Rng.fromSeed(`${content.contentVersion}:${seed}`);

  // Step 2: roll one species.
  const species = rollSpecies(rng, policy.species);
  const speciesDef = content.species.get(species);
  if (!speciesDef) throw new SetupError(`unknown species ${species}`);

  // Steps 3-4: draft 10, choose 3.
  let drafted: string[] = [];
  let chosen: string[] = [];
  if (policy.talents.kind === 'none') {
    drafted = draftTalents(rng, content);
    chosen = [];
  } else if (policy.talents.kind === 'fixed') {
    drafted = draftTalents(rng, content);
    chosen = [...policy.talents.talents];
    // A targeted scenario must still be a legal selection.
    validateTalentSelection(content, chosen);
    for (const id of chosen) if (!drafted.includes(id)) drafted.push(id);
  } else {
    drafted = draftTalents(rng, content);
    chosen = chooseCompatibleTalents(content, drafted);
  }
  validateTalentSelection(content, chosen);

  // Step 5: allocate starting visible attributes.
  const allocation = allocateStats(rng, content, speciesDef.allocation_points, policy.allocation);

  const state: RunState = {
    age: 0,
    stats: { CHR: 0, INT: 0, STR: 0, MNY: 0, SPR: 0, FIX: content.adapters.startingFIX.base },
    species,
    registeredSpecies: species,
    material: 'NONE',
    priorMaterials: [],
    flags: new Set(),
    talents: new Set(chosen),
    triggeredTalents: new Set(),
    dormantTalents: new Set(),
    history: [],
    eventIdsThisRun: new Set(),
    priorRunEventIds: new Set(policy.priorRunEventIds ?? []),
    achievements: new Set(policy.achievements ?? []),
    reincarnationCount: policy.reincarnationCount ?? 0,
    repeats: new Map(),
    schedules: [],
    scheduleSeq: 0,
    ending: null,
    diagnostics: emptyDiagnostics(),
  };

  for (const stat of VISIBLE_STATS) state.stats[stat] = allocation[stat];

  // Step 6: apply species modifiers.
  applyStatEffects(state, content.adapters, speciesDef.modifiers);

  state.registeredSpecies = resolveRegisteredSpecies(rng, content, species, chosen);

  initDormantTalents(state, content);

  // Checkpoint 1: after starting allocation/species.
  evaluateThresholdTalents(state, content);

  // Step 7: apply unconditional/start talent effects.
  applyStartTalents(state, content);

  // Step 8: checkpoint 2 — evaluate dormant threshold talents until stable.
  evaluateThresholdTalents(state, content);

  // Clamp once more in case start effects pushed FIX below its floor.
  for (const stat of ALL_STATS) state.stats[stat] = clampStat(content.adapters, stat, state.stats[stat]);

  // Step 9: life begins at age 0.
  state.age = 0;

  return {
    state,
    rng,
    setup: {
      seed,
      species,
      draftedTalents: drafted,
      chosenTalents: chosen,
      allocation,
      priorRunEventIds: policy.priorRunEventIds ?? [],
      reincarnationCount: policy.reincarnationCount ?? 0,
      achievements: policy.achievements ?? [],
    },
  };
}
