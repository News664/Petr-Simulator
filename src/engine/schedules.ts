import { evaluateCondition } from './conditions/evaluate.js';
import type { ContentBundle } from './content/load.js';
import { isEligible } from './eligibility.js';
import { conditionContext } from './state.js';
import type { Rng } from './rng.js';
import type { GameEvent, PendingSchedule, RunState, ScheduleSpec, SchedulePriority } from './types.js';

/**
 * Schedule queue and annual priority resolution. Contract sections 8 and 14.
 *
 * Priority classes, highest first:
 *   1. ending / committed hidden-route climax
 *   2. mandatory committed-route continuation
 *   3. scheduled priority event
 *   4. normal hierarchical draft
 *
 * A displaced schedule stays pending inside its authored window. A schedule is
 * discarded when its window closes.
 *
 * `validityCondition` is a FIRE-TIME GATE, not a destruction test: canonical
 * schedules routinely carry conditions that are false when created (for example
 * `MAT!=NONE & FIX>=55` created while MAT is still NONE). See ASSUMPTION A-4.
 */

export function priorityRank(content: ContentBundle, priority: SchedulePriority): number {
  const ranks = content.balance.priorityClassRank;
  switch (priority) {
    case 'climax':
      return ranks.ending_or_hidden_climax;
    case 'mandatory':
      return ranks.mandatory_route;
    case 'scheduled':
      return ranks.scheduled;
  }
}

export function normalRank(content: ContentBundle): number {
  return content.balance.priorityClassRank.normal;
}

/** Creates pending schedules from a resolved variant. */
export function addSchedules(
  state: RunState,
  content: ContentBundle,
  sourceEventId: string,
  specs: readonly ScheduleSpec[],
): void {
  if (content.balance.scheduleSemantics.window !== 'earliest_plus_window_inclusive') {
    throw new Error(`unsupported schedule window semantics ${content.balance.scheduleSemantics.window}`);
  }
  for (const spec of specs) {
    const earliestAge = state.age + spec.offsetYears;
    state.schedules.push({
      seq: state.scheduleSeq++,
      eventId: spec.eventId,
      earliestAge,
      latestAge: earliestAge + spec.windowYears,
      priority: spec.priority,
      // Content Schema v0.3: absent behaves as 0.
      priorityOrder: spec.priorityOrder ?? 0,
      validityCondition: spec.validityCondition,
      createdAtAge: state.age,
      createdByEventId: sourceEventId,
    });
  }
}

/** Drops schedules whose window has closed. Called at the top of each year. */
export function expireSchedules(state: RunState): void {
  if (state.schedules.length === 0) return;
  const kept: PendingSchedule[] = [];
  for (const schedule of state.schedules) {
    if (state.age > schedule.latestAge) {
      state.diagnostics.expiredSchedules.push({
        eventId: schedule.eventId,
        age: state.age,
        reason: 'window_closed',
      });
      continue;
    }
    kept.push(schedule);
  }
  state.schedules = kept;
}

export interface ScheduleCandidate {
  schedule: PendingSchedule;
  event: GameEvent;
  rank: number;
}

/** Schedules that could fire this year: in window, valid, and target eligible. */
export function scheduleCandidates(state: RunState, content: ContentBundle): ScheduleCandidate[] {
  const ctx = conditionContext(state);
  const candidates: ScheduleCandidate[] = [];
  for (const schedule of state.schedules) {
    if (state.age < schedule.earliestAge || state.age > schedule.latestAge) continue;
    if (!evaluateCondition(schedule.validityCondition, ctx)) continue;
    const event = content.eventsById.get(schedule.eventId);
    if (!event) continue;
    if (!isEligible(event, state, content, ctx)) continue;
    candidates.push({ schedule, event, rank: priorityRank(content, schedule.priority) });
  }
  return candidates;
}

/**
 * Ranks candidates and returns the winner.
 *
 * Q-11 RESOLVED (Content Schema v0.3): within a priority class, the larger
 * `priorityOrder` wins; an actual tie is broken by seeded RNG. Creation order is
 * NOT the permanent design tiebreak — it is used only to make the candidate list
 * order itself deterministic before the RNG draw, so the same seed and state
 * always yield the same tie result.
 */
export function rankCandidates(
  candidates: readonly ScheduleCandidate[],
  rng?: Rng,
): ScheduleCandidate[] {
  const sorted = candidates.slice().sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    if (a.schedule.priorityOrder !== b.schedule.priorityOrder) {
      return b.schedule.priorityOrder - a.schedule.priorityOrder;
    }
    // Stable, content-independent ordering for the tie group.
    return a.schedule.seq - b.schedule.seq;
  });
  if (sorted.length < 2 || !rng) return sorted;

  const best = sorted[0]!;
  const tied = sorted.filter(
    (c) => c.rank === best.rank && c.schedule.priorityOrder === best.schedule.priorityOrder,
  );
  if (tied.length < 2) return sorted;

  const winner = rng.pick(tied);
  return [winner, ...sorted.filter((c) => c !== winner)];
}

/** Removes a fired schedule from the pending queue. */
export function consumeSchedule(state: RunState, schedule: PendingSchedule): void {
  state.schedules = state.schedules.filter((s) => s.seq !== schedule.seq);
}
