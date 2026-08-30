import { everContacted, factionState, isPersonallyActive, isPersonalTerminal } from '../engine/factions.js';
import type { ContentBundle } from '../engine/content/load.js';
import type { RunResult } from '../engine/simulation.js';
import { VISIBLE_STATS, type FactionLifecycleState, type RunState, type VisibleStat } from '../engine/types.js';

/**
 * H2B.1B Part A diagnostic.
 *
 * Answers the two Round-2 findings this milestone is scoped to and nothing
 * else: does the starting allocation still mean anything by adulthood, and is a
 * contacted faction recognisable as one relationship rather than three
 * unrelated letters.
 *
 * Everything here measures. No metric feeds back into content or balance, and
 * the review bands in `h2b1bReport.ts` are read as PASS / REVIEW / FAIL rather
 * than as tuning targets.
 *
 * Two hooks are required, exactly as the H2A/H2B accumulators use them:
 * `beforeYear` on the runner's `onBeforeYear`, `add` on its `onRun`. Pre-event
 * state is only visible from the hook, so one run's scratch is held at a time
 * and folded in when the run finishes.
 */

// ---------------------------------------------------------------------------
// Plan constants
// ---------------------------------------------------------------------------

/**
 * The age-18 snapshot is the state ENTERING age 18: after the age-17 event has
 * resolved and before the age-18 event is selected. That is exactly what
 * `onBeforeYear` sees when `state.age === 18`.
 */
export const AGE18 = 18;

/** Drift snapshots the general arm reports. `final` is handled separately. */
export const SNAPSHOT_AGES = [AGE18, 25, 35, 50, 65] as const;

/** Stats the Part A ecology patch is about. */
export const ECOLOGY_STATS: readonly VisibleStat[] = ['INT', 'CHR', 'SPR'];

/** A-12 age bands, kept identical to the H2B contributor audit so the two compare. */
export const CONTRIBUTOR_BANDS = ['0-17', '18-34', '35-64', '65+'] as const;
export type ContributorBand = (typeof CONTRIBUTOR_BANDS)[number];

function contributorBand(age: number): ContributorBand {
  if (age <= 17) return '0-17';
  if (age <= 34) return '18-34';
  if (age <= 64) return '35-64';
  return '65+';
}

/** The compressed chain: disposition -> middle touchpoint -> escalation. */
export const MIDDLE_TOUCHPOINT_IDS = [
  'EVT-SPC-SECR-2001',
  'EVT-SPC-SECR-2002',
  'EVT-SPC-SECR-2003',
  'EVT-SPC-SECR-2004',
  'EVT-SPC-SECR-2005',
  'EVT-SPC-SECR-2006',
] as const;

export const ESCALATION_IDS = [
  'EVT-SPC-SECR-0019',
  'EVT-SPC-SECR-0020',
  'EVT-SPC-SECR-0021',
  'EVT-SPC-SECR-0022',
  'EVT-SPC-SECR-0023',
  'EVT-SPC-SECR-0024',
] as const;

/** Every event whose schedule Part A compresses. A new expiry here is a defect. */
export const COMPRESSED_CHAIN_IDS: readonly string[] = [...MIDDLE_TOUCHPOINT_IDS, ...ESCALATION_IDS];

// ---------------------------------------------------------------------------
// Small statistics helpers
// ---------------------------------------------------------------------------

export function mean(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

/** Nearest-rank percentile on a copy; `q` in [0,1]. */
export function quantile(values: readonly number[], q: number): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0]!;
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower]!;
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (position - lower);
}

export function median(values: readonly number[]): number | null {
  return quantile(values, 0.5);
}

export function share(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

/**
 * Spearman rank correlation with average ranks for ties.
 *
 * Ties are the normal case here — starting allocations are small integers — so
 * the tie-corrected Pearson-on-ranks form is used rather than the 6*d^2
 * shortcut, which is only valid without ties.
 */
export function spearman(pairs: readonly (readonly [number, number])[]): number | null {
  if (pairs.length < 2) return null;
  const rank = (values: readonly number[]): number[] => {
    const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
    const ranks = new Array<number>(values.length);
    let i = 0;
    while (i < order.length) {
      let j = i;
      while (j + 1 < order.length && order[j + 1]!.value === order[i]!.value) j++;
      // Average rank across the tie group, 1-based.
      const averaged = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[order[k]!.index] = averaged;
      i = j + 1;
    }
    return ranks;
  };

  const xs = rank(pairs.map((p) => p[0]));
  const ys = rank(pairs.map((p) => p[1]));
  const mx = mean(xs)!;
  const my = mean(ys)!;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i]! - mx;
    const b = ys[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

// ---------------------------------------------------------------------------
// Targeted-arm allocation fit-up
// ---------------------------------------------------------------------------

/**
 * The acceptance plan's targeted allocations total 20 points, which is what
 * every species except Human receives; Human has 21. The spare point goes to
 * STR in every arm — STR is never an arm's variable and never sits at its cap,
 * so the arms stay comparable and no arm's own stat is perturbed.
 */
export const HUMAN_SPARE_POINT_STAT: VisibleStat = 'STR';

export function explicitAllocationFor(
  allocation: Record<VisibleStat, number>,
  allocationPoints: number,
): Record<VisibleStat, number> {
  const total = VISIBLE_STATS.reduce((sum, stat) => sum + allocation[stat], 0);
  if (total === allocationPoints) return { ...allocation };
  if (allocationPoints !== total + 1) {
    throw new Error(`cannot fit a ${total}-point arm into ${allocationPoints} allocation points`);
  }
  return { ...allocation, [HUMAN_SPARE_POINT_STAT]: allocation[HUMAN_SPARE_POINT_STAT] + 1 };
}

// ---------------------------------------------------------------------------
// Reported shapes
// ---------------------------------------------------------------------------

export interface Distribution {
  samples: number;
  mean: number | null;
  median: number | null;
  p10: number | null;
  p25: number | null;
  p75: number | null;
  p90: number | null;
  min: number | null;
  max: number | null;
}

export function distribution(values: readonly number[]): Distribution {
  return {
    samples: values.length,
    mean: mean(values),
    median: median(values),
    p10: quantile(values, 0.1),
    p25: quantile(values, 0.25),
    p75: quantile(values, 0.75),
    p90: quantile(values, 0.9),
    min: values.length === 0 ? null : Math.min(...values),
    max: values.length === 0 ? null : Math.max(...values),
  };
}

/** One stat's start / age-18 / drift picture for an arm. */
export interface StatArmRow {
  stat: VisibleStat;
  /** Pre-species allocation the setup policy chose. */
  allocatedStart: Distribution;
  /** Post-species, post-start-talent value the run actually begins at age 0 with. */
  effectiveStart: Distribution;
  /** Value entering age 18. Runs that never reach 18 contribute nothing. */
  age18: Distribution;
  /** age18 minus effective start, over the runs that reached 18. */
  drift: Distribution;
  shareAge18AtLeast5: number;
  shareAge18AtLeast8: number;
  shareAge18AtLeast10: number;
  shareAge18AtLeast15: number;
}

export interface DriftSnapshotRow {
  label: string;
  age: number | null;
  activeRuns: number;
  /** Mean of (value at this snapshot - effective start), per stat. */
  meanDrift: Record<string, number | null>;
  meanValue: Record<string, number | null>;
}

export interface ContributorRow {
  stat: VisibleStat;
  band: ContributorBand;
  eventId: string;
  variantIndex: number;
  delta: number;
  occurrences: number;
  totalMagnitude: number;
  repeatPolicy: string;
  repeatMaxCount: number | null;
  /** Set when a repeatable event's total magnitude is a severe outlier in its band. */
  repeatableOutlier: boolean;
}

export interface ContributorAudit {
  bands: readonly ContributorBand[];
  /** Ranked by total magnitude, positive and negative kept apart. */
  byStat: Record<string, Record<string, { positive: ContributorRow[]; negative: ContributorRow[] }>>;
  /** Repeatable events flagged as severe outliers anywhere in the audit. */
  repeatableOutliers: ContributorRow[];
}

export interface FactionCoherenceRow {
  factionId: string;
  shortName: string;
  contactRuns: number;
  contactRate: number;
  dispositionRuns: number;
  dispositionRate: number;
  engagedRuns: number;
  engagedRate: number;
  committedRuns: number;
  committedRate: number;
  optedOutRuns: number;
  closedRuns: number;
  exitRate: number;
  endingRuns: number;
  endingShareOfCompleted: number;
  /** Personalized touchpoints (contact / personal / climax) per contacted run. */
  touchpointsPerContacted: Distribution;
  touchpointsPerEngaged: Distribution;
  engagedRunsWith3Plus: number;
  engagedThreePlusShare: number;
  /** Years between consecutive personalized events for this faction. */
  gapYears: Distribution;
  /** Contact -> COMMITTED or terminal exit, in years. */
  contactToTerminalYears: Distribution;
  firstDispositionRuns: number;
  firstDispositionExitRuns: number;
  firstDispositionExitRate: number | null;
  scheduleExpiries: number;
}

export interface FactionCoherenceSummary {
  byFaction: FactionCoherenceRow[];
  overall: {
    anyContactRuns: number;
    anyContactRate: number;
    factionEndingRuns: number;
    factionEndingShareOfCompleted: number;
    engagedRuns: number;
    engagedRunsWith3Plus: number;
    engagedThreePlusShare: number;
    touchpointsPerEngaged: Distribution;
    gapYears: Distribution;
    contactToTerminalYears: Distribution;
    maxSimultaneouslyActive: number;
  };
}

/** Every hard requirement in the acceptance plan. All must be zero. */
export interface CorrectnessCounters {
  endingsBefore18: number;
  materialCommitmentsBefore18: number;
  coverageDefects: number;
  pre25FallbackYears: number;
  multipleVisibleEventsInAYear: number;
  illegalFactionTransitions: number;
  lifecycleCollisions: number;
  personalEventsAfterTerminalExit: number;
  runsWithTwoActiveFactions: number;
  contactWhileAnotherActive: number;
  compressedChainScheduleExpiries: number;
  /** Per-event breakdown of the line above, so a regression names itself. */
  compressedChainExpiriesByEvent: Record<string, number>;
}

export interface H2b1bArmSummary {
  runs: number;
  runsReachingAge18: number;
  completedRuns: number;
  stats: StatArmRow[];
  driftSnapshots: DriftSnapshotRow[];
  /** Share of runs still active entering 65 that hold SPR >= 15 there. */
  spr15At65: { activeRuns: number; atLeast15: number; share: number | null };
  contributors: ContributorAudit | null;
  factions: FactionCoherenceSummary | null;
  correctness: CorrectnessCounters;
}

export interface H2b1bAccumulatorOptions {
  /** The general arm reports the contributor audit and faction coherence; the targeted arms do not. */
  includeContributors?: boolean;
  includeFactions?: boolean;
}

// ---------------------------------------------------------------------------
// Accumulator
// ---------------------------------------------------------------------------

interface ContributorBucket {
  stat: VisibleStat;
  band: ContributorBand;
  eventId: string;
  variantIndex: number;
  delta: number;
  occurrences: number;
}

interface FactionScratch {
  contacted: boolean;
  dispositionSeen: boolean;
  reached: Set<FactionLifecycleState>;
  touchpointAges: number[];
  contactAge: number | null;
  terminalOrCommittedAge: number | null;
  /** Set when the first disposition event took the run straight out of the chain. */
  firstDispositionExit: boolean;
}

export class H2b1bAccumulator {
  private readonly includeContributors: boolean;
  private readonly includeFactions: boolean;

  private runs = 0;
  private completedRuns = 0;
  private runsReachingAge18 = 0;

  /** Per-stat samples, keyed by stat. */
  private readonly allocated = new Map<VisibleStat, number[]>();
  private readonly effectiveStart = new Map<VisibleStat, number[]>();
  private readonly age18 = new Map<VisibleStat, number[]>();
  private readonly drift = new Map<VisibleStat, number[]>();
  /** (allocated start, age-18 value) pairs, for the rank correlation. */
  private readonly startToAge18 = new Map<VisibleStat, [number, number][]>();

  /** age -> per-stat values and per-stat drift, across runs still active at that age. */
  private readonly snapshotValues = new Map<number, Map<VisibleStat, number[]>>();
  private readonly snapshotDrift = new Map<number, Map<VisibleStat, number[]>>();
  private readonly finalValues = new Map<VisibleStat, number[]>();
  private readonly finalDrift = new Map<VisibleStat, number[]>();

  private spr65Active = 0;
  private spr65AtLeast15 = 0;

  private readonly contributors = new Map<string, ContributorBucket>();

  private readonly factionScratch = new Map<string, {
    contactRuns: number;
    dispositionRuns: number;
    engagedRuns: number;
    committedRuns: number;
    optedOutRuns: number;
    closedRuns: number;
    endingRuns: number;
    touchpointsContacted: number[];
    touchpointsEngaged: number[];
    engagedThreePlus: number;
    gaps: number[];
    contactToTerminal: number[];
    firstDispositionRuns: number;
    firstDispositionExitRuns: number;
    scheduleExpiries: number;
  }>();

  private anyContactRuns = 0;
  private factionEndingRuns = 0;
  private overallEngagedRuns = 0;
  private overallEngagedThreePlus = 0;
  private readonly overallTouchpointsEngaged: number[] = [];
  private readonly overallGaps: number[] = [];
  private readonly overallContactToTerminal: number[] = [];
  private maxSimultaneouslyActive = 0;

  private readonly correctness: CorrectnessCounters = {
    endingsBefore18: 0,
    materialCommitmentsBefore18: 0,
    coverageDefects: 0,
    pre25FallbackYears: 0,
    multipleVisibleEventsInAYear: 0,
    illegalFactionTransitions: 0,
    lifecycleCollisions: 0,
    personalEventsAfterTerminalExit: 0,
    runsWithTwoActiveFactions: 0,
    contactWhileAnotherActive: 0,
    compressedChainScheduleExpiries: 0,
    compressedChainExpiriesByEvent: {},
  };

  /** Per-run scratch filled by `beforeYear` and consumed by `add`. */
  private scratchStart: Record<VisibleStat, number> | null = null;
  private scratchSnapshots = new Map<number, Record<VisibleStat, number>>();
  private scratchMaxActive = 0;

  constructor(
    private readonly content: ContentBundle,
    options: H2b1bAccumulatorOptions = {},
  ) {
    this.includeContributors = options.includeContributors ?? true;
    this.includeFactions = options.includeFactions ?? true;
    for (const stat of VISIBLE_STATS) {
      this.allocated.set(stat, []);
      this.effectiveStart.set(stat, []);
      this.age18.set(stat, []);
      this.drift.set(stat, []);
      this.startToAge18.set(stat, []);
      this.finalValues.set(stat, []);
      this.finalDrift.set(stat, []);
    }
    for (const age of SNAPSHOT_AGES) {
      this.snapshotValues.set(age, new Map(VISIBLE_STATS.map((s) => [s, [] as number[]])));
      this.snapshotDrift.set(age, new Map(VISIBLE_STATS.map((s) => [s, [] as number[]])));
    }
    for (const faction of this.content.factions.values()) {
      this.factionScratch.set(faction.id, {
        contactRuns: 0,
        dispositionRuns: 0,
        engagedRuns: 0,
        committedRuns: 0,
        optedOutRuns: 0,
        closedRuns: 0,
        endingRuns: 0,
        touchpointsContacted: [],
        touchpointsEngaged: [],
        engagedThreePlus: 0,
        gaps: [],
        contactToTerminal: [],
        firstDispositionRuns: 0,
        firstDispositionExitRuns: 0,
        scheduleExpiries: 0,
      });
    }
  }

  /** Wire to the runner's `onBeforeYear`. */
  beforeYear(state: RunState): void {
    if (state.age === 0) {
      this.scratchStart = { ...pickVisible(state) };
      this.scratchSnapshots = new Map();
      this.scratchMaxActive = 0;
    }
    if (SNAPSHOT_AGES.includes(state.age as (typeof SNAPSHOT_AGES)[number])) {
      this.scratchSnapshots.set(state.age, { ...pickVisible(state) });
    }
    if (this.includeFactions) {
      let active = 0;
      for (const faction of this.content.factions.values()) {
        if (isPersonallyActive(this.content.factionRules, factionState(state.flags, faction))) active += 1;
      }
      if (active > this.scratchMaxActive) this.scratchMaxActive = active;
    }
  }

  /** Wire to the runner's `onRun`. */
  add(result: RunResult): void {
    const state = result.state;
    this.runs += 1;
    if (result.outcome.kind === 'ended') this.completedRuns += 1;

    const start = this.scratchStart ?? pickVisible(state);
    const snapshots = this.scratchSnapshots;
    const maxActive = this.scratchMaxActive;
    this.scratchStart = null;
    this.scratchSnapshots = new Map();
    this.scratchMaxActive = 0;

    for (const stat of VISIBLE_STATS) {
      this.allocated.get(stat)!.push(result.setup.allocation[stat]);
      this.effectiveStart.get(stat)!.push(start[stat]);
    }

    const at18 = snapshots.get(AGE18);
    if (at18) {
      this.runsReachingAge18 += 1;
      for (const stat of VISIBLE_STATS) {
        this.age18.get(stat)!.push(at18[stat]);
        this.drift.get(stat)!.push(at18[stat] - start[stat]);
        this.startToAge18.get(stat)!.push([result.setup.allocation[stat], at18[stat]]);
      }
    }

    for (const age of SNAPSHOT_AGES) {
      const snapshot = snapshots.get(age);
      if (!snapshot) continue;
      for (const stat of VISIBLE_STATS) {
        this.snapshotValues.get(age)!.get(stat)!.push(snapshot[stat]);
        this.snapshotDrift.get(age)!.get(stat)!.push(snapshot[stat] - start[stat]);
      }
    }
    for (const stat of VISIBLE_STATS) {
      this.finalValues.get(stat)!.push(state.stats[stat]);
      this.finalDrift.get(stat)!.push(state.stats[stat] - start[stat]);
    }

    const at65 = snapshots.get(65);
    if (at65) {
      this.spr65Active += 1;
      if (at65.SPR >= 15) this.spr65AtLeast15 += 1;
    }

    if (this.includeContributors) this.addContributors(state);
    if (this.includeFactions) this.addFactions(result, maxActive);
    this.addCorrectness(result, maxActive);
  }

  /** Authored INT / CHR / SPR deltas, attributed to the band they fired in. */
  private addContributors(state: RunState): void {
    for (const occurrence of state.history) {
      const event = this.content.eventsById.get(occurrence.eventId);
      const variant = event?.variants[occurrence.variantIndex];
      if (!event || !variant) continue;
      const band = contributorBand(occurrence.age);
      for (const stat of ECOLOGY_STATS) {
        const delta = variant.effects[stat];
        if (delta === undefined || delta === 0) continue;
        const key = `${stat}|${band}|${event.id}|${occurrence.variantIndex}`;
        const bucket = this.contributors.get(key);
        if (bucket) {
          bucket.occurrences += 1;
        } else {
          this.contributors.set(key, {
            stat,
            band,
            eventId: event.id,
            variantIndex: occurrence.variantIndex,
            delta,
            occurrences: 1,
          });
        }
      }
    }
  }

  private addFactions(result: RunResult, maxActive: number): void {
    const state = result.state;
    // A faction ending is the one produced by that faction's own event, which is
    // how the Phase 1.3 accumulator attributes them too.
    const endingSource =
      result.outcome.kind === 'ended'
        ? this.content.eventsById.get(result.outcome.ending.sourceEventId)
        : undefined;
    if (maxActive > this.maxSimultaneouslyActive) this.maxSimultaneouslyActive = maxActive;

    let anyContact = false;
    let sawFactionEnding = false;

    for (const faction of this.content.factions.values()) {
      const bucket = this.factionScratch.get(faction.id)!;
      const scratch = this.runFactionScratch(state, faction.id);
      if (!scratch.contacted) continue;

      anyContact = true;
      bucket.contactRuns += 1;
      if (scratch.dispositionSeen) bucket.dispositionRuns += 1;
      if (scratch.reached.has('ENGAGED')) bucket.engagedRuns += 1;
      if (scratch.reached.has('COMMITTED')) bucket.committedRuns += 1;
      if (scratch.reached.has('OPTED_OUT')) bucket.optedOutRuns += 1;
      if (scratch.reached.has('CLOSED')) bucket.closedRuns += 1;

      const touchpoints = scratch.touchpointAges.length;
      bucket.touchpointsContacted.push(touchpoints);
      if (scratch.reached.has('ENGAGED')) {
        bucket.touchpointsEngaged.push(touchpoints);
        this.overallTouchpointsEngaged.push(touchpoints);
        this.overallEngagedRuns += 1;
        if (touchpoints >= 3) {
          bucket.engagedThreePlus += 1;
          this.overallEngagedThreePlus += 1;
        }
      }

      const ages = scratch.touchpointAges.slice().sort((a, b) => a - b);
      for (let i = 1; i < ages.length; i++) {
        const gap = ages[i]! - ages[i - 1]!;
        bucket.gaps.push(gap);
        this.overallGaps.push(gap);
      }

      if (scratch.contactAge !== null && scratch.terminalOrCommittedAge !== null) {
        const span = scratch.terminalOrCommittedAge - scratch.contactAge;
        bucket.contactToTerminal.push(span);
        this.overallContactToTerminal.push(span);
      }

      if (scratch.dispositionSeen) {
        bucket.firstDispositionRuns += 1;
        if (scratch.firstDispositionExit) bucket.firstDispositionExitRuns += 1;
      }

      if (endingSource && endingSource.factionIds.includes(faction.id)) {
        bucket.endingRuns += 1;
        sawFactionEnding = true;
      }

      for (const expired of state.diagnostics.expiredSchedules) {
        if (!COMPRESSED_CHAIN_IDS.includes(expired.eventId)) continue;
        const event = this.content.eventsById.get(expired.eventId);
        if (!event || !event.factionIds.includes(faction.id)) continue;
        bucket.scheduleExpiries += 1;
      }
    }

    if (anyContact) this.anyContactRuns += 1;
    if (sawFactionEnding) this.factionEndingRuns += 1;
  }

  /**
   * One faction's shape within one run, read from the transition log and the
   * timeline. The transition log is authoritative for lifecycle; the timeline is
   * authoritative for how many personalized events the player actually saw.
   */
  private runFactionScratch(state: RunState, factionId: string): FactionScratch {
    const faction = this.content.factions.get(factionId)!;
    const scratch: FactionScratch = {
      contacted: false,
      dispositionSeen: false,
      reached: new Set(),
      touchpointAges: [],
      contactAge: null,
      terminalOrCommittedAge: null,
      firstDispositionExit: false,
    };

    for (const record of state.diagnostics.factionTransitions) {
      if (record.factionId !== factionId) continue;
      scratch.reached.add(record.to);
      if (record.to === 'CONTACTED' && scratch.contactAge === null) scratch.contactAge = record.age;
      const terminal =
        record.to === 'COMMITTED' || isPersonalTerminal(this.content.factionRules, record.to);
      if (terminal && scratch.terminalOrCommittedAge === null) scratch.terminalOrCommittedAge = record.age;
    }
    scratch.contacted = scratch.reached.size > 0 || everContacted(state.flags, faction);

    // Personalized touchpoints: the contact, disposition, middle and escalation
    // events plus the climax. `news` bulletins are world texture, not a
    // relationship, and are deliberately excluded.
    let firstDispositionAge: number | null = null;
    for (const occurrence of state.history) {
      const event = this.content.eventsById.get(occurrence.eventId);
      if (!event || !event.factionIds.includes(factionId)) continue;
      const interaction = event.factionInteraction;
      if (interaction !== 'contact' && interaction !== 'personal' && interaction !== 'climax') continue;
      scratch.touchpointAges.push(occurrence.age);
      if (interaction === 'personal' && DISPOSITION_IDS.includes(event.id)) {
        if (firstDispositionAge === null) {
          firstDispositionAge = occurrence.age;
          scratch.dispositionSeen = true;
          const variant = event.variants[occurrence.variantIndex];
          const target = variant?.factionTransitions?.find((t) => t.factionId === factionId)?.to;
          scratch.firstDispositionExit =
            target !== undefined && isPersonalTerminal(this.content.factionRules, target);
        }
      }
    }
    return scratch;
  }

  private addCorrectness(result: RunResult, maxActive: number): void {
    const state = result.state;
    const c = this.correctness;

    if (result.outcome.kind === 'ended' && result.outcome.ending.endingAge < 18) c.endingsBefore18 += 1;
    if (state.diagnostics.commitmentAge !== null && state.diagnostics.commitmentAge < 18) {
      c.materialCommitmentsBefore18 += 1;
    }
    c.coverageDefects += state.diagnostics.coverageDefectAges.length;
    c.pre25FallbackYears += state.diagnostics.fallbackYears.filter((age) => age < 25).length;

    const seenAges = new Set<number>();
    for (const occurrence of state.history) {
      if (seenAges.has(occurrence.age)) c.multipleVisibleEventsInAYear += 1;
      seenAges.add(occurrence.age);
    }

    c.illegalFactionTransitions += state.diagnostics.illegalFactionTransitions.length;
    c.personalEventsAfterTerminalExit += state.diagnostics.personalEventsAfterExit.length;

    for (const faction of this.content.factions.values()) {
      const held = Object.values(faction.lifecycleFlags).filter((flag) => state.flags.has(flag));
      if (held.length > 1) c.lifecycleCollisions += 1;
    }

    if (maxActive > 1) c.runsWithTwoActiveFactions += 1;

    // A contact that opened while another relationship was still running. The
    // engine gates this in `factionSlotAllows`; this counts it from the log.
    const contacts: { factionId: string; age: number }[] = [];
    const terminalAt = new Map<string, number>();
    for (const record of state.diagnostics.factionTransitions) {
      if (record.to === 'CONTACTED' && !contacts.some((c2) => c2.factionId === record.factionId)) {
        contacts.push({ factionId: record.factionId, age: record.age });
      }
      if (isPersonalTerminal(this.content.factionRules, record.to) && !terminalAt.has(record.factionId)) {
        terminalAt.set(record.factionId, record.age);
      }
    }
    contacts.sort((a, b) => a.age - b.age);
    for (let i = 1; i < contacts.length; i++) {
      const opened = contacts[i]!;
      for (let j = 0; j < i; j++) {
        const prior = contacts[j]!;
        const exit = terminalAt.get(prior.factionId);
        if (exit === undefined || exit > opened.age) {
          c.contactWhileAnotherActive += 1;
          break;
        }
      }
    }

    for (const expired of state.diagnostics.expiredSchedules) {
      if (!COMPRESSED_CHAIN_IDS.includes(expired.eventId)) continue;
      c.compressedChainScheduleExpiries += 1;
      c.compressedChainExpiriesByEvent[expired.eventId] =
        (c.compressedChainExpiriesByEvent[expired.eventId] ?? 0) + 1;
    }
  }

  /** (allocated start, age-18 value) pairs for one stat. Used for the rank correlation. */
  pairs(stat: VisibleStat): readonly (readonly [number, number])[] {
    return this.startToAge18.get(stat) ?? [];
  }

  summary(): H2b1bArmSummary {
    const stats: StatArmRow[] = ECOLOGY_STATS.map((stat) => {
      const age18 = this.age18.get(stat)!;
      const total = age18.length;
      const atLeast = (threshold: number): number =>
        share(age18.filter((value) => value >= threshold).length, total);
      return {
        stat,
        allocatedStart: distribution(this.allocated.get(stat)!),
        effectiveStart: distribution(this.effectiveStart.get(stat)!),
        age18: distribution(age18),
        drift: distribution(this.drift.get(stat)!),
        shareAge18AtLeast5: atLeast(5),
        shareAge18AtLeast8: atLeast(8),
        shareAge18AtLeast10: atLeast(10),
        shareAge18AtLeast15: atLeast(15),
      };
    });

    const driftSnapshots: DriftSnapshotRow[] = SNAPSHOT_AGES.map((age) => {
      const values = this.snapshotValues.get(age)!;
      const drift = this.snapshotDrift.get(age)!;
      return {
        label: `age ${age}`,
        age,
        activeRuns: values.get('INT')!.length,
        meanDrift: Object.fromEntries(ECOLOGY_STATS.map((s) => [s, mean(drift.get(s)!)])),
        meanValue: Object.fromEntries(ECOLOGY_STATS.map((s) => [s, mean(values.get(s)!)])),
      };
    });
    driftSnapshots.push({
      label: 'final',
      age: null,
      activeRuns: this.finalValues.get('INT')!.length,
      meanDrift: Object.fromEntries(ECOLOGY_STATS.map((s) => [s, mean(this.finalDrift.get(s)!)])),
      meanValue: Object.fromEntries(ECOLOGY_STATS.map((s) => [s, mean(this.finalValues.get(s)!)])),
    });

    return {
      runs: this.runs,
      runsReachingAge18: this.runsReachingAge18,
      completedRuns: this.completedRuns,
      stats,
      driftSnapshots,
      spr15At65: {
        activeRuns: this.spr65Active,
        atLeast15: this.spr65AtLeast15,
        share: this.spr65Active === 0 ? null : this.spr65AtLeast15 / this.spr65Active,
      },
      contributors: this.includeContributors ? this.contributorAudit() : null,
      factions: this.includeFactions ? this.factionSummary() : null,
      correctness: this.correctness,
    };
  }

  private contributorAudit(): ContributorAudit {
    const rows: ContributorRow[] = [...this.contributors.values()].map((bucket) => {
      const event = this.content.eventsById.get(bucket.eventId);
      return {
        stat: bucket.stat,
        band: bucket.band,
        eventId: bucket.eventId,
        variantIndex: bucket.variantIndex,
        delta: bucket.delta,
        occurrences: bucket.occurrences,
        totalMagnitude: bucket.delta * bucket.occurrences,
        repeatPolicy: event?.repeatPolicy ?? 'unknown',
        repeatMaxCount: event?.repeatMaxCount ?? null,
        repeatableOutlier: false,
      };
    });

    const byStat: ContributorAudit['byStat'] = {};
    const outliers: ContributorRow[] = [];
    for (const stat of ECOLOGY_STATS) {
      byStat[stat] = {};
      for (const band of CONTRIBUTOR_BANDS) {
        const inBand = rows.filter((row) => row.stat === stat && row.band === band);
        const positive = inBand
          .filter((row) => row.totalMagnitude > 0)
          .sort((a, b) => b.totalMagnitude - a.totalMagnitude);
        const negative = inBand
          .filter((row) => row.totalMagnitude < 0)
          .sort((a, b) => a.totalMagnitude - b.totalMagnitude);

        // "Severe outlier": a repeatable event carrying at least three times the
        // median absolute contribution of its own stat/band and at least a fifth
        // of the band's whole absolute magnitude. Both halves matter — the first
        // alone fires on tiny bands, the second alone fires on any dominant
        // one-shot.
        const magnitudes = inBand.map((row) => Math.abs(row.totalMagnitude));
        const bandTotal = magnitudes.reduce((a, b) => a + b, 0);
        const medianMagnitude = median(magnitudes) ?? 0;
        for (const row of inBand) {
          if (row.repeatPolicy !== 'repeatable') continue;
          const magnitude = Math.abs(row.totalMagnitude);
          if (magnitude < medianMagnitude * 3) continue;
          if (bandTotal === 0 || magnitude / bandTotal < 0.2) continue;
          row.repeatableOutlier = true;
          outliers.push(row);
        }

        byStat[stat]![band] = { positive: positive.slice(0, 10), negative: negative.slice(0, 10) };
      }
    }
    outliers.sort((a, b) => Math.abs(b.totalMagnitude) - Math.abs(a.totalMagnitude));
    return { bands: CONTRIBUTOR_BANDS, byStat, repeatableOutliers: outliers };
  }

  private factionSummary(): FactionCoherenceSummary {
    const byFaction: FactionCoherenceRow[] = [];
    for (const faction of this.content.factions.values()) {
      const bucket = this.factionScratch.get(faction.id)!;
      byFaction.push({
        factionId: faction.id,
        shortName: faction.shortName,
        contactRuns: bucket.contactRuns,
        contactRate: share(bucket.contactRuns, this.runs),
        dispositionRuns: bucket.dispositionRuns,
        dispositionRate: share(bucket.dispositionRuns, this.runs),
        engagedRuns: bucket.engagedRuns,
        engagedRate: share(bucket.engagedRuns, this.runs),
        committedRuns: bucket.committedRuns,
        committedRate: share(bucket.committedRuns, this.runs),
        optedOutRuns: bucket.optedOutRuns,
        closedRuns: bucket.closedRuns,
        exitRate: share(bucket.optedOutRuns + bucket.closedRuns, this.runs),
        endingRuns: bucket.endingRuns,
        endingShareOfCompleted: share(bucket.endingRuns, this.completedRuns),
        touchpointsPerContacted: distribution(bucket.touchpointsContacted),
        touchpointsPerEngaged: distribution(bucket.touchpointsEngaged),
        engagedRunsWith3Plus: bucket.engagedThreePlus,
        engagedThreePlusShare: share(bucket.engagedThreePlus, bucket.engagedRuns),
        gapYears: distribution(bucket.gaps),
        contactToTerminalYears: distribution(bucket.contactToTerminal),
        firstDispositionRuns: bucket.firstDispositionRuns,
        firstDispositionExitRuns: bucket.firstDispositionExitRuns,
        firstDispositionExitRate:
          bucket.firstDispositionRuns === 0
            ? null
            : bucket.firstDispositionExitRuns / bucket.firstDispositionRuns,
        scheduleExpiries: bucket.scheduleExpiries,
      });
    }

    return {
      byFaction,
      overall: {
        anyContactRuns: this.anyContactRuns,
        anyContactRate: share(this.anyContactRuns, this.runs),
        factionEndingRuns: this.factionEndingRuns,
        factionEndingShareOfCompleted: share(this.factionEndingRuns, this.completedRuns),
        engagedRuns: this.overallEngagedRuns,
        engagedRunsWith3Plus: this.overallEngagedThreePlus,
        engagedThreePlusShare: share(this.overallEngagedThreePlus, this.overallEngagedRuns),
        touchpointsPerEngaged: distribution(this.overallTouchpointsEngaged),
        gapYears: distribution(this.overallGaps),
        contactToTerminalYears: distribution(this.overallContactToTerminal),
        maxSimultaneouslyActive: this.maxSimultaneouslyActive,
      },
    };
  }
}

/** Batch 007 first-disposition events, one per faction. */
export const DISPOSITION_IDS: readonly string[] = [
  'EVT-SPC-SECR-0013',
  'EVT-SPC-SECR-0014',
  'EVT-SPC-SECR-0015',
  'EVT-SPC-SECR-0016',
  'EVT-SPC-SECR-0017',
  'EVT-SPC-SECR-0018',
];

function pickVisible(state: RunState): Record<VisibleStat, number> {
  return {
    CHR: state.stats.CHR,
    INT: state.stats.INT,
    STR: state.stats.STR,
    MNY: state.stats.MNY,
    SPR: state.stats.SPR,
  };
}
