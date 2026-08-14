#!/usr/bin/env node
/**
 * H2B Batch 008 diagnostic runner.
 *
 *   npm run h2b:diagnostic
 *   npm run h2b:diagnostic -- --runs 200 --quiet     # smoke run
 *
 * Executes `docs/validation/SOLID_STATE_H2B_DIAGNOSTIC_PLAN_v0.1.md`: a primary
 * 5 000-run LOW + Batch 008 arm and a 2 500-run CURRENT_AUTHORED + Batch 008
 * comparator, species stratified, uniform-three talents, ARCHETYPE_SET
 * allocation, uniform family weighting.
 *
 * LOW is applied through the retained reversible rewrite in `experiments.ts`.
 * It is a diagnostic baseline, not a canonical freeze: no canonical FIX gate is
 * written, no profile is selected, and Batch 008 is never auto-tuned.
 *
 * Writes `reports/h2b-batch008-diagnostic.{json,md}`. The historical
 * `reports/phase1_1-experiments.*` and `reports/h2a-threshold-calibration.*`
 * are not touched.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ContentValidationError,
  defaultContentPaths,
  loadContent,
  REPO_ROOT,
  type ContentBundle,
} from '../engine/content/load.js';
import type { VisibleStat } from '../engine/types.js';
import { applyThresholdProfile, loadExperimentMatrix } from '../sim/experiments.js';
import { H2aTelemetryAccumulator, type TelemetryConfig } from '../sim/h2aThresholdTelemetry.js';
import { H2bAccumulator } from '../sim/h2bDiagnostic.js';
import { renderH2bReport, type H2bArm, type H2bPayload } from '../sim/h2bReport.js';
import { FactionAccumulator } from '../sim/phase1_3.js';
import { runScenario } from '../sim/runner.js';
import { findScenario } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — H2B Batch 008 diagnostic

Usage:
  npm run h2b:diagnostic -- [options]

Options:
  --runs <n>      Override the primary arm's run count (comparator scales by half)
  --seed <string> Base seed (default "h2b_batch008")
  --out <dir>     Output directory (default ./reports)
  --quiet         Suppress progress output
  --help          Show this help
`.trim();

/** The plan's sampling design, in one place. */
const SAMPLING = {
  primaryRuns: 5000,
  comparatorRuns: 2500,
  speciesMode: 'STRATIFY_EQUALLY_BY_SPECIES',
  talentScenario: 'UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC',
  allocationPolicy: 'ARCHETYPE_SET',
  familyWeightMode: 'uniform',
  maxAge: 120,
} as const;

/** Snapshot ages and risk horizons the plan asks for. */
const TELEMETRY: TelemetryConfig = {
  statTelemetry: { snapshotAges: [0, 18, 25, 35, 50, 65], includeFinal: true },
  eventFrequencyTelemetry: { topEventCount: 25 },
  lowStatRiskTelemetry: { ageMinimum: 18, horizonsYears: [3, 5] },
};

function main(argv: string[]): number {
  const args = parseArgs(argv);
  if (boolFlag(args, 'help')) {
    console.log(USAGE);
    return 0;
  }

  let base: ContentBundle;
  try {
    base = loadContent(defaultContentPaths());
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED; refusing to run the H2B diagnostic.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const matrix = loadExperimentMatrix();
  const scenario = findScenario(SAMPLING.talentScenario);
  if (!scenario) {
    console.error(`unknown talent scenario ${SAMPLING.talentScenario}`);
    return 2;
  }
  if (base.balance.familyWeightMode !== SAMPLING.familyWeightMode) {
    console.error(
      `plan expects familyWeightMode ${SAMPLING.familyWeightMode} but canonical balance is ` +
        `${base.balance.familyWeightMode}; refusing to derive a bundle.`,
    );
    return 2;
  }

  const override = intFlag(args, 'runs', 0);
  const primaryRuns = override > 0 ? override : SAMPLING.primaryRuns;
  const comparatorRuns = override > 0 ? Math.max(1, Math.round(override / 2)) : SAMPLING.comparatorRuns;
  const baseSeed = stringFlag(args, 'seed', 'h2b_batch008');
  const quiet = boolFlag(args, 'quiet');
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });

  const allocation = {
    kind: 'archetype' as const,
    archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as VisibleStat[]),
  };

  const plan: { label: string; profile: string | null; runs: number }[] = [
    { label: 'LOW + Batch 008', profile: 'LOW', runs: primaryRuns },
    { label: 'CURRENT_AUTHORED + Batch 008', profile: null, runs: comparatorRuns },
  ];

  const arms: H2bArm[] = [];
  for (const entry of plan) {
    if (!quiet) process.stderr.write(`h2b: ${entry.label} (${entry.runs} runs)\n`);
    let content = base;
    let gatesRewritten: number | null = null;
    let appliedThresholds: Record<string, number> | null = null;
    if (entry.profile) {
      const applied = applyThresholdProfile(base, matrix, entry.profile);
      content = applied.content;
      gatesRewritten = applied.application.totalRewrites;
      appliedThresholds = matrix.thresholdProfiles[entry.profile] ?? null;
    }

    const factions = new FactionAccumulator(content);
    const telemetry = new H2aTelemetryAccumulator(content, TELEMETRY);
    const h2b = new H2bAccumulator(content);
    const report = runScenario(content, scenario, {
      runs: entry.runs,
      baseSeed: `${baseSeed}|h2b`,
      speciesStratified: SAMPLING.speciesMode === 'STRATIFY_EQUALLY_BY_SPECIES',
      allocation,
      maxAge: SAMPLING.maxAge,
      hooks: {
        onBeforeYear: (state) => {
          telemetry.beforeYear(state);
          h2b.beforeYear(state);
        },
      },
      onRun: (result) => {
        factions.add(result);
        telemetry.add(result);
        h2b.add(result);
      },
    });

    arms.push({
      label: entry.label,
      profile: entry.profile ?? 'CURRENT_AUTHORED',
      contentVersion: content.contentVersion,
      runs: entry.runs,
      gatesRewritten,
      appliedThresholds,
      metrics: report.metrics,
      factions: factions.summary(),
      telemetry: telemetry.summary(),
      h2b: h2b.summary(),
    });
  }

  const payload: H2bPayload = {
    generatedAt: new Date().toISOString(),
    contentVersion: base.contentVersion,
    balanceVersion: base.balance.version,
    matrixVersion: matrix.version,
    baseSeed,
    sampling: { ...SAMPLING, primaryRuns, comparatorRuns },
    arms,
  };

  const jsonPath = path.join(outDir, 'h2b-batch008-diagnostic.json');
  const mdPath = path.join(outDir, 'h2b-batch008-diagnostic.md');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderH2bReport(base, payload), 'utf8');
  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  // Hard correctness. Balance misses are warnings; these are not.
  const blockers: string[] = [];
  for (const arm of arms) {
    const m = arm.metrics;
    const f = arm.factions;
    const t = arm.telemetry;
    const h = arm.h2b;
    const tag = arm.label;
    if (m.coverageErrors > 0) blockers.push(`${tag}: ${m.coverageErrors} pre-25 coverage defect(s)`);
    if (m.pre25FallbackYears > 0) blockers.push(`${tag}: ${m.pre25FallbackYears} pre-25 generic fallback event(s)`);
    if (f.illegalTransitionCount > 0) blockers.push(`${tag}: ${f.illegalTransitionCount} illegal faction transition(s)`);
    if (f.illegalLifecycleStateCount > 0) blockers.push(`${tag}: ${f.illegalLifecycleStateCount} lifecycle collision(s)`);
    if (f.personalEventsAfterExitCount > 0) {
      blockers.push(`${tag}: ${f.personalEventsAfterExitCount} personalized faction event(s) after a safe exit`);
    }
    if (t.earlyOutcomes.endingsBefore18 > 0) blockers.push(`${tag}: ${t.earlyOutcomes.endingsBefore18} ending(s) before 18`);
    if (t.earlyOutcomes.materialCommitmentsBefore18 > 0) {
      blockers.push(`${tag}: ${t.earlyOutcomes.materialCommitmentsBefore18} Material Commitment(s) before 18`);
    }
    if (h.factions.simultaneousActiveViolations > 0) {
      blockers.push(
        `${tag}: ${h.factions.simultaneousActiveViolations} run(s) held two personally-active factions at once`,
      );
    }
    if (h.factions.secondContactWhileActiveRuns > 0) {
      blockers.push(
        `${tag}: ${h.factions.secondContactWhileActiveRuns} second faction contact(s) opened before the previous relationship ended`,
      );
    }
  }
  if (blockers.length > 0) {
    console.error('H2B correctness FAILURES:');
    for (const blocker of blockers) console.error(`  - ${blocker}`);
    return 1;
  }
  console.log('Correctness counters: all zero in both arms, including faction exclusivity.');
  return 0;
}

process.exitCode = main(process.argv.slice(2));
