import type { ContentBundle } from '../engine/content/load.js';
import { VISIBLE_STATS, type VisibleStat } from '../engine/types.js';
import type { H2aArmTelemetry, StatSnapshot } from './h2aThresholdTelemetry.js';
import type { H2bTelemetry } from './h2bDiagnostic.js';
import { RELOCATION_VARIANTS } from './h2bDiagnostic.js';
import type { MetricsSummary } from './metrics.js';
import type { FactionSummary } from './phase1_3.js';
import { num, pct, table } from './report.js';

/**
 * Markdown renderer for the H2B Batch 008 diagnostic.
 *
 * Reports measurements and compares them against the review *goals* stated in
 * the H2B diagnostic plan. It does not select a profile, does not tune Batch
 * 008 and does not freeze LOW — the written analysis lives in the findings
 * document this file links to.
 */

export interface H2bArm {
  label: string;
  profile: string;
  contentVersion: string;
  runs: number;
  gatesRewritten: number | null;
  appliedThresholds: Record<string, number> | null;
  metrics: MetricsSummary;
  factions: FactionSummary;
  telemetry: H2aArmTelemetry;
  h2b: H2bTelemetry;
}

export interface H2bPayload {
  generatedAt: string;
  contentVersion: string;
  balanceVersion: string;
  matrixVersion: string;
  baseSeed: string;
  sampling: Record<string, string | number>;
  arms: H2bArm[];
}

const BUCKETS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] as const;

function bucketShare(metrics: MetricsSummary, band: string): number | null {
  return metrics.endingAgeShareByTargetBucket.find((b) => b.band === band)?.observedShare ?? null;
}

function snapshot(telemetry: H2aArmTelemetry, label: string): StatSnapshot | undefined {
  return telemetry.statSnapshots.find((s) => s.label === label);
}

function largestBucket(metrics: MetricsSummary): string {
  let best = '—';
  let bestShare = -1;
  for (const band of BUCKETS) {
    const value = bucketShare(metrics, band) ?? 0;
    if (value > bestShare) {
      bestShare = value;
      best = band;
    }
  }
  return best;
}

export function renderH2bReport(content: ContentBundle, payload: H2bPayload): string {
  const out: string[] = [];
  const arms = payload.arms;

  out.push('# SOLID STATE — H2B Batch 008 Diagnostic');
  out.push('');
  out.push('**Measurements only.** Generated from');
  out.push('`docs/validation/SOLID_STATE_H2B_DIAGNOSTIC_PLAN_v0.1.md`.');
  out.push('');
  out.push(
    'LOW is the **provisional diagnostic baseline**, applied through the retained reversible rewrite in ' +
      '`src/sim/experiments.ts`. No canonical FIX gate is written, no profile is frozen, and Batch 008 is not ' +
      'auto-tuned from this run. Written analysis is in ' +
      '[`docs/H2B_BATCH008_FINDINGS.md`](../docs/H2B_BATCH008_FINDINGS.md); decisions stay in ' +
      '[`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md). This file is regenerated on every run.',
  );
  out.push('');
  out.push(
    table(
      ['Field', 'Value'],
      [
        ['Generated at', payload.generatedAt],
        ['Content fingerprint', `\`${payload.contentVersion}\``],
        ['Balance constants', `v${payload.balanceVersion}`],
        ['Experiment matrix (LOW values)', `v${payload.matrixVersion}`],
        ['Base seed', `\`${payload.baseSeed}\``],
        ['Events in corpus', String(content.events.length)],
        ['Endings in registry', String(content.endings.size)],
        ...Object.entries(payload.sampling).map(([key, value]) => [key, `\`${String(value)}\``]),
      ],
    ),
  );
  out.push('');

  // -------------------------------------------------------------------------
  out.push('## 1. Headline balance');
  out.push('');
  out.push('Bucket shares are shares of **completed** runs.');
  out.push('');
  out.push(
    table(
      ['Arm', 'Runs', 'Completion', ...BUCKETS, 'Largest', 'Median ending age'],
      arms.map((arm) => [
        `**${arm.label}**`,
        String(arm.runs),
        pct(arm.metrics.completedRate),
        ...BUCKETS.map((band) => pct(bucketShare(arm.metrics, band))),
        largestBucket(arm.metrics),
        num(arm.metrics.medianEndingAge, 0),
      ]),
    ),
  );
  out.push('');
  out.push(
    table(
      ['Arm', 'Commitment', 'Mean commit age', 'Median commit age', 'Ending coverage', 'Faction endings', 'Material entropy', 'Guardrail failures'],
      arms.map((arm) => [
        `**${arm.label}**`,
        pct(arm.metrics.materialCommitmentRate),
        num(arm.telemetry.commitmentTiming.mean),
        num(arm.telemetry.commitmentTiming.median, 0),
        `${pct(arm.metrics.endingCoverageShare)} (${arm.metrics.distinctEndingsObserved}/${arm.metrics.distinctEndingsInRegistry})`,
        pct(arm.factions.factionEndingShare),
        num(arm.metrics.materialEntropyBitsOverall, 3),
        String(arm.metrics.guardrails.filter((g) => g.severity === 'failure').length),
      ]),
    ),
  );
  out.push('');
  out.push('### Review goals from the plan');
  out.push('');
  out.push('These are **review goals, not hard final targets**. Nothing is selected from them.');
  out.push('');
  const primary = arms[0];
  if (primary) {
    const goals: [string, string, boolean | null][] = [
      ['completion 50–70% under LOW', pct(primary.metrics.completedRate), primary.metrics.completedRate >= 0.5 && primary.metrics.completedRate <= 0.7],
      [
        'mean commitment materially earlier than 35, preferably 28–31',
        num(primary.telemetry.commitmentTiming.mean),
        primary.telemetry.commitmentTiming.mean !== null && primary.telemetry.commitmentTiming.mean < 35,
      ],
      ['25–34 the largest or a clearly major bucket', `${pct(bucketShare(primary.metrics, '25-34'))} (largest: ${largestBucket(primary.metrics)})`, largestBucket(primary.metrics) === '25-34'],
      ['18–24 visibly nontrivial', pct(bucketShare(primary.metrics, '18-24')), (bucketShare(primary.metrics, '18-24') ?? 0) >= 0.05],
      ['35–44 falls substantially from ~48%', pct(bucketShare(primary.metrics, '35-44')), (bucketShare(primary.metrics, '35-44') ?? 1) < 0.4],
      ['65+ low rather than survivor-dominant', pct(bucketShare(primary.metrics, '65+')), (bucketShare(primary.metrics, '65+') ?? 1) < 0.15],
      ['faction endings stay secondary', pct(primary.factions.factionEndingShare), primary.factions.factionEndingShare < 0.35],
    ];
    out.push(
      table(
        ['Review goal (primary arm)', 'Observed', 'Met'],
        goals.map(([goal, observed, met]) => [goal, observed, met === null ? 'n/a' : met ? 'yes' : 'no']),
      ),
    );
  }
  out.push('');

  // -------------------------------------------------------------------------
  out.push('## 2. Correctness counters');
  out.push('');
  out.push('All must be zero in every arm.');
  out.push('');
  out.push(
    table(
      ['Arm', 'Pre-25 coverage', 'Pre-25 fallback', 'Illegal transitions', 'Lifecycle collisions', 'Personal after exit', 'Ending <18', 'Commit <18', 'Two active factions', 'Contact while active'],
      arms.map((arm) => [
        `**${arm.label}**`,
        String(arm.metrics.coverageErrors),
        String(arm.metrics.pre25FallbackYears),
        String(arm.factions.illegalTransitionCount),
        String(arm.factions.illegalLifecycleStateCount),
        String(arm.factions.personalEventsAfterExitCount),
        String(arm.telemetry.earlyOutcomes.endingsBefore18),
        String(arm.telemetry.earlyOutcomes.materialCommitmentsBefore18),
        String(arm.h2b.factions.simultaneousActiveViolations),
        String(arm.h2b.factions.secondContactWhileActiveRuns),
      ]),
    ),
  );
  out.push('');

  // -------------------------------------------------------------------------
  out.push('## 3. Pressure chains — Batch 008 event behaviour');
  out.push('');
  out.push(
    'One row per new event, then one row per authored variant. `Rescue band` follows the Pressure & Tone spec: ' +
      'clean luck 0–2 FIX, costly-but-legitimate 3–6, predatory institutional 10+. The 7–9 gap is unnamed in the ' +
      'spec and is reported separately rather than folded into a neighbour. `P(ending ≤5y)` and ' +
      '`P(commit ≤5y)` are conditional on complete follow-up; censored occurrences are dropped, not counted as ' +
      '"no event".',
  );
  out.push('');
  for (const arm of arms) {
    out.push(`### ${arm.label}`);
    out.push('');
    out.push(
      table(
        ['Rescue band', 'Occurrences'],
        (['clean', 'costly', 'unclassified', 'predatory'] as const).map((band) => [
          band,
          String(arm.h2b.rescueBandTotals[band].occurrences),
        ]),
      ),
    );
    out.push('');
    for (const event of arm.h2b.newEvents) {
      const bands = event.gatingStatBands;
      out.push(
        `**\`${event.eventId}\`** ${event.channel}/${event.family} — run incidence ${pct(event.runIncidence)} ` +
          `(${event.runsSeen} runs, ${event.occurrences} occurrences), mean age ${num(event.meanAge, 1)}` +
          (event.gatingCondition ? `, gated on \`${event.gatingCondition}\`` : ''),
      );
      if (bands) {
        out.push('');
        out.push(
          `Gating-stat band entering the year it fired — critical ${bands['critical'] ?? 0}, ` +
            `vulnerable ${bands['vulnerable'] ?? 0}, ordinary+ ${bands['ordinary_plus'] ?? 0}.`,
        );
      }
      out.push('');
      out.push(
        table(
          ['#', 'When', 'Text', 'Occurrences', 'Mean age', 'FIX', 'Band', 'Δ gate stat', 'P(ending ≤5y)', 'P(commit ≤5y)', 'n'],
          event.variants.map((variant) => [
            String(variant.variantIndex + 1),
            `\`${variant.when}\``,
            variant.textExcerpt.replace(/\|/g, '\\|'),
            String(variant.occurrences),
            num(variant.meanAge, 1),
            variant.fixGained === 0 ? '—' : `+${variant.fixGained}`,
            variant.occurrences === 0 ? '—' : variant.rescueBand,
            num(variant.meanGatingStatDelta, 2),
            variant.observed5 === 0 ? 'n/a' : pct(variant.endingWithin5 / variant.observed5),
            variant.observed5 === 0 ? 'n/a' : pct(variant.commitmentWithin5 / variant.observed5),
            String(variant.observed5),
          ]),
        ),
      );
      out.push('');
    }
  }

  // -------------------------------------------------------------------------
  out.push('## 4. Basic Continuity Insurance (STR) chain');
  out.push('');
  for (const arm of arms) {
    const s = arm.h2b.strInsurance;
    out.push(`### ${arm.label}`);
    out.push('');
    out.push(
      table(
        ['Field', 'Value'],
        [
          ['Functional Continuity Review opened', `${s.reviewRuns} (${pct(s.reviewRate)})`],
          ['Mean review age', num(s.meanReviewAge, 1)],
          ['Two-year decision reached', String(s.decisionRuns)],
          ['Final outcome event reached', String(s.outcomeRuns)],
          ['`END-MED-003 Benefit Approved`', `${s.benefitApprovedRuns} (${pct(s.benefitApprovedRate)} of runs, ${pct(s.benefitApprovedShareOfCompletions)} of completions)`],
          ['Mean / median benefit age', `${num(s.meanBenefitAge, 1)} / ${num(s.medianBenefitAge, 0)}`],
          ['Synthetic share of benefit endings', pct(s.syntheticShareOfBenefitEndings)],
          ['Adult runs ever at STR ≤ −3', String(s.runsEverExtremeLowStr)],
          ['…of which saw a review', `${s.extremeLowStrWithReview} (${pct(s.extremeLowStrCoverage)})`],
          ['Long survivors at STR ≤ −3 with no review', String(s.longSurvivorsExtremeLowStrNoReview)],
        ],
      ),
    );
    out.push('');
    out.push('**Two-year decision split**');
    out.push('');
    out.push(
      table(
        ['Branch', 'Runs', 'Share'],
        s.decisionBranches.map((b) => [b.label, String(b.runs), pct(b.share)]),
      ),
    );
    out.push('');
    out.push('**Final outcome split**');
    out.push('');
    out.push(
      table(
        ['Branch', 'Runs', 'Share'],
        s.outcomeBranches.map((b) => [b.label, String(b.runs), pct(b.share)]),
      ),
    );
    out.push('');
    out.push('**Material at the Benefit Approved ending**');
    out.push('');
    const materials = Object.entries(s.benefitMaterials).sort((a, b) => b[1] - a[1]);
    out.push(
      materials.length === 0
        ? '_None observed._'
        : table(['Material', 'Runs'], materials.map(([m, n]) => [m, String(n)])),
    );
    out.push('');
  }

  // -------------------------------------------------------------------------
  out.push('## 5. Housing and relocation');
  out.push('');
  out.push(
    'Housing is attributed by the canonical `housing` route tag. **Relocation is not a canonical tag**: the ' +
      'registry has no `relocation` entry, so the diagnostic declares an explicit variant list ' +
      `(${RELOCATION_VARIANTS.length} variants across ${new Set(RELOCATION_VARIANTS.map(([id]) => id)).size} events) ` +
      'in `src/sim/h2bDiagnostic.ts`. That list is an analyst classification, not content — a canonical ' +
      '`relocation` metadata tag would replace it and is recommended for a later patch.',
  );
  out.push('');
  out.push(
    table(
      ['Arm', 'Any housing', 'Housing events', 'Mean distinct housing IDs/run', 'Max distinct', 'Relocations', 'Relocation runs', 'Moves as share of housing', 'Runs with 2+ moves'],
      arms.map((arm) => {
        const h = arm.h2b.housing;
        return [
          `**${arm.label}**`,
          `${h.housingRuns} (${pct(h.housingRunIncidence)})`,
          String(h.housingOccurrences),
          num(h.meanUniqueHousingEventIdsPerRun, 2),
          String(h.maxUniqueHousingEventIdsInOneRun),
          String(h.relocationOccurrences),
          `${h.relocationRuns} (${pct(h.relocationRunIncidence)})`,
          pct(h.relocationShareOfHousingEvents),
          String(h.runsWith2PlusRelocations),
        ];
      }),
    ),
  );
  out.push('');
  out.push('**Aggregate authored deltas carried by housing-tagged events**');
  out.push('');
  out.push(
    table(
      ['Arm', ...VISIBLE_STATS, 'FIX', 'Mean FIX per housing event'],
      arms.map((arm) => {
        const h = arm.h2b.housing;
        return [
          `**${arm.label}**`,
          ...VISIBLE_STATS.map((stat: VisibleStat) => String(h.statDeltaTotals[stat])),
          String(h.fixDeltaTotal),
          num(h.meanFixPerHousingEvent, 3),
        ];
      }),
    ),
  );
  out.push('');
  out.push('**Structural-housing route**');
  out.push('');
  out.push(
    table(
      ['Arm', 'Offer taken', 'Structural commitment', 'Pilot lapsed', 'Structural ending', 'Mean ending age', 'Endings'],
      arms.map((arm) => {
        const h = arm.h2b.housing;
        return [
          `**${arm.label}**`,
          `${h.structuralOfferRuns} (${pct(h.structuralOfferRate)})`,
          String(h.structuralCommittedRuns),
          String(h.structuralLapsedRuns),
          `${h.structuralEndingRuns} (${pct(h.structuralEndingRate)})`,
          num(h.meanStructuralEndingAge, 1),
          Object.entries(h.structuralEndings)
            .map(([id, n]) => `${id}×${n}`)
            .join(', ') || '—',
        ];
      }),
    ),
  );
  out.push('');

  // -------------------------------------------------------------------------
  out.push('## 6. Faction exclusivity and chains');
  out.push('');
  out.push(
    'The single-active-faction rule is an invariant: **two simultaneously personally-active factions and a ' +
      'second contact opened before the previous relationship ended are both failures, not balance numbers.** ' +
      'Personalized touchpoints count `contact` / `personal` / `climax` events; news and lore are excluded.',
  );
  out.push('');
  out.push(
    table(
      ['Arm', 'Max simultaneous active', 'Runs with any contact', 'Runs with 2+ factions contacted', 'Second contact after terminal exit'],
      arms.map((arm) => {
        const f = arm.h2b.factions;
        return [
          `**${arm.label}**`,
          String(f.maxSimultaneousActive),
          String(f.runsWithAnyContact),
          `${f.runsWithMultipleFactionsContacted} (${pct(f.multiFactionRate)})`,
          String(f.secondContactAfterTerminalRuns),
        ];
      }),
    ),
  );
  out.push('');
  for (const arm of arms) {
    out.push(`### ${arm.label} — chain shape`);
    out.push('');
    out.push(
      table(
        ['Faction', 'Contact', 'ENGAGED', 'COMMITTED', 'OPTED_OUT', 'CLOSED', 'Endings', 'Touchpoints (mean)', 'Mean gap', 'Exit at first disposition', 'Climax after COMMITTED'],
        arm.telemetry.factionChains.map((row) => [
          row.shortName,
          `${row.contactRuns} (${pct(row.contactRate)})`,
          pct(row.everReachedRate['ENGAGED'] ?? 0),
          pct(row.everReachedRate['COMMITTED'] ?? 0),
          pct(row.everReachedRate['OPTED_OUT'] ?? 0),
          pct(row.everReachedRate['CLOSED'] ?? 0),
          String(row.endingRuns),
          num(row.meanPersonalizedEventsPerContactedRun, 2),
          num(row.meanGapYears, 2),
          pct(row.firstDispositionExitShare),
          pct(row.climaxAfterCommittedShare),
        ]),
      ),
    );
    out.push('');
    out.push('**New intermediate touchpoints and escalation-schedule expiry**');
    out.push('');
    const f = arm.h2b.factions;
    const ids = Object.keys(f.intermediateEventRate).sort();
    out.push(
      ids.length === 0
        ? '_No intermediate touchpoint observed._'
        : table(
            ['Intermediate event', 'Runs', 'Incidence'],
            ids.map((id) => [`\`${id}\``, String(f.intermediateEventRuns[id] ?? 0), pct(f.intermediateEventRate[id] ?? 0)]),
          ),
    );
    out.push('');
    const expired = Object.entries(f.expiredEscalationSchedules).sort((a, b) => b[1] - a[1]);
    out.push(
      expired.length === 0
        ? '_No escalation schedule expired._'
        : table(['Escalation event', 'Expired schedules'], expired.map(([id, n]) => [`\`${id}\``, String(n)])),
    );
    out.push('');
  }

  // -------------------------------------------------------------------------
  out.push('## 7. Age-stratified low-stat risk');
  out.push('');
  out.push(
    `Person-years classified by the stat entering that year and followed ${arms[0]?.h2b.riskHorizonYears ?? 5} years, ` +
      'split by adult life stage so old-age CHR/STR decline cannot invert the reading. Censored person-years are ' +
      'dropped rather than counted as "no event". **Correlation, not causation.**',
  );
  out.push('');
  for (const arm of arms) {
    out.push(`### ${arm.label}`);
    out.push('');
    for (const stage of ['18-24', '25-34', '35-49', '50-64', '65+']) {
      const rows = arm.h2b.ageStratifiedRisk.filter((r) => r.ageBand === stage);
      if (rows.length === 0) continue;
      out.push(`**Ages ${stage}**`);
      out.push('');
      out.push(
        table(
          ['Stat', 'Band', 'Person-years', 'Observed', 'P(ending)', 'Uncommitted n', 'P(commitment)'],
          rows.map((r) => [
            r.stat,
            r.band,
            String(r.personYears),
            String(r.observedPersonYears),
            pct(r.endingProbability),
            String(r.commitmentEligiblePersonYears),
            pct(r.commitmentProbability),
          ]),
        ),
      );
      out.push('');
    }
  }

  // -------------------------------------------------------------------------
  out.push('## 8. Stat ecology');
  out.push('');
  out.push(
    'Snapshots taken **entering** each age, including only runs still active then. `final` mixes a 25-year-old’s ' +
      'final state with a 120-year-old’s and is not comparable to a fixed-age row.',
  );
  out.push('');
  for (const arm of arms) {
    out.push(`### ${arm.label} — mean drift from post-setup start`);
    out.push('');
    out.push(
      table(
        ['Snapshot', 'Active runs', ...VISIBLE_STATS],
        arm.telemetry.statSnapshots.map((snap) => [
          snap.label,
          String(snap.activeRuns),
          ...VISIBLE_STATS.map((stat) => num(snap.byStat[stat].meanDriftFromStart, 2)),
        ]),
      ),
    );
    out.push('');
    out.push(`### ${arm.label} — share ≥15`);
    out.push('');
    out.push(
      table(
        ['Snapshot', 'Active runs', ...VISIBLE_STATS],
        arm.telemetry.statSnapshots.map((snap) => [
          snap.label,
          String(snap.activeRuns),
          ...VISIBLE_STATS.map((stat) => pct(snap.byStat[stat].shareAtLeast15)),
        ]),
      ),
    );
    out.push('');
    out.push(`### ${arm.label} — authored deltas per 1 000 run-years`);
    out.push('');
    const drift = arm.telemetry.statDrift;
    out.push(
      table(
        ['Stat', '+ deltas', '+ magnitude', '− deltas', '− magnitude', 'Final lower', 'Final equal', 'Final higher'],
        VISIBLE_STATS.map((stat) => [
          stat,
          num(drift.positiveDeltaEventsPer1000RunYears[stat], 1),
          num(drift.positiveDeltaMagnitudePer1000RunYears[stat], 1),
          num(drift.negativeDeltaEventsPer1000RunYears[stat], 1),
          num(drift.negativeDeltaMagnitudePer1000RunYears[stat], 1),
          pct(drift.finalVsStart[stat].lowerShare),
          pct(drift.finalVsStart[stat].equalShare),
          pct(drift.finalVsStart[stat].higherShare),
        ]),
      ),
    );
    out.push('');
  }

  // -------------------------------------------------------------------------
  out.push('## 9. Endings and routes');
  out.push('');
  for (const arm of arms) {
    out.push(`### ${arm.label}`);
    out.push('');
    const families = Object.entries(arm.metrics.endingCountsByRouteFamily).sort((a, b) => b[1] - a[1]);
    out.push(
      families.length === 0
        ? '_No endings observed._'
        : table(
            ['Route family', 'Endings', 'Share of completions', 'Median age'],
            families.map(([family, count]) => [
              `\`${family}\``,
              String(count),
              pct(arm.metrics.completed === 0 ? 0 : count / arm.metrics.completed),
              num(arm.metrics.endingAgeByRouteFamily[family]?.median ?? null, 0),
            ]),
          ),
    );
    out.push('');
    const unseen = [...content.endings.keys()].filter((id) => !(id in arm.metrics.endingDistribution)).sort();
    out.push(unseen.length === 0 ? '_All registry endings observed._' : `Unobserved endings: ${unseen.map((id) => `\`${id}\``).join(', ')}.`);
    out.push('');
    out.push('**Guardrail findings**');
    out.push('');
    out.push(
      arm.metrics.guardrails.length === 0
        ? '_None._'
        : table(
            ['Severity', 'ID', 'Finding'],
            arm.metrics.guardrails.map((g) => [g.severity.toUpperCase(), `\`${g.id}\``, g.message]),
          ),
    );
    out.push('');
  }

  return out.join('\n');
}

/** Re-exported so the CLI does not need a second import path for the snapshot type. */
export type { StatSnapshot };
