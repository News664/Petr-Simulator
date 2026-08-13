import { channelWeightsForAge, fixChannelScalar } from './content/balance.js';
import type { ContentBundle } from './content/load.js';
import { eligibleNormalEvents } from './eligibility.js';
import type { Rng } from './rng.js';
import { CHANNELS, type Channel, type GameEvent, type RunState } from './types.js';

/**
 * Normal hierarchical drafting. Event Drafting Rules v0.3.
 *
 *   channel -> uniform eligible family -> locally weighted eligible event
 *
 * Empty families and channels are removed and the remaining weights are
 * renormalized. Weighted selection over the survivors IS the renormalization.
 *
 * Evidence is applied in three distinct layers, and each layer's inputs are
 * fixed by canonical data rather than by code:
 *
 *   channel layer  neutral age weights x FIX scalar (TRN) x talent channel ops
 *   family layer   uniform base x species family tendency x hint x manifestation
 *                  x talent family ops
 *   event layer    weightClass x routeFavor (at most one) x species refinement
 *                  hook (only when the event carries a matching refinementTag)
 *
 * "Event count must not silently become family probability" (Drafting Rules
 * v0.3): under the `uniform` baseline a family's base weight is 1 regardless of
 * how many events it holds. `sum_of_event_weights` is retained ONLY as the A/B
 * diagnostic comparison and is not the design baseline.
 *
 * All numbers come from Balance Constants v0.2. This module contains none.
 */

export interface DraftTrace {
  channelCandidates: { channel: Channel; weight: number }[];
  chosenChannel: Channel;
  familyCandidates: { family: string; weight: number }[];
  chosenFamily: string;
  eventCandidates: { eventId: string; weight: number }[];
  chosenEventId: string;
}

export class EmptyPoolError extends Error {
  readonly age: number;

  constructor(age: number) {
    super(`no eligible non-fallback event at age ${age}`);
    this.name = 'EmptyPoolError';
    this.age = age;
  }
}

/**
 * Channel-layer talent multiplier. Talent Registry v1.1 `channel:` targets only.
 */
export function talentChannelScalar(channel: Channel, state: RunState, content: ContentBundle): number {
  const scalars = content.balance.familyEvidenceScalar;
  let scalar = 1;
  for (const talentId of [...state.talents].sort()) {
    const talent = content.talents.get(talentId);
    if (!talent) continue;
    const matches = (targets: { kind: string; code: string }[]): boolean =>
      targets.some((t) => t.kind === 'channel' && t.code === channel);
    if (matches(talent.draftingStronglyFavor)) scalar *= scalars.talentStronglyFavor;
    else if (matches(talent.draftingFavor)) scalar *= scalars.talentFavor;
    if (matches(talent.draftingSuppress)) scalar *= scalars.talentSuppress;
  }
  return scalar;
}

/**
 * Family-layer evidence multiplier.
 *
 * Species family tendencies apply only to Transformation families and only
 * before Material Commitment (Species Registry v1.2 `family_tendency_rule`).
 */
export function familyEvidenceScalar(
  channel: Channel,
  family: string,
  state: RunState,
  content: ContentBundle,
): number {
  const scalars = content.balance.familyEvidenceScalar;
  let scalar = 1;

  if (channel === 'TRN' && state.material === 'NONE') {
    const tendencies = content.speciesFamilyTendencies.get(state.species);
    if (tendencies) {
      if (tendencies.primary.has(family)) scalar *= scalars.speciesPrimary;
      else if (tendencies.secondary.has(family)) scalar *= scalars.speciesSecondary;
      else if (tendencies.uncommon.has(family)) scalar *= scalars.speciesUncommon;
    }
  }

  // Childhood hint / reversible manifestation flags for this family.
  if (state.flags.has(`MAT_HINT_${family}`)) scalar *= scalars.hintMatchingFamily;
  if (state.flags.has(`MAT_MANIFEST_${family}`)) scalar *= scalars.manifestMatchingFamily;

  // Talent family operations (Talent Registry v1.1 `family:` targets).
  for (const talentId of [...state.talents].sort()) {
    const talent = content.talents.get(talentId);
    if (!talent) continue;
    const matches = (targets: { kind: string; code: string }[]): boolean =>
      targets.some((t) => t.kind === 'family' && t.code === family);
    if (matches(talent.draftingStronglyFavor)) scalar *= scalars.talentStronglyFavor;
    else if (matches(talent.draftingFavor)) scalar *= scalars.talentFavor;
    if (matches(talent.draftingSuppress)) scalar *= scalars.talentSuppress;
  }

  return scalar;
}

/**
 * Event-layer multiplier: route context and species refinement hooks.
 *
 * Route rules (Route Tag Registry v1.0 + Drafting Rules v0.3):
 *  - at most ONE route-favor scalar per event however many tags match;
 *  - a tag with `activeEventFavor: false` never grants one;
 *  - a tag with `allowTransformationEventFavor: false` grants none on a TRN
 *    event, which is what keeps `academic` from biasing TEMP.
 *
 * Refinement hooks apply only when the event carries the matching
 * `refinementTag`. They never select a family and never add a drafting stage.
 * `MAGICAL_SEAL` has `family: null` and so contributes no family scalar
 * anywhere; it can only ever act here, on an explicitly tagged event.
 */
export function eventContextScalar(event: GameEvent, state: RunState, content: ContentBundle): number {
  const scalars = content.balance.familyEvidenceScalar;
  let scalar = 1;

  for (const tag of event.routeTags) {
    const def = content.routeTags.get(tag);
    if (!def || !def.activeEventFavor) continue;
    if (event.channel === 'TRN' && !def.allowTransformationEventFavor) continue;
    let active = false;
    for (const prefix of def.flagPrefixes) {
      for (const flag of state.flags) {
        if (flag.startsWith(prefix)) {
          active = true;
          break;
        }
      }
      if (active) break;
    }
    if (active) {
      scalar *= scalars.routeFavor;
      break; // Stacking rule: at most one route-context scalar per event.
    }
  }

  if (event.refinementTags.length > 0) {
    const species = content.species.get(state.species);
    const refinement = content.balance.speciesRefinementScalar;
    if (species) {
      for (const hook of species.refinementHooks) {
        if (!event.refinementTags.includes(hook.tag)) continue;
        if (hook.operation === 'favor') scalar *= refinement.favor;
        else if (hook.operation === 'strongly_favor') scalar *= refinement.stronglyFavor;
        else if (hook.operation === 'suppress') scalar *= refinement.suppress;
        // `unlock` is eligibility semantics, not a weight. See ASSUMPTION A-16.
      }
    }
  }

  return scalar;
}

/** Local event weight inside an already-selected family. */
export function eventWeight(event: GameEvent, state: RunState, content: ContentBundle): number {
  return content.balance.eventWeightClassScalar[event.weightClass] * eventContextScalar(event, state, content);
}

/**
 * Runs the full normal draft for the current year.
 * Throws EmptyPoolError when nothing is eligible.
 */
export function draftNormalEvent(state: RunState, content: ContentBundle, rng: Rng): DraftTrace {
  const pool = eligibleNormalEvents(state, content);
  if (pool.length === 0) throw new EmptyPoolError(state.age);

  const byChannel = new Map<Channel, GameEvent[]>();
  for (const event of pool) {
    const list = byChannel.get(event.channel);
    if (list) list.push(event);
    else byChannel.set(event.channel, [event]);
  }

  const neutral = channelWeightsForAge(content.balance, state.age);
  const trnScalar = fixChannelScalar(content.balance, state.stats.FIX);

  // Channel step: drop empty channels, keep taxonomy order for reproducibility.
  const channelCandidates: { channel: Channel; weight: number }[] = [];
  for (const channel of CHANNELS) {
    const events = byChannel.get(channel);
    if (!events || events.length === 0) continue;
    let weight = neutral[channel];
    if (channel === 'TRN') weight *= trnScalar;
    weight *= talentChannelScalar(channel, state, content);
    if (weight <= 0) continue;
    channelCandidates.push({ channel, weight });
  }
  if (channelCandidates.length === 0) {
    // Every surviving channel has zero neutral weight (e.g. SPC below age 12).
    // Eligible events exist, so this is not an empty pool: fall back to uniform.
    for (const channel of CHANNELS) {
      const events = byChannel.get(channel);
      if (events && events.length > 0) channelCandidates.push({ channel, weight: 1 });
    }
  }
  const chosenChannel = rng.weightedPick(
    channelCandidates.map((c) => c.channel),
    channelCandidates.map((c) => c.weight),
  );

  // Family step inside the chosen channel. Uniform base under the v0.3 baseline.
  const channelEvents = byChannel.get(chosenChannel)!;
  const byFamily = new Map<string, GameEvent[]>();
  for (const event of channelEvents) {
    const list = byFamily.get(event.family);
    if (list) list.push(event);
    else byFamily.set(event.family, [event]);
  }

  const weightsByEvent = new Map<string, number>();
  for (const event of channelEvents) weightsByEvent.set(event.id, eventWeight(event, state, content));

  const mode = content.balance.familyWeightMode;
  const familyCandidates: { family: string; weight: number }[] = [];
  for (const [family, events] of [...byFamily.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const base =
      mode === 'uniform'
        ? 1
        : // Diagnostic comparison mode only: content density becomes probability.
          events.reduce((sum, event) => sum + weightsByEvent.get(event.id)!, 0);
    const weight = base * familyEvidenceScalar(chosenChannel, family, state, content);
    if (weight <= 0) continue;
    familyCandidates.push({ family, weight });
  }
  if (familyCandidates.length === 0) {
    for (const family of [...byFamily.keys()].sort()) familyCandidates.push({ family, weight: 1 });
  }
  const chosenFamily = rng.weightedPick(
    familyCandidates.map((f) => f.family),
    familyCandidates.map((f) => f.weight),
  );

  // Event step inside the chosen family.
  const familyEvents = byFamily.get(chosenFamily)!.slice().sort((a, b) => a.id.localeCompare(b.id));
  const eventCandidates = familyEvents.map((event) => ({
    eventId: event.id,
    weight: weightsByEvent.get(event.id)!,
  }));
  const positive = eventCandidates.filter((c) => c.weight > 0);
  const usable = positive.length > 0 ? positive : eventCandidates.map((c) => ({ ...c, weight: 1 }));
  const chosenEventId = rng.weightedPick(
    usable.map((c) => c.eventId),
    usable.map((c) => c.weight),
  );

  return { channelCandidates, chosenChannel, familyCandidates, chosenFamily, eventCandidates, chosenEventId };
}
