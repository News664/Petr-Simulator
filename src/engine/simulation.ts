import { evaluateCondition } from './conditions/evaluate.js';
import type { ContentBundle } from './content/load.js';
import { draftNormalEvent, EmptyPoolError } from './drafting.js';
import { buildEndingRecord } from './endings.js';
import { eligibleFallbackEvents, materialLockAllows, selectVariantIndex } from './eligibility.js';
import type { Rng } from './rng.js';
import {
  addSchedules,
  consumeSchedule,
  expireSchedules,
  rankCandidates,
  scheduleCandidates,
} from './schedules.js';
import { createRun, type SetupPolicy } from './setup.js';
import { applyStatEffects, conditionContext, recordOccurrence } from './state.js';
import { evaluateThresholdTalents } from './talents.js';
import type {
  EventOccurrence,
  GameEvent,
  Material,
  RunOutcome,
  RunSetup,
  RunState,
  SchedulePriority,
} from './types.js';

/**
 * The annual simulation loop. Contract section 8:
 *
 *   1. advance to target age
 *   2. resolve highest-priority valid committed/scheduled event if one exists
 *   3. otherwise build current channel weights
 *   4. choose eligible channel
 *   5. choose eligible family
 *   6. choose eligible event
 *   7. choose first matching automatic variant
 *   8. append exactly one visible event text
 *   9. apply effects
 *  10. apply flags/material/schedules
 *  11. resolve ending if the event is terminal
 *  12. otherwise evaluate threshold talents until stable
 *  13. persist state
 *  14. continue
 *
 * Exactly one visible timeline entry is produced per age. Internal variant
 * resolution, flag changes, scheduling and material commitment never add a
 * second entry for the same year.
 */

export class ContentCoverageError extends Error {
  readonly age: number;

  constructor(age: number) {
    super(
      `content coverage defect: no eligible non-fallback event at age ${age}; ` +
        'a generic quiet-year fallback is not legal before age 25',
    );
    this.name = 'ContentCoverageError';
    this.age = age;
  }
}

export interface SimulationOptions {
  /** Diagnostic maximum age. At this age without an ending the run is nonterminal. */
  maxAge?: number;
  /** Throw instead of recording a coverage defect. Default: record and stop. */
  strictCoverage?: boolean;
  /** Optional per-year observer for tests and tracing. */
  onYear?: (occurrence: EventOccurrence, state: RunState) => void;
}

interface YearSelection {
  event: GameEvent;
  source: EventOccurrence['source'];
  /** Set when the event came from a schedule. */
  firedSchedulePriority?: SchedulePriority;
}

function selectYearEvent(state: RunState, content: ContentBundle, rng: Rng): YearSelection {
  // Step 2: priority classes 1-3 all arrive through the schedule queue.
  const candidates = scheduleCandidates(state, content);
  if (candidates.length > 0) {
    if (candidates.length > 1) {
      state.diagnostics.priorityCollisionAges.push(state.age);
      // Every candidate but the winner is displaced and stays pending.
      state.diagnostics.displacementCount += candidates.length - 1;
    }
    const winner = rankCandidates(candidates)[0]!;
    consumeSchedule(state, winner.schedule);
    return {
      event: winner.event,
      source: winner.schedule.priority,
      firedSchedulePriority: winner.schedule.priority,
    };
  }

  // Steps 3-6: normal hierarchical draft.
  try {
    const trace = draftNormalEvent(state, content, rng);
    return { event: content.eventsById.get(trace.chosenEventId)!, source: 'normal' };
  } catch (error) {
    if (!(error instanceof EmptyPoolError)) throw error;
  }

  // Taxonomy v0.2 fallback rule: below the fallback minimum age an empty pool is
  // a content coverage defect, not a quiet year.
  const minimumAge = content.balance.fallback.minimumAge;
  if (state.age < minimumAge) {
    const rescued = pre25EmergencyEvent(state, content, rng);
    if (rescued) return rescued;
    throw new ContentCoverageError(state.age);
  }

  const fallbacks = eligibleFallbackEvents(state, content);
  if (fallbacks.length === 0) throw new ContentCoverageError(state.age);
  const chosen = fallbacks.length === 1 ? fallbacks[0]! : rng.pick(fallbacks);
  state.diagnostics.fallbackYears.push(state.age);
  return { event: chosen, source: 'fallback' };
}

/**
 * Diagnostic-only pre-25 rescue. Off unless the adapter selects
 * `reuse_baseline_repeatables`.
 *
 * Ages 0-5 of the current content slice provide exactly six event-years for six
 * years of life, so ordinary weighted drafting runs the band dry whenever the
 * one repeatable baseline event lands on the wrong parity (CONFLICT C-5). This
 * policy re-drafts from `baseline`-tagged repeatable events while ignoring
 * repeatCooldownYears and repeatMaxCount, purely so the remaining Phase-1
 * metrics stay measurable. It never emits a fallback_only event before the
 * fallback minimum age, and it never modifies content.
 */
function pre25EmergencyEvent(state: RunState, content: ContentBundle, rng: Rng): YearSelection | null {
  if (content.adapters.engineRules.pre25CoveragePolicy !== 'reuse_baseline_repeatables') return null;
  const routeTag = content.adapters.engineRules.pre25CoverageReuseRouteTag;
  const ctx = conditionContext(state);
  const pool = content.events.filter((event) => {
    if (event.selectionMode !== 'random') return false;
    if (event.repeatPolicy !== 'repeatable') return false;
    if (!event.routeTags.includes(routeTag)) return false;
    if (state.age < event.age.min) return false;
    if (event.age.max !== null && state.age > event.age.max) return false;
    // Reuse ignores cooldown/max count but nothing else: the event must still be
    // age-legal, condition-legal and material-legal.
    const record = state.repeats.get(event.id);
    if (record && state.age - record.lastAge < 1) return false;
    if (!materialLockAllows(event, state.material)) return false;
    if (!evaluateCondition(event.include, ctx)) return false;
    if (evaluateCondition(event.exclude, ctx)) return false;
    return true;
  });
  if (pool.length === 0) return null;
  const sorted = pool.slice().sort((a, b) => a.id.localeCompare(b.id));
  const chosen = sorted.length === 1 ? sorted[0]! : rng.pick(sorted);
  state.diagnostics.emergencyReuseAges.push(state.age);
  return { event: chosen, source: 'normal' };
}

function trackMaterialFlag(state: RunState, content: ContentBundle, flag: string): void {
  const { hint, manifestation } = content.adapters.materialFlagPrefixes;
  if (flag.startsWith(hint)) {
    const family = flag.slice(hint.length);
    if (!state.diagnostics.hintFamilies.includes(family)) state.diagnostics.hintFamilies.push(family);
    if (state.diagnostics.firstHintFamily === null) {
      state.diagnostics.firstHintFamily = family;
      state.diagnostics.firstHintAge = state.age;
    }
    return;
  }
  if (flag.startsWith(manifestation)) {
    const family = flag.slice(manifestation.length);
    if (!state.diagnostics.manifestationFamilies.includes(family)) {
      state.diagnostics.manifestationFamilies.push(family);
    }
    if (state.diagnostics.firstManifestationFamily === null) {
      state.diagnostics.firstManifestationFamily = family;
      state.diagnostics.firstManifestationAge = state.age;
    }
  }
}

/** Resolves one year. Returns the ending record when the year is terminal. */
function resolveYear(state: RunState, content: ContentBundle, rng: Rng, options: SimulationOptions): EventOccurrence {
  expireSchedules(state);

  const selection = selectYearEvent(state, content, rng);
  const event = selection.event;

  // Step 7: first matching variant, evaluated against PRE-EVENT state.
  const variantIndex = selectVariantIndex(event, state);
  const variant = event.variants[variantIndex]!;

  // Step 8: exactly one visible timeline entry.
  const occurrence: EventOccurrence = {
    age: state.age,
    eventId: event.id,
    variantIndex,
    channel: event.channel,
    family: event.family,
    selectionMode: event.selectionMode,
    source: selection.source,
    textEn: variant.text.en,
  };
  state.history.push(occurrence);
  recordOccurrence(state, event.id, state.age);

  // Step 9: effects.
  applyStatEffects(state, content.adapters, variant.effects);

  // Step 10: flags, material, schedules.
  for (const flag of variant.removeFlags) state.flags.delete(flag);
  for (const flag of variant.addFlags) {
    if (!state.flags.has(flag)) {
      state.flags.add(flag);
      trackMaterialFlag(state, content, flag);
      if (flag.startsWith('ROUTE_') && !state.diagnostics.routeEntries.includes(flag)) {
        state.diagnostics.routeEntries.push(flag);
      }
    }
  }

  if (variant.setMaterialCommitment) {
    const next = variant.setMaterialCommitment as Material;
    // Contract section 18: a transition to MIXD preserves prior primary materials.
    if (state.material !== 'NONE' && state.material !== next) {
      if (!state.priorMaterials.includes(state.material)) state.priorMaterials.push(state.material);
    }
    if (state.material === 'NONE') state.diagnostics.commitmentAge = state.age;
    state.material = next;
  }

  addSchedules(state, content, event.id, variant.schedules);

  // Step 11: ending.
  if (variant.endingId) {
    state.ending = buildEndingRecord(content, state, event, variantIndex, variant);
    if (selection.firedSchedulePriority === 'climax') {
      state.diagnostics.routeClimaxes.push(event.id);
    }
    options.onYear?.(occurrence, state);
    return occurrence;
  }

  // Step 12: threshold talents, after the event is fully resolved. A talent that
  // fires here cannot retroactively change this year's variant.
  evaluateThresholdTalents(state, content);

  options.onYear?.(occurrence, state);
  return occurrence;
}

export interface RunResult {
  outcome: RunOutcome;
  setup: RunSetup;
  state: RunState;
}

export function runSimulation(
  seed: string,
  content: ContentBundle,
  policy: SetupPolicy,
  options: SimulationOptions = {},
): RunResult {
  const { state, setup, rng } = createRun(seed, content, policy);
  const maxAge = options.maxAge ?? content.balance.diagnosticSimulation.maxAge;

  for (state.age = 0; state.age <= maxAge; state.age++) {
    try {
      resolveYear(state, content, rng, options);
    } catch (error) {
      if (error instanceof ContentCoverageError) {
        if (options.strictCoverage) throw error;
        state.diagnostics.coverageDefectAges.push(error.age);
        return {
          outcome: { kind: 'coverage_error', state, age: error.age, message: error.message },
          setup,
          state,
        };
      }
      throw error;
    }
    if (state.ending) {
      return { outcome: { kind: 'ended', state, ending: state.ending }, setup, state };
    }
  }

  // Contract / Acceptance N: at the diagnostic maximum without an ending, stop
  // and mark the run nonterminal. Never synthesize an ending.
  return { outcome: { kind: 'nonterminal', state, reachedAge: maxAge }, setup, state };
}

export { createRun };
export type { SetupPolicy };
