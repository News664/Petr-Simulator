import { z } from 'zod';
import {
  CHANNELS,
  MATERIALS,
  REPEAT_POLICIES,
  SCHEDULE_PRIORITIES,
  SELECTION_MODES,
  SPECIES_IDS,
  WEIGHT_CLASSES,
} from '../types.js';

/** `EVT-{CHANNEL}-{FAMILY}-{NNNN}` — Event Taxonomy v0.2. */
export const EVENT_ID_RE = /^EVT-(ORD|INS|TRN|SPC)-[A-Z0-9]+-\d{4}$/;
/** `END-{PRIMARY_FAMILY}-{NNN}` — Core Contract section 22. */
export const ENDING_ID_RE = /^END-[A-Z0-9]+-\d{3}$/;
export const TALENT_ID_RE = /^T\d{4}$/;
export const FLAG_ID_RE = /^[A-Z][A-Z0-9_]*$/;

const conditionString = z.string().min(1);

export const scheduleSpecSchema = z
  .object({
    eventId: z.string().regex(EVENT_ID_RE, 'malformed scheduled event id'),
    offsetYears: z.number().int().min(1),
    windowYears: z.number().int().min(0),
    priority: z.enum(SCHEDULE_PRIORITIES),
    // Content Schema v0.3. Absent behaves as 0.
    priorityOrder: z.number().int().optional(),
    validityCondition: conditionString,
  })
  .strict();

export const statEffectsSchema = z
  .object({
    CHR: z.number().int().optional(),
    INT: z.number().int().optional(),
    STR: z.number().int().optional(),
    MNY: z.number().int().optional(),
    SPR: z.number().int().optional(),
    FIX: z.number().int().optional(),
  })
  .strict();

export const localizedTextSchema = z
  .object({
    en: z.string().min(1),
    // zh-TW stays reserved until localization. Empty is expected and legal.
    'zh-TW': z.string(),
  })
  .strict();

export const eventVariantSchema = z
  .object({
    when: conditionString,
    text: localizedTextSchema,
    effects: statEffectsSchema,
    addFlags: z.array(z.string().regex(FLAG_ID_RE)),
    removeFlags: z.array(z.string().regex(FLAG_ID_RE)),
    schedules: z.array(scheduleSpecSchema),
    setMaterialCommitment: z.enum(MATERIALS).optional(),
    endingId: z.string().regex(ENDING_ID_RE).optional(),
    endingOverrides: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const gameEventSchema = z
  .object({
    id: z.string().regex(EVENT_ID_RE, 'malformed event id'),
    channel: z.enum(CHANNELS),
    family: z.string().regex(/^[A-Z0-9]+$/),
    age: z
      .object({
        min: z.number().int().min(0),
        max: z.number().int().min(0).nullable(),
      })
      .strict(),
    selectionMode: z.enum(SELECTION_MODES),
    weightClass: z.enum(WEIGHT_CLASSES),
    repeatPolicy: z.enum(REPEAT_POLICIES),
    repeatCooldownYears: z.number().int().min(0),
    repeatMaxCount: z.number().int().min(1).nullable(),
    routeTags: z.array(z.string()),
    materialTags: z.array(z.string()),
    // Content Schema v0.3. Optional; validated against the Species Registry.
    refinementTags: z.array(z.string()).optional(),
    include: conditionString,
    exclude: conditionString,
    variants: z.array(eventVariantSchema).min(1),
    designerNotes: z.string(),
  })
  .strict()
  .superRefine((event, ctx) => {
    if (event.age.max !== null && event.age.max < event.age.min) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${event.id}: age.max < age.min` });
    }
    if (!event.id.startsWith(`EVT-${event.channel}-${event.family}-`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${event.id}: id does not encode its own channel/family`,
      });
    }
    // Content Schema v0.2 repeatability invariants.
    if (event.repeatPolicy === 'once_per_run' && event.repeatMaxCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${event.id}: once_per_run must have repeatMaxCount=1`,
      });
    }
    if (event.selectionMode === 'fallback_only') {
      if (event.repeatPolicy !== 'repeatable') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${event.id}: fallback_only must be repeatable`,
        });
      }
      if (event.age.min < 25) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${event.id}: fallback_only is forbidden before age 25`,
        });
      }
    }
    // Contract section 13 / taxonomy: a final TRUE fallback variant is validated.
    const last = event.variants[event.variants.length - 1]!;
    if (last.when !== 'TRUE') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${event.id}: final variant must be a TRUE fallback`,
      });
    }
    // Childhood safety (Taxonomy v0.2 / Acceptance E).
    if (event.age.min < 18) {
      event.variants.forEach((variant, index) => {
        if (variant.setMaterialCommitment) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${event.id} variant ${index + 1}: Material Commitment forbidden on an under-18-capable event`,
          });
        }
        if (variant.endingId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${event.id} variant ${index + 1}: canonical ending forbidden on an under-18-capable event`,
          });
        }
      });
    }
  });

export const eventBatchSchema = z
  .object({
    batchId: z.string().min(1),
    version: z.string().min(1),
    languageStatus: z.record(z.string(), z.string()).optional(),
    notes: z.string().optional(),
    events: z.array(gameEventSchema).min(1),
  })
  .strict();

const refinementOperationSchema = z.enum(['favor', 'strongly_favor', 'suppress', 'unlock']);

/** Species Registry v1.2. */
export const speciesRegistrySchema = z
  .object({
    version: z.string(),
    canonical: z.boolean().optional(),
    tendency_vocabulary: z.array(z.string()).optional(),
    family_tendency_rule: z.string().optional(),
    refinement_rule: z.string().optional(),
    refinement_tags: z.record(
      z.string(),
      z.object({ family: z.string().nullable(), description: z.string() }).strict(),
    ),
    species: z
      .array(
        z
          .object({
            id: z.enum(SPECIES_IDS),
            name_en: z.string(),
            name_zh_tw: z.string(),
            colloquial_en: z.string(),
            colloquial_zh_tw: z.string(),
            allocation_points: z.number().int().min(1),
            modifiers: z
              .object({
                CHR: z.number().int().optional(),
                INT: z.number().int().optional(),
                STR: z.number().int().optional(),
                MNY: z.number().int().optional(),
                SPR: z.number().int().optional(),
              })
              .strict(),
            notes: z.string(),
            family_tendencies: z
              .object({
                primary: z.array(z.string()),
                secondary: z.array(z.string()),
                uncommon: z.array(z.string()),
              })
              .strict(),
            refinement_hooks: z.array(
              z.object({ tag: z.string(), operation: refinementOperationSchema }).strict(),
            ),
          })
          .strict(),
      )
      .min(1),
    authoring_rule: z.string().optional(),
    institution_rule: z.string().optional(),
  })
  .strict();

/** Route Tag Registry v1.0. */
export const routeTagRegistrySchema = z
  .object({
    version: z.string(),
    canonical: z.boolean().optional(),
    stackingRule: z.string().optional(),
    familyRule: z.string().optional(),
    validationRule: z.string().optional(),
    tags: z
      .array(
        z
          .object({
            tag: z.string().min(1),
            kind: z.string().min(1),
            flagPrefixes: z.array(z.string()),
            activeEventFavor: z.boolean(),
            allowTransformationEventFavor: z.boolean(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
