import { evaluateCondition, type ConditionContext } from './conditions/evaluate.js';
import type { ContentBundle } from './content/load.js';
import { activeFaction } from './factions.js';
import { conditionContext, repeatAllows } from './state.js';
import { TRANSFORMATION_FAMILIES, type GameEvent, type RunState } from './types.js';

/** Material tags that let a transformation event bypass the commitment lock. */
const BYPASS_TAGS = new Set(['transition', 'mixed', 'anomaly', 'anomalous']);
const TRANSFORMATION_FAMILY_SET = new Set<string>(TRANSFORMATION_FAMILIES);

export type IneligibleReason =
  | 'age'
  | 'include'
  | 'exclude'
  | 'repeat'
  | 'material_lock'
  | 'faction_slot';

/**
 * Material Commitment continuity. Contract section 17 / Drafting Rules section 10.
 *
 * After MAT is set, unrelated ordinary Transformation families become
 * ineligible. Committed-family, explicit transition, mixed-material, and
 * anomaly events remain allowed.
 */
export function materialLockAllows(event: GameEvent, material: string): boolean {
  if (material === 'NONE') return true;
  if (event.channel !== 'TRN') return true;
  if (!TRANSFORMATION_FAMILY_SET.has(event.family)) return true;
  if (event.family === material) return true;
  if (event.family === 'MIXD' || event.family === 'ANOM') return true;
  return event.materialTags.some((tag) => BYPASS_TAGS.has(tag));
}

/**
 * Single active personalized faction. H2B Single Active Faction Rule v0.1.
 *
 * A faction is *personally active* while it is CONTACTED, ENGAGED or COMMITTED.
 * A `contact` event may only open a new relationship when no other faction is
 * personally active, so the protagonist is never simultaneously inside two
 * faction chains.
 *
 * Deliberately narrow:
 *  - it gates `contact` events only. `personal` and `climax` events for the
 *    already-active faction stay eligible, which is what keeps a chain running;
 *  - `news` and `lore_fallback` are untouched, so the rest of the world keeps
 *    talking while a relationship is open;
 *  - a contact event for the faction that is *already* active is not blocked by
 *    its own relationship;
 *  - entering OPTED_OUT or CLOSED frees the slot, and because this is evaluated
 *    fresh each year the next annual draft can already offer a different
 *    faction. The exited faction stays terminal under the unchanged FSM.
 *
 * This is an eligibility rule, not state: nothing is stored, no meter exists,
 * and the condition grammar gains no faction syntax.
 */
export function factionSlotAllows(event: GameEvent, state: RunState, content: ContentBundle): boolean {
  if (event.factionInteraction !== 'contact') return true;
  const active = activeFaction(state.flags, content);
  if (!active) return true;
  return event.factionIds.includes(active.id);
}

/**
 * Structural eligibility, independent of how the event is being selected.
 * Returns null when eligible, otherwise the first failing reason.
 */
export function ineligibleReason(
  event: GameEvent,
  state: RunState,
  content: ContentBundle,
  ctx: ConditionContext = conditionContext(state),
): IneligibleReason | null {
  const age = state.age;
  if (age < event.age.min) return 'age';
  if (event.age.max !== null && age > event.age.max) return 'age';
  if (!repeatAllows(state, content.balance, event.id, event.repeatMaxCount, event.repeatCooldownYears, age)) {
    return 'repeat';
  }
  if (!materialLockAllows(event, state.material)) return 'material_lock';
  if (!factionSlotAllows(event, state, content)) return 'faction_slot';
  if (!evaluateCondition(event.include, ctx)) return 'include';
  if (evaluateCondition(event.exclude, ctx)) return 'exclude';
  return null;
}

export function isEligible(
  event: GameEvent,
  state: RunState,
  content: ContentBundle,
  ctx?: ConditionContext,
): boolean {
  return ineligibleReason(event, state, content, ctx) === null;
}

/** Events that may be drafted normally: selectionMode `random` and eligible. */
export function eligibleNormalEvents(state: RunState, content: ContentBundle): GameEvent[] {
  const ctx = conditionContext(state);
  return content.events.filter((event) => event.selectionMode === 'random' && isEligible(event, state, content, ctx));
}

/**
 * Eligible `lore_fallback_only` bulletins. Content Schema v0.4.
 *
 * Its own tier: never drafted normally, and consulted only after the normal pool
 * is exhausted but before the generic quiet-year fallback.
 */
export function eligibleLoreFallbackEvents(state: RunState, content: ContentBundle): GameEvent[] {
  const ctx = conditionContext(state);
  return content.events.filter(
    (event) => event.selectionMode === 'lore_fallback_only' && isEligible(event, state, content, ctx),
  );
}

/** Eligible `fallback_only` events. Never participates in normal weighting. */
export function eligibleFallbackEvents(state: RunState, content: ContentBundle): GameEvent[] {
  const ctx = conditionContext(state);
  return content.events.filter(
    (event) => event.selectionMode === 'fallback_only' && isEligible(event, state, content, ctx),
  );
}

/**
 * Resolves the variant for an event against PRE-EVENT state. Contract section 13:
 * variants are ordered, first match wins.
 */
export function selectVariantIndex(event: GameEvent, state: RunState): number {
  const ctx = conditionContext(state);
  for (let i = 0; i < event.variants.length; i++) {
    if (evaluateCondition(event.variants[i]!.when, ctx)) return i;
  }
  throw new Error(`${event.id}: no variant matched; content must end with a TRUE fallback`);
}
