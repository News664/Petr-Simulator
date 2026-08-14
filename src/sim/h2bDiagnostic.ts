import type { ContentBundle } from '../engine/content/load.js';
import { everContacted } from '../engine/factions.js';
import type { RunResult } from '../engine/simulation.js';
import { VISIBLE_STATS, type RunState, type VisibleStat } from '../engine/types.js';

/**
 * H2B Batch 008 diagnostic telemetry.
 *
 * Implements the H2B-specific measurements in
 * `docs/validation/SOLID_STATE_H2B_DIAGNOSTIC_PLAN_v0.1.md`: pressure-chain
 * behaviour, the Basic Continuity Insurance (STR) chain, age-stratified
 * low-stat risk, housing/relocation separation, the structural-housing route
 * and faction exclusivity.
 *
 * Visible-stat snapshots, event frequency, aggregate housing and faction-chain
 * legibility are already measured by `h2aThresholdTelemetry.ts` and are reused
 * rather than reimplemented.
 *
 * Measurement only. Nothing here tunes content, and no threshold is frozen.
 */

/** The batch whose events this diagnostic treats as "new". */
export const H2B_BATCH_ID = 'EVENT_BATCH_008';

/**
 * A literal change of address is now canonical data.
 *
 * H2B.1A A-10 added the metadata-only `relocation` route tag to the Route Tag
 * Registry, so the diagnostic reads the corpus instead of carrying an analyst
 * list. The tag is event-level, which the schema supports; the one case it
 * cannot express is recorded as a conflict rather than patched around here.
 */
export const RELOCATION_TAG = 'relocation';

/** The Basic Continuity Insurance chain, in order. */
export const STR_INSURANCE_CHAIN = {
  review: 'EVT-INS-MED-2001',
  decision: 'EVT-INS-MED-2002',
  outcome: 'EVT-INS-MED-2003',
  ending: 'END-MED-003',
} as const;

/** The financial-obligation maturation chain (H2B.1A A-02). */
export const FINANCE_MATURATION = {
  rescue: 'EVT-INS-FIN-2001',
  followUp: 'EVT-INS-FIN-2002',
  maturation: 'EVT-INS-FIN-2004',
  climax: 'EVT-INS-FIN-0005',
  routeFlag: 'ROUTE_FIN_SECURED_DEBT',
} as const;

/** The housing-to-architecture route. */
export const STRUCTURAL_HOUSING = {
  offer: 'EVT-INS-ARC-2001',
  resolution: 'EVT-INS-ARC-2002',
  climax: 'EVT-INS-ARC-2003',
  offerFlag: 'ROUTE_ARC_HOUSING_PROGRAM',
  committedFlag: 'ROUTE_ARC_STRUCTURAL',
  lapsedFlag: 'ROUTE_ARC_HOUSING_HISTORY',
  selfOwnedFlag: 'ROUTE_ARC_SELF_OWNED',
} as const;

/**
 * FIX-gain bands from the H2B Pressure & Tone spec.
 *
 * clean luck 0–2 · costly but legitimate 3–6 · predatory institutional 10+.
 * 7–9 is unnamed in the spec and is reported as its own band rather than being
 * folded into either neighbour.
 */
export type RescueBand = 'clean' | 'costly' | 'unclassified' | 'predatory';

export function rescueBand(fixGained: number): RescueBand {
  if (fixGained <= 2) return 'clean';
  if (fixGained <= 6) return 'costly';
  if (fixGained <= 9) return 'unclassified';
  return 'predatory';
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface VariantOutcomeRow {
  variantIndex: number;
  when: string;
  textExcerpt: string;
  occurrences: number;
  runIncidence: number;
  meanAge: number | null;
  medianAge: number | null;
  fixGained: number;
  meanFixGained: number | null;
  rescueBand: RescueBand;
  /** Mean authored delta on the event's gating stat, where one is identifiable. */
  meanGatingStatDelta: number | null;
  endingWithin3: number;
  endingWithin5: number;
  commitmentWithin3: number;
  commitmentWithin5: number;
  /** Follow-up denominators; a run censored before the horizon is excluded. */
  observed3: number;
  observed5: number;
}

export interface NewEventRow {
  eventId: string;
  channel: string;
  family: string;
  routeTags: string[];
  /** The visible stat the `include` condition gates on, when there is exactly one. */
  gatingStat: VisibleStat | null;
  gatingCondition: string | null;
  runsSeen: number;
  runIncidence: number;
  occurrences: number;
  meanAge: number | null;
  /** Distribution of the gating stat entering the year the event fired. */
  gatingStatBands: Record<string, number> | null;
  variants: VariantOutcomeRow[];
}

export interface StrInsuranceTelemetry {
  reviewRuns: number;
  reviewRate: number;
  meanReviewAge: number | null;
  decisionRuns: number;
  /** Branch counts at the two-year decision, in authored variant order. */
  decisionBranches: { label: string; runs: number; share: number }[];
  outcomeRuns: number;
  outcomeBranches: { label: string; runs: number; share: number }[];
  benefitApprovedRuns: number;
  benefitApprovedRate: number;
  benefitApprovedShareOfCompletions: number;
  meanBenefitAge: number | null;
  medianBenefitAge: number | null;
  /** Material at the Benefit Approved ending. */
  benefitMaterials: Record<string, number>;
  syntheticShareOfBenefitEndings: number;
  /** Coverage check: adult runs that ever hit STR <= -3, and how many saw a review. */
  runsEverExtremeLowStr: number;
  extremeLowStrWithReview: number;
  extremeLowStrCoverage: number | null;
  /** The failure the plan names: long survivors sitting at extreme negative STR unseen. */
  longSurvivorsExtremeLowStrNoReview: number;
}

export interface HousingRelocationTelemetry {
  housingRuns: number;
  housingRunIncidence: number;
  housingOccurrences: number;
  meanUniqueHousingEventIdsPerRun: number | null;
  maxUniqueHousingEventIdsInOneRun: number;
  relocationOccurrences: number;
  relocationRuns: number;
  relocationRunIncidence: number;
  relocationShareOfHousingEvents: number;
  meanRelocationsPerRun: number | null;
  maxRelocationsInOneRun: number;
  runsWith2PlusRelocations: number;
  /** Aggregate authored deltas carried by housing-tagged events. */
  statDeltaTotals: Record<VisibleStat, number>;
  fixDeltaTotal: number;
  meanFixPerHousingEvent: number | null;
  structuralOfferRuns: number;
  structuralOfferRate: number;
  structuralCommittedRuns: number;
  structuralLapsedRuns: number;
  structuralEndingRuns: number;
  structuralEndingRate: number;
  structuralEndings: Record<string, number>;
  meanStructuralEndingAge: number | null;
}

export interface FactionExclusivityTelemetry {
  /** Must stay zero: the single-active-faction rule is an invariant, not a target. */
  simultaneousActiveViolations: number;
  maxSimultaneousActive: number;
  runsWithAnyContact: number;
  runsWithMultipleFactionsContacted: number;
  multiFactionRate: number;
  /** Second contacts observed after the previous relationship reached a terminal state. */
  secondContactAfterTerminalRuns: number;
  /** Runs that contacted a second faction while the first was still active. Must be zero. */
  secondContactWhileActiveRuns: number;
  intermediateEventRuns: Record<string, number>;
  intermediateEventRate: Record<string, number>;
  /** Escalation events that expired because the middle event pushed them past their window. */
  expiredEscalationSchedules: Record<string, number>;
}

export interface StatContributorRow {
  eventId: string;
  variantIndex: number;
  textExcerpt: string;
  delta: number;
  occurrences: number;
  totalMagnitude: number;
}

/** A-12: ranked contributors per stat, per age band. */
export interface StatContributorAudit {
  ageBands: string[];
  /** stat -> age band -> { positive, negative } ranked by total magnitude. */
  byStat: Record<string, Record<string, { positive: StatContributorRow[]; negative: StatContributorRow[] }>>;
}

export interface FinanceMaturationTelemetry {
  rescueRuns: number;
  followUpRuns: number;
  buyoutRuns: number;
  obligationSurvivedRuns: number;
  maturationRuns: number;
  maturationRate: number;
  meanMaturationAge: number | null;
  /** Maturation branch split, by the material it did or did not commit. */
  maturationBranches: { label: string; runs: number; share: number }[];
  maturationCommittedMaterials: Record<string, number>;
  financeClimaxRuns: number;
  financeEndings: Record<string, number>;
}

export interface BlackLedgerTelemetry {
  contactRuns: number;
  engagedRuns: number;
  committedRuns: number;
  optedOutRuns: number;
  closedRuns: number;
  committedRate: number;
  endingRuns: number;
  endingRate: number;
  endings: Record<string, number>;
  meanCommittedAge: number | null;
  /** Runs holding the DEBTOR obligation role at the escalation. */
  debtorAtEscalationRuns: number;
}

export interface StateTriggerTelemetry {
  firings: Record<string, number>;
  runsTriggered: Record<string, number>;
  meanFiringAge: Record<string, number | null>;
  maxFiringsInOneRun: Record<string, number>;
}

export interface AgeStratifiedRiskRow {
  ageBand: string;
  stat: VisibleStat;
  band: string;
  personYears: number;
  observedPersonYears: number;
  endingProbability: number | null;
  commitmentEligiblePersonYears: number;
  commitmentProbability: number | null;
}

export interface H2bTelemetry {
  runs: number;
  runYears: number;
  newEvents: NewEventRow[];
  rescueBandTotals: Record<RescueBand, { occurrences: number; runs: number }>;
  strInsurance: StrInsuranceTelemetry;
  housing: HousingRelocationTelemetry;
  factions: FactionExclusivityTelemetry;
  statContributors: StatContributorAudit;
  finance: FinanceMaturationTelemetry;
  blackLedger: BlackLedgerTelemetry;
  stateTriggers: StateTriggerTelemetry;
  /** Extreme-STR review exposure among runs that survive past 65. */
  extremeStrSurvivors: { survivorsEverExtreme: number; survivorsWithReview: number; coverage: number | null };
  /** Low-stat risk split by adult life stage, so old-age censoring cannot invert it. */
  ageStratifiedRisk: AgeStratifiedRiskRow[];
  riskHorizonYears: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mean(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** The single visible stat an `include` condition gates low, if there is exactly one. */
export function gatingStatOf(include: string): { stat: VisibleStat; condition: string } | null {
  const found: { stat: VisibleStat; condition: string }[] = [];
  for (const stat of VISIBLE_STATS) {
    const match = new RegExp(`\\b${stat}\\s*(<=|>=|<|>)\\s*(-?\\d+)`).exec(include);
    if (match) found.push({ stat, condition: `${stat}${match[1]}${match[2]}` });
  }
  return found.length === 1 ? found[0]! : null;
}

function band(value: number): string {
  if (value <= 2) return 'critical';
  if (value <= 4) return 'vulnerable';
  return 'ordinary_plus';
}

/** Adult life stages for the age-stratified risk table. */
/** A-12 reports these three stats. */
const CONTRIBUTOR_STATS: readonly VisibleStat[] = ['CHR', 'INT', 'SPR'];

/** A-12 age bands, which are coarser than the risk stages on purpose. */
const CONTRIBUTOR_BANDS = ['0-17', '18-34', '35-64', '65+'] as const;

function contributorBand(age: number): string {
  if (age <= 17) return '0-17';
  if (age <= 34) return '18-34';
  if (age <= 64) return '35-64';
  return '65+';
}

const ADULT_STAGES: { label: string; min: number; max: number }[] = [
  { label: '18-24', min: 18, max: 24 },
  { label: '25-34', min: 25, max: 34 },
  { label: '35-49', min: 35, max: 49 },
  { label: '50-64', min: 50, max: 64 },
  { label: '65+', min: 65, max: Number.POSITIVE_INFINITY },
];

function excerpt(text: string, limit = 70): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1)}…`;
}

interface VariantBucket {
  occurrences: number;
  runs: Set<number>;
  ages: number[];
  gatingDeltas: number[];
  endingWithin: Record<3 | 5, number>;
  commitmentWithin: Record<3 | 5, number>;
  observed: Record<3 | 5, number>;
}

/**
 * Streaming accumulator for the H2B-specific telemetry.
 *
 * `beforeYear` must be wired to `onBeforeYear` and `add` to the runner's
 * `onRun`. Pre-event stats are only visible from the hook, so one run's scratch
 * is held at a time and folded in when the run finishes.
 */
export class H2bAccumulator {
  private readonly newEventIds: string[];
  private readonly relocationEventIds: Set<string>;
  private readonly housingEventIds: Set<string>;

  private runs = 0;
  private runYears = 0;

  private readonly variantBuckets = new Map<string, VariantBucket>();
  private readonly eventRuns = new Map<string, number>();
  private readonly eventOccurrences = new Map<string, number>();
  private readonly eventAges = new Map<string, number[]>();
  private readonly gatingBands = new Map<string, Record<string, number>>();

  // STR insurance
  private reviewRuns = 0;
  private readonly reviewAges: number[] = [];
  private decisionRuns = 0;
  private readonly decisionBranch: number[] = [0, 0, 0, 0];
  private outcomeRuns = 0;
  private readonly outcomeBranch: number[] = [0, 0, 0, 0];
  private benefitRuns = 0;
  private readonly benefitAges: number[] = [];
  private readonly benefitMaterials: Record<string, number> = {};
  private everExtremeLowStr = 0;
  private extremeLowStrWithReview = 0;
  private longSurvivorExtremeNoReview = 0;

  // Housing
  private housingRuns = 0;
  private housingOccurrences = 0;
  private readonly uniqueHousingIds: number[] = [];
  private maxUniqueHousingIds = 0;
  private relocationOccurrences = 0;
  private relocationRuns = 0;
  private readonly relocationsPerRun: number[] = [];
  private maxRelocations = 0;
  private runsWith2PlusRelocations = 0;
  private readonly housingDeltas: Record<VisibleStat, number>;
  private housingFix = 0;
  private structuralOffer = 0;
  private structuralCommitted = 0;
  private structuralLapsed = 0;
  private structuralEnding = 0;
  private readonly structuralEndings: Record<string, number> = {};
  private readonly structuralEndingAges: number[] = [];

  // A-12 stat contributors: `${stat}|${band}|${eventId}|${variantIndex}` -> counters.
  private readonly contributors = new Map<string, { delta: number; occurrences: number }>();

  // Finance maturation
  private financeRescue = 0;
  private financeFollowUp = 0;
  private financeBuyout = 0;
  private financeObligationSurvived = 0;
  private financeMaturation = 0;
  private readonly financeMaturationAges: number[] = [];
  private readonly financeMaturationBranch = new Map<number, number>();
  private readonly financeMaturationMaterials: Record<string, number> = {};
  private financeClimax = 0;
  private readonly financeEndings: Record<string, number> = {};

  // Black Ledger
  private blContact = 0;
  private blEngaged = 0;
  private blCommitted = 0;
  private blOptedOut = 0;
  private blClosed = 0;
  private blEnding = 0;
  private readonly blEndings: Record<string, number> = {};
  private readonly blCommittedAges: number[] = [];
  private blDebtorAtEscalation = 0;

  // State triggers
  private readonly triggerFirings: Record<string, number> = {};
  private readonly triggerRuns: Record<string, number> = {};
  private readonly triggerAges: Record<string, number[]> = {};
  private readonly triggerMaxInRun: Record<string, number> = {};

  // Extreme-STR exposure among 65+ survivors
  private survivorsEverExtreme = 0;
  private survivorsWithReview = 0;

  // Factions
  private simultaneousViolations = 0;
  private maxSimultaneous = 0;
  private runsWithContact = 0;
  private runsMultiFaction = 0;
  private secondContactAfterTerminal = 0;
  private secondContactWhileActive = 0;
  private readonly intermediateRuns: Record<string, number> = {};
  private readonly expiredEscalations: Record<string, number> = {};

  // Age-stratified risk: `${stage}|${stat}|${band}` -> counters.
  private readonly risk = new Map<
    string,
    { personYears: number; observed: number; ending: number; commitEligible: number; commitment: number }
  >();

  private completed = 0;

  // Per-run scratch
  private statsByAge = new Map<number, Record<VisibleStat, number>>();
  private simultaneousThisRun = 0;

  constructor(
    private readonly content: ContentBundle,
    private readonly riskHorizonYears = 5,
  ) {
    this.newEventIds = content.events
      .filter((event) => event.sourceBatchId === H2B_BATCH_ID)
      .map((event) => event.id)
      .sort();
    this.housingEventIds = new Set(
      content.events.filter((event) => event.routeTags.includes('housing')).map((event) => event.id),
    );
    this.relocationEventIds = new Set(
      content.events.filter((event) => event.routeTags.includes(RELOCATION_TAG)).map((event) => event.id),
    );
    this.housingDeltas = {} as Record<VisibleStat, number>;
    for (const stat of VISIBLE_STATS) this.housingDeltas[stat] = 0;
  }

  /** Wire to `onBeforeYear`. */
  beforeYear(state: RunState): void {
    if (state.age === 0) {
      this.statsByAge = new Map();
      this.simultaneousThisRun = 0;
    }
    const snapshot = {} as Record<VisibleStat, number>;
    for (const stat of VISIBLE_STATS) snapshot[stat] = state.stats[stat];
    this.statsByAge.set(state.age, snapshot);

    // Single-active-faction invariant, checked every year rather than at the end,
    // so a relationship that opened and closed inside one run is still seen.
    // Counted directly rather than via `activeFaction`, which returns only the
    // first match — the point here is to catch a second one if it ever exists.
    let active = 0;
    for (const faction of this.content.factions.values()) {
      const held = [
        faction.lifecycleFlags.CONTACTED,
        faction.lifecycleFlags.ENGAGED,
        faction.lifecycleFlags.COMMITTED,
      ].filter((flag) => state.flags.has(flag)).length;
      if (held > 0) active += 1;
    }
    if (active > this.simultaneousThisRun) this.simultaneousThisRun = active;
    if (active > this.maxSimultaneous) this.maxSimultaneous = active;
  }

  /** Wire to the runner's `onRun`. */
  add(result: RunResult): void {
    const state = result.state;
    this.runs += 1;
    this.runYears += state.history.length;
    if (this.simultaneousThisRun > 1) this.simultaneousViolations += 1;
    if (result.outcome.kind === 'ended') this.completed += 1;

    const endingAge = result.outcome.kind === 'ended' ? result.outcome.ending.endingAge : null;
    const endingId = result.outcome.kind === 'ended' ? result.outcome.ending.endingId : null;
    const lastObservedAge = state.history.length === 0 ? -1 : state.history[state.history.length - 1]!.age;
    const commitmentAge = state.diagnostics.commitmentAge;

    this.addEventTelemetry(state, endingAge, commitmentAge, lastObservedAge);
    this.addStrInsurance(state, endingAge, endingId);
    this.addHousing(state);
    this.addFactions(state);
    this.addStatContributors(state);
    this.addFinance(state, result);
    this.addBlackLedger(state, result);
    this.addStateTriggers(state);
    this.addAgeStratifiedRisk(state, endingAge, commitmentAge, lastObservedAge);
  }

  private addEventTelemetry(
    state: RunState,
    endingAge: number | null,
    commitmentAge: number | null,
    lastObservedAge: number,
  ): void {
    const seenThisRun = new Set<string>();
    for (const occurrence of state.history) {
      const event = this.content.eventsById.get(occurrence.eventId);
      if (!event || event.sourceBatchId !== H2B_BATCH_ID) continue;
      const variant = event.variants[occurrence.variantIndex];
      if (!variant) continue;

      this.eventOccurrences.set(event.id, (this.eventOccurrences.get(event.id) ?? 0) + 1);
      (this.eventAges.get(event.id) ?? this.eventAges.set(event.id, []).get(event.id)!).push(occurrence.age);
      if (!seenThisRun.has(event.id)) {
        seenThisRun.add(event.id);
        this.eventRuns.set(event.id, (this.eventRuns.get(event.id) ?? 0) + 1);
        const gating = gatingStatOf(event.include);
        if (gating) {
          const entering = this.statsByAge.get(occurrence.age);
          if (entering) {
            const bucket = this.gatingBands.get(event.id) ?? { critical: 0, vulnerable: 0, ordinary_plus: 0 };
            bucket[band(entering[gating.stat])] = (bucket[band(entering[gating.stat])] ?? 0) + 1;
            this.gatingBands.set(event.id, bucket);
          }
        }
      }

      const key = `${event.id}:${occurrence.variantIndex}`;
      let bucket = this.variantBuckets.get(key);
      if (!bucket) {
        bucket = {
          occurrences: 0,
          runs: new Set(),
          ages: [],
          gatingDeltas: [],
          endingWithin: { 3: 0, 5: 0 },
          commitmentWithin: { 3: 0, 5: 0 },
          observed: { 3: 0, 5: 0 },
        };
        this.variantBuckets.set(key, bucket);
      }
      bucket.occurrences += 1;
      bucket.runs.add(this.runs);
      bucket.ages.push(occurrence.age);
      const gating = gatingStatOf(event.include);
      if (gating) {
        const delta = variant.effects[gating.stat];
        if (delta !== undefined) bucket.gatingDeltas.push(delta);
      }
      for (const horizon of [3, 5] as const) {
        const limit = occurrence.age + horizon;
        const fullyObserved = endingAge !== null || lastObservedAge >= limit;
        if (!fullyObserved) continue;
        bucket.observed[horizon] += 1;
        if (endingAge !== null && endingAge <= limit) bucket.endingWithin[horizon] += 1;
        if (commitmentAge !== null && commitmentAge >= occurrence.age && commitmentAge <= limit) {
          bucket.commitmentWithin[horizon] += 1;
        }
      }
    }
  }

  private addStrInsurance(state: RunState, endingAge: number | null, endingId: string | null): void {
    let sawReview = false;
    for (const occurrence of state.history) {
      if (occurrence.eventId === STR_INSURANCE_CHAIN.review) {
        sawReview = true;
        this.reviewRuns += 1;
        this.reviewAges.push(occurrence.age);
      } else if (occurrence.eventId === STR_INSURANCE_CHAIN.decision) {
        this.decisionRuns += 1;
        const index = occurrence.variantIndex;
        if (index < this.decisionBranch.length) {
          this.decisionBranch[index] = (this.decisionBranch[index] ?? 0) + 1;
        }
      } else if (occurrence.eventId === STR_INSURANCE_CHAIN.outcome) {
        this.outcomeRuns += 1;
        const index = occurrence.variantIndex;
        if (index < this.outcomeBranch.length) {
          this.outcomeBranch[index] = (this.outcomeBranch[index] ?? 0) + 1;
        }
      }
    }
    if (endingId === STR_INSURANCE_CHAIN.ending) {
      this.benefitRuns += 1;
      if (endingAge !== null) this.benefitAges.push(endingAge);
      this.benefitMaterials[state.material] = (this.benefitMaterials[state.material] ?? 0) + 1;
    }

    // Coverage: adults who ever sat at STR <= -3 should not be invisible to the insurer.
    let extreme = false;
    let extremeLate = false;
    for (const [age, stats] of this.statsByAge) {
      if (age < 18 || stats.STR > -3) continue;
      extreme = true;
      if (age >= 65) extremeLate = true;
    }
    if (extreme) {
      this.everExtremeLowStr += 1;
      if (sawReview) this.extremeLowStrWithReview += 1;
      else if (extremeLate) this.longSurvivorExtremeNoReview += 1;
    }
    if (extremeLate) {
      this.survivorsEverExtreme += 1;
      if (sawReview) this.survivorsWithReview += 1;
    }
  }

  private addHousing(state: RunState): void {
    const ids = new Set<string>();
    let occurrences = 0;
    let relocations = 0;
    for (const occurrence of state.history) {
      if (!this.housingEventIds.has(occurrence.eventId)) continue;
      occurrences += 1;
      ids.add(occurrence.eventId);
      const event = this.content.eventsById.get(occurrence.eventId);
      const variant = event?.variants[occurrence.variantIndex];
      if (variant) {
        for (const stat of VISIBLE_STATS) {
          const delta = variant.effects[stat];
          if (delta) this.housingDeltas[stat] += delta;
        }
        this.housingFix += variant.effects.FIX ?? 0;
      }
      if (this.relocationEventIds.has(occurrence.eventId)) relocations += 1;
    }
    if (occurrences > 0) {
      this.housingRuns += 1;
      this.housingOccurrences += occurrences;
      this.uniqueHousingIds.push(ids.size);
      if (ids.size > this.maxUniqueHousingIds) this.maxUniqueHousingIds = ids.size;
    }
    if (relocations > 0) {
      this.relocationRuns += 1;
      this.relocationOccurrences += relocations;
      this.relocationsPerRun.push(relocations);
      if (relocations > this.maxRelocations) this.maxRelocations = relocations;
      if (relocations >= 2) this.runsWith2PlusRelocations += 1;
    }

    if (state.flags.has(STRUCTURAL_HOUSING.offerFlag) || state.flags.has(STRUCTURAL_HOUSING.committedFlag) ||
        state.flags.has(STRUCTURAL_HOUSING.lapsedFlag) ||
        state.history.some((o) => o.eventId === STRUCTURAL_HOUSING.offer)) {
      this.structuralOffer += 1;
    }
    if (state.flags.has(STRUCTURAL_HOUSING.committedFlag)) this.structuralCommitted += 1;
    if (state.flags.has(STRUCTURAL_HOUSING.lapsedFlag)) this.structuralLapsed += 1;
    const climax = state.history.find((o) => o.eventId === STRUCTURAL_HOUSING.climax);
    if (climax && state.ending) {
      this.structuralEnding += 1;
      this.structuralEndings[state.ending.endingId] = (this.structuralEndings[state.ending.endingId] ?? 0) + 1;
      this.structuralEndingAges.push(state.ending.endingAge);
    }
  }

  private addFactions(state: RunState): void {
    const contacted = [...this.content.factions.values()].filter((faction) =>
      everContacted(state.flags, faction) ||
      state.diagnostics.factionTransitions.some((r) => r.factionId === faction.id),
    );
    if (contacted.length > 0) this.runsWithContact += 1;
    if (contacted.length > 1) this.runsMultiFaction += 1;

    // Ordering check: a second relationship may only open after the previous one
    // reached OPTED_OUT or CLOSED.
    const firstContact = new Map<string, number>();
    const terminalAt = new Map<string, number>();
    for (const record of state.diagnostics.factionTransitions) {
      if (record.to === 'CONTACTED' && !firstContact.has(record.factionId)) {
        firstContact.set(record.factionId, record.age);
      }
      if ((record.to === 'OPTED_OUT' || record.to === 'CLOSED') && !terminalAt.has(record.factionId)) {
        terminalAt.set(record.factionId, record.age);
      }
    }
    const order = [...firstContact.entries()].sort((a, b) => a[1] - b[1]);
    for (let i = 1; i < order.length; i++) {
      const [, contactAge] = order[i]!;
      const priorTerminals = order
        .slice(0, i)
        .map(([id]) => terminalAt.get(id))
        .filter((age): age is number => age !== undefined);
      if (priorTerminals.length === i && priorTerminals.every((age) => age <= contactAge)) {
        this.secondContactAfterTerminal += 1;
      } else {
        this.secondContactWhileActive += 1;
      }
    }

    const intermediate = new Set(
      ['2001', '2002', '2003', '2004', '2005', '2006'].map((n) => `EVT-SPC-SECR-${n}`),
    );
    const seen = new Set<string>();
    for (const occurrence of state.history) {
      if (intermediate.has(occurrence.eventId) && !seen.has(occurrence.eventId)) {
        seen.add(occurrence.eventId);
        this.intermediateRuns[occurrence.eventId] = (this.intermediateRuns[occurrence.eventId] ?? 0) + 1;
      }
    }
    for (const expired of state.diagnostics.expiredSchedules) {
      if (!/^EVT-SPC-SECR-00(19|2[0-4])$/.test(expired.eventId)) continue;
      this.expiredEscalations[expired.eventId] = (this.expiredEscalations[expired.eventId] ?? 0) + 1;
    }
  }

  /** A-12: authored CHR/INT/SPR deltas attributed to the age band they fired in. */
  private addStatContributors(state: RunState): void {
    for (const occurrence of state.history) {
      const event = this.content.eventsById.get(occurrence.eventId);
      const variant = event?.variants[occurrence.variantIndex];
      if (!event || !variant) continue;
      const bandLabel = contributorBand(occurrence.age);
      for (const stat of CONTRIBUTOR_STATS) {
        const delta = variant.effects[stat];
        if (delta === undefined || delta === 0) continue;
        const key = `${stat}|${bandLabel}|${event.id}|${occurrence.variantIndex}`;
        const bucket = this.contributors.get(key) ?? { delta, occurrences: 0 };
        bucket.occurrences += 1;
        this.contributors.set(key, bucket);
      }
    }
  }

  /** A-01 / A-02: does the obligation survive the rescue, and does it mature? */
  private addFinance(state: RunState, result: RunResult): void {
    let sawFollowUp = false;
    let buyout = false;
    for (const occurrence of state.history) {
      switch (occurrence.eventId) {
        case FINANCE_MATURATION.rescue:
          this.financeRescue += 1;
          break;
        case FINANCE_MATURATION.followUp:
          sawFollowUp = true;
          // Variant 0 is the A-01 buyout; every other branch keeps the lien.
          if (occurrence.variantIndex === 0) buyout = true;
          break;
        case FINANCE_MATURATION.maturation: {
          this.financeMaturation += 1;
          this.financeMaturationAges.push(occurrence.age);
          const index = occurrence.variantIndex;
          this.financeMaturationBranch.set(index, (this.financeMaturationBranch.get(index) ?? 0) + 1);
          const variant = this.content.eventsById.get(occurrence.eventId)?.variants[index];
          const material = variant?.setMaterialCommitment;
          const label = material ?? (index === 0 ? 'already committed' : 'ambiguous — none');
          this.financeMaturationMaterials[label] = (this.financeMaturationMaterials[label] ?? 0) + 1;
          break;
        }
        case FINANCE_MATURATION.climax:
          this.financeClimax += 1;
          break;
        default:
          break;
      }
    }
    if (sawFollowUp) {
      this.financeFollowUp += 1;
      if (buyout) this.financeBuyout += 1;
      else this.financeObligationSurvived += 1;
    }
    if (result.outcome.kind === 'ended' && state.flags.has(FINANCE_MATURATION.routeFlag)) {
      const id = result.outcome.ending.endingId;
      this.financeEndings[id] = (this.financeEndings[id] ?? 0) + 1;
    }
  }

  /** A-03: escalation should follow the obligation role, not continued poverty. */
  private addBlackLedger(state: RunState, result: RunResult): void {
    const faction = this.content.factions.get('FCT-BLACK-LEDGER');
    if (!faction) return;
    const transitions = state.diagnostics.factionTransitions.filter((r) => r.factionId === faction.id);
    if (transitions.length === 0 && !everContacted(state.flags, faction)) return;
    this.blContact += 1;
    const firstAt = new Map<string, number>();
    for (const record of transitions) {
      if (!firstAt.has(record.to)) firstAt.set(record.to, record.age);
    }
    if (firstAt.has('ENGAGED')) this.blEngaged += 1;
    const committedAge = firstAt.get('COMMITTED');
    if (committedAge !== undefined) {
      this.blCommitted += 1;
      this.blCommittedAges.push(committedAge);
      if (transitions.some((r) => r.addedRoles.includes('DEBTOR'))) this.blDebtorAtEscalation += 1;
    }
    if (firstAt.has('OPTED_OUT')) this.blOptedOut += 1;
    if (firstAt.has('CLOSED')) this.blClosed += 1;
    if (result.outcome.kind === 'ended') {
      const source = this.content.eventsById.get(result.outcome.ending.sourceEventId);
      if (source?.factionIds.includes(faction.id)) {
        this.blEnding += 1;
        const id = result.outcome.ending.endingId;
        this.blEndings[id] = (this.blEndings[id] ?? 0) + 1;
      }
    }
  }

  /** A-04: how often the data-driven trigger actually had to step in. */
  private addStateTriggers(state: RunState): void {
    const perRun: Record<string, number> = {};
    for (const firing of state.diagnostics.stateTriggerFirings) {
      this.triggerFirings[firing.triggerId] = (this.triggerFirings[firing.triggerId] ?? 0) + 1;
      (this.triggerAges[firing.triggerId] ??= []).push(firing.age);
      perRun[firing.triggerId] = (perRun[firing.triggerId] ?? 0) + 1;
    }
    for (const [id, count] of Object.entries(perRun)) {
      this.triggerRuns[id] = (this.triggerRuns[id] ?? 0) + 1;
      if (count > (this.triggerMaxInRun[id] ?? 0)) this.triggerMaxInRun[id] = count;
    }
  }

  private addAgeStratifiedRisk(
    state: RunState,
    endingAge: number | null,
    commitmentAge: number | null,
    lastObservedAge: number,
  ): void {
    for (const [age, stats] of this.statsByAge) {
      if (age < 18) continue;
      const stage = ADULT_STAGES.find((s) => age >= s.min && age <= s.max);
      if (!stage) continue;
      const limit = age + this.riskHorizonYears;
      const fullyObserved = endingAge !== null || lastObservedAge >= limit;
      const alreadyCommitted = commitmentAge !== null && commitmentAge < age;
      for (const stat of VISIBLE_STATS) {
        const key = `${stage.label}|${stat}|${band(stats[stat])}`;
        let counters = this.risk.get(key);
        if (!counters) {
          counters = { personYears: 0, observed: 0, ending: 0, commitEligible: 0, commitment: 0 };
          this.risk.set(key, counters);
        }
        counters.personYears += 1;
        if (!fullyObserved) continue;
        counters.observed += 1;
        if (endingAge !== null && endingAge <= limit) counters.ending += 1;
        if (!alreadyCommitted) {
          counters.commitEligible += 1;
          if (commitmentAge !== null && commitmentAge <= limit) counters.commitment += 1;
        }
      }
    }
  }

  summary(): H2bTelemetry {
    const rate = (n: number): number => (this.runs === 0 ? 0 : n / this.runs);

    const newEvents: NewEventRow[] = this.newEventIds.map((eventId) => {
      const event = this.content.eventsById.get(eventId)!;
      const gating = gatingStatOf(event.include);
      const variants: VariantOutcomeRow[] = event.variants.map((variant, index) => {
        const bucket = this.variantBuckets.get(`${eventId}:${index}`);
        const fix = variant.effects.FIX ?? 0;
        return {
          variantIndex: index,
          when: variant.when,
          textExcerpt: excerpt(variant.text.en),
          occurrences: bucket?.occurrences ?? 0,
          runIncidence: rate(bucket?.runs.size ?? 0),
          meanAge: mean(bucket?.ages ?? []),
          medianAge: median(bucket?.ages ?? []),
          fixGained: fix,
          meanFixGained: bucket && bucket.occurrences > 0 ? fix : null,
          rescueBand: rescueBand(fix),
          meanGatingStatDelta: mean(bucket?.gatingDeltas ?? []),
          endingWithin3: bucket?.endingWithin[3] ?? 0,
          endingWithin5: bucket?.endingWithin[5] ?? 0,
          commitmentWithin3: bucket?.commitmentWithin[3] ?? 0,
          commitmentWithin5: bucket?.commitmentWithin[5] ?? 0,
          observed3: bucket?.observed[3] ?? 0,
          observed5: bucket?.observed[5] ?? 0,
        };
      });
      return {
        eventId,
        channel: event.channel,
        family: event.family,
        routeTags: event.routeTags,
        gatingStat: gating?.stat ?? null,
        gatingCondition: gating?.condition ?? null,
        runsSeen: this.eventRuns.get(eventId) ?? 0,
        runIncidence: rate(this.eventRuns.get(eventId) ?? 0),
        occurrences: this.eventOccurrences.get(eventId) ?? 0,
        meanAge: mean(this.eventAges.get(eventId) ?? []),
        gatingStatBands: this.gatingBands.get(eventId) ?? null,
        variants,
      };
    });

    const rescueBandTotals: Record<RescueBand, { occurrences: number; runs: number }> = {
      clean: { occurrences: 0, runs: 0 },
      costly: { occurrences: 0, runs: 0 },
      unclassified: { occurrences: 0, runs: 0 },
      predatory: { occurrences: 0, runs: 0 },
    };
    for (const row of newEvents) {
      for (const variant of row.variants) {
        if (variant.occurrences === 0) continue;
        const bucket = rescueBandTotals[variant.rescueBand];
        bucket.occurrences += variant.occurrences;
        bucket.runs += Math.round(variant.runIncidence * this.runs);
      }
    }

    const decisionLabels = ['recovered (STR>=3)', 'independent treatment', 'expedited (STR<=-3)', 'covered stabilization'];
    const outcomeLabels = ['recovered', 'independent alternative', 'benefit approved (existing MAT)', 'benefit approved (SYNT)'];
    const syntheticBenefit = this.benefitMaterials['SYNT'] ?? 0;

    const strInsurance: StrInsuranceTelemetry = {
      reviewRuns: this.reviewRuns,
      reviewRate: rate(this.reviewRuns),
      meanReviewAge: mean(this.reviewAges),
      decisionRuns: this.decisionRuns,
      decisionBranches: decisionLabels.map((label, index) => {
        const runs = this.decisionBranch[index] ?? 0;
        return { label, runs, share: this.decisionRuns === 0 ? 0 : runs / this.decisionRuns };
      }),
      outcomeRuns: this.outcomeRuns,
      outcomeBranches: outcomeLabels.map((label, index) => {
        const runs = this.outcomeBranch[index] ?? 0;
        return { label, runs, share: this.outcomeRuns === 0 ? 0 : runs / this.outcomeRuns };
      }),
      benefitApprovedRuns: this.benefitRuns,
      benefitApprovedRate: rate(this.benefitRuns),
      benefitApprovedShareOfCompletions: this.completed === 0 ? 0 : this.benefitRuns / this.completed,
      meanBenefitAge: mean(this.benefitAges),
      medianBenefitAge: median(this.benefitAges),
      benefitMaterials: { ...this.benefitMaterials },
      syntheticShareOfBenefitEndings: this.benefitRuns === 0 ? 0 : syntheticBenefit / this.benefitRuns,
      runsEverExtremeLowStr: this.everExtremeLowStr,
      extremeLowStrWithReview: this.extremeLowStrWithReview,
      extremeLowStrCoverage:
        this.everExtremeLowStr === 0 ? null : this.extremeLowStrWithReview / this.everExtremeLowStr,
      longSurvivorsExtremeLowStrNoReview: this.longSurvivorExtremeNoReview,
    };

    const housing: HousingRelocationTelemetry = {
      housingRuns: this.housingRuns,
      housingRunIncidence: rate(this.housingRuns),
      housingOccurrences: this.housingOccurrences,
      meanUniqueHousingEventIdsPerRun: mean(this.uniqueHousingIds),
      maxUniqueHousingEventIdsInOneRun: this.maxUniqueHousingIds,
      relocationOccurrences: this.relocationOccurrences,
      relocationRuns: this.relocationRuns,
      relocationRunIncidence: rate(this.relocationRuns),
      relocationShareOfHousingEvents:
        this.housingOccurrences === 0 ? 0 : this.relocationOccurrences / this.housingOccurrences,
      meanRelocationsPerRun: mean(this.relocationsPerRun),
      maxRelocationsInOneRun: this.maxRelocations,
      runsWith2PlusRelocations: this.runsWith2PlusRelocations,
      statDeltaTotals: { ...this.housingDeltas },
      fixDeltaTotal: this.housingFix,
      meanFixPerHousingEvent:
        this.housingOccurrences === 0 ? null : this.housingFix / this.housingOccurrences,
      structuralOfferRuns: this.structuralOffer,
      structuralOfferRate: rate(this.structuralOffer),
      structuralCommittedRuns: this.structuralCommitted,
      structuralLapsedRuns: this.structuralLapsed,
      structuralEndingRuns: this.structuralEnding,
      structuralEndingRate: rate(this.structuralEnding),
      structuralEndings: { ...this.structuralEndings },
      meanStructuralEndingAge: mean(this.structuralEndingAges),
    };

    const factions: FactionExclusivityTelemetry = {
      simultaneousActiveViolations: this.simultaneousViolations,
      maxSimultaneousActive: this.maxSimultaneous,
      runsWithAnyContact: this.runsWithContact,
      runsWithMultipleFactionsContacted: this.runsMultiFaction,
      multiFactionRate: rate(this.runsMultiFaction),
      secondContactAfterTerminalRuns: this.secondContactAfterTerminal,
      secondContactWhileActiveRuns: this.secondContactWhileActive,
      intermediateEventRuns: { ...this.intermediateRuns },
      intermediateEventRate: Object.fromEntries(
        Object.entries(this.intermediateRuns).map(([id, count]) => [id, rate(count)]),
      ),
      expiredEscalationSchedules: { ...this.expiredEscalations },
    };

    const ageStratifiedRisk: AgeStratifiedRiskRow[] = [];
    for (const stage of ADULT_STAGES) {
      for (const stat of VISIBLE_STATS) {
        for (const bandId of ['critical', 'vulnerable', 'ordinary_plus']) {
          const counters = this.risk.get(`${stage.label}|${stat}|${bandId}`);
          if (!counters || counters.personYears === 0) continue;
          ageStratifiedRisk.push({
            ageBand: stage.label,
            stat,
            band: bandId,
            personYears: counters.personYears,
            observedPersonYears: counters.observed,
            endingProbability: counters.observed === 0 ? null : counters.ending / counters.observed,
            commitmentEligiblePersonYears: counters.commitEligible,
            commitmentProbability:
              counters.commitEligible === 0 ? null : counters.commitment / counters.commitEligible,
          });
        }
      }
    }

    const byStat: StatContributorAudit['byStat'] = {};
    for (const stat of CONTRIBUTOR_STATS) {
      byStat[stat] = {};
      for (const bandLabel of CONTRIBUTOR_BANDS) {
        byStat[stat]![bandLabel] = { positive: [], negative: [] };
      }
    }
    for (const [key, bucket] of this.contributors) {
      const [stat, bandLabel, eventId, variantIndexRaw] = key.split('|');
      const variantIndex = Number(variantIndexRaw);
      const variant = this.content.eventsById.get(eventId!)?.variants[variantIndex];
      const row: StatContributorRow = {
        eventId: eventId!,
        variantIndex,
        textExcerpt: excerpt(variant?.text.en ?? ''),
        delta: bucket.delta,
        occurrences: bucket.occurrences,
        totalMagnitude: bucket.delta * bucket.occurrences,
      };
      const cell = byStat[stat!]?.[bandLabel!];
      if (!cell) continue;
      (bucket.delta > 0 ? cell.positive : cell.negative).push(row);
    }
    for (const stat of CONTRIBUTOR_STATS) {
      for (const bandLabel of CONTRIBUTOR_BANDS) {
        const cell = byStat[stat]![bandLabel]!;
        cell.positive.sort((a, b) => b.totalMagnitude - a.totalMagnitude);
        cell.negative.sort((a, b) => a.totalMagnitude - b.totalMagnitude);
      }
    }

    const maturationEvent = this.content.eventsById.get(FINANCE_MATURATION.maturation);
    const finance: FinanceMaturationTelemetry = {
      rescueRuns: this.financeRescue,
      followUpRuns: this.financeFollowUp,
      buyoutRuns: this.financeBuyout,
      obligationSurvivedRuns: this.financeObligationSurvived,
      maturationRuns: this.financeMaturation,
      maturationRate: rate(this.financeMaturation),
      meanMaturationAge: mean(this.financeMaturationAges),
      maturationBranches: [...this.financeMaturationBranch.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([index, runs]) => ({
          label: maturationEvent?.variants[index]?.when ?? `variant ${index + 1}`,
          runs,
          share: this.financeMaturation === 0 ? 0 : runs / this.financeMaturation,
        })),
      maturationCommittedMaterials: { ...this.financeMaturationMaterials },
      financeClimaxRuns: this.financeClimax,
      financeEndings: { ...this.financeEndings },
    };

    const blackLedger: BlackLedgerTelemetry = {
      contactRuns: this.blContact,
      engagedRuns: this.blEngaged,
      committedRuns: this.blCommitted,
      optedOutRuns: this.blOptedOut,
      closedRuns: this.blClosed,
      committedRate: rate(this.blCommitted),
      endingRuns: this.blEnding,
      endingRate: rate(this.blEnding),
      endings: { ...this.blEndings },
      meanCommittedAge: mean(this.blCommittedAges),
      debtorAtEscalationRuns: this.blDebtorAtEscalation,
    };

    const stateTriggers: StateTriggerTelemetry = {
      firings: { ...this.triggerFirings },
      runsTriggered: { ...this.triggerRuns },
      meanFiringAge: Object.fromEntries(
        Object.entries(this.triggerAges).map(([id, ages]) => [id, mean(ages)]),
      ),
      maxFiringsInOneRun: { ...this.triggerMaxInRun },
    };

    return {
      runs: this.runs,
      runYears: this.runYears,
      statContributors: { ageBands: [...CONTRIBUTOR_BANDS], byStat },
      finance,
      blackLedger,
      stateTriggers,
      extremeStrSurvivors: {
        survivorsEverExtreme: this.survivorsEverExtreme,
        survivorsWithReview: this.survivorsWithReview,
        coverage:
          this.survivorsEverExtreme === 0 ? null : this.survivorsWithReview / this.survivorsEverExtreme,
      },
      newEvents,
      rescueBandTotals,
      strInsurance,
      housing,
      factions,
      ageStratifiedRisk,
      riskHorizonYears: this.riskHorizonYears,
    };
  }
}
