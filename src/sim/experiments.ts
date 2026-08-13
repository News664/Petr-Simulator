import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { CONTENT_ROOT, type ContentBundle } from '../engine/content/load.js';
import { clearConditionCache, parseCondition } from '../engine/conditions/parser.js';
import type { GameEvent, ScheduleSpec } from '../engine/types.js';

/**
 * Phase 1.1 experiment harness.
 *
 * Implements `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json` as a reversible
 * DIAGNOSTIC layer. It never rewrites creative prose and never writes to disk:
 * every transform produces a derived in-memory ContentBundle.
 *
 * The matrix is an experiment input. Nothing here selects or freezes a profile.
 */

const experimentMatrixSchema = z
  .object({
    version: z.string(),
    status: z.string().optional(),
    purpose: z.string().optional(),
    implementationNote: z.string().optional(),
    gateAssignments: z.record(z.string(), z.array(z.string())),
    thresholdProfiles: z.record(z.string(), z.record(z.string(), z.number())),
    primaryExperimentPlan: z.array(z.record(z.string(), z.unknown())),
    minmaxPolicy: z.object({ description: z.string() }).strict(),
    archetypePolicy: z
      .object({
        description: z.string(),
        archetypes: z.array(z.object({ id: z.string(), priority: z.array(z.string()) }).strict()),
      })
      .strict(),
    t1027Sensitivity: z
      .object({
        runAfter: z.string().optional(),
        startFIXValues: z.array(z.number().int()),
        reportSeparately: z.boolean().optional(),
      })
      .strict(),
    requiredComparisons: z.array(z.string()).optional(),
  })
  .strict();

export type ExperimentMatrix = z.infer<typeof experimentMatrixSchema>;

export function loadExperimentMatrix(file?: string): ExperimentMatrix {
  const target =
    file ?? path.join(CONTENT_ROOT, 'balance', 'SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json');
  const parsed = experimentMatrixSchema.safeParse(JSON.parse(readFileSync(target, 'utf8')));
  if (!parsed.success) {
    throw new Error(
      `experiment matrix invalid:\n  - ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('\n  - ')}`,
    );
  }
  return parsed.data;
}

const FIX_GATE_RE = /FIX\s*>=\s*\d+/g;

function rewriteFixGate(source: string, threshold: number): { text: string; replaced: number } {
  let replaced = 0;
  const text = source.replace(FIX_GATE_RE, () => {
    replaced += 1;
    return `FIX>=${threshold}`;
  });
  return { text, replaced };
}

export interface ThresholdApplication {
  profile: string;
  /** Per-event thresholds actually applied. */
  applied: Map<string, number>;
  /** Gate-assigned events whose conditions contained no FIX gate to rewrite. */
  eventsWithoutGate: string[];
  totalRewrites: number;
}

/**
 * Returns a derived bundle whose FIX gates follow the named threshold profile.
 *
 * The gate appears in two places for a climax: the target event's own `include`
 * and the `validityCondition` of every schedule pointing at it. Both are
 * rewritten, keyed by target event ID, so a profile cannot be half-applied.
 */
export function applyThresholdProfile(
  content: ContentBundle,
  matrix: ExperimentMatrix,
  profileName: string,
): { content: ContentBundle; application: ThresholdApplication } {
  const profile = matrix.thresholdProfiles[profileName];
  if (!profile) {
    throw new Error(
      `unknown threshold profile ${profileName}; expected one of ${Object.keys(matrix.thresholdProfiles).join(', ')}`,
    );
  }

  const thresholdByEvent = new Map<string, number>();
  for (const [gate, eventIds] of Object.entries(matrix.gateAssignments)) {
    const threshold = profile[gate];
    if (threshold === undefined) {
      throw new Error(`threshold profile ${profileName} has no value for gate ${gate}`);
    }
    for (const eventId of eventIds) {
      if (!content.eventsById.has(eventId)) {
        throw new Error(`experiment matrix gate ${gate} references unknown event ${eventId}`);
      }
      thresholdByEvent.set(eventId, threshold);
    }
  }

  const eventsWithoutGate: string[] = [];
  let totalRewrites = 0;

  const events: GameEvent[] = content.events.map((event) => {
    const own = thresholdByEvent.get(event.id);
    let include = event.include;
    let ownRewrites = 0;
    if (own !== undefined) {
      const result = rewriteFixGate(include, own);
      include = result.text;
      ownRewrites += result.replaced;
    }

    // Rewrite schedule validity gates that point at a gate-assigned event.
    let scheduleRewrites = 0;
    const variants = event.variants.map((variant) => {
      if (variant.schedules.length === 0) return variant;
      const schedules: ScheduleSpec[] = variant.schedules.map((schedule) => {
        const target = thresholdByEvent.get(schedule.eventId);
        if (target === undefined) return schedule;
        const result = rewriteFixGate(schedule.validityCondition, target);
        scheduleRewrites += result.replaced;
        return result.replaced === 0 ? schedule : { ...schedule, validityCondition: result.text };
      });
      return { ...variant, schedules };
    });

    if (own !== undefined && ownRewrites === 0) eventsWithoutGate.push(event.id);
    totalRewrites += ownRewrites + scheduleRewrites;

    if (ownRewrites === 0 && scheduleRewrites === 0) return event;
    return { ...event, include, variants };
  });

  // Every rewritten condition must still parse.
  clearConditionCache();
  for (const event of events) {
    parseCondition(event.include);
    for (const variant of event.variants) {
      for (const schedule of variant.schedules) parseCondition(schedule.validityCondition);
    }
  }

  const derived: ContentBundle = {
    ...content,
    events,
    eventsById: new Map(events.map((e) => [e.id, e])),
    contentVersion: `${content.contentVersion}:threshold=${profileName}`,
  };

  return {
    content: derived,
    application: {
      profile: profileName,
      applied: thresholdByEvent,
      eventsWithoutGate,
      totalRewrites,
    },
  };
}

/** Derived bundle with a different family-weighting mode (A/B diagnostic only). */
export function withFamilyWeightMode(
  content: ContentBundle,
  mode: 'uniform' | 'sum_of_event_weights',
): ContentBundle {
  if (content.balance.familyWeightMode === mode) return content;
  return {
    ...content,
    balance: { ...content.balance, familyWeightMode: mode },
    contentVersion: `${content.contentVersion}:family=${mode}`,
  };
}

/** Derived bundle with a diagnostic T1027 starting-FIX bonus (Q-14 sweep). */
export function withT1027StartFix(content: ContentBundle, startFIX: number): ContentBundle {
  const talents = new Map(content.talents);
  const t1027 = talents.get('T1027');
  if (!t1027) throw new Error('T1027 is not in the talent registry');
  talents.set('T1027', { ...t1027, startFixBonus: startFIX });
  return {
    ...content,
    talents,
    contentVersion: `${content.contentVersion}:t1027=${startFIX}`,
  };
}
