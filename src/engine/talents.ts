import { evaluateCondition } from './conditions/evaluate.js';
import type { ContentBundle } from './content/load.js';
import { applyStatEffects, conditionContext } from './state.js';
import type { RunState, TalentDef } from './types.js';

/**
 * Talent engine. Contract section 20.
 *
 *   Dormant -> Triggered -> Spent
 *
 * Checkpoints:
 *   1. after starting allocation/species
 *   2. after unconditional start talent effects
 *   3. after each annual event completes
 *   4. after exceptional direct system stat operations
 *
 * Triggered effects are permanent and never revoked. After one talent fires,
 * dormant talents are re-evaluated until stable.
 */

export class TalentSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TalentSelectionError';
  }
}

/** Rejects an incompatible or malformed talent selection. Acceptance I. */
export function validateTalentSelection(content: ContentBundle, talentIds: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of talentIds) {
    if (!content.talents.has(id)) throw new TalentSelectionError(`unknown talent ${id}`);
    if (seen.has(id)) throw new TalentSelectionError(`talent ${id} selected more than once`);
    seen.add(id);
  }
  for (const id of talentIds) {
    const talent = content.talents.get(id)!;
    for (const other of talent.incompatibleWith) {
      if (seen.has(other)) {
        throw new TalentSelectionError(`talents ${id} and ${other} are incompatible`);
      }
    }
  }
}

/** Applies `start` and `start_hidden` effects exactly once, at setup step 7. */
export function applyStartTalents(state: RunState, content: ContentBundle): void {
  for (const id of state.talents) {
    const talent = content.talents.get(id);
    if (!talent) continue;
    if (talent.trigger_type !== 'start' && talent.trigger_type !== 'start_hidden') continue;
    applyStatEffects(state, content.adapters, talent.effects);
    const adapter = content.adapters.talentAdapters[id];
    if (adapter?.startFIX) {
      state.stats.FIX += adapter.startFIX;
    }
    state.diagnostics.talentActivations.push({ talentId: id, age: state.age });
  }
}

/** Initialises the dormant set from the run's chosen talents. */
export function initDormantTalents(state: RunState, content: ContentBundle): void {
  state.dormantTalents.clear();
  for (const id of state.talents) {
    const talent = content.talents.get(id);
    if (talent?.trigger_type === 'threshold_once') state.dormantTalents.add(id);
  }
}

/**
 * Evaluates dormant threshold talents until stable.
 *
 * Returns the talents that fired, in fire order. One triggered talent may
 * satisfy another's threshold; the loop continues until a pass fires nothing.
 * The caller decides when to run this — never in the middle of resolving an
 * event, so a talent cannot retroactively change that event's variant.
 */
export function evaluateThresholdTalents(state: RunState, content: ContentBundle): string[] {
  const fired: string[] = [];
  // Bound the cascade by the dormant-set size: each pass removes at least one.
  let guard = state.dormantTalents.size + 1;
  for (;;) {
    if (guard-- < 0) throw new Error('threshold talent cascade failed to stabilise');
    const ready: TalentDef[] = [];
    const ctx = conditionContext(state);
    // Deterministic evaluation order: sorted talent ID, independent of Set order.
    for (const id of [...state.dormantTalents].sort()) {
      const talent = content.talents.get(id)!;
      if (talent.condition !== '' && evaluateCondition(talent.condition, ctx)) ready.push(talent);
    }
    if (ready.length === 0) return fired;
    for (const talent of ready) {
      state.dormantTalents.delete(talent.id);
      state.triggeredTalents.add(talent.id);
      applyStatEffects(state, content.adapters, talent.effects);
      state.diagnostics.talentActivations.push({ talentId: talent.id, age: state.age });
      fired.push(talent.id);
    }
  }
}
