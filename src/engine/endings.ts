import type { AwarenessRule } from './content/balance.js';
import type { ContentBundle } from './content/load.js';
import {
  AUTHORIZATION_REQUIRED_AWARENESS,
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

/** Contract section 23 fallback when an ending carries no registry default. */
function contractDefaultAwareness(material: string): AwarenessState {
  return material === 'TEMP' ? 'Suspended' : 'Unconscious';
}

export interface AwarenessResolution {
  awareness: AwarenessState;
  authorized: boolean;
}

export function resolveAwareness(
  content: ContentBundle,
  endingId: string,
  material: string,
  state: RunState,
  override: string | undefined,
): AwarenessResolution {
  const ending = content.endings.get(endingId);
  if (!ending) throw new EndingResolutionError(`unknown ending ${endingId}`);

  const authorizingTalents = content.adapters.endingAwarenessAuthorizingTalents[endingId] ?? [];
  const hasAuthorization =
    authorizingTalents.length > 0 && authorizingTalents.some((id) => state.talents.has(id));

  const requestExplicit = (value: string): AwarenessResolution => {
    const awareness = value as AwarenessState;
    if (AUTHORIZATION_REQUIRED_AWARENESS.includes(awareness) && !hasAuthorization) {
      throw new EndingResolutionError(
        `${endingId}: awareness ${awareness} requires authored authorization (one of ${authorizingTalents.join(', ') || 'none registered'})`,
      );
    }
    return { awareness, authorized: hasAuthorization };
  };

  // An explicit endingOverride always wins, subject to the authorization rule.
  if (override) return requestExplicit(override);

  const rules: AwarenessRule[] | undefined = content.adapters.endingAwarenessRules[ending.defaultAwarenessRaw];
  if (rules) {
    for (const rule of rules) {
      if (rule.ifMaterial && !rule.ifMaterial.includes(material as never)) continue;
      if (rule.requiresAuthorization && !hasAuthorization) continue;
      if (AUTHORIZATION_REQUIRED_AWARENESS.includes(rule.state) && !hasAuthorization) continue;
      return { awareness: rule.state, authorized: hasAuthorization };
    }
  }
  return { awareness: contractDefaultAwareness(material), authorized: hasAuthorization };
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
