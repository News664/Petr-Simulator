import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { CONTENT_ROOT, type ContentBundle } from '../engine/content/load.js';
import { everContacted } from '../engine/factions.js';
import type { RunResult } from '../engine/simulation.js';
import {
  VISIBLE_STATS,
  type FactionDef,
  type RunState,
  type VisibleStat,
} from '../engine/types.js';

/**
 * H2A threshold-calibration telemetry.
 *
 * Implements `SOLID_STATE_H2A_THRESHOLD_TELEMETRY_SPEC_v0.1.md` on top of the
 * ordinary Monte Carlo aggregation in `metrics.ts`. Everything here observes:
 * no stat is clamped, no condition is tuned, no threshold is selected, and the
 * canonical corpus is never written to.
 *
 * The historical Phase 1.1 experiment harness (`experiments.ts`) is reused for
 * the reversible LOW/MID/HIGH rewrites and is otherwise untouched.
 */

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

const calibrationPlanSchema = z
  .object({
    version: z.string(),
    status: z.string(),
    purpose: z.string(),
    baseCorpus: z.string(),
    profiles: z.array(
      z
        .object({ id: z.string(), mode: z.string(), note: z.string().optional() })
        .strict(),
    ),
    sampling: z
      .object({
        runsPerArm: z.number().int().positive(),
        speciesMode: z.string(),
        talentScenario: z.string(),
        allocationPolicy: z.string(),
        familyWeightMode: z.enum(['uniform', 'sum_of_event_weights']),
        sameBaseSeedAcrossArms: z.boolean(),
        baseSeed: z.string(),
        maxAge: z.number().int().positive(),
      })
      .strict(),
    whyArchetypeAllocation: z.string().optional(),
    requiredCoreMetrics: z.array(z.string()),
    statTelemetry: z
      .object({
        snapshotAges: z.array(z.number().int().nonnegative()),
        includeFinal: z.boolean(),
        visibleStats: z.array(z.string()),
        perSnapshot: z.array(z.string()),
        drift: z.array(z.string()),
        interpretation: z.string().optional(),
      })
      .strict(),
    eventFrequencyTelemetry: z
      .object({
        topEventCount: z.number().int().positive(),
        report: z.array(z.string()),
        housing: z.array(z.string()),
        purpose: z.string().optional(),
      })
      .strict(),
    lowStatRiskTelemetry: z
      .object({
        ageMinimum: z.number().int().nonnegative(),
        bands: z.array(z.object({ id: z.string(), condition: z.string() }).strict()),
        horizonsYears: z.array(z.number().int().positive()),
        perStat: z.array(z.string()),
        purpose: z.string().optional(),
      })
      .strict(),
    factionChainTelemetry: z
      .object({ perFaction: z.array(z.string()), purpose: z.string().optional() })
      .strict(),
    selectionReviewGuardrails: z.record(z.string(), z.unknown()),
    explicitlyNotRun: z.array(z.string()),
    retentionPolicy: z.object({ notDropped: z.boolean(), note: z.string() }).strict(),
  })
  .strict();

export type CalibrationPlan = z.infer<typeof calibrationPlanSchema>;

export const DEFAULT_CALIBRATION_PLAN = 'SOLID_STATE_H2A_THRESHOLD_CALIBRATION_PLAN_v0.1.json';

export function loadCalibrationPlan(file?: string): CalibrationPlan {
  const target = file ?? path.join(CONTENT_ROOT, 'balance', DEFAULT_CALIBRATION_PLAN);
  const parsed = calibrationPlanSchema.safeParse(JSON.parse(readFileSync(target, 'utf8')));
  if (!parsed.success) {
    throw new Error(
      `H2A threshold calibration plan invalid:\n  - ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('\n  - ')}`,
    );
  }
  const plan = parsed.data;
  const unknownStats = plan.statTelemetry.visibleStats.filter(
    (stat) => !(VISIBLE_STATS as readonly string[]).includes(stat),
  );
  if (unknownStats.length > 0) {
    throw new Error(`calibration plan names unknown visible stat(s): ${unknownStats.join(', ')}`);
  }
  return plan;
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface StatDistribution {
  /** Runs contributing a value to this snapshot. Always printed as the denominator. */
  activeRuns: number;
  mean: number | null;
  median: number | null;
  p10: number | null;
  p25: number | null;
  p75: number | null;
  p90: number | null;
  p95: number | null;
  min: number | null;
  max: number | null;
  shareAtMost2: number;
  shareAtMost4: number;
  shareAtLeast12: number;
  shareAtLeast15: number;
  shareAtLeast20: number;
  /** Mean of (value at this snapshot - that run's post-setup starting value). */
  meanDriftFromStart: number | null;
}

export interface StatSnapshot {
  label: string;
  /** Null for the `final` snapshot, which is not tied to a fixed age. */
  age: number | null;
  activeRuns: number;
  byStat: Record<VisibleStat, StatDistribution>;
}

export interface FinalVsStart {
  lower: number;
  equal: number;
  higher: number;
  lowerShare: number;
  equalShare: number;
  higherShare: number;
}

export interface StatDriftTelemetry {
  positiveDeltaEventsPer1000RunYears: Record<VisibleStat, number>;
  positiveDeltaMagnitudePer1000RunYears: Record<VisibleStat, number>;
  negativeDeltaEventsPer1000RunYears: Record<VisibleStat, number>;
  negativeDeltaMagnitudePer1000RunYears: Record<VisibleStat, number>;
  finalVsStart: Record<VisibleStat, FinalVsStart>;
}

export interface EventFrequencyRow {
  eventId: string;
  label: string;
  channel: string;
  family: string;
  routeTags: string[];
  occurrences: number;
  occurrencesPer1000RunYears: number;
  runsSeen: number;
  runIncidence: number;
  runsRepeated: number;
  /** Share of runs that saw the event which saw it more than once. */
  repeatWithinRunRate: number;
  meanCountWhereSeen: number;
  maxCountInOneRun: number;
  repeatPolicy: string;
  repeatCooldownYears: number;
  repeatMaxCount: number | null;
}

export interface HousingTelemetry {
  routeTag: string;
  eventIds: string[];
  runsWithAny: number;
  runIncidence: number;
  occurrences: number;
  occurrencesPer1000RunYears: number;
  runsWith2Plus: number;
  share2Plus: number;
  meanCountWhereSeen: number;
  maxCountInOneRun: number;
  countsByEventId: Record<string, number>;
  /** Authored visible-stat deltas contributed by housing-tagged events. */
  statDeltaTotals: Record<VisibleStat, number>;
  meanStatDeltaPerHousingEvent: Record<VisibleStat, number>;
  meanStatDeltaPerRunWithHousing: Record<VisibleStat, number>;
}

export interface LowStatHorizonRow {
  horizonYears: number;
  /** Person-years with complete follow-up over the horizon. */
  observedPersonYears: number;
  endingProbability: number | null;
  /** Person-years still uncommitted at observation time. */
  commitmentEligiblePersonYears: number;
  commitmentProbability: number | null;
  /** Person-years with no faction yet at COMMITTED. */
  factionCommittedEligiblePersonYears: number;
  factionCommittedProbability: number | null;
}

export interface LowStatBandRow {
  band: string;
  condition: string;
  /** All age-18+ person-years observed in this band, before horizon censoring. */
  personYears: number;
  horizons: LowStatHorizonRow[];
}

export interface LowStatRiskTelemetry {
  ageMinimum: number;
  horizonsYears: number[];
  totalPersonYears: number;
  byStat: Record<VisibleStat, LowStatBandRow[]>;
}

export interface FactionChainRow {
  factionId: string;
  shortName: string;
  contactRuns: number;
  contactRate: number;
  everReachedRuns: Record<string, number>;
  everReachedRate: Record<string, number>;
  endingRuns: number;
  endingRate: number;
  /** Personalized touchpoints per contacted run: contact/personal/climax events. */
  personalizedEventBuckets: { zero: number; one: number; two: number; threePlus: number };
  meanPersonalizedEventsPerContactedRun: number | null;
  meanGapYears: number | null;
  medianGapYears: number | null;
  gapSamples: number;
  firstDispositionRuns: number;
  firstDispositionExitRuns: number;
  firstDispositionExitShare: number | null;
  escalationAfterEngagedRuns: number;
  escalationAfterEngagedShare: number | null;
  climaxAfterCommittedRuns: number;
  climaxAfterCommittedShare: number | null;
}

export interface CommitmentTiming {
  runs: number;
  mean: number | null;
  median: number | null;
  p10: number | null;
  p90: number | null;
}

/**
 * Age-18 floor counters.
 *
 * The taxonomy forbids both an ending and a Material Commitment before 18, so
 * these belong with the correctness counters rather than with balance.
 */
export interface EarlyOutcomeCounters {
  endingsBefore18: number;
  materialCommitmentsBefore18: number;
}

export interface H2aArmTelemetry {
  runs: number;
  runYears: number;
  commitmentTiming: CommitmentTiming;
  earlyOutcomes: EarlyOutcomeCounters;
  statSnapshots: StatSnapshot[];
  statDrift: StatDriftTelemetry;
  topEvents: EventFrequencyRow[];
  distinctEventsObserved: number;
  housing: HousingTelemetry;
  lowStatRisk: LowStatRiskTelemetry;
  factionChains: FactionChainRow[];
}

// ---------------------------------------------------------------------------
// Small statistics helpers
// ---------------------------------------------------------------------------

function mean(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

function percentile(sorted: readonly number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[index]!;
}

function median(sorted: readonly number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function share(values: readonly number[], predicate: (value: number) => boolean): number {
  if (values.length === 0) return 0;
  return values.filter(predicate).length / values.length;
}

function emptyStatRecord(): Record<VisibleStat, number> {
  const out = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) out[stat] = 0;
  return out;
}

function visibleStatsOf(state: RunState): Record<VisibleStat, number> {
  const out = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) out[stat] = state.stats[stat];
  return out;
}

/** Band id for a visible-stat value, per the plan's fixed bands. */
function bandOf(value: number): 'critical' | 'vulnerable' | 'ordinary_plus' {
  if (value <= 2) return 'critical';
  if (value <= 4) return 'vulnerable';
  return 'ordinary_plus';
}

const FINAL_LABEL = 'final';
/** Faction interactions that address the player directly rather than the world. */
const PERSONALIZED_INTERACTIONS = new Set(['contact', 'personal', 'climax']);

interface PersonYear {
  age: number;
  stats: Record<VisibleStat, number>;
}

interface FactionBucket {
  contact: number;
  everReached: Record<string, number>;
  endings: number;
  personalizedBuckets: { zero: number; one: number; two: number; threePlus: number };
  personalizedCounts: number[];
  gaps: number[];
  firstDisposition: number;
  firstDispositionExit: number;
  escalationEligible: number;
  escalation: number;
  climaxEligible: number;
  climax: number;
}

const TRACKED_STATES = ['CONTACTED', 'ENGAGED', 'COMMITTED', 'OPTED_OUT', 'CLOSED'] as const;

/**
 * Streaming accumulator for the H2A calibration telemetry.
 *
 * `beforeYear` must be wired to `SimulationOptions.onBeforeYear` and `add` to
 * the runner's `onRun`. Per-year state is only reachable from the hook, so the
 * accumulator keeps one run's scratch at a time and folds it into the totals
 * when the run finishes — a 3 000-run arm never holds every timeline at once.
 */
export class H2aTelemetryAccumulator {
  private readonly snapshotAges: number[];
  private readonly topEventCount: number;
  private readonly lowStatMinAge: number;
  private readonly horizons: number[];
  private readonly housingEventIds: Set<string>;
  private readonly factions: FactionDef[];

  private runs = 0;
  private runYears = 0;
  private readonly commitmentAges: number[] = [];
  private endingsBefore18 = 0;
  private commitmentsBefore18 = 0;

  /** snapshot label -> stat -> observed values (and drift values). */
  private readonly snapshotValues = new Map<string, Record<VisibleStat, number[]>>();
  private readonly snapshotDrift = new Map<string, Record<VisibleStat, number[]>>();
  private readonly snapshotRuns = new Map<string, number>();

  private readonly positiveDeltaEvents = emptyStatRecord();
  private readonly positiveDeltaMagnitude = emptyStatRecord();
  private readonly negativeDeltaEvents = emptyStatRecord();
  private readonly negativeDeltaMagnitude = emptyStatRecord();
  private readonly finalVsStart: Record<VisibleStat, { lower: number; equal: number; higher: number }>;

  private readonly eventStats = new Map<
    string,
    { occurrences: number; runsSeen: number; runsRepeated: number; maxInRun: number; label: string }
  >();

  private housingRuns = 0;
  private housingRuns2Plus = 0;
  private housingOccurrences = 0;
  private housingMaxInRun = 0;
  private readonly housingCounts: Record<string, number> = {};
  private readonly housingDeltas = emptyStatRecord();

  /** stat -> band -> horizon -> counters. */
  private readonly lowStat = new Map<
    string,
    {
      personYears: number;
      horizons: Map<
        number,
        {
          observed: number;
          ending: number;
          commitmentEligible: number;
          commitment: number;
          factionEligible: number;
          faction: number;
        }
      >;
    }
  >();

  private readonly factionBuckets = new Map<string, FactionBucket>();

  // Per-run scratch, populated by `beforeYear`.
  private baseline: Record<VisibleStat, number> | null = null;
  private scratchSnapshots = new Map<number, Record<VisibleStat, number>>();
  private personYears: PersonYear[] = [];

  constructor(
    private readonly content: ContentBundle,
    plan: CalibrationPlan,
  ) {
    this.snapshotAges = [...plan.statTelemetry.snapshotAges].sort((a, b) => a - b);
    this.topEventCount = plan.eventFrequencyTelemetry.topEventCount;
    this.lowStatMinAge = plan.lowStatRiskTelemetry.ageMinimum;
    this.horizons = [...plan.lowStatRiskTelemetry.horizonsYears].sort((a, b) => a - b);

    for (const label of this.snapshotLabels(plan)) {
      this.snapshotValues.set(label, this.emptyValueRecord());
      this.snapshotDrift.set(label, this.emptyValueRecord());
      this.snapshotRuns.set(label, 0);
    }

    this.finalVsStart = {} as Record<VisibleStat, { lower: number; equal: number; higher: number }>;
    for (const stat of VISIBLE_STATS) this.finalVsStart[stat] = { lower: 0, equal: 0, higher: 0 };

    for (const stat of VISIBLE_STATS) {
      for (const band of ['critical', 'vulnerable', 'ordinary_plus']) {
        this.lowStat.set(`${stat}:${band}`, {
          personYears: 0,
          horizons: new Map(
            this.horizons.map((h) => [
              h,
              {
                observed: 0,
                ending: 0,
                commitmentEligible: 0,
                commitment: 0,
                factionEligible: 0,
                faction: 0,
              },
            ]),
          ),
        });
      }
    }

    // Housing is identified by the canonical route tag, never by prose or a
    // single hard-coded event ID.
    if (!content.routeTags.has('housing')) {
      throw new Error('route tag registry has no `housing` tag; housing telemetry cannot be attributed');
    }
    this.housingEventIds = new Set(
      content.events.filter((event) => event.routeTags.includes('housing')).map((event) => event.id),
    );

    this.factions = [...content.factions.values()];
    for (const faction of this.factions) {
      this.factionBuckets.set(faction.id, {
        contact: 0,
        everReached: Object.fromEntries(TRACKED_STATES.map((s) => [s, 0])),
        endings: 0,
        personalizedBuckets: { zero: 0, one: 0, two: 0, threePlus: 0 },
        personalizedCounts: [],
        gaps: [],
        firstDisposition: 0,
        firstDispositionExit: 0,
        escalationEligible: 0,
        escalation: 0,
        climaxEligible: 0,
        climax: 0,
      });
    }
  }

  private snapshotLabels(plan: CalibrationPlan): string[] {
    const labels = this.snapshotAges.map((age) => (age === 0 ? 'start (post-setup)' : `age ${age}`));
    if (plan.statTelemetry.includeFinal) labels.push(FINAL_LABEL);
    return labels;
  }

  private labelForAge(age: number): string {
    return age === 0 ? 'start (post-setup)' : `age ${age}`;
  }

  private emptyValueRecord(): Record<VisibleStat, number[]> {
    const out = {} as Record<VisibleStat, number[]>;
    for (const stat of VISIBLE_STATS) out[stat] = [];
    return out;
  }

  /** Wire to `onBeforeYear`: the state entering `state.age`, before this year's event. */
  beforeYear(state: RunState): void {
    if (state.age === 0) {
      this.baseline = visibleStatsOf(state);
      this.scratchSnapshots = new Map();
      this.personYears = [];
    }
    if (this.snapshotAges.includes(state.age)) {
      this.scratchSnapshots.set(state.age, visibleStatsOf(state));
    }
    if (state.age >= this.lowStatMinAge) {
      this.personYears.push({ age: state.age, stats: visibleStatsOf(state) });
    }
  }

  /** Wire to the runner's `onRun`: folds one finished run into the totals. */
  add(result: RunResult): void {
    const state = result.state;
    const baseline = this.baseline ?? visibleStatsOf(state);
    this.runs += 1;
    this.runYears += state.history.length;

    const commitmentAge = state.diagnostics.commitmentAge;
    if (commitmentAge !== null) {
      this.commitmentAges.push(commitmentAge);
      if (commitmentAge < 18) this.commitmentsBefore18 += 1;
    }
    if (result.outcome.kind === 'ended' && result.outcome.ending.endingAge < 18) this.endingsBefore18 += 1;

    // --- visible-stat snapshots ---------------------------------------------
    for (const age of this.snapshotAges) {
      const snapshot = this.scratchSnapshots.get(age);
      if (!snapshot) continue;
      const label = this.labelForAge(age);
      this.snapshotRuns.set(label, (this.snapshotRuns.get(label) ?? 0) + 1);
      const values = this.snapshotValues.get(label)!;
      const drift = this.snapshotDrift.get(label)!;
      for (const stat of VISIBLE_STATS) {
        values[stat].push(snapshot[stat]);
        drift[stat].push(snapshot[stat] - baseline[stat]);
      }
    }
    if (this.snapshotValues.has(FINAL_LABEL)) {
      this.snapshotRuns.set(FINAL_LABEL, (this.snapshotRuns.get(FINAL_LABEL) ?? 0) + 1);
      const values = this.snapshotValues.get(FINAL_LABEL)!;
      const drift = this.snapshotDrift.get(FINAL_LABEL)!;
      for (const stat of VISIBLE_STATS) {
        values[stat].push(state.stats[stat]);
        drift[stat].push(state.stats[stat] - baseline[stat]);
      }
    }

    for (const stat of VISIBLE_STATS) {
      const delta = state.stats[stat] - baseline[stat];
      if (delta < 0) this.finalVsStart[stat].lower += 1;
      else if (delta === 0) this.finalVsStart[stat].equal += 1;
      else this.finalVsStart[stat].higher += 1;
    }

    // --- authored deltas, event frequency, housing ---------------------------
    const countsThisRun = new Map<string, number>();
    let housingThisRun = 0;
    for (const occurrence of state.history) {
      const event = this.content.eventsById.get(occurrence.eventId);
      countsThisRun.set(occurrence.eventId, (countsThisRun.get(occurrence.eventId) ?? 0) + 1);
      if (!event) continue;
      const variant = event.variants[occurrence.variantIndex];
      if (!variant) continue;
      const housing = this.housingEventIds.has(event.id);
      if (housing) housingThisRun += 1;
      for (const stat of VISIBLE_STATS) {
        const delta = variant.effects[stat];
        if (delta === undefined || delta === 0) continue;
        if (delta > 0) {
          this.positiveDeltaEvents[stat] += 1;
          this.positiveDeltaMagnitude[stat] += delta;
        } else {
          this.negativeDeltaEvents[stat] += 1;
          this.negativeDeltaMagnitude[stat] += delta;
        }
        if (housing) this.housingDeltas[stat] += delta;
      }
    }

    for (const [eventId, count] of countsThisRun) {
      let bucket = this.eventStats.get(eventId);
      if (!bucket) {
        const event = this.content.eventsById.get(eventId);
        const label = event?.variants[0]?.text.en ?? '(unknown event)';
        bucket = { occurrences: 0, runsSeen: 0, runsRepeated: 0, maxInRun: 0, label };
        this.eventStats.set(eventId, bucket);
      }
      bucket.occurrences += count;
      bucket.runsSeen += 1;
      if (count > 1) bucket.runsRepeated += 1;
      if (count > bucket.maxInRun) bucket.maxInRun = count;
      if (this.housingEventIds.has(eventId)) {
        this.housingCounts[eventId] = (this.housingCounts[eventId] ?? 0) + count;
      }
    }

    if (housingThisRun > 0) {
      this.housingRuns += 1;
      this.housingOccurrences += housingThisRun;
      if (housingThisRun >= 2) this.housingRuns2Plus += 1;
      if (housingThisRun > this.housingMaxInRun) this.housingMaxInRun = housingThisRun;
    }

    this.addLowStatRisk(result);
    this.addFactionChains(result);

    this.baseline = null;
    this.scratchSnapshots = new Map();
    this.personYears = [];
  }

  /**
   * Conditional risk by low-stat band.
   *
   * A person-year contributes to a horizon only when its follow-up is complete:
   * either the run reached an ending (fully observed) or it was still being
   * simulated at `age + horizon`. Runs censored by the diagnostic maximum age
   * are dropped from that horizon rather than counted as "no event".
   */
  private addLowStatRisk(result: RunResult): void {
    const state = result.state;
    const endingAge = result.outcome.kind === 'ended' ? result.outcome.ending.endingAge : null;
    const lastObservedAge = state.history.length === 0 ? -1 : state.history[state.history.length - 1]!.age;
    const commitmentAge = state.diagnostics.commitmentAge;
    let factionCommittedAge: number | null = null;
    for (const record of state.diagnostics.factionTransitions) {
      if (record.to !== 'COMMITTED') continue;
      if (factionCommittedAge === null || record.age < factionCommittedAge) factionCommittedAge = record.age;
    }

    for (const personYear of this.personYears) {
      const alreadyCommitted = commitmentAge !== null && commitmentAge < personYear.age;
      const alreadyFactionCommitted = factionCommittedAge !== null && factionCommittedAge < personYear.age;
      for (const stat of VISIBLE_STATS) {
        const key = `${stat}:${bandOf(personYear.stats[stat])}`;
        const bucket = this.lowStat.get(key)!;
        bucket.personYears += 1;
        for (const horizon of this.horizons) {
          const limit = personYear.age + horizon;
          const fullyObserved = endingAge !== null || lastObservedAge >= limit;
          if (!fullyObserved) continue;
          const counters = bucket.horizons.get(horizon)!;
          counters.observed += 1;
          if (endingAge !== null && endingAge <= limit) counters.ending += 1;
          if (!alreadyCommitted) {
            counters.commitmentEligible += 1;
            if (commitmentAge !== null && commitmentAge <= limit) counters.commitment += 1;
          }
          if (!alreadyFactionCommitted) {
            counters.factionEligible += 1;
            if (factionCommittedAge !== null && factionCommittedAge <= limit) counters.faction += 1;
          }
        }
      }
    }
  }

  private addFactionChains(result: RunResult): void {
    const state = result.state;
    const endingEventId = result.outcome.kind === 'ended' ? result.outcome.ending.sourceEventId : null;

    for (const faction of this.factions) {
      const bucket = this.factionBuckets.get(faction.id)!;
      const transitions = state.diagnostics.factionTransitions.filter((r) => r.factionId === faction.id);
      const contacted = everContacted(state.flags, faction) || transitions.length > 0;
      if (!contacted) continue;
      bucket.contact += 1;

      const firstAge: Record<string, number> = {};
      for (const record of transitions) {
        if (firstAge[record.to] === undefined) firstAge[record.to] = record.age;
      }
      for (const trackedState of TRACKED_STATES) {
        if (firstAge[trackedState] !== undefined) {
          bucket.everReached[trackedState] = (bucket.everReached[trackedState] ?? 0) + 1;
        }
      }

      // Personalized touchpoints: everything this faction addresses to the
      // player. News bulletins and lore fallback are world texture, not chain.
      const ages: number[] = [];
      let climaxAges: number[] = [];
      for (const occurrence of state.history) {
        const event = this.content.eventsById.get(occurrence.eventId);
        if (!event || !event.factionIds.includes(faction.id)) continue;
        const interaction = event.factionInteraction ?? '';
        if (!PERSONALIZED_INTERACTIONS.has(interaction)) continue;
        ages.push(occurrence.age);
        if (interaction === 'climax') climaxAges.push(occurrence.age);
      }
      bucket.personalizedCounts.push(ages.length);
      if (ages.length === 0) bucket.personalizedBuckets.zero += 1;
      else if (ages.length === 1) bucket.personalizedBuckets.one += 1;
      else if (ages.length === 2) bucket.personalizedBuckets.two += 1;
      else bucket.personalizedBuckets.threePlus += 1;
      for (let i = 1; i < ages.length; i++) bucket.gaps.push(ages[i]! - ages[i - 1]!);

      // First disposition: the first lifecycle move after CONTACTED.
      const contactAge = firstAge['CONTACTED'];
      const disposition = transitions.find(
        (record) => record.to !== 'CONTACTED' && (contactAge === undefined || record.age >= contactAge),
      );
      if (disposition) {
        bucket.firstDisposition += 1;
        if (disposition.to === 'OPTED_OUT' || disposition.to === 'CLOSED') bucket.firstDispositionExit += 1;
      }

      const engagedAge = firstAge['ENGAGED'];
      if (engagedAge !== undefined) {
        bucket.escalationEligible += 1;
        if (ages.some((age) => age > engagedAge)) bucket.escalation += 1;
      }
      const committedAge = firstAge['COMMITTED'];
      if (committedAge !== undefined) {
        bucket.climaxEligible += 1;
        if (climaxAges.some((age) => age >= committedAge)) bucket.climax += 1;
      }
      climaxAges = [];

      if (endingEventId) {
        const endingEvent = this.content.eventsById.get(endingEventId);
        if (endingEvent?.factionIds.includes(faction.id)) bucket.endings += 1;
      }
    }
  }

  summary(): H2aArmTelemetry {
    const per1000 = (n: number): number => (this.runYears === 0 ? 0 : (n * 1000) / this.runYears);
    const rate = (n: number): number => (this.runs === 0 ? 0 : n / this.runs);

    const statSnapshots: StatSnapshot[] = [];
    for (const [label, values] of this.snapshotValues) {
      const drift = this.snapshotDrift.get(label)!;
      const byStat = {} as Record<VisibleStat, StatDistribution>;
      for (const stat of VISIBLE_STATS) {
        const raw = values[stat];
        const sorted = raw.slice().sort((a, b) => a - b);
        byStat[stat] = {
          activeRuns: raw.length,
          mean: mean(raw),
          median: median(sorted),
          p10: percentile(sorted, 10),
          p25: percentile(sorted, 25),
          p75: percentile(sorted, 75),
          p90: percentile(sorted, 90),
          p95: percentile(sorted, 95),
          min: sorted.length === 0 ? null : sorted[0]!,
          max: sorted.length === 0 ? null : sorted[sorted.length - 1]!,
          shareAtMost2: share(raw, (v) => v <= 2),
          shareAtMost4: share(raw, (v) => v <= 4),
          shareAtLeast12: share(raw, (v) => v >= 12),
          shareAtLeast15: share(raw, (v) => v >= 15),
          shareAtLeast20: share(raw, (v) => v >= 20),
          meanDriftFromStart: mean(drift[stat]),
        };
      }
      const age = label === FINAL_LABEL ? null : Number.parseInt(label.replace(/[^0-9]/g, ''), 10) || 0;
      statSnapshots.push({ label, age, activeRuns: this.snapshotRuns.get(label) ?? 0, byStat });
    }

    const finalVsStart = {} as Record<VisibleStat, FinalVsStart>;
    for (const stat of VISIBLE_STATS) {
      const counts = this.finalVsStart[stat];
      finalVsStart[stat] = {
        ...counts,
        lowerShare: rate(counts.lower),
        equalShare: rate(counts.equal),
        higherShare: rate(counts.higher),
      };
    }

    const topEvents: EventFrequencyRow[] = [...this.eventStats.entries()]
      .sort((a, b) => b[1].occurrences - a[1].occurrences || a[0].localeCompare(b[0]))
      .slice(0, this.topEventCount)
      .map(([eventId, bucket]) => {
        const event = this.content.eventsById.get(eventId);
        return {
          eventId,
          label: bucket.label,
          channel: event?.channel ?? '?',
          family: event?.family ?? '?',
          routeTags: event?.routeTags ?? [],
          occurrences: bucket.occurrences,
          occurrencesPer1000RunYears: per1000(bucket.occurrences),
          runsSeen: bucket.runsSeen,
          runIncidence: rate(bucket.runsSeen),
          runsRepeated: bucket.runsRepeated,
          repeatWithinRunRate: bucket.runsSeen === 0 ? 0 : bucket.runsRepeated / bucket.runsSeen,
          meanCountWhereSeen: bucket.runsSeen === 0 ? 0 : bucket.occurrences / bucket.runsSeen,
          maxCountInOneRun: bucket.maxInRun,
          repeatPolicy: event?.repeatPolicy ?? '?',
          repeatCooldownYears: event?.repeatCooldownYears ?? 0,
          repeatMaxCount: event?.repeatMaxCount ?? null,
        };
      });

    const meanHousingDelta = emptyStatRecord();
    const meanHousingDeltaPerRun = emptyStatRecord();
    for (const stat of VISIBLE_STATS) {
      meanHousingDelta[stat] =
        this.housingOccurrences === 0 ? 0 : this.housingDeltas[stat] / this.housingOccurrences;
      meanHousingDeltaPerRun[stat] = this.housingRuns === 0 ? 0 : this.housingDeltas[stat] / this.housingRuns;
    }

    const housing: HousingTelemetry = {
      routeTag: 'housing',
      eventIds: [...this.housingEventIds].sort(),
      runsWithAny: this.housingRuns,
      runIncidence: rate(this.housingRuns),
      occurrences: this.housingOccurrences,
      occurrencesPer1000RunYears: per1000(this.housingOccurrences),
      runsWith2Plus: this.housingRuns2Plus,
      share2Plus: rate(this.housingRuns2Plus),
      meanCountWhereSeen: this.housingRuns === 0 ? 0 : this.housingOccurrences / this.housingRuns,
      maxCountInOneRun: this.housingMaxInRun,
      countsByEventId: { ...this.housingCounts },
      statDeltaTotals: { ...this.housingDeltas },
      meanStatDeltaPerHousingEvent: meanHousingDelta,
      meanStatDeltaPerRunWithHousing: meanHousingDeltaPerRun,
    };

    const byStat = {} as Record<VisibleStat, LowStatBandRow[]>;
    let totalPersonYears = 0;
    for (const stat of VISIBLE_STATS) {
      const rows: LowStatBandRow[] = [];
      for (const [band, condition] of [
        ['critical', '<=2'],
        ['vulnerable', '3-4'],
        ['ordinary_plus', '>=5'],
      ] as const) {
        const bucket = this.lowStat.get(`${stat}:${band}`)!;
        if (stat === VISIBLE_STATS[0]) totalPersonYears += bucket.personYears;
        rows.push({
          band,
          condition,
          personYears: bucket.personYears,
          horizons: this.horizons.map((horizon) => {
            const counters = bucket.horizons.get(horizon)!;
            return {
              horizonYears: horizon,
              observedPersonYears: counters.observed,
              endingProbability: counters.observed === 0 ? null : counters.ending / counters.observed,
              commitmentEligiblePersonYears: counters.commitmentEligible,
              commitmentProbability:
                counters.commitmentEligible === 0 ? null : counters.commitment / counters.commitmentEligible,
              factionCommittedEligiblePersonYears: counters.factionEligible,
              factionCommittedProbability:
                counters.factionEligible === 0 ? null : counters.faction / counters.factionEligible,
            };
          }),
        });
      }
      byStat[stat] = rows;
    }

    const factionChains: FactionChainRow[] = this.factions.map((faction) => {
      const bucket = this.factionBuckets.get(faction.id)!;
      const contacted = bucket.contact;
      const sortedGaps = bucket.gaps.slice().sort((a, b) => a - b);
      return {
        factionId: faction.id,
        shortName: faction.shortName,
        contactRuns: contacted,
        contactRate: rate(contacted),
        everReachedRuns: { ...bucket.everReached },
        everReachedRate: Object.fromEntries(
          Object.entries(bucket.everReached).map(([key, count]) => [key, rate(count)]),
        ),
        endingRuns: bucket.endings,
        endingRate: rate(bucket.endings),
        personalizedEventBuckets: { ...bucket.personalizedBuckets },
        meanPersonalizedEventsPerContactedRun: mean(bucket.personalizedCounts),
        meanGapYears: mean(bucket.gaps),
        medianGapYears: median(sortedGaps),
        gapSamples: bucket.gaps.length,
        firstDispositionRuns: bucket.firstDisposition,
        firstDispositionExitRuns: bucket.firstDispositionExit,
        firstDispositionExitShare:
          bucket.firstDisposition === 0 ? null : bucket.firstDispositionExit / bucket.firstDisposition,
        escalationAfterEngagedRuns: bucket.escalation,
        escalationAfterEngagedShare:
          bucket.escalationEligible === 0 ? null : bucket.escalation / bucket.escalationEligible,
        climaxAfterCommittedRuns: bucket.climax,
        climaxAfterCommittedShare: bucket.climaxEligible === 0 ? null : bucket.climax / bucket.climaxEligible,
      };
    });

    const sortedCommitment = this.commitmentAges.slice().sort((a, b) => a - b);

    return {
      runs: this.runs,
      runYears: this.runYears,
      commitmentTiming: {
        runs: sortedCommitment.length,
        mean: mean(this.commitmentAges),
        median: median(sortedCommitment),
        p10: percentile(sortedCommitment, 10),
        p90: percentile(sortedCommitment, 90),
      },
      earlyOutcomes: {
        endingsBefore18: this.endingsBefore18,
        materialCommitmentsBefore18: this.commitmentsBefore18,
      },
      statSnapshots,
      statDrift: {
        positiveDeltaEventsPer1000RunYears: mapRecord(this.positiveDeltaEvents, per1000),
        positiveDeltaMagnitudePer1000RunYears: mapRecord(this.positiveDeltaMagnitude, per1000),
        negativeDeltaEventsPer1000RunYears: mapRecord(this.negativeDeltaEvents, per1000),
        negativeDeltaMagnitudePer1000RunYears: mapRecord(this.negativeDeltaMagnitude, per1000),
        finalVsStart,
      },
      topEvents,
      distinctEventsObserved: this.eventStats.size,
      housing,
      lowStatRisk: {
        ageMinimum: this.lowStatMinAge,
        horizonsYears: this.horizons,
        totalPersonYears,
        byStat,
      },
      factionChains,
    };
  }
}

function mapRecord(
  source: Record<VisibleStat, number>,
  transform: (value: number) => number,
): Record<VisibleStat, number> {
  const out = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) out[stat] = transform(source[stat]);
  return out;
}
