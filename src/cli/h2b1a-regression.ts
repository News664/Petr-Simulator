#!/usr/bin/env node
/**
 * H2B.1A focused regression.
 *
 *   npm run h2b1a
 *   npm run h2b1a -- --runs 200 --quiet     # smoke run
 *
 * One arm, 3 000 runs, against the corpus as it now stands: LOW is the working
 * canonical balance, so there is no threshold rewrite to apply. Sampling matches
 * the H2B Batch 008 diagnostic exactly (species stratified, uniform-three
 * talents, ARCHETYPE_SET, uniform family weighting, max age 120) so the
 * committed H2B report is a valid reference and a second large pre-patch run is
 * not needed.
 *
 * Writes `reports/h2b1a-regression.{json,md}`. Earlier reports are untouched.
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
import { loadExperimentMatrix } from '../sim/experiments.js';
import { H2aTelemetryAccumulator, type TelemetryConfig } from '../sim/h2aThresholdTelemetry.js';
import { H2bAccumulator } from '../sim/h2bDiagnostic.js';
import { renderH2bReport, type H2bArm, type H2bPayload } from '../sim/h2bReport.js';
import { FactionAccumulator } from '../sim/phase1_3.js';
import { runScenario } from '../sim/runner.js';
import { findScenario } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — H2B.1A focused regression

Usage:
  npm run h2b1a -- [options]

Options:
  --runs <n>      Override the run count (default 3000)
  --seed <string> Base seed (default "h2b1a_timing")
  --out <dir>     Output directory (default ./reports)
  --quiet         Suppress progress output
  --help          Show this help
`.trim();

const SAMPLING = {
  runs: 3000,
  speciesMode: 'STRATIFY_EQUALLY_BY_SPECIES',
  talentScenario: 'UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC',
  allocationPolicy: 'ARCHETYPE_SET',
  familyWeightMode: 'uniform',
  maxAge: 120,
} as const;

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

  let content: ContentBundle;
  try {
    content = loadContent(defaultContentPaths());
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED; refusing to run the H2B.1A regression.');
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

  const runs = intFlag(args, 'runs', 0) || SAMPLING.runs;
  const baseSeed = stringFlag(args, 'seed', 'h2b1a_timing');
  const quiet = boolFlag(args, 'quiet');
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });

  if (!quiet) process.stderr.write(`h2b1a: working canonical balance (${runs} runs)\n`);

  const factions = new FactionAccumulator(content);
  const telemetry = new H2aTelemetryAccumulator(content, TELEMETRY);
  const h2b = new H2bAccumulator(content);
  const report = runScenario(content, scenario, {
    runs,
    baseSeed: `${baseSeed}|h2b1a`,
    speciesStratified: true,
    allocation: {
      kind: 'archetype',
      archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as VisibleStat[]),
    },
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

  const arm: H2bArm = {
    label: 'H2B.1A working canonical balance (LOW applied)',
    profile: 'WORKING_CANONICAL_LOW',
    contentVersion: content.contentVersion,
    runs,
    gatesRewritten: null,
    appliedThresholds: null,
    metrics: report.metrics,
    factions: factions.summary(),
    telemetry: telemetry.summary(),
    h2b: h2b.summary(),
  };

  const payload: H2bPayload = {
    generatedAt: new Date().toISOString(),
    contentVersion: content.contentVersion,
    balanceVersion: content.balance.version,
    matrixVersion: matrix.version,
    baseSeed,
    sampling: { ...SAMPLING, runs },
    arms: [arm],
  };

  const jsonPath = path.join(outDir, 'h2b1a-regression.json');
  const mdPath = path.join(outDir, 'h2b1a-regression.md');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderH2bReport(content, payload), 'utf8');
  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  const m = arm.metrics;
  const f = arm.factions;
  const t = arm.telemetry;
  const h = arm.h2b;
  const blockers: string[] = [];
  if (m.coverageErrors > 0) blockers.push(`${m.coverageErrors} pre-25 coverage defect(s)`);
  if (m.pre25FallbackYears > 0) blockers.push(`${m.pre25FallbackYears} pre-25 generic fallback event(s)`);
  if (f.illegalTransitionCount > 0) blockers.push(`${f.illegalTransitionCount} illegal faction transition(s)`);
  if (f.illegalLifecycleStateCount > 0) blockers.push(`${f.illegalLifecycleStateCount} lifecycle collision(s)`);
  if (f.personalEventsAfterExitCount > 0) {
    blockers.push(`${f.personalEventsAfterExitCount} personalized faction event(s) after a safe exit`);
  }
  if (t.earlyOutcomes.endingsBefore18 > 0) blockers.push(`${t.earlyOutcomes.endingsBefore18} ending(s) before 18`);
  if (t.earlyOutcomes.materialCommitmentsBefore18 > 0) {
    blockers.push(`${t.earlyOutcomes.materialCommitmentsBefore18} Material Commitment(s) before 18`);
  }
  if (h.factions.simultaneousActiveViolations > 0) {
    blockers.push(`${h.factions.simultaneousActiveViolations} run(s) held two personally-active factions`);
  }
  if (h.factions.secondContactWhileActiveRuns > 0) {
    blockers.push(`${h.factions.secondContactWhileActiveRuns} second contact(s) opened before the previous ended`);
  }
  if (blockers.length > 0) {
    console.error('H2B.1A correctness FAILURES:');
    for (const blocker of blockers) console.error(`  - ${blocker}`);
    return 1;
  }
  console.log('Correctness counters: all zero, including faction exclusivity.');
  return 0;
}

process.exitCode = main(process.argv.slice(2));
