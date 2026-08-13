import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { CONTENT_ROOT, type ContentBundle } from '../engine/content/load.js';
import { everContacted, factionState } from '../engine/factions.js';
import type { RunResult } from '../engine/simulation.js';
import type { FactionLifecycleState } from '../engine/types.js';

/**
 * Phase 1.3 compact sanity harness.
 *
 * Implements `SOLID_STATE_PHASE1_3_SANITY_PLAN_v0.1.json` and nothing else. The
 * historical sweeps (LOW/MID/HIGH thresholds, family-weight A/B, the three-way
 * allocation comparison, T1027 sensitivity, the T1023 SPC comparison and the
 * neutral-Human manifestation diagnostic) are deliberately NOT executed here;
 * their harnesses in `experiments.ts` and `phase1_2.ts` stay intact for H2B.
 *
 * Everything here measures. Nothing tunes content or balance.
 */

const sanityPlanSchema = z
  .object({
    version: z.string(),
    status: z.string(),
    purpose: z.string(),
    primary: z
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
    requiredMetrics: z.array(z.string()),
    explicitlyNotRun: z.array(z.string()),
    retentionPolicy: z.object({ notDropped: z.boolean(), note: z.string() }).strict(),
    h2aDecisionRule: z.string(),
    stopCondition: z.string(),
  })
  .strict();

export type SanityPlan = z.infer<typeof sanityPlanSchema>;

export function loadSanityPlan(file?: string): SanityPlan {
  const target = file ?? path.join(CONTENT_ROOT, 'balance', 'SOLID_STATE_PHASE1_3_SANITY_PLAN_v0.1.json');
  const parsed = sanityPlanSchema.safeParse(JSON.parse(readFileSync(target, 'utf8')));
  if (!parsed.success) {
    throw new Error(
      `Phase 1.3 sanity plan invalid:\n  - ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('\n  - ')}`,
    );
  }
  return parsed.data;
}

// ---------------------------------------------------------------------------
// Faction lifecycle metrics
// ---------------------------------------------------------------------------

export interface FactionLifecycleStats {
  /** Runs that ever crossed this faction's path, by any route. */
  contactRuns: number;
  contactRate: number;
  /** Runs that ever reached each lifecycle state, whether or not they stayed. */
  everReached: Record<string, number>;
  everReachedRate: Record<string, number>;
  /** Runs that held the TARGETED role at any point. */
  targetedRuns: number;
  targetedRate: number;
  /** Runs exposed to at least one of this faction's news bulletins. */
  newsRuns: number;
  newsRate: number;
  /** Runs whose ending came from this faction. */
  endingRuns: number;
  endingRate: number;
  /** Years from CONTACTED to each later milestone. */
  yearsFromContact: Record<string, { mean: number | null; median: number | null; runs: number }>;
}

export interface FactionSummary {
  byFaction: Record<string, FactionLifecycleStats>;
  /** Runs with at least one faction contact of any kind. */
  anyContactRuns: number;
  anyContactRate: number;
  /** Faction-caused endings as a share of completed runs. */
  factionEndingRuns: number;
  factionEndingShare: number;
  /**
   * How faction endings arrived. `committedLadder` is the intended
   * CONTACT -> DISPOSITION -> ESCALATION -> CLIMAX path; `sudden` is the
   * minority branch where a strongly conditioned disposition or escalation
   * variant ends the run directly.
   */
  suddenFactionEndings: number;
  committedLadderFactionEndings: number;
  suddenShareOfFactionEndings: number;
  committedLadderShareOfFactionEndings: number;
  meanFactionEndingAge: Record<string, number | null>;
  /** Correctness counters. Both must be zero. */
  illegalTransitionCount: number;
  illegalLifecycleStateCount: number;
  personalEventsAfterExitCount: number;
  /** Total applied transitions, by target state. */
  transitionCounts: Record<string, number>;
}

function mean(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

const MILESTONES: FactionLifecycleState[] = ['ENGAGED', 'COMMITTED', 'OPTED_OUT', 'CLOSED'];
const TRACKED_STATES: FactionLifecycleState[] = ['CONTACTED', 'ENGAGED', 'COMMITTED', 'OPTED_OUT', 'CLOSED'];

/**
 * Streaming accumulator for the faction-lifecycle metrics.
 *
 * Consumes each run as it finishes so a 5 000-run sanity pass never has to hold
 * every timeline in memory at once.
 */
export class FactionAccumulator {
  private readonly names: string[];
  private readonly stats = new Map<
    string,
    {
      contact: number;
      everReached: Record<string, number>;
      targeted: number;
      news: number;
      endings: number;
      endingAges: number[];
      yearsFromContact: Record<string, number[]>;
    }
  >();

  private runs = 0;
  private completed = 0;
  private anyContact = 0;
  private factionEndings = 0;
  private sudden = 0;
  private ladder = 0;
  private illegalTransitions = 0;
  private illegalLifecycleStates = 0;
  private personalAfterExit = 0;
  private readonly transitionCounts: Record<string, number> = {};
  /** Event id -> faction shortName, for news and ending attribution. */
  private readonly newsEventFaction = new Map<string, string[]>();
  private readonly endingEventFaction = new Map<string, { name: string; interaction: string }>();

  constructor(private readonly content: ContentBundle) {
    this.names = [...content.factions.values()].map((f) => f.shortName);
    for (const name of this.names) {
      this.stats.set(name, {
        contact: 0,
        everReached: Object.fromEntries(TRACKED_STATES.map((s) => [s, 0])),
        targeted: 0,
        news: 0,
        endings: 0,
        endingAges: [],
        yearsFromContact: Object.fromEntries(MILESTONES.map((s) => [s, [] as number[]])),
      });
    }
    const nameOf = new Map([...content.factions.values()].map((f) => [f.id, f.shortName]));
    for (const gameEvent of content.events) {
      const names = gameEvent.factionIds.map((id) => nameOf.get(id)).filter((n): n is string => Boolean(n));
      if (names.length === 0) continue;
      if (gameEvent.factionInteraction === 'news' || gameEvent.factionInteraction === 'lore_fallback') {
        this.newsEventFaction.set(gameEvent.id, names);
      }
      if (gameEvent.variants.some((v) => v.endingId)) {
        this.endingEventFaction.set(gameEvent.id, {
          name: names[0]!,
          interaction: gameEvent.factionInteraction ?? 'unknown',
        });
      }
    }
  }

  add(result: RunResult): void {
    this.runs += 1;
    const { state } = result;
    const diagnostics = state.diagnostics;
    this.illegalTransitions += diagnostics.illegalFactionTransitions.length;
    this.personalAfterExit += diagnostics.personalEventsAfterExit.length;

    for (const faction of this.content.factions.values()) {
      const bucket = this.stats.get(faction.shortName)!;
      // At most one lifecycle flag per faction is a hard invariant.
      const held = Object.values(faction.lifecycleFlags).filter((flag) => state.flags.has(flag)).length;
      if (held > 1) this.illegalLifecycleStates += 1;
      if (everContacted(state.flags, faction)) bucket.contact += 1;
    }

    // Reconstruct the lifecycle history from the applied transitions.
    const contactAge = new Map<string, number>();
    const seenStates = new Map<string, Set<string>>();
    for (const record of diagnostics.factionTransitions) {
      const faction = this.content.factions.get(record.factionId);
      if (!faction) continue;
      const name = faction.shortName;
      const bucket = this.stats.get(name)!;
      this.transitionCounts[record.to] = (this.transitionCounts[record.to] ?? 0) + 1;

      let seen = seenStates.get(name);
      if (!seen) {
        seen = new Set();
        seenStates.set(name, seen);
      }
      if (!seen.has(record.to)) {
        seen.add(record.to);
        bucket.everReached[record.to] = (bucket.everReached[record.to] ?? 0) + 1;
      }
      if (record.to === 'CONTACTED' && !contactAge.has(name)) contactAge.set(name, record.age);
      const from = contactAge.get(name);
      if (from !== undefined && MILESTONES.includes(record.to as FactionLifecycleState)) {
        bucket.yearsFromContact[record.to]!.push(record.age - from);
      }
      if (record.addedRoles.includes('TARGETED')) {
        // Counted once per run per faction.
        const key = `${name}:TARGETED`;
        if (!seen.has(key)) {
          seen.add(key);
          bucket.targeted += 1;
        }
      }
    }
    if (contactAge.size > 0 || [...this.content.factions.values()].some((f) => everContacted(state.flags, f))) {
      this.anyContact += 1;
    }

    // News exposure, counted once per faction per run.
    const newsSeen = new Set<string>();
    for (const occurrence of state.history) {
      for (const name of this.newsEventFaction.get(occurrence.eventId) ?? []) {
        if (newsSeen.has(name)) continue;
        newsSeen.add(name);
        this.stats.get(name)!.news += 1;
      }
    }

    if (result.outcome.kind !== 'ended') return;
    this.completed += 1;
    const source = this.endingEventFaction.get(result.outcome.ending.sourceEventId);
    if (!source) return;
    this.factionEndings += 1;
    const bucket = this.stats.get(source.name)!;
    bucket.endings += 1;
    bucket.endingAges.push(result.outcome.ending.endingAge);
    if (source.interaction === 'climax') this.ladder += 1;
    else this.sudden += 1;
    const faction = [...this.content.factions.values()].find((f) => f.shortName === source.name);
    if (faction) {
      const from = contactAge.get(source.name);
      if (from !== undefined) {
        (bucket.yearsFromContact['ENDING'] ??= []).push(result.outcome.ending.endingAge - from);
      }
      // The state at the ending is informative: a faction ending should be
      // COMMITTED, since that is what the climax gates require.
      void factionState(state.flags, faction);
    }
  }

  summary(): FactionSummary {
    const rate = (n: number): number => (this.runs === 0 ? 0 : n / this.runs);
    const byFaction: Record<string, FactionLifecycleStats> = {};
    for (const name of this.names) {
      const bucket = this.stats.get(name)!;
      byFaction[name] = {
        contactRuns: bucket.contact,
        contactRate: rate(bucket.contact),
        everReached: { ...bucket.everReached },
        everReachedRate: Object.fromEntries(
          Object.entries(bucket.everReached).map(([state, count]) => [state, rate(count)]),
        ),
        targetedRuns: bucket.targeted,
        targetedRate: rate(bucket.targeted),
        newsRuns: bucket.news,
        newsRate: rate(bucket.news),
        endingRuns: bucket.endings,
        endingRate: rate(bucket.endings),
        yearsFromContact: Object.fromEntries(
          Object.entries(bucket.yearsFromContact).map(([milestone, values]) => [
            milestone,
            { mean: mean(values), median: median(values), runs: values.length },
          ]),
        ),
      };
    }
    return {
      byFaction,
      anyContactRuns: this.anyContact,
      anyContactRate: rate(this.anyContact),
      factionEndingRuns: this.factionEndings,
      factionEndingShare: this.completed === 0 ? 0 : this.factionEndings / this.completed,
      suddenFactionEndings: this.sudden,
      committedLadderFactionEndings: this.ladder,
      suddenShareOfFactionEndings: this.factionEndings === 0 ? 0 : this.sudden / this.factionEndings,
      committedLadderShareOfFactionEndings:
        this.factionEndings === 0 ? 0 : this.ladder / this.factionEndings,
      meanFactionEndingAge: Object.fromEntries(
        this.names.map((name) => [name, mean(this.stats.get(name)!.endingAges)]),
      ),
      illegalTransitionCount: this.illegalTransitions,
      illegalLifecycleStateCount: this.illegalLifecycleStates,
      personalEventsAfterExitCount: this.personalAfterExit,
      transitionCounts: { ...this.transitionCounts },
    };
  }
}
