import type { ConditionContext } from './conditions/evaluate.js';
import type { BalanceAdapters } from './content/balance.js';
import { ALL_STATS, type RunState, type StatKey } from './types.js';

/** Snapshot of everything conditions may read. Cheap enough to rebuild per query. */
export function conditionContext(state: RunState): ConditionContext {
  return {
    AGE: state.age,
    CHR: state.stats.CHR,
    INT: state.stats.INT,
    STR: state.stats.STR,
    MNY: state.stats.MNY,
    SPR: state.stats.SPR,
    FIX: state.stats.FIX,
    TMS: state.reincarnationCount,
    SPECIES: state.species,
    RSPECIES: state.registeredSpecies,
    MAT: state.material,
    talents: state.talents,
    events: state.eventIdsThisRun,
    priorRunEvents: state.priorRunEventIds,
    flags: state.flags,
    achievements: state.achievements,
  };
}

/** Applies the configured clamp. Balance data, never a magic number in code. */
export function clampStat(adapters: BalanceAdapters, key: StatKey, value: number): number {
  const clamp = adapters.engineRules.statClamp;
  const min = key === 'FIX' ? clamp.fixMin : clamp.visibleMin;
  const max = key === 'FIX' ? clamp.fixMax : clamp.visibleMax;
  let out = value;
  if (min !== null && out < min) out = min;
  if (max !== null && out > max) out = max;
  return out;
}

export function applyStatEffects(
  state: RunState,
  adapters: BalanceAdapters,
  effects: Partial<Record<StatKey, number>>,
): void {
  for (const key of ALL_STATS) {
    const delta = effects[key];
    if (delta === undefined || delta === 0) continue;
    state.stats[key] = clampStat(adapters, key, state.stats[key] + delta);
  }
}

/**
 * Repeat eligibility.
 *
 * `at_least` (the canonical reading, see ASSUMPTION A-7): an event with
 * cooldown C last resolved at age L may recur once AGE - L >= C.
 * `strictly_greater` keeps the alternative reading available for comparison.
 */
export function repeatAllows(
  state: RunState,
  adapters: BalanceAdapters,
  eventId: string,
  repeatMaxCount: number | null,
  repeatCooldownYears: number,
  age: number,
): boolean {
  const record = state.repeats.get(eventId);
  if (!record) return true;
  if (repeatMaxCount !== null && record.count >= repeatMaxCount) return false;
  const elapsed = age - record.lastAge;
  // A repeat always needs at least one chronological year, since one visible
  // event per year is the cadence.
  if (elapsed < 1) return false;
  return adapters.engineRules.repeatCooldownSemantics === 'at_least'
    ? elapsed >= repeatCooldownYears
    : elapsed > repeatCooldownYears;
}

export function recordOccurrence(state: RunState, eventId: string, age: number): void {
  const record = state.repeats.get(eventId);
  if (record) {
    record.count += 1;
    record.lastAge = age;
  } else {
    state.repeats.set(eventId, { count: 1, lastAge: age });
  }
  state.eventIdsThisRun.add(eventId);
}
