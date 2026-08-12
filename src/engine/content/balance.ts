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
  })
  .strict();

export type BalanceConstants = z.infer<typeof balanceConstantsSchema>;

const talentAdapterSchema = z
  .object({
    favorChannels: z.array(z.enum(CHANNELS)).optional(),
    stronglyFavorChannels: z.array(z.enum(CHANNELS)).optional(),
    suppressChannels: z.array(z.enum(CHANNELS)).optional(),
    favorFamilies: z.array(z.string()).optional(),
    stronglyFavorFamilies: z.array(z.string()).optional(),
    suppressFamilies: z.array(z.string()).optional(),
    startFIX: z.number().int().optional(),
    registeredSpeciesRule: z.enum(['UNREGISTERED', 'SEEDED_OTHER_SPECIES']).optional(),
    unmappedHooks: z.array(z.string()).optional(),
    sourceText: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();

const awarenessRuleSchema = z
  .object({
    state: z.enum(AWARENESS_STATES),
    ifMaterial: z.array(z.enum(MATERIALS)).optional(),
    requiresAuthorization: z.boolean().optional(),
  })
  .strict();

export const balanceAdaptersSchema = z
  .object({
    version: z.string(),
    status: z.string().optional(),
    warning: z.string().optional(),
    reviewPointer: z.string().optional(),
    provenance: z.record(z.string(), z.string()).optional(),
    engineRules: z
      .object({
        repeatCooldownSemantics: z.enum(['at_least', 'strictly_greater']),
        repeatCooldownNote: z.string().optional(),
        scheduleWindowSemantics: z.literal('earliest_plus_window'),
        scheduleWindowNote: z.string().optional(),
        scheduleValidityIsFireGate: z.boolean(),
        scheduleValidityNote: z.string().optional(),
        pre25CoveragePolicy: z.enum(['strict', 'reuse_baseline_repeatables']),
        pre25CoveragePolicyNote: z.string().optional(),
        pre25CoverageReuseRouteTag: z.string(),
        familyWeightMode: z.enum(['sum_of_event_weights', 'uniform']),
        familyWeightNote: z.string().optional(),
        statClamp: z
          .object({
            visibleMin: z.number().int().nullable(),
            visibleMax: z.number().int().nullable(),
            fixMin: z.number().int().nullable(),
            fixMax: z.number().int().nullable(),
          })
          .strict(),
        statClampNote: z.string().optional(),
        speciesTendencyPrecedence: z.array(z.enum(['primary', 'secondary', 'uncommon'])),
        speciesTendencyPrecedenceNote: z.string().optional(),
        startingAllocationRange: z.object({ min: z.number().int(), max: z.number().int() }).strict(),
        startingAllocationNote: z.string().optional(),
        diagnosticMaxAge: z.number().int().min(1),
      })
      .strict(),
    speciesTendencyFamilyMap: z.record(z.string(), z.string()),
    speciesTendencyUnmapped: z.record(z.string(), z.string()).optional(),
    routeTagFlagPrefixes: z.record(z.string(), z.string()),
    routeTagsWithNoTransformationFavor: z.array(z.string()).default([]),
    routeTagsWithNoTransformationFavorNote: z.string().optional(),
    routeTagsWithoutFlagNamespace: z.array(z.string()).optional(),
    materialFlagPrefixes: z.object({ hint: z.string(), manifestation: z.string() }).strict(),
    talentAdapters: z.record(z.string(), z.union([talentAdapterSchema, z.string()])),
    startingFIX: z.object({ base: z.number().int(), note: z.string().optional() }).strict(),
    endingAwarenessRules: z.record(z.string(), z.union([z.array(awarenessRuleSchema), z.string()])),
    endingAwarenessAuthorizingTalents: z.record(z.string(), z.array(z.string())),
    endingUnresolvedPlaceholder: z.string(),
    endingUnresolvedNote: z.string().optional(),
  })
  .strict();

export type BalanceAdaptersRaw = z.infer<typeof balanceAdaptersSchema>;
export type TalentAdapter = z.infer<typeof talentAdapterSchema>;
export type AwarenessRule = z.infer<typeof awarenessRuleSchema>;

/** Adapters with the `_policy` documentation strings stripped out. */
export interface BalanceAdapters extends Omit<BalanceAdaptersRaw, 'talentAdapters' | 'endingAwarenessRules'> {
  talentAdapters: Record<string, TalentAdapter>;
  endingAwarenessRules: Record<string, AwarenessRule[]>;
}

export function normalizeAdapters(raw: BalanceAdaptersRaw): BalanceAdapters {
  const talentAdapters: Record<string, TalentAdapter> = {};
  for (const [key, value] of Object.entries(raw.talentAdapters)) {
    if (typeof value === 'string') continue; // documentation entries such as `_policy`
    talentAdapters[key] = value;
  }
  const endingAwarenessRules: Record<string, AwarenessRule[]> = {};
  for (const [key, value] of Object.entries(raw.endingAwarenessRules)) {
    if (typeof value === 'string') continue;
    endingAwarenessRules[key] = value;
  }
  return { ...raw, talentAdapters, endingAwarenessRules };
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
