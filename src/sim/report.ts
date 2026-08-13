import type { ContentBundle } from '../engine/content/load.js';
import { CHANNELS } from '../engine/types.js';
import type { MetricsSummary } from './metrics.js';
import type {
  FactionSeedIncidence,
  ManifestationWindowProbe,
  SpcSplit,
  DiagnosticPlan,
} from './phase1_2.js';
import type { ScenarioReport } from './runner.js';

/**
 * Human-readable Monte Carlo report.
 *
 * Reports measurements. It never proposes balance numbers: exact multipliers
 * stay unfrozen until design reviews this output.
 */

export interface SimulationReport {
  generatedAt: string;
  contentVersion: string;
  balanceVersion: string;
  adaptersVersion: string;
  sourceFiles: { path: string; sha256: string }[];
  scenarios: ScenarioReport[];
}

function pct(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${(value * 100).toFixed(digits)}%`;
}

function num(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return value.toFixed(digits);
}

function table(headers: string[], rows: string[][]): string {
  const lines = [`| ${headers.join(' | ')} |`, `|${headers.map(() => '---').join('|')}|`];
  for (const row of rows) lines.push(`| ${row.join(' | ')} |`);
  return lines.join('\n');
}

function sortedEntries(counts: Record<string, number>): [string, number][] {
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function scenarioSection(content: ContentBundle, report: ScenarioReport): string {
  const m: MetricsSummary = report.metrics;
  const out: string[] = [];

  out.push(`## Scenario \`${report.scenarioLabel}\` — ${report.scenarioId}`);
  out.push('');
  out.push(report.scenarioDescription);
  out.push('');
  out.push(
    table(
      ['Setting', 'Value'],
      [
        ['Runs', String(report.options.runs)],
        ['Base seed', `\`${report.options.baseSeed}\``],
        ['Species sampling', report.options.fixedSpecies ?? (report.options.speciesStratified ? 'stratified equally' : 'seeded uniform')],
        ['Diagnostic max age', String(report.options.maxAge)],
        ['Family weighting', `\`${report.options.familyWeightMode}\``],
      ],
    ),
  );
  out.push('');

  out.push('### Outcome rates');
  out.push('');
  out.push(
    table(
      ['Outcome', 'Runs', 'Share'],
      [
        ['Completed (reached an ending)', String(m.completed), pct(m.completedRate)],
        ['Nonterminal at diagnostic max age', String(m.nonterminal), pct(m.nonterminalRate)],
        ['Pre-25 content coverage defect', String(m.coverageErrors), pct(m.coverageErrorRate)],
      ],
    ),
  );
  out.push('');
  out.push(`Average run length: **${num(m.averageRunLengthYears)} years** across ${m.totalEventYears} simulated event-years.`);
  out.push('');

  out.push('### Ending age');
  out.push('');
  if (m.completed === 0) {
    out.push('_No run reached an ending in this scenario._');
  } else {
    out.push(
      `Average **${num(m.averageEndingAge)}**, median **${num(m.medianEndingAge)}**, ` +
        `p10 **${num(m.endingAgeP10, 0)}**, p90 **${num(m.endingAgeP90, 0)}**.`,
    );
    out.push('');
    out.push(
      table(
        ['Age band', 'Observed share', 'Target range', 'Within target'],
        m.endingAgeShareByTargetBucket.map((bucket) => [
          bucket.band,
          pct(bucket.observedShare),
          `${pct(bucket.targetMin, 0)}–${pct(bucket.targetMax, 0)}`,
          bucket.withinTarget ? 'yes' : 'NO',
        ]),
      ),
    );
  }
  out.push('');

  out.push('### Channel counts by age band');
  out.push('');
  out.push(
    table(
      ['Age band', ...CHANNELS, 'Total'],
      Object.entries(m.channelCountsByAgeBand).map(([band, counts]) => {
        const total = CHANNELS.reduce((sum, channel) => sum + counts[channel], 0);
        return [band, ...CHANNELS.map((channel) => String(counts[channel])), String(total)];
      }),
    ),
  );
  out.push('');

  out.push('### Family counts by age band');
  out.push('');
  out.push('<details><summary>Expand</summary>');
  out.push('');
  for (const [band, counts] of Object.entries(m.familyCountsByAgeBand)) {
    const entries = sortedEntries(counts);
    if (entries.length === 0) continue;
    out.push(`**${band}** — ${entries.map(([family, count]) => `${family} ${count}`).join(', ')}`);
    out.push('');
  }
  out.push('</details>');
  out.push('');

  out.push('### Fallback and coverage');
  out.push('');
  out.push(
    table(
      ['Metric', 'Value'],
      [
        ['Fallback event-years', String(m.fallbackYears)],
        ['Fallback share of all event-years', pct(m.fallbackUseRate)],
        ['Fallback share of age-25+ event-years', pct(m.fallbackShareAge25Plus)],
        ['Target age-25+ fallback share', pct(content.balance.fallbackGuardrails.targetFallbackShareAge25Plus, 0)],
        ['Pre-25 fallback events (must be 0)', String(m.pre25FallbackYears)],
        ['Pre-25 coverage-defect runs', `${m.coverageErrors} (${pct(m.pre25CoverageDefectRate)})`],
        ['SPC channel share of event-years', pct(m.spcShare, 2)],
        ['Runs using a mandatory_only event', pct(m.mandatoryUsageRate)],
        ['Endings at age 65+', pct(m.endingShare65Plus)],
      ],
    ),
  );
  out.push('');

  out.push('### Routes, schedules and priority');
  out.push('');
  out.push(
    table(
      ['Metric', 'Value'],
      [
        ['Route entry rate (run entered >=1 route)', pct(m.routeEntryRate)],
        ['Route climax rate (run fired a climax schedule)', pct(m.routeClimaxRate)],
        ['Route abandonment/expiry rate (run had >=1 expired schedule)', pct(m.routeAbandonmentRate)],
        ['Expired schedules total', String(m.expiredScheduleCount)],
        ['Priority collision rate (run had >=1 contested year)', pct(m.priorityCollisionRate)],
        ['Contested years total', String(m.priorityCollisionYears)],
        ['Schedule displacements per run', num(m.scheduleDisplacementPerRun, 2)],
      ],
    ),
  );
  out.push('');
  const routeEntries = sortedEntries(m.routeEntryCountsByRoute).slice(0, 20);
  if (routeEntries.length > 0) {
    out.push('Most-entered route flags:');
    out.push('');
    out.push(table(['Route flag', 'Runs'], routeEntries.map(([flag, count]) => [`\`${flag}\``, String(count)])));
    out.push('');
  }

  out.push('### Material');
  out.push('');
  out.push(`Material Commitment rate: **${pct(m.materialCommitmentRate)}**. Final-material entropy: **${num(m.materialEntropyBitsOverall, 2)} bits**.`);
  out.push('');
  out.push(
    table(
      ['Final material', 'Runs', 'Share'],
      sortedEntries(m.finalMaterialDistribution).map(([material, count]) => [
        material,
        String(count),
        pct(m.runs === 0 ? 0 : count / m.runs),
      ]),
    ),
  );
  out.push('');
  out.push('Final material by species:');
  out.push('');
  const materialKeys = [...new Set(Object.values(m.finalMaterialBySpecies).flatMap((c) => Object.keys(c)))].sort();
  out.push(
    table(
      ['Species', ...materialKeys, 'Entropy (bits)'],
      Object.entries(m.finalMaterialBySpecies).map(([species, counts]) => [
        species,
        ...materialKeys.map((material) => String(counts[material] ?? 0)),
        num(m.materialEntropyBitsBySpecies[species], 2),
      ]),
    ),
  );
  out.push('');
  out.push(
    table(
      ['Determinism check', 'Runs with evidence', 'Same final material', 'P', 'Guardrail'],
      [
        ...Object.entries(m.pFinalGivenHint).map(([family, stats]) => [
          `P(final ${family} | hint ${family})`,
          String(stats.hintRuns),
          String(stats.sameMaterial),
          pct(stats.probability),
          `<= ${pct(content.balance.materialDeterminismGuardrails.maxSameMaterialShareGivenOnlyMatchingHint, 0)}`,
        ]),
        ...Object.entries(m.pFinalGivenFirstManifestation).map(([family, stats]) => [
          `P(final ${family} | first manifestation ${family})`,
          String(stats.manifestationRuns),
          String(stats.sameMaterial),
          pct(stats.probability),
          `<= ${pct(content.balance.materialDeterminismGuardrails.maxSameMaterialShareGivenFirstManifestation, 0)}`,
        ]),
      ],
    ),
  );
  out.push('');
  out.push('First manifestation family distribution (Q-22):');
  out.push('');
  out.push(
    table(
      ['Family', 'Runs', 'Share of runs with a manifestation', 'Mean age', 'Median age'],
      sortedEntries(m.firstManifestationFamilyCounts).map(([family, count]) => [
        family,
        String(count),
        pct(m.firstManifestationFamilyShare[family]),
        num(m.firstManifestationAgeByFamily[family]?.mean, 1),
        num(m.firstManifestationAgeByFamily[family]?.median, 1),
      ]),
    ),
  );
  out.push('');
  out.push(`Runs with no manifestation at all: **${pct(m.noManifestationRate)}**.`);
  out.push('');
  out.push(
    table(
      ['Material timing', 'Value'],
      [
        ['Average first-hint age', num(m.averageHintAge)],
        ['Average first-manifestation age', num(m.averageFirstManifestationAge)],
        ['Average commitment age', num(m.averageCommitmentAge)],
        ['Multiple manifestations before commitment', pct(m.multipleManifestationBeforeCommitmentRate)],
      ],
    ),
  );
  out.push('');

  out.push('### Talents');
  out.push('');
  const talentRows = Object.entries(m.talentActivationRate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([talentId, activationRate]) => {
      const talent = content.talents.get(talentId);
      return [
        talentId,
        talent?.name_en ?? '',
        talent?.trigger_type ?? '',
        pct(activationRate),
        num(m.talentActivationAverageAge[talentId], 1),
      ];
    });
  out.push(table(['Talent', 'Name', 'Trigger', 'Activation rate', 'Average activation age'], talentRows));
  out.push('');

  out.push('### Endings');
  out.push('');
  out.push(
    `Distinct endings observed: **${m.distinctEndingsObserved}/${m.distinctEndingsInRegistry}** (${pct(m.endingCoverageShare)} of the registry). ` +
      `Rare/hidden share of completed runs: **${pct(m.rareEndingRate)}**; hidden-only: **${pct(m.hiddenEndingRate)}**.`,
  );
  out.push('');
  if (m.completed > 0) {
    out.push(
      table(
        ['Ending', 'Title', 'Runs', 'Share of completed'],
        sortedEntries(m.endingDistribution).map(([endingId, count]) => [
          `\`${endingId}\``,
          content.endings.get(endingId)?.title_en ?? '',
          String(count),
          pct(count / m.completed),
        ]),
      ),
    );
    out.push('');
  }

  out.push('### Final stats');
  out.push('');
  out.push(
    table(
      ['Stat', 'Mean at run end'],
      Object.entries(m.finalStatMeans).map(([stat, value]) => [stat, num(value, 2)]),
    ),
  );
  out.push('');
  out.push(
    `FIX distribution at run end — p50 **${num(m.finalFixPercentiles.p50, 0)}**, p90 **${num(m.finalFixPercentiles.p90, 0)}**, ` +
      `p99 **${num(m.finalFixPercentiles.p99, 0)}**, max **${num(m.finalFixPercentiles.max, 0)}**.`,
  );
  out.push('');

  out.push('### Guardrail findings');
  out.push('');
  if (m.guardrails.length === 0) {
    out.push('_No guardrail findings._');
  } else {
    out.push(
      table(
        ['Severity', 'ID', 'Finding'],
        m.guardrails.map((finding) => [finding.severity.toUpperCase(), `\`${finding.id}\``, finding.message]),
      ),
    );
  }
  out.push('');

  return out.join('\n');
}

export function renderMarkdownReport(content: ContentBundle, report: SimulationReport): string {
  const out: string[] = [];
  out.push('# SOLID STATE — Phase-1 Monte Carlo Report');
  out.push('');
  out.push('Generated by the headless simulation engine. **Measurements only.**');
  out.push('Provisional balance constants are simulation inputs, not frozen design.');
  out.push('');
  out.push(
    'Decisions arising from this report are tracked in [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md); ' +
      'narrative analysis is in [`docs/PHASE1_FINDINGS.md`](../docs/PHASE1_FINDINGS.md). ' +
      'Resolve questions there, not in this generated file — it is overwritten on every run.',
  );
  out.push('');
  out.push(
    table(
      ['Field', 'Value'],
      [
        ['Generated at', report.generatedAt],
        ['Content fingerprint', `\`${report.contentVersion}\``],
        ['Balance constants version', report.balanceVersion],
        ['Balance adapters version', report.adaptersVersion],
        ['Scenarios', String(report.scenarios.length)],
      ],
    ),
  );
  out.push('');

  out.push('## Cross-scenario summary');
  out.push('');
  out.push(
    table(
      ['Scenario', 'Runs', 'Completed', 'Nonterminal', 'Coverage defect', 'Avg run length', 'Median ending age', 'Fallback share'],
      report.scenarios.map((scenario) => [
        `\`${scenario.scenarioLabel}\``,
        String(scenario.metrics.runs),
        pct(scenario.metrics.completedRate),
        pct(scenario.metrics.nonterminalRate),
        pct(scenario.metrics.coverageErrorRate),
        num(scenario.metrics.averageRunLengthYears),
        num(scenario.metrics.medianEndingAge),
        pct(scenario.metrics.fallbackUseRate),
      ]),
    ),
  );
  out.push('');

  const failures = report.scenarios.flatMap((scenario) =>
    scenario.metrics.guardrails
      .filter((finding) => finding.severity === 'failure')
      .map((finding) => `- \`${scenario.scenarioLabel}\` — **${finding.id}**: ${finding.message}`),
  );
  if (failures.length > 0) {
    out.push('### Guardrail failures across scenarios');
    out.push('');
    out.push(...failures);
    out.push('');
  }

  out.push('## Content snapshot');
  out.push('');
  out.push(
    table(
      ['File', 'SHA-256'],
      report.sourceFiles.map((file) => [`\`${file.path}\``, `\`${file.sha256.slice(0, 16)}…\``]),
    ),
  );
  out.push('');

  for (const scenario of report.scenarios) {
    out.push(scenarioSection(content, scenario));
  }

  out.push('---');
  out.push('');
  out.push(
    'Per `SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md` section Q, Phase 1 stops here. ' +
      'Do not tune creative content or proceed into UI implementation without design review of this report.',
  );
  out.push('');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Phase 1.1 experiment report
// ---------------------------------------------------------------------------

export interface ExperimentArm {
  label: string;
  settings: Record<string, string>;
  metrics: MetricsSummary;
}

export interface ExperimentReport {
  name: string;
  description: string;
  arms: ExperimentArm[];
}

export interface ExperimentPayload {
  generatedAt: string;
  contentVersion: string;
  balanceVersion: string;
  matrixVersion: string;
  runsPerArm: number;
  baseSeed: string;
  experiments: ExperimentReport[];
}

/**
 * Renders the experiment-matrix comparison.
 *
 * Deliberately presents arms side by side without ranking them: the Phase 1.1
 * instructions forbid selecting a winning threshold profile or switching the
 * family-weighting baseline automatically.
 */
export function renderExperimentReport(content: ContentBundle, payload: ExperimentPayload): string {
  const out: string[] = [];
  out.push('# SOLID STATE — Phase 1.1 Experiment Matrix Results');
  out.push('');
  out.push('**Measurements only.** No threshold profile is selected, no baseline is switched,');
  out.push('and no creative content was tuned to produce these numbers.');
  out.push('');
  out.push(
    table(
      ['Field', 'Value'],
      [
        ['Generated at', payload.generatedAt],
        ['Content fingerprint', `\`${payload.contentVersion.slice(0, 32)}…\``],
        ['Balance constants', `v${payload.balanceVersion}`],
        ['Experiment matrix', `v${payload.matrixVersion}`],
        ['Runs per arm', String(payload.runsPerArm)],
        ['Base seed', `\`${payload.baseSeed}\``],
      ],
    ),
  );
  out.push('');

  for (const experiment of payload.experiments) {
    out.push(`## ${experiment.name}`);
    out.push('');
    out.push(experiment.description);
    out.push('');

    const settingKeys = [...new Set(experiment.arms.flatMap((a) => Object.keys(a.settings)))];
    out.push(
      table(
        ['Arm', ...settingKeys],
        experiment.arms.map((arm) => [arm.label, ...settingKeys.map((k) => arm.settings[k] ?? '—')]),
      ),
    );
    out.push('');

    out.push(
      table(
        [
          'Arm',
          'Completed',
          'Nonterminal',
          'Coverage defect',
          'Committed',
          'Commit age',
          'Median end age',
          '65+ endings',
          'Fallback 25+',
          'Route climax',
          'Endings seen',
        ],
        experiment.arms.map((arm) => {
          const m = arm.metrics;
          return [
            arm.label,
            pct(m.completedRate),
            pct(m.nonterminalRate),
            pct(m.coverageErrorRate),
            pct(m.materialCommitmentRate),
            num(m.averageCommitmentAge),
            num(m.medianEndingAge),
            pct(m.endingShare65Plus),
            pct(m.fallbackShareAge25Plus),
            pct(m.routeClimaxRate),
            `${m.distinctEndingsObserved}/${m.distinctEndingsInRegistry}`,
          ];
        }),
      ),
    );
    out.push('');

    out.push('Ending-age bands against target:');
    out.push('');
    const bandLabels = experiment.arms[0]!.metrics.endingAgeShareByTargetBucket.map((b) => b.band);
    out.push(
      table(
        ['Arm', ...bandLabels],
        experiment.arms.map((arm) => [
          arm.label,
          ...arm.metrics.endingAgeShareByTargetBucket.map(
            (b) => `${pct(b.observedShare)}${b.withinTarget ? ' ✓' : ''}`,
          ),
        ]),
      ),
    );
    out.push('');
    out.push(
      `Targets: ${experiment.arms[0]!.metrics.endingAgeShareByTargetBucket
        .map((b) => `${b.band} ${pct(b.targetMin, 0)}–${pct(b.targetMax, 0)}`)
        .join(' · ')}`,
    );
    out.push('');

    out.push('Final FIX distribution:');
    out.push('');
    out.push(
      table(
        ['Arm', 'p50', 'p90', 'p99', 'max'],
        experiment.arms.map((arm) => [
          arm.label,
          num(arm.metrics.finalFixPercentiles.p50, 0),
          num(arm.metrics.finalFixPercentiles.p90, 0),
          num(arm.metrics.finalFixPercentiles.p99, 0),
          num(arm.metrics.finalFixPercentiles.max, 0),
        ]),
      ),
    );
    out.push('');

    if (experiment.name === 'family_weight_ab') {
      out.push('Family distribution by channel (age 25–34 band):');
      out.push('');
      for (const arm of experiment.arms) {
        const counts = arm.metrics.familyCountsByAgeBand['25-34'] ?? {};
        out.push(`**${arm.label}** — ${sortedEntries(counts).map(([f, c]) => `${f} ${c}`).join(', ')}`);
        out.push('');
      }
      out.push('Material distribution and entropy:');
      out.push('');
      out.push(
        table(
          ['Arm', 'Entropy (bits)', 'Committed', 'Top materials'],
          experiment.arms.map((arm) => [
            arm.label,
            num(arm.metrics.materialEntropyBitsOverall, 2),
            pct(arm.metrics.materialCommitmentRate),
            sortedEntries(arm.metrics.finalMaterialDistribution)
              .filter(([mat]) => mat !== 'NONE')
              .slice(0, 5)
              .map(([mat, c]) => `${mat} ${c}`)
              .join(', '),
          ]),
        ),
      );
      out.push('');
    }

    if (experiment.name === 'allocation_policy_compare') {
      out.push('Threshold-talent activation by allocation policy:');
      out.push('');
      const thresholdTalents = [...content.talents.values()]
        .filter((t) => t.trigger_type === 'threshold_once')
        .map((t) => t.id)
        .sort();
      out.push(
        table(
          ['Arm', ...thresholdTalents.map((id) => `${id} rate / age`)],
          experiment.arms.map((arm) => [
            arm.label,
            ...thresholdTalents.map((id) => {
              const rate = arm.metrics.talentActivationRate[id];
              const age = arm.metrics.talentActivationAverageAge[id];
              return rate === undefined ? '—' : `${pct(rate, 0)} / ${num(age, 1)}`;
            }),
          ]),
        ),
      );
      out.push('');
    }

    if (experiment.name === 'first_manifestation') {
      for (const arm of experiment.arms) {
        out.push(
          table(
            ['Family', 'Runs', 'Share', 'Mean age', 'Median age'],
            sortedEntries(arm.metrics.firstManifestationFamilyCounts).map(([family, count]) => [
              family,
              String(count),
              pct(arm.metrics.firstManifestationFamilyShare[family]),
              num(arm.metrics.firstManifestationAgeByFamily[family]?.mean, 1),
              num(arm.metrics.firstManifestationAgeByFamily[family]?.median, 1),
            ]),
          ),
        );
        out.push('');
        out.push(`Runs with no manifestation: **${pct(arm.metrics.noManifestationRate)}**.`);
        out.push('');
      }
    }

    const findings = experiment.arms.flatMap((arm) =>
      arm.metrics.guardrails.map((f) => `- \`${arm.label}\` — **${f.severity}** ${f.id}: ${f.message}`),
    );
    if (findings.length > 0) {
      out.push('Guardrail findings:');
      out.push('');
      out.push(...findings);
      out.push('');
    }
  }

  out.push('---');
  out.push('');
  out.push('Per the Phase 1.1 instructions, H2 remains CLOSED and no profile is frozen here.');
  out.push('');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Phase 1.2 compact diagnostic report
// ---------------------------------------------------------------------------

export interface Phase12Arm {
  name: string;
  talents: string[];
  metrics: MetricsSummary;
  spc: SpcSplit;
  factionSeeds: FactionSeedIncidence;
}

export interface Phase12Payload {
  generatedAt: string;
  contentVersion: string;
  balanceVersion: string;
  planVersion: string;
  planStatus: string;
  planPurpose: string;
  baseSeed: string;
  baseline: {
    settings: DiagnosticPlan['baseline'];
    metrics: MetricsSummary;
    spc: SpcSplit;
    factionSeeds: FactionSeedIncidence;
  };
  t1023Arms: Phase12Arm[];
  neutralHuman: {
    runs: number;
    species: string;
    allocationPolicy: string;
    metrics: MetricsSummary;
    probe: ManifestationWindowProbe;
  };
  requiredBaselineMetrics: string[];
  explicitlySkippedThisPatch: string[];
  retentionPolicy: DiagnosticPlan['retentionPolicy'];
  stopCondition: string;
}

function factionSection(content: ContentBundle, metrics: MetricsSummary, seeds: FactionSeedIncidence): string[] {
  const out: string[] = [];
  const factions = [...content.factions.values()].sort((a, b) => a.shortName.localeCompare(b.shortName));
  out.push(
    table(
      ['Faction', 'Route tag', 'Entry age min', 'Contact rate', 'Mean first-contact age', 'Climax rate', 'Endings'],
      factions.map((faction) => [
        faction.name_en,
        `\`${faction.routeTag}\``,
        String(faction.entryAgeMin),
        pct(metrics.factionContactRate[faction.shortName]),
        num(seeds.meanFirstContactAgeByFaction[faction.shortName], 1),
        pct(metrics.factionClimaxRate[faction.shortName]),
        String(metrics.endingCountsByFaction[faction.shortName] ?? 0),
      ]),
    ),
  );
  out.push('');
  out.push(
    `Runs with at least one faction contact: **${pct(seeds.anyContactRate)}**` +
      ` (mean age at first contact **${num(seeds.meanFirstContactAge, 1)}**).` +
      ' `CONTACT` records that a life crossed a faction\'s path; it is not membership.',
  );
  out.push('');
  return out;
}

function endingBucketTable(metrics: MetricsSummary): string {
  return table(
    ['Age band', 'Observed share', 'Target range', 'Within target'],
    metrics.endingAgeShareByTargetBucket.map((bucket) => [
      bucket.band,
      pct(bucket.observedShare),
      `${pct(bucket.targetMin, 0)}–${pct(bucket.targetMax, 0)}`,
      bucket.withinTarget ? 'yes' : 'NO',
    ]),
  );
}

/**
 * Renders the Phase 1.2 compact diagnostic.
 *
 * Presents the baseline and the two targeted arms as measurements. No threshold
 * profile is chosen, no baseline is switched, and nothing here proposes content.
 */
export function renderPhase12Report(content: ContentBundle, payload: Phase12Payload): string {
  const out: string[] = [];
  const m = payload.baseline.metrics;

  out.push('# SOLID STATE — Phase 1.2 Compact Diagnostic');
  out.push('');
  out.push('**Measurements only.** Generated by the headless engine from');
  out.push('`content/balance/SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json`.');
  out.push('');
  out.push(payload.planPurpose);
  out.push('');
  out.push(
    'Narrative analysis lives in [`docs/PHASE1_2_FINDINGS.md`](../docs/PHASE1_2_FINDINGS.md) and decisions in ' +
      '[`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md). This file is regenerated on every run — do not ' +
      'record decisions here.',
  );
  out.push('');
  out.push(
    table(
      ['Field', 'Value'],
      [
        ['Generated at', payload.generatedAt],
        ['Content fingerprint', `\`${payload.contentVersion.slice(0, 32)}…\``],
        ['Balance constants', `v${payload.balanceVersion}`],
        ['Diagnostic plan', `v${payload.planVersion} (${payload.planStatus})`],
        ['Base seed', `\`${payload.baseSeed}\``],
      ],
    ),
  );
  out.push('');
  out.push('Deliberately **not** run in this patch (harness retained, not retired):');
  out.push('');
  for (const skipped of payload.explicitlySkippedThisPatch) out.push(`- ${skipped}`);
  out.push('');
  out.push(`Re-run the retained Phase 1.1 matrix when: ${payload.retentionPolicy.rerunWhen.join('; ')}.`);
  out.push('');

  // --- Baseline --------------------------------------------------------------
  out.push('## 1. Baseline');
  out.push('');
  out.push(
    table(
      ['Setting', 'Value'],
      [
        ['Runs', String(payload.baseline.settings.runs)],
        ['Species sampling', payload.baseline.settings.speciesMode],
        ['Talent scenario', payload.baseline.settings.talentScenario],
        ['Allocation policy', payload.baseline.settings.allocationPolicy],
        ['Family weighting', `\`${payload.baseline.settings.familyWeightMode}\``],
        ['FIX thresholds', payload.baseline.settings.thresholdMode],
        ['Pre-25 coverage policy', payload.baseline.settings.pre25CoveragePolicy],
      ],
    ),
  );
  out.push('');

  out.push('### Completion');
  out.push('');
  out.push(
    table(
      ['Outcome', 'Runs', 'Share'],
      [
        ['Completed (reached an ending)', String(m.completed), pct(m.completedRate)],
        ['Nonterminal at diagnostic max age', String(m.nonterminal), pct(m.nonterminalRate)],
        ['Pre-25 content coverage defect', String(m.coverageErrors), pct(m.coverageErrorRate)],
      ],
    ),
  );
  out.push('');
  out.push(
    `Average run length **${num(m.averageRunLengthYears)} years**; median ending age **${num(m.medianEndingAge)}** ` +
      `(mean ${num(m.averageEndingAge)}, p10 ${num(m.endingAgeP10, 0)}, p90 ${num(m.endingAgeP90, 0)}). ` +
      `Endings at 65+: **${pct(m.endingShare65Plus)}**.`,
  );
  out.push('');

  out.push('### Ending age buckets');
  out.push('');
  out.push(endingBucketTable(m));
  out.push('');
  const early = m.endingAgeShareByTargetBucket.filter((b) => b.band === '18-24' || b.band === '25-34');
  if (early.length > 0) {
    out.push(
      'The Phase 1.1 blocking finding was concentrated in these two bands: ' +
        early.map((b) => `**${b.band} ${pct(b.observedShare)}** (target ${pct(b.targetMin, 0)}–${pct(b.targetMax, 0)})`).join(', ') +
        '.',
    );
    out.push('');
  }

  out.push('### FIX economy');
  out.push('');
  out.push(
    table(
      ['Metric', 'Value'],
      [
        ['Mean FIX at Material Commitment', num(m.meanFixAtCommitment, 2)],
        ['Mean FIX at ending', num(m.meanFixAtEnding, 2)],
        ['Final FIX p50 / p90 / p99 / max', `${num(m.finalFixPercentiles.p50, 0)} / ${num(m.finalFixPercentiles.p90, 0)} / ${num(m.finalFixPercentiles.p99, 0)} / ${num(m.finalFixPercentiles.max, 0)}`],
        ['Material Commitment rate', pct(m.materialCommitmentRate)],
        ['Average commitment age', num(m.averageCommitmentAge)],
      ],
    ),
  );
  out.push('');

  out.push('### Factions');
  out.push('');
  out.push(...factionSection(content, m, payload.baseline.factionSeeds));

  out.push('### Endings by route family');
  out.push('');
  out.push(
    table(
      ['Route family', 'Endings', 'Share of completed', 'Mean ending age', 'Median ending age'],
      sortedEntries(m.endingCountsByRouteFamily).map(([family, count]) => [
        `\`${family}\``,
        String(count),
        pct(m.completed === 0 ? 0 : count / m.completed),
        num(m.endingAgeByRouteFamily[family]?.mean, 1),
        num(m.endingAgeByRouteFamily[family]?.median, 1),
      ]),
    ),
  );
  out.push('');
  out.push(
    `Distinct endings observed: **${m.distinctEndingsObserved}/${m.distinctEndingsInRegistry}** ` +
      `(${pct(m.endingCoverageShare)} of the registry). Rare/hidden share: **${pct(m.rareEndingRate)}**.`,
  );
  out.push('');
  if (m.completed > 0) {
    out.push('<details><summary>Full ending distribution</summary>');
    out.push('');
    out.push(
      table(
        ['Ending', 'Title', 'Runs', 'Share of completed'],
        sortedEntries(m.endingDistribution).map(([endingId, count]) => [
          `\`${endingId}\``,
          content.endings.get(endingId)?.title_en ?? '',
          String(count),
          pct(count / m.completed),
        ]),
      ),
    );
    out.push('');
    out.push('</details>');
    out.push('');
  }

  out.push('### Fallback share by age band, conditional on the run still being active');
  out.push('');
  out.push(
    table(
      ['Age band', 'Active event-years', 'Fallback years', 'Share of active years'],
      Object.entries(m.fallbackShareByAgeBandActive).map(([band, counts]) => [
        band,
        String(counts.activeYears),
        String(counts.fallbackYears),
        pct(counts.share),
      ]),
    ),
  );
  out.push('');
  out.push(
    `Unconditional age-25+ fallback share **${pct(m.fallbackShareAge25Plus)}** against a target of ` +
      `${pct(content.balance.fallbackGuardrails.targetFallbackShareAge25Plus, 0)}. ` +
      `Pre-25 fallback events (must be 0): **${m.pre25FallbackYears}**.`,
  );
  out.push('');

  out.push('### Schedules and mandatory routes by route family');
  out.push('');
  out.push(
    table(
      ['Route family', 'Expired schedules', 'Runs with a mandatory event in this family'],
      [
        ...new Set([
          ...Object.keys(m.scheduleExpiryByRouteFamily),
          ...Object.keys(m.mandatoryIncidenceByRouteFamily),
        ]),
      ]
        .sort()
        .map((family) => [
          `\`${family}\``,
          String(m.scheduleExpiryByRouteFamily[family] ?? 0),
          String(m.mandatoryIncidenceByRouteFamily[family] ?? 0),
        ]),
    ),
  );
  out.push('');
  out.push(
    `Route entry rate **${pct(m.routeEntryRate)}**, route climax rate **${pct(m.routeClimaxRate)}**, ` +
      `abandonment/expiry rate **${pct(m.routeAbandonmentRate)}** (${m.expiredScheduleCount} expired schedules total). ` +
      `SPC share of event-years **${pct(m.spcShare, 2)}**; runs using a mandatory_only event **${pct(m.mandatoryUsageRate)}**.`,
  );
  out.push('');

  out.push('### Baseline guardrail findings');
  out.push('');
  if (m.guardrails.length === 0) {
    out.push('_No guardrail findings._');
  } else {
    out.push(
      table(
        ['Severity', 'ID', 'Finding'],
        m.guardrails.map((finding) => [finding.severity.toUpperCase(), `\`${finding.id}\``, finding.message]),
      ),
    );
  }
  out.push('');

  // --- Targeted A ------------------------------------------------------------
  out.push('## 2. T1023 SPC comparison');
  out.push('');
  out.push(
    'Two fixed talent arms from the plan. The arms differ only in whether T1023 replaces T1004, so the ' +
      'SPC delta is attributable to that talent rather than to allocation or species sampling.',
  );
  out.push('');
  out.push(
    table(
      ['Arm', 'Talents', 'Runs'],
      payload.t1023Arms.map((arm) => [arm.name, arm.talents.map((t) => `\`${t}\``).join(', '), String(arm.metrics.runs)]),
    ),
  );
  out.push('');
  out.push(
    table(
      ['Arm', 'SPC share of event-years', 'Runs with any SPC', 'SPC per completed run', 'SPC per non-completed run'],
      payload.t1023Arms.map((arm) => [
        arm.name,
        pct(arm.metrics.spcShare, 2),
        pct(arm.spc.anySpcRate),
        num(arm.spc.spcPerCompletedRun, 2),
        num(arm.spc.spcPerNoncompletedRun, 2),
      ]),
    ),
  );
  out.push('');
  out.push('Faction seed incidence:');
  out.push('');
  const factionNames = [...content.factions.values()].map((f) => f.shortName).sort();
  out.push(
    table(
      ['Arm', 'Any contact', ...factionNames],
      payload.t1023Arms.map((arm) => [
        arm.name,
        pct(arm.factionSeeds.anyContactRate),
        ...factionNames.map((name) => pct(arm.metrics.factionContactRate[name])),
      ]),
    ),
  );
  out.push('');
  out.push('Ending-age buckets by arm:');
  out.push('');
  const armBands = payload.t1023Arms[0]?.metrics.endingAgeShareByTargetBucket.map((b) => b.band) ?? [];
  out.push(
    table(
      ['Arm', 'Completed', 'Median end age', ...armBands],
      payload.t1023Arms.map((arm) => [
        arm.name,
        pct(arm.metrics.completedRate),
        num(arm.metrics.medianEndingAge),
        ...arm.metrics.endingAgeShareByTargetBucket.map((b) => `${pct(b.observedShare)}${b.withinTarget ? ' ✓' : ''}`),
      ]),
    ),
  );
  out.push('');

  // --- Targeted B ------------------------------------------------------------
  const probe = payload.neutralHuman.probe;
  out.push('## 3. Neutral-Human manifestation window (ages 18–20)');
  out.push('');
  out.push(
    `${payload.neutralHuman.runs} runs, species ${payload.neutralHuman.species}, no talents, ` +
      `${payload.neutralHuman.allocationPolicy} allocation. HUMAN carries no family tendency and no refinement ` +
      'hook, so any skew here is a property of what the content offers, not of species evidence.',
  );
  out.push('');
  out.push(
    `Observations (run-years in the window with \`MAT=NONE\` at draft time): **${probe.observations}** ` +
      `(${probe.ages.map((age) => `age ${age}: ${probe.observationsByAge[String(age)] ?? 0}`).join(', ')}).`,
  );
  out.push('');
  out.push('P(manifestation family | age 18–20, MAT=NONE, no matching prior evidence):');
  out.push('');
  if (probe.unpromptedTotal === 0) {
    out.push('_No unprompted manifestation occurred anywhere in the window._');
  } else {
    out.push(
      table(
        ['Family', 'Unprompted manifestations', 'P per window-year', 'Share of unprompted'],
        sortedEntries(probe.unpromptedByFamily).map(([family, count]) => [
          family,
          String(count),
          pct(probe.unpromptedProbabilityByFamily[family], 2),
          pct(count / probe.unpromptedTotal),
        ]),
      ),
    );
  }
  out.push('');
  out.push(
    `Any unprompted manifestation in a window year: **${pct(probe.unpromptedProbability, 2)}**. ` +
      `Manifestations that followed matching evidence (excluded from the conditional above): **${probe.promptedTotal}**.`,
  );
  out.push('');
  out.push('Eligible draft pool at each window age:');
  out.push('');
  out.push(
    table(
      ['Age', 'Mean eligible events', 'Mean distinct families', 'Min', 'Max', ...CHANNELS.map((c) => `${c} families`)],
      probe.ages.map((age) => {
        const key = String(age);
        const families = probe.eligibleFamiliesByAge[key];
        const perChannel = probe.eligibleFamiliesByAgeChannel[key];
        return [
          String(age),
          num(probe.eligibleEventsByAge[key], 1),
          num(families?.mean, 2),
          String(families?.min ?? 0),
          String(families?.max ?? 0),
          ...CHANNELS.map((channel) => num(perChannel?.[channel], 2)),
        ];
      }),
    ),
  );
  out.push('');
  out.push('<details><summary>How often each channel/family was eligible in the window</summary>');
  out.push('');
  out.push(
    table(
      ['Channel/family', 'Window-years eligible', 'Share of observations'],
      sortedEntries(probe.familyEligibilityCounts).map(([family, count]) => [
        `\`${family}\``,
        String(count),
        pct(probe.observations === 0 ? 0 : count / probe.observations),
      ]),
    ),
  );
  out.push('');
  out.push('</details>');
  out.push('');
  out.push('Mean first-manifestation age by family, across the whole neutral-Human run (not just the window):');
  out.push('');
  out.push(
    table(
      ['Family', 'Runs', 'Share of runs with a manifestation', 'Mean age', 'Median age'],
      sortedEntries(payload.neutralHuman.metrics.firstManifestationFamilyCounts).map(([family, count]) => [
        family,
        String(count),
        pct(payload.neutralHuman.metrics.firstManifestationFamilyShare[family]),
        num(payload.neutralHuman.metrics.firstManifestationAgeByFamily[family]?.mean, 1),
        num(payload.neutralHuman.metrics.firstManifestationAgeByFamily[family]?.median, 1),
      ]),
    ),
  );
  out.push('');
  out.push(`Runs with no manifestation at all: **${pct(payload.neutralHuman.metrics.noManifestationRate)}**.`);
  out.push('');

  out.push('---');
  out.push('');
  out.push(payload.stopCondition);
  out.push('');
  return out.join('\n');
}
