#!/usr/bin/env node
/**
 * Phase 1.1 experiment runner.
 *
 *   npm run experiment -- --runs 4000
 *   npm run experiment -- --runs 500 --only threshold_sweep
 *
 * Executes `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json` and writes one
 * JSON + Markdown pair per experiment plus a combined comparison document.
 *
 * Reports measurements only. It never selects or freezes a threshold profile,
 * never switches the design baseline, and never edits content.
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
import type { AllocationPolicy } from '../engine/setup.js';
import type { VisibleStat } from '../engine/types.js';
import {
  applyThresholdProfile,
  loadExperimentMatrix,
  withFamilyWeightMode,
  withT1027StartFix,
  type ExperimentMatrix,
} from '../sim/experiments.js';
import { renderExperimentReport, type ExperimentArm, type ExperimentReport } from '../sim/report.js';
import { runScenario } from '../sim/runner.js';
import { SCENARIOS, findScenario } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — Phase 1.1 experiment runner

Usage:
  npm run experiment -- [options]

Options:
  --runs <n>        Runs per arm (default 4000)
  --seed <string>   Base seed (default "phase1_1")
  --only <name>     Run one experiment: threshold_sweep | family_weight_ab |
                    allocation_policy_compare | t1027_sensitivity | first_manifestation
  --out <dir>       Output directory (default ./reports)
  --quiet           Suppress progress output
  --help            Show this help
`.trim();

function allocationPolicy(name: string, matrix: ExperimentMatrix): AllocationPolicy {
  switch (name) {
    case 'BALANCED_RANDOM_FILL':
      return { kind: 'seeded_random' };
    case 'MINMAX_PRIMARY_SECONDARY':
      return { kind: 'minmax' };
    case 'ARCHETYPE_SET':
      return {
        kind: 'archetype',
        archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as VisibleStat[]),
      };
    default:
      throw new Error(`unknown allocation policy ${name}`);
  }
}

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
      console.error('Content validation FAILED; refusing to run experiments.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const matrix = loadExperimentMatrix();
  const runs = intFlag(args, 'runs', 4000);
  const baseSeed = stringFlag(args, 'seed', 'phase1_1');
  const only = optionalStringFlag(args, 'only');
  const quiet = boolFlag(args, 'quiet');
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });

  const uniformDiagnostic = findScenario('uniform-three')!;
  const anomalousScenario = findScenario('anomalous-talents')!;
  const noTalents = findScenario('no-talents')!;

  const reports: ExperimentReport[] = [];
  const note = (message: string): void => {
    if (!quiet) process.stderr.write(`${message}\n`);
  };

  const shouldRun = (name: string): boolean => only === undefined || only === name;

  // --- 1. Threshold sweep: LOW / MID / HIGH / ORIGINAL_REFERENCE ---------------
  if (shouldRun('threshold_sweep')) {
    const arms: ExperimentArm[] = [];
    for (const profile of ['LOW', 'MID', 'HIGH', 'ORIGINAL_REFERENCE']) {
      note(`threshold_sweep ${profile} (${runs} runs)`);
      const { content, application } = applyThresholdProfile(base, matrix, profile);
      const scenario = runScenario(withFamilyWeightMode(content, 'uniform'), uniformDiagnostic, {
        runs,
        baseSeed: `${baseSeed}|threshold`,
        speciesStratified: true,
      });
      arms.push({
        label: profile,
        settings: {
          threshold: profile,
          familyWeightMode: 'uniform',
          allocation: 'BALANCED_RANDOM_FILL',
          gatesRewritten: String(application.totalRewrites),
        },
        metrics: scenario.metrics,
      });
      if (application.eventsWithoutGate.length > 0) {
        note(`  note: no FIX gate found in ${application.eventsWithoutGate.join(', ')}`);
      }
    }
    reports.push({
      name: 'threshold_sweep',
      description:
        'FIX gate profiles from the Phase 1.1 experiment matrix, under the uniform-family design baseline and balanced allocation. Experiment inputs only — no profile is selected here.',
      arms,
    });
  }

  // --- 2. Family weighting A/B at MID ----------------------------------------
  if (shouldRun('family_weight_ab')) {
    const arms: ExperimentArm[] = [];
    const { content } = applyThresholdProfile(base, matrix, 'MID');
    for (const mode of ['uniform', 'sum_of_event_weights'] as const) {
      note(`family_weight_ab ${mode} (${runs} runs)`);
      const scenario = runScenario(withFamilyWeightMode(content, mode), uniformDiagnostic, {
        runs,
        baseSeed: `${baseSeed}|family`,
        speciesStratified: true,
      });
      arms.push({
        label: mode === 'uniform' ? 'uniform (design baseline)' : 'sum_of_event_weights (diagnostic)',
        settings: { threshold: 'MID', familyWeightMode: mode, allocation: 'BALANCED_RANDOM_FILL' },
        metrics: scenario.metrics,
      });
    }
    reports.push({
      name: 'family_weight_ab',
      description:
        'Design baseline is uniform eligible family. `sum_of_event_weights` is retained only as this comparison and must not become the baseline without a design decision.',
      arms,
    });
  }

  // --- 3. Allocation policy comparison at MID + uniform ------------------------
  if (shouldRun('allocation_policy_compare')) {
    const arms: ExperimentArm[] = [];
    const { content } = applyThresholdProfile(base, matrix, 'MID');
    const uniform = withFamilyWeightMode(content, 'uniform');
    for (const policyName of ['BALANCED_RANDOM_FILL', 'MINMAX_PRIMARY_SECONDARY', 'ARCHETYPE_SET']) {
      note(`allocation_policy_compare ${policyName} (${runs} runs)`);
      const scenario = runScenario(uniform, uniformDiagnostic, {
        runs,
        baseSeed: `${baseSeed}|alloc`,
        speciesStratified: true,
        allocation: allocationPolicy(policyName, matrix),
      });
      arms.push({
        label: policyName,
        settings: { threshold: 'MID', familyWeightMode: 'uniform', allocation: policyName },
        metrics: scenario.metrics,
      });
    }
    reports.push({
      name: 'allocation_policy_compare',
      description:
        'Q-17: allocation policies are reported separately and never mixed into one headline statistic. Threshold-talent activation differs sharply by policy.',
      arms,
    });
  }

  // --- 4. T1027 sensitivity (Q-14 stays OPEN) --------------------------------
  if (shouldRun('t1027_sensitivity')) {
    const arms: ExperimentArm[] = [];
    const { content } = applyThresholdProfile(base, matrix, 'MID');
    const uniform = withFamilyWeightMode(content, 'uniform');
    for (const startFIX of matrix.t1027Sensitivity.startFIXValues) {
      note(`t1027_sensitivity startFIX=${startFIX} (${runs} runs)`);
      const scenario = runScenario(withT1027StartFix(uniform, startFIX), anomalousScenario, {
        runs,
        baseSeed: `${baseSeed}|t1027`,
        speciesStratified: true,
      });
      arms.push({
        label: `startFIX = ${startFIX}`,
        settings: { threshold: 'MID', familyWeightMode: 'uniform', t1027StartFIX: String(startFIX) },
        metrics: scenario.metrics,
      });
    }
    reports.push({
      name: 't1027_sensitivity',
      description:
        'Q-14 remains OPEN. Canonical `start_fix_bonus` is blank; these arms sweep the diagnostic value against the anomalous-talent scenario (which holds T1027). No value is frozen.',
      arms,
    });
  }

  // --- 5. Neutral first-manifestation diagnostic -----------------------------
  if (shouldRun('first_manifestation')) {
    const arms: ExperimentArm[] = [];
    const { content } = applyThresholdProfile(base, matrix, 'MID');
    const uniform = withFamilyWeightMode(content, 'uniform');
    note(`first_manifestation HUMAN/no-talents (${runs} runs)`);
    const scenario = runScenario(uniform, noTalents, {
      runs,
      baseSeed: `${baseSeed}|manifest`,
      speciesStratified: false,
      fixedSpecies: 'HUMAN',
    });
    arms.push({
      label: 'HUMAN, no talents, no material evidence',
      settings: { threshold: 'MID', familyWeightMode: 'uniform', species: 'HUMAN', talents: 'none' },
      metrics: scenario.metrics,
    });
    reports.push({
      name: 'first_manifestation',
      description:
        'Q-22 neutrality diagnostic. HUMAN has no family tendencies and no refinement hooks, and the scenario holds no talents, so any residual skew is an availability artifact of the content itself. WOOD above 50% is a stated failure.',
      arms,
    });
  }

  if (reports.length === 0) {
    console.error(`--only ${JSON.stringify(only)} matched no experiment`);
    return 2;
  }

  const jsonPath = path.join(outDir, 'phase1_1-experiments.json');
  const mdPath = path.join(outDir, 'phase1_1-experiments.md');
  const payload = {
    generatedAt: new Date().toISOString(),
    contentVersion: base.contentVersion,
    balanceVersion: base.balance.version,
    matrixVersion: matrix.version,
    runsPerArm: runs,
    baseSeed,
    experiments: reports,
  };
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderExperimentReport(base, payload), 'utf8');

  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
