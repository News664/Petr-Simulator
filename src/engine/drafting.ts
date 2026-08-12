import { channelWeightsForAge, fixChannelScalar } from './content/balance.js';
import type { ContentBundle } from './content/load.js';
import { eligibleNormalEvents } from './eligibility.js';
import type { Rng } from './rng.js';
import { CHANNELS, type Channel, type GameEvent, type RunState } from './types.js';

/**
 * Normal hierarchical drafting. Contract sections 9-10:
 *
 *   age/state profile -> channel -> family -> event
 *
 * Empty families and channels are removed and the remaining weights are
 * renormalized. Weighted selection over the surviving entries IS the
 * renormalization: proportions among survivors are unchanged.
 *
 * All numbers come from the balance/adapter data. This module contains none.
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
 * Multiplicative soft-evidence scalar for one candidate event.
 *
 * Evidence is directional, never deterministic (Drafting Rules section 2). Each
 * source contributes at most one multiplier from `familyEvidenceScalar`.
 */
export function evidenceScalar(event: GameEvent, state: RunState, content: ContentBundle): number {
  const scalars = content.balance.familyEvidenceScalar;
  const adapters = content.adapters;
  let scalar = 1;

  // Species material tendency, only meaningful for transformation families.
  if (event.channel === 'TRN') {
    const tendencies = content.speciesFamilyTendencies.get(state.species);
    if (tendencies) {
      if (tendencies.primary.has(event.family)) scalar *= scalars.speciesPrimary;
      else if (tendencies.secondary.has(event.family)) scalar *= scalars.speciesSecondary;
      else if (tendencies.uncommon.has(event.family)) scalar *= scalars.speciesUncommon;
    }
  }

  // Childhood hint / reversible manifestation flags for this family.
  if (state.flags.has(`${adapters.materialFlagPrefixes.hint}${event.family}`)) {
    scalar *= scalars.hintMatchingFamily;
  }
  if (state.flags.has(`${adapters.materialFlagPrefixes.manifestation}${event.family}`)) {
    scalar *= scalars.manifestMatchingFamily;
  }

  // Active route context: any flag in the route tag's namespace.
  // Some tags are barred from favouring transformation families, so that a
  // social/research route cannot bias one material merely by being active
  // (EVENT_DRAFTING_RULES v0.2, Comparative Materials).
  const noTransformationFavor = adapters.routeTagsWithNoTransformationFavor ?? [];
  for (const tag of event.routeTags) {
    const prefix = adapters.routeTagFlagPrefixes[tag];
    if (!prefix) continue;
    if (event.channel === 'TRN' && noTransformationFavor.includes(tag)) continue;
    let active = false;
    for (const flag of state.flags) {
      if (flag.startsWith(prefix)) {
        active = true;
        break;
      }
    }
    if (active) {
      scalar *= scalars.routeFavor;
      break; // One route-context multiplier per event, not one per matching tag.
    }
  }

  // Talent channel/family hooks from the provisional adapter table.
  for (const talentId of state.talents) {
    const adapter = adapters.talentAdapters[talentId];
    if (!adapter) continue;
    if (adapter.stronglyFavorFamilies?.includes(event.family) || adapter.stronglyFavorChannels?.includes(event.channel)) {
      scalar *= scalars.talentStronglyFavor;
    } else if (adapter.favorFamilies?.includes(event.family) || adapter.favorChannels?.includes(event.channel)) {
      scalar *= scalars.talentFavor;
    }
    if (adapter.suppressFamilies?.includes(event.family) || adapter.suppressChannels?.includes(event.channel)) {
      scalar *= scalars.talentSuppress;
    }
  }

  return scalar;
}

export function eventWeight(event: GameEvent, state: RunState, content: ContentBundle): number {
  const base = content.balance.eventWeightClassScalar[event.weightClass];
  return base * evidenceScalar(event, state, content);
}

/**
 * Runs the full normal draft for the current year.
 * Throws EmptyPoolError when nothing is eligible, which the caller turns into a
 * pre-25 content coverage error or an age-25+ fallback.
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

  // Channel step: drop empty channels, keep authored order for reproducibility.
  const channelCandidates: { channel: Channel; weight: number }[] = [];
  for (const channel of CHANNELS) {
    const events = byChannel.get(channel);
    if (!events || events.length === 0) continue;
    let weight = neutral[channel];
    if (channel === 'TRN') weight *= trnScalar;
    if (weight <= 0) continue;
    channelCandidates.push({ channel, weight });
  }
  if (channelCandidates.length === 0) {
    // Every surviving channel has zero neutral weight (e.g. SPC before age 12).
    // Fall back to uniform over the non-empty channels rather than dropping the
    // year: an eligible event exists, so this is not an empty pool.
    for (const channel of CHANNELS) {
      const events = byChannel.get(channel);
      if (events && events.length > 0) channelCandidates.push({ channel, weight: 1 });
    }
  }
  const chosenChannel = rng.weightedPick(
    channelCandidates.map((c) => c.channel),
    channelCandidates.map((c) => c.weight),
  );

  // Family step within the chosen channel.
  const channelEvents = byChannel.get(chosenChannel)!;
  const byFamily = new Map<string, GameEvent[]>();
  for (const event of channelEvents) {
    const list = byFamily.get(event.family);
    if (list) list.push(event);
    else byFamily.set(event.family, [event]);
  }

  const weightsByEvent = new Map<string, number>();
  for (const event of channelEvents) weightsByEvent.set(event.id, eventWeight(event, state, content));

  const mode = content.adapters.engineRules.familyWeightMode;
  const familyCandidates: { family: string; weight: number }[] = [];
  for (const [family, events] of [...byFamily.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const weight =
      mode === 'uniform' ? 1 : events.reduce((sum, event) => sum + weightsByEvent.get(event.id)!, 0);
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

  // Event step within the chosen family.
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
