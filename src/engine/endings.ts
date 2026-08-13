import type { ContentBundle } from './content/load.js';
import {
  AUTHORIZATION_REQUIRED_AWARENESS,
  AWARENESS_STATES,
  type AwarenessState,
  type EndingRecord,
  type EventVariant,
  type GameEvent,
  type RunState,
} from './types.js';

/**
 * Ending resolution and Ending Record construction.
 *
 * Contract sections 22-25:
 *  - the final material normally equals the current Material Commitment unless
 *    the climax explicitly performs an allowed transition;
 *  - Awareness is independent from consent/autonomy/legal status;
 *  - ordinary solid material defaults to Unconscious, temporal to Suspended;
 *  - Continuous/Intermittent/Displaced require authored authorization;
 *  - Unknown/Disputed values are valid.
 */

export class EndingResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EndingResolutionError';
  }
}

export interface AwarenessResolution {
  awareness: AwarenessState;
  authorized: boolean;
}

/**
 * Awareness resolution from Ending Registry v1.1 structured fields.
 *
 * No prose is parsed (Acceptance Addendum section 5). Rules:
 *  - ordinary solid Permanent Form -> the ending's `default_awareness`;
 *  - temporal material -> `awareness_if_temporal` when the ending declares one;
 *  - `Uncertain` requires no authorization;
 *  - states listed in `authorization_required_states` need one of the ending's
 *    `authorizing_talents` (END-ANO-001 -> T1028, END-ANO-002 -> T1029);
 *  - without authorization the engine falls back to the Contract section 23
 *    default rather than inventing eternal awareness.
 */
export function resolveAwareness(
  content: ContentBundle,
  endingId: string,
  material: string,
  state: RunState,
  override: string | undefined,
): AwarenessResolution {
  const ending = content.endings.get(endingId);
  if (!ending) throw new EndingResolutionError(`unknown ending ${endingId}`);

  const hasAuthorization =
    ending.authorizingTalents.length > 0 &&
    ending.authorizingTalents.some((id) => state.talents.has(id));

  const needsAuthorization = (value: AwarenessState): boolean =>
    ending.authorizationRequiredStates.includes(value) ||
    AUTHORIZATION_REQUIRED_AWARENESS.includes(value);

  // An explicit endingOverride wins, subject to the authorization rule.
  if (override) {
    if (!AWARENESS_STATES.includes(override as AwarenessState)) {
      throw new EndingResolutionError(`${endingId}: unknown awareness override ${JSON.stringify(override)}`);
    }
    const awareness = override as AwarenessState;
    if (needsAuthorization(awareness) && !hasAuthorization) {
      throw new EndingResolutionError(
        `${endingId}: awareness ${awareness} requires authored authorization (one of ${ending.authorizingTalents.join(', ') || 'none registered'})`,
      );
    }
    return { awareness, authorized: hasAuthorization };
  }

  const preferred =
    material === 'TEMP' && ending.awarenessIfTemporal
      ? ending.awarenessIfTemporal
      : ending.defaultAwareness;

  if (needsAuthorization(preferred) && !hasAuthorization) {
    // Contract section 23 default: never infer permanent awareness.
    return { awareness: material === 'TEMP' ? 'Suspended' : 'Unconscious', authorized: false };
  }
  return { awareness: preferred, authorized: hasAuthorization };
}

/**
 * Ending Registry cells hold prose alternatives ("Museum; Self; Disputed") or the
 * literal "route-derived". Without an authored override we surface the first
 * listed alternative, and "route-derived" becomes the Unknown placeholder.
 */
function resolveRegistryField(content: ContentBundle, raw: string, override: string | undefined): string {
  if (override !== undefined) return override;
  const value = raw.trim();
  if (value === '' || value.toLowerCase() === 'route-derived') {
    return content.adapters.endingUnresolvedPlaceholder;
  }
  const first = value.split(/;| or /i)[0]!.trim();
  return first === '' ? content.adapters.endingUnresolvedPlaceholder : first;
}

export function buildEndingRecord(
  content: ContentBundle,
  state: RunState,
  event: GameEvent,
  variantIndex: number,
  variant: EventVariant,
): EndingRecord {
  const endingId = variant.endingId;
  if (!endingId) throw new EndingResolutionError(`${event.id} variant ${variantIndex + 1} has no endingId`);
  const ending = content.endings.get(endingId);
  if (!ending) throw new EndingResolutionError(`${event.id}: unknown ending ${endingId}`);

  // Contract section 22: the final material is the current Material Commitment.
  // The variant's own setMaterialCommitment has already been applied by the
  // caller, so the ending never replaces a committed material on its own.
  const material = state.material;
  const overrides = variant.endingOverrides ?? {};

  const { awareness, authorized } = resolveAwareness(
    content,
    endingId,
    material,
    state,
    overrides['awareness'],
  );

  return {
    endingId,
    title_en: ending.title_en,
    endingAge: state.age,
    species: state.species,
    registeredSpecies: state.registeredSpecies,
    primaryMaterial: material,
    priorMaterials: [...state.priorMaterials],
    form: resolveRegistryField(content, ending.typicalForms.join('; '), overrides['form']),
    awareness,
    awarenessAuthorized: authorized,
    integrity: overrides['integrity'] ?? content.adapters.endingUnresolvedPlaceholder,
    legalStatus: resolveRegistryField(content, ending.legalStatus, overrides['legalStatus']),
    ownership: resolveRegistryField(content, ending.ownership, overrides['ownership']),
    autonomy: resolveRegistryField(content, ending.autonomy, overrides['autonomy']),
    conversionConsent: resolveRegistryField(content, ending.conversionConsent, overrides['conversionConsent']),
    location: resolveRegistryField(content, ending.typicalLocation, overrides['location']),
    socialMeaning: resolveRegistryField(content, ending.socialMeaning, overrides['socialMeaning']),
    sourceEventId: event.id,
    sourceVariantIndex: variantIndex,
  };
}
