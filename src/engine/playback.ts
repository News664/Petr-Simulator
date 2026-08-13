import { factionRoles, factionState } from './factions.js';
import type { ContentBundle } from './content/load.js';
import { runSimulation, type RunResult } from './simulation.js';
import type { SetupPolicy } from './setup.js';
import {
  VISIBLE_STATS,
  type EndingRecord,
  type EventOccurrence,
  type FactionLifecycleState,
  type Material,
  type RunState,
  type SpeciesId,
  type VisibleStat,
} from './types.js';

/**
 * Precomputed playback.
 *
 * The whole life is simulated once, synchronously, and each year is captured as an
 * immutable presentation frame. The UI then reveals frames on a timer, so
 * pause/1x/2x can only change *when* a frame is shown — never what it contains,
 * and never the RNG. React never touches `RunState`.
 *
 * Every mutable structure is copied at capture time. Holding a reference to the
 * live `flags` Set or `schedules` array would let the final state of the run leak
 * backwards into earlier frames, which is exactly the hidden-state leak the
 * technical contract forbids.
 */

export interface SerializableSchedule {
  eventId: string;
  earliestAge: number;
  latestAge: number;
  priority: string;
  priorityOrder: number;
  createdByEventId: string;
}

/** Developer-only view of a single year. Never rendered in normal mode. */
export interface PlaybackFrameDev {
  fix: number;
  registeredSpecies: string;
  priorMaterials: Material[];
  flags: string[];
  routeFlags: string[];
  schedules: SerializableSchedule[];
  factionStates: Record<string, FactionLifecycleState>;
  factionRoles: Record<string, string[]>;
}

export interface PlaybackFrame {
  age: number;
  occurrence: EventOccurrence;
  statsBefore: Record<VisibleStat, number>;
  statsAfter: Record<VisibleStat, number>;
  statDelta: Partial<Record<VisibleStat, number>>;
  materialBefore: Material;
  materialAfter: Material;
  /** Threshold talents that fired during this year, in activation order. */
  triggeredTalentIdsThisAge: string[];
  /** The ending record, present only on the final frame of a completed life. */
  endingAfter: EndingRecord | null;
  dev: PlaybackFrameDev;
}

export type PlaybackOutcome =
  | { kind: 'ended'; ending: EndingRecord }
  | { kind: 'nonterminal'; reachedAge: number }
  | { kind: 'coverage_error'; age: number; message: string };

export interface PlaybackLife {
  seed: string;
  contentVersion: string;
  species: SpeciesId;
  registeredSpecies: string;
  draftedTalents: string[];
  chosenTalents: string[];
  allocation: Record<VisibleStat, number>;
  /** Stats after species modifiers and start talents, before age 0 resolves. */
  startingStats: Record<VisibleStat, number>;
  frames: PlaybackFrame[];
  outcome: PlaybackOutcome;
}

function visibleStats(state: RunState): Record<VisibleStat, number> {
  const out = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) out[stat] = state.stats[stat];
  return out;
}

function statDelta(
  before: Record<VisibleStat, number>,
  after: Record<VisibleStat, number>,
): Partial<Record<VisibleStat, number>> {
  const delta: Partial<Record<VisibleStat, number>> = {};
  for (const stat of VISIBLE_STATS) {
    const change = after[stat] - before[stat];
    if (change !== 0) delta[stat] = change;
  }
  return delta;
}

function devSnapshot(state: RunState, content: ContentBundle): PlaybackFrameDev {
  const factionStates: Record<string, FactionLifecycleState> = {};
  const roles: Record<string, string[]> = {};
  for (const faction of content.factions.values()) {
    factionStates[faction.shortName] = factionState(state.flags, faction);
    roles[faction.shortName] = factionRoles(state.flags, faction);
  }
  const flags = [...state.flags].sort();
  return {
    fix: state.stats.FIX,
    registeredSpecies: state.registeredSpecies,
    priorMaterials: [...state.priorMaterials],
    flags,
    routeFlags: flags.filter((flag) => flag.startsWith('ROUTE_')),
    schedules: state.schedules.map((schedule) => ({
      eventId: schedule.eventId,
      earliestAge: schedule.earliestAge,
      latestAge: schedule.latestAge,
      priority: schedule.priority,
      priorityOrder: schedule.priorityOrder,
      createdByEventId: schedule.createdByEventId,
    })),
    factionStates,
    factionRoles: roles,
  };
}

/**
 * Runs one complete life and returns its immutable frames.
 *
 * `onBeforeYear` records the pre-event stats and material so each frame can show
 * a delta; `onYear` captures everything after the year fully resolved, including
 * any threshold talents that fired in it.
 */
export function computePlayback(
  seed: string,
  content: ContentBundle,
  policy: SetupPolicy,
  options: { maxAge?: number } = {},
): PlaybackLife {
  const frames: PlaybackFrame[] = [];
  let statsBefore: Record<VisibleStat, number> | null = null;
  let materialBefore: Material = 'NONE';
  let talentActivationsSeen = 0;
  let startingStats: Record<VisibleStat, number> | null = null;

  const result: RunResult = runSimulation(seed, content, policy, {
    ...(options.maxAge !== undefined ? { maxAge: options.maxAge } : {}),
    onBeforeYear: (state) => {
      if (startingStats === null) startingStats = visibleStats(state);
      statsBefore = visibleStats(state);
      materialBefore = state.material;
    },
    onYear: (occurrence, state) => {
      const before = statsBefore ?? visibleStats(state);
      const after = visibleStats(state);
      // Activations are appended to a growing array; take only this year's tail.
      const activations = state.diagnostics.talentActivations;
      const triggered = activations.slice(talentActivationsSeen).map((entry) => entry.talentId);
      talentActivationsSeen = activations.length;

      frames.push({
        age: occurrence.age,
        occurrence: { ...occurrence },
        statsBefore: before,
        statsAfter: after,
        statDelta: statDelta(before, after),
        materialBefore,
        materialAfter: state.material,
        triggeredTalentIdsThisAge: triggered,
        // A copy: the live record would otherwise appear on earlier frames too.
        endingAfter: state.ending ? { ...state.ending } : null,
        dev: devSnapshot(state, content),
      });
      statsBefore = null;
    },
  });

  const outcome: PlaybackOutcome =
    result.outcome.kind === 'ended'
      ? { kind: 'ended', ending: { ...result.outcome.ending } }
      : result.outcome.kind === 'nonterminal'
        ? { kind: 'nonterminal', reachedAge: result.outcome.reachedAge }
        : { kind: 'coverage_error', age: result.outcome.age, message: result.outcome.message };

  const allocation = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) allocation[stat] = result.setup.allocation[stat];

  return {
    seed,
    contentVersion: content.contentVersion,
    species: result.setup.species,
    registeredSpecies: result.state.registeredSpecies,
    draftedTalents: [...result.setup.draftedTalents],
    chosenTalents: [...result.setup.chosenTalents],
    allocation,
    startingStats: startingStats ?? ({ CHR: 0, INT: 0, STR: 0, MNY: 0, SPR: 0 } as Record<VisibleStat, number>),
    frames,
    outcome,
  };
}
