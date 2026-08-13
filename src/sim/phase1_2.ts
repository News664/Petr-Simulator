import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { CONTENT_ROOT, type ContentBundle } from '../engine/content/load.js';
import { eligibleNormalEvents } from '../engine/eligibility.js';
import type { RunResult } from '../engine/simulation.js';
import type { Channel, EventOccurrence, RunState } from '../engine/types.js';

/**
 * Phase 1.2 compact diagnostic harness.
 *
 * Implements `SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json` and nothing else.
 * The Phase 1.1 sweeps (threshold LOW/MID/HIGH, family-weight A/B, allocation
 * three-way, T1027 sensitivity) are deliberately NOT executed here; their code
 * in `experiments.ts` stays intact per the plan's `retentionPolicy`.
 *
 * Everything in this module measures. Nothing tunes content or balance.
 */

const diagnosticPlanSchema = z
  .object({
    version: z.string(),
    status: z.string(),
    purpose: z.string(),
    baseline: z
      .object({
        runs: z.number().int().positive(),
        speciesMode: z.string(),
        talentScenario: z.string(),
        allocationPolicy: z.string(),
        familyWeightMode: z.enum(['uniform', 'sum_of_event_weights']),
        thresholdMode: z.string(),
        pre25CoveragePolicy: z.string(),
      })
      .strict(),
    targetedDiagnostics: z.array(
      z
        .object({
          id: z.string(),
          runs: z.number().int().positive().optional(),
          runsPerArm: z.number().int().positive().optional(),
          species: z.string().optional(),
          talents: z.array(z.string()).optional(),
          allocationPolicy: z.string().optional(),
          arms: z
            .array(z.object({ name: z.string(), talents: z.array(z.string()) }).strict())
            .optional(),
          report: z.array(z.string()),
        })
        .strict(),
    ),
    requiredBaselineMetrics: z.array(z.string()),
    explicitlySkippedThisPatch: z.array(z.string()),
    retentionPolicy: z
      .object({ notDropped: z.boolean(), rerunWhen: z.array(z.string()) })
      .strict(),
    stopCondition: z.string(),
  })
  .strict();

export type DiagnosticPlan = z.infer<typeof diagnosticPlanSchema>;

export function loadDiagnosticPlan(file?: string): DiagnosticPlan {
  const target =
    file ?? path.join(CONTENT_ROOT, 'balance', 'SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json');
  const parsed = diagnosticPlanSchema.safeParse(JSON.parse(readFileSync(target, 'utf8')));
  if (!parsed.success) {
    throw new Error(
      `Phase 1.2 diagnostic plan invalid:\n  - ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('\n  - ')}`,
    );
  }
  return parsed.data;
}

/** Looks up a targeted diagnostic by the plan's own id. */
export function targetedDiagnostic(plan: DiagnosticPlan, id: string): DiagnosticPlan['targetedDiagnostics'][number] {
  const found = plan.targetedDiagnostics.find((entry) => entry.id === id);
  if (!found) throw new Error(`diagnostic plan has no targeted diagnostic ${id}`);
  return found;
}

// ---------------------------------------------------------------------------
// T1023 / SPC split
// ---------------------------------------------------------------------------

export interface SpcSplit {
  completedRuns: number;
  noncompletedRuns: number;
  spcEventsInCompleted: number;
  spcEventsInNoncompleted: number;
  spcPerCompletedRun: number | null;
  spcPerNoncompletedRun: number | null;
  runsWithAnySpc: number;
  anySpcRate: number;
}

/**
 * SPC event counts split by outcome.
 *
 * `MetricsSummary.spcShare` is a share of all event-years; the plan additionally
 * asks for SPC events per completed vs non-completed run, which separates "SPC
 * is rare" from "SPC only happens in long runs".
 */
export function spcSplit(results: RunResult[]): SpcSplit {
  let completedRuns = 0;
  let noncompletedRuns = 0;
  let spcEventsInCompleted = 0;
  let spcEventsInNoncompleted = 0;
  let runsWithAnySpc = 0;

  for (const result of results) {
    const spc = result.state.history.filter((occurrence) => occurrence.channel === 'SPC').length;
    if (spc > 0) runsWithAnySpc += 1;
    if (result.outcome.kind === 'ended') {
      completedRuns += 1;
      spcEventsInCompleted += spc;
    } else {
      noncompletedRuns += 1;
      spcEventsInNoncompleted += spc;
    }
  }

  return {
    completedRuns,
    noncompletedRuns,
    spcEventsInCompleted,
    spcEventsInNoncompleted,
    spcPerCompletedRun: completedRuns === 0 ? null : spcEventsInCompleted / completedRuns,
    spcPerNoncompletedRun: noncompletedRuns === 0 ? null : spcEventsInNoncompleted / noncompletedRuns,
    runsWithAnySpc,
    anySpcRate: results.length === 0 ? 0 : runsWithAnySpc / results.length,
  };
}

export interface FactionSeedIncidence {
  /** Runs that acquired at least one registered `FAC_*` flag. */
  anyContactRuns: number;
  anyContactRate: number;
  /** Age at first faction contact, averaged over runs that had one. */
  meanFirstContactAge: number | null;
  /** Per-faction run counts, keyed by faction shortName. */
  byFaction: Record<string, number>;
  /** Per-faction age at first contact. */
  meanFirstContactAgeByFaction: Record<string, number | null>;
}

/**
 * Faction seed incidence.
 *
 * Contact is a discrete flag context — never membership — so this counts runs
 * that crossed a faction's path, not runs that "joined" anything.
 */
export function factionSeedIncidence(content: ContentBundle, results: RunResult[]): FactionSeedIncidence {
  const flagToFaction = new Map<string, string>();
  for (const faction of content.factions.values()) {
    for (const flag of faction.flags) flagToFaction.set(flag, faction.shortName);
  }

  const byFaction: Record<string, number> = {};
  const firstAgesByFaction: Record<string, number[]> = {};
  for (const faction of content.factions.values()) {
    byFaction[faction.shortName] = 0;
    firstAgesByFaction[faction.shortName] = [];
  }
  const firstAges: number[] = [];
  let anyContactRuns = 0;

  for (const result of results) {
    // Earliest year each faction flag appeared, recovered from the timeline.
    const firstAgeFor = new Map<string, number>();
    for (const occurrence of result.state.history) {
      const gameEvent = content.eventsById.get(occurrence.eventId);
      const variant = gameEvent?.variants[occurrence.variantIndex];
      if (!variant) continue;
      for (const flag of variant.addFlags) {
        const name = flagToFaction.get(flag);
        if (name === undefined) continue;
        if (!firstAgeFor.has(name)) firstAgeFor.set(name, occurrence.age);
      }
    }
    if (firstAgeFor.size === 0) continue;
    anyContactRuns += 1;
    firstAges.push(Math.min(...firstAgeFor.values()));
    for (const [name, age] of firstAgeFor) {
      byFaction[name] = (byFaction[name] ?? 0) + 1;
      (firstAgesByFaction[name] ??= []).push(age);
    }
  }

  const mean = (values: number[]): number | null =>
    values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;

  return {
    anyContactRuns,
    anyContactRate: results.length === 0 ? 0 : anyContactRuns / results.length,
    meanFirstContactAge: mean(firstAges),
    byFaction,
    meanFirstContactAgeByFaction: Object.fromEntries(
      Object.entries(firstAgesByFaction).map(([name, ages]) => [name, mean(ages)]),
    ),
  };
}

// ---------------------------------------------------------------------------
// Neutral-Human manifestation probe (ages 18-20)
// ---------------------------------------------------------------------------

const MANIFEST_PREFIX = 'MAT_MANIFEST_';
const HINT_PREFIX = 'MAT_HINT_';

export interface ManifestationWindowProbe {
  /** Ages sampled, in order. */
  ages: number[];
  /**
   * Observations = (run, year) pairs inside the window where the run was still
   * active and MAT was still NONE at draft time.
   */
  observations: number;
  observationsByAge: Record<string, number>;
  /**
   * P(unprompted manifestation of family F in a window year): the year produced
   * `MAT_MANIFEST_F` while the pre-event state held neither `MAT_HINT_F` nor
   * `MAT_MANIFEST_F`.
   */
  unpromptedByFamily: Record<string, number>;
  unpromptedProbabilityByFamily: Record<string, number>;
  unpromptedTotal: number;
  unpromptedProbability: number;
  /** Manifestations in the window that DID follow matching evidence. */
  promptedTotal: number;
  /** Distinct eligible families in the draft pool, averaged per age. */
  eligibleFamiliesByAge: Record<string, { mean: number; min: number; max: number; samples: number }>;
  /** Eligible families per channel, averaged per age. */
  eligibleFamiliesByAgeChannel: Record<string, Record<Channel, number>>;
  /** How often each channel/family was eligible at all, across the window. */
  familyEligibilityCounts: Record<string, number>;
  /** Distinct eligible events in the draft pool, averaged per age. */
  eligibleEventsByAge: Record<string, number>;
}

interface Snapshot {
  age: number;
  material: string;
  flags: Set<string>;
}

/**
 * Collects the age-18-20 manifestation-opportunity probe.
 *
 * Returns the hooks to hand to `runScenario`, plus a `finish()` that folds the
 * collected samples into the report shape. The probe reads state only; it never
 * influences drafting.
 */
export function manifestationWindowProbe(
  content: ContentBundle,
  ages: number[],
): {
  hooks: { onBeforeYear: (state: RunState) => void; onYear: (occurrence: EventOccurrence, state: RunState) => void };
  finish: () => ManifestationWindowProbe;
} {
  const window = new Set(ages);
  let snapshot: Snapshot | null = null;

  let observations = 0;
  const observationsByAge: Record<string, number> = {};
  const unpromptedByFamily: Record<string, number> = {};
  let unpromptedTotal = 0;
  let promptedTotal = 0;
  const eligibleFamilyCountsByAge: Record<string, number[]> = {};
  const eligibleEventCountsByAge: Record<string, number[]> = {};
  const eligibleFamiliesByAgeChannel: Record<string, Record<Channel, number[]>> = {};
  const familyEligibilityCounts: Record<string, number> = {};
  for (const age of ages) {
    observationsByAge[String(age)] = 0;
    eligibleFamilyCountsByAge[String(age)] = [];
    eligibleEventCountsByAge[String(age)] = [];
    eligibleFamiliesByAgeChannel[String(age)] = { ORD: [], INS: [], TRN: [], SPC: [] };
  }

  const onBeforeYear = (state: RunState): void => {
    if (!window.has(state.age) || state.material !== 'NONE') {
      snapshot = null;
      return;
    }
    snapshot = { age: state.age, material: state.material, flags: new Set(state.flags) };

    const key = String(state.age);
    observations += 1;
    observationsByAge[key] = (observationsByAge[key] ?? 0) + 1;

    const pool = eligibleNormalEvents(state, content);
    eligibleEventCountsByAge[key]!.push(pool.length);
    const families = new Set<string>();
    const perChannel: Record<Channel, Set<string>> = {
      ORD: new Set(),
      INS: new Set(),
      TRN: new Set(),
      SPC: new Set(),
    };
    for (const gameEvent of pool) {
      const label = `${gameEvent.channel}/${gameEvent.family}`;
      families.add(label);
      perChannel[gameEvent.channel].add(gameEvent.family);
    }
    eligibleFamilyCountsByAge[key]!.push(families.size);
    for (const label of families) familyEligibilityCounts[label] = (familyEligibilityCounts[label] ?? 0) + 1;
    for (const channel of Object.keys(perChannel) as Channel[]) {
      eligibleFamiliesByAgeChannel[key]![channel].push(perChannel[channel].size);
    }
  };

  const onYear = (occurrence: EventOccurrence): void => {
    const before = snapshot;
    snapshot = null;
    if (!before || before.age !== occurrence.age) return;
    const gameEvent = content.eventsById.get(occurrence.eventId);
    const variant = gameEvent?.variants[occurrence.variantIndex];
    if (!variant) return;
    for (const flag of variant.addFlags) {
      if (!flag.startsWith(MANIFEST_PREFIX)) continue;
      const family = flag.slice(MANIFEST_PREFIX.length);
      const hadEvidence = before.flags.has(flag) || before.flags.has(`${HINT_PREFIX}${family}`);
      if (hadEvidence) {
        promptedTotal += 1;
        continue;
      }
      unpromptedByFamily[family] = (unpromptedByFamily[family] ?? 0) + 1;
      unpromptedTotal += 1;
    }
  };

  const meanOf = (values: number[]): number =>
    values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

  const finish = (): ManifestationWindowProbe => ({
    ages: [...ages],
    observations,
    observationsByAge,
    unpromptedByFamily,
    unpromptedProbabilityByFamily: Object.fromEntries(
      Object.entries(unpromptedByFamily).map(([family, count]) => [
        family,
        observations === 0 ? 0 : count / observations,
      ]),
    ),
    unpromptedTotal,
    unpromptedProbability: observations === 0 ? 0 : unpromptedTotal / observations,
    promptedTotal,
    eligibleFamiliesByAge: Object.fromEntries(
      Object.entries(eligibleFamilyCountsByAge).map(([age, values]) => [
        age,
        {
          mean: meanOf(values),
          min: values.length === 0 ? 0 : Math.min(...values),
          max: values.length === 0 ? 0 : Math.max(...values),
          samples: values.length,
        },
      ]),
    ),
    eligibleFamiliesByAgeChannel: Object.fromEntries(
      Object.entries(eligibleFamiliesByAgeChannel).map(([age, perChannel]) => [
        age,
        {
          ORD: meanOf(perChannel.ORD),
          INS: meanOf(perChannel.INS),
          TRN: meanOf(perChannel.TRN),
          SPC: meanOf(perChannel.SPC),
        },
      ]),
    ),
    familyEligibilityCounts,
    eligibleEventsByAge: Object.fromEntries(
      Object.entries(eligibleEventCountsByAge).map(([age, values]) => [age, meanOf(values)]),
    ),
  });

  return { hooks: { onBeforeYear, onYear }, finish };
}
