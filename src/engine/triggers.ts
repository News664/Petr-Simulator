import { evaluateCondition } from './conditions/evaluate.js';
import type { ContentBundle } from './content/load.js';
import { addSchedules } from './schedules.js';
import { conditionContext, repeatAllows } from './state.js';
import type { RunState, StateTrigger } from './types.js';

/**
 * Data-driven state triggers. H2B.1A A-04.
 *
 * The smallest facility that lets canonical *state* — rather than a preceding
 * event — put an authored event on the schedule queue. It exists because some
 * institutional attention is a response to a condition a run drifted into, not
 * to something that just happened: an adult at STR ≤ −3 should eventually hear
 * from their insurer even if no event has fired about it.
 *
 * Deliberately not a meter:
 *
 *  - nothing is stored and nothing accumulates. Each year the trigger's own
 *    `when` is re-evaluated against the ordinary condition context;
 *  - it may only enqueue an authored event that already exists in the corpus;
 *  - `offsetYears >= 1` is enforced by schema, so a trigger can never produce a
 *    second visible event in the same year;
 *  - it never touches stats, flags, material, faction state or endings, and
 *    never chooses a variant. The scheduled event resolves normally when its
 *    turn comes, including its own eligibility and validity gates;
 *  - every trigger is declared in `content/balance/SOLID_STATE_STATE_TRIGGERS_v0.1.json`.
 *    The engine hard-codes none of them.
 *
 * Duplicate suppression is the part that matters in practice. A trigger stays
 * quiet while its target is already pending, while `suppressWhile` holds, and
 * once the target's repeat policy is exhausted — so a run cannot accumulate a
 * backlog of identical reviews.
 */

/** True when this trigger should not fire right now. */
function suppressed(state: RunState, content: ContentBundle, trigger: StateTrigger): boolean {
  // Already queued: one pending review is enough.
  if (state.schedules.some((pending) => pending.eventId === trigger.schedule.eventId)) return true;

  const target = content.eventsById.get(trigger.schedule.eventId);
  if (!target) return true;
  // Exhausted repeat policy: scheduling it again could only ever expire.
  if (
    !repeatAllows(
      state,
      content.balance,
      target.id,
      target.repeatMaxCount,
      target.repeatCooldownYears,
      state.age + trigger.schedule.offsetYears,
    )
  ) {
    return true;
  }

  const ctx = conditionContext(state);
  return trigger.suppressWhile !== undefined && evaluateCondition(trigger.suppressWhile, ctx);
}

/**
 * Evaluates every declared trigger against the state at the end of a year.
 *
 * Called once per year after the year's event has fully resolved, so a trigger
 * always sees the state the player just finished the year in.
 */
export function applyStateTriggers(state: RunState, content: ContentBundle): void {
  if (content.stateTriggers.length === 0) return;
  const ctx = conditionContext(state);
  for (const trigger of content.stateTriggers) {
    if (!evaluateCondition(trigger.when, ctx)) continue;
    if (suppressed(state, content, trigger)) continue;
    addSchedules(state, content, `TRIGGER:${trigger.id}`, [trigger.schedule]);
    state.diagnostics.stateTriggerFirings.push({
      triggerId: trigger.id,
      age: state.age,
      eventId: trigger.schedule.eventId,
    });
  }
}
