import { z } from 'zod';
import { AWARENESS_STATES, CHANNELS, MATERIALS } from '../types.js';

/**
 * Balance and adapter configuration schemas.
 *
 * Both files are data. Nothing in the engine hard-codes a balance number; the
 * engine reads these structures and the CLI can be pointed at replacements.
 */

const ageBandSchema = z
  .object({
    minAge: z.number().int().min(0),
    maxAge: z.number().int().min(0).nullable(),
    ORD: z.number().min(0),
    INS: z.number().min(0),
    TRN: z.number().min(0),
    SPC: z.number().min(0),
  })
  .strict();

export const balanceConstantsSchema = z
  .object({
    version: z.string(),
    status: z.string().optional(),
    warning: z.string().optional(),
    ageChannelWeights: z.array(ageBandSchema).min(1),
    eventWeightClassScalar: z
      .object({
        VERY_LOW: z.number().min(0),
        LOW: z.number().min(0),
        NORMAL: z.number().min(0),
        HIGH: z.number().min(0),
        VERY_HIGH: z.number().min(0),
      })
      .strict(),
    familyEvidenceScalar: z
      .object({
        speciesPrimary: z.number().min(0),
        speciesSecondary: z.number().min(0),
        speciesUncommon: z.number().min(0),
        hintMatchingFamily: z.number().min(0),
        manifestMatchingFamily: z.number().min(0),
        routeFavor: z.number().min(0),
        talentFavor: z.number().min(0),
        talentStronglyFavor: z.number().min(0),
        talentSuppress: z.number().min(0),
      })
      .strict(),
    fixTransformationChannelScalar: z
      .array(
        z
          .object({
            minFIX: z.number().int(),
            maxFIX: z.number().int().nullable(),
            scalar: z.number().min(0),
          })
          .strict(),
      )
      .min(1),
    priorityClassRank: z
      .object({
        ending_or_hidden_climax: z.number(),
        mandatory_route: z.number(),
        scheduled: z.number(),
        normal: z.number(),
      })
      .strict(),
    fallback: z
      .object({
        minimumAge: z.number().int().min(0),
        participatesInNormalDraft: z.boolean(),
      })
      .strict(),
    diagnosticSimulation: z
      .object({
        maxAge: z.number().int().min(1),
        onMaxAgeWithoutEnding: z.string(),
        defaultRunsPerScenario: z.number().int().min(1),
      })
      .strict(),
    diagnosticSampling: z
      .object({
        speciesMode: z.string(),
        talentMode: z.string(),
        talentScenarios: z.array(z.string()),
        note: z.string().optional(),
        allocationPolicies: z.array(z.string()).optional(),
      })
      .strict(),
    targetEndingAgeShare: z.array(
      z
        .object({
          minAge: z.number().int(),
          maxAge: z.number().int().nullable(),
          minShare: z.number(),
          maxShare: z.number(),
        })
        .strict(),
    ),
    materialDeterminismGuardrails: z
      .object({
        maxSameMaterialShareGivenOnlyMatchingHint: z.number(),
        maxSameMaterialShareGivenFirstManifestation: z.number(),
        warningOnly: z.boolean(),
      })
      .strict(),
    fallbackGuardrails: z
      .object({
        pre25FallbackAllowed: z.boolean(),
        targetFallbackShareAge25Plus: z.number(),
        warningIfAbove: z.number(),
      })
      .strict(),
    notes: z.array(z.string()).optional(),
    // --- Phase 1.1 (Balance Constants v0.2) ---
    familyWeightMode: z.enum(['uniform', 'sum_of_event_weights']),
    familyWeightDiagnosticComparisonModes: z.array(z.enum(['uniform', 'sum_of_event_weights'])).optional(),
    speciesRefinementScalar: z
      .object({ favor: z.number().min(0), stronglyFavor: z.number().min(0), suppress: z.number().min(0) })
      .strict(),
    /** Q-26: must stay null. No passive annual FIX drift is authorized. */
    fixAnnualDrift: z.null(),
    startingFIX: z.object({ base: z.number().int() }).strict(),
    statClamp: z
      .object({
        visibleMin: z.number().int().nullable(),
        visibleMax: z.number().int().nullable(),
        fixMin: z.number().int().nullable(),
        fixMax: z.number().int().nullable(),
      })
      .strict(),
    repeatCooldownSemantics: z.enum(['at_least', 'strictly_greater']),
    scheduleSemantics: z
      .object({
        validityCondition: z.literal('fire_gate'),
        window: z.literal('earliest_plus_window_inclusive'),
      })
      .strict(),
  })
  .strict();

export type BalanceConstants = z.infer<typeof balanceConstantsSchema>;

/**
 * Phase 1.1 diagnostic adapters.
 *
 * Everything that Phase 1 kept here has moved into canonical registries:
 * species tendencies/refinements -> Species Registry v1.2, talent drafting
 * polarity and registered-species rules -> Talent Registry v1.1, awareness ->
 * Ending Registry v1.1, route tag namespaces -> Route Tag Registry v1.0, and
 * every engine rule -> Balance Constants v0.2.
 *
 * What remains is only what design has explicitly left unresolved.
 */
const talentDiagnosticSchema = z
  .object({
    /** Q-14 is OPEN. Canonical `start_fix_bonus` is blank; this drives sweeps. */
    startFIX: z.number().int().optional(),
    note: z.string().optional(),
  })
  .strict();

export const balanceAdaptersSchema = z
  .object({
    version: z.string(),
    status: z.string().optional(),
    warning: z.string().optional(),
    reviewPointer: z.string().optional(),
    /** Diagnostic talent overrides for unresolved questions. */
    talentDiagnostics: z.record(z.string(), z.union([talentDiagnosticSchema, z.string()])),
    /** Placeholder resolution for Ending Record prose fields. */
    endingUnresolvedPlaceholder: z.string(),
    endingUnresolvedNote: z.string().optional(),
  })
  .strict();

export type BalanceAdaptersRaw = z.infer<typeof balanceAdaptersSchema>;
export type TalentDiagnostic = z.infer<typeof talentDiagnosticSchema>;

export interface BalanceAdapters extends Omit<BalanceAdaptersRaw, 'talentDiagnostics'> {
  talentDiagnostics: Record<string, TalentDiagnostic>;
}

export function normalizeAdapters(raw: BalanceAdaptersRaw): BalanceAdapters {
  const talentDiagnostics: Record<string, TalentDiagnostic> = {};
  for (const [key, value] of Object.entries(raw.talentDiagnostics)) {
    if (typeof value === 'string') continue; // documentation entries such as `_policy`
    talentDiagnostics[key] = value;
  }
  return { ...raw, talentDiagnostics };
}

/** Channel weight lookup for an age. */
export function channelWeightsForAge(
  balance: BalanceConstants,
  age: number,
): Record<(typeof CHANNELS)[number], number> {
  for (const band of balance.ageChannelWeights) {
    if (age >= band.minAge && (band.maxAge === null || age <= band.maxAge)) {
      return { ORD: band.ORD, INS: band.INS, TRN: band.TRN, SPC: band.SPC };
    }
  }
  throw new Error(`no ageChannelWeights band covers age ${age}`);
}

/** Transformation-channel scalar for the current FIX. */
export function fixChannelScalar(balance: BalanceConstants, fix: number): number {
  for (const band of balance.fixTransformationChannelScalar) {
    if (fix >= band.minFIX && (band.maxFIX === null || fix <= band.maxFIX)) return band.scalar;
  }
  throw new Error(`no fixTransformationChannelScalar band covers FIX ${fix}`);
}
