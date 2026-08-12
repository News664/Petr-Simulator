import type { ContentBundle } from '../engine/content/load.js';
import { CHANNELS } from '../engine/types.js';
import type { MetricsSummary } from './metrics.js';
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
        ['Pre-25 coverage policy', `\`${report.options.pre25CoveragePolicy}\``],
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
        ['Pre-25 diagnostic reuse years', String(m.pre25EmergencyReuseYears)],
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
