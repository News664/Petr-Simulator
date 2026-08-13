#!/usr/bin/env node
/**
 * Phase 1.2 compact diagnostic runner.
 *
 *   npm run diagnostic
 *   npm run diagnostic -- --runs 400 --seed smoke
 *
 * Executes exactly `SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json`: one
 * baseline plus the two targeted diagnostics it names. The Phase 1.1 sweeps
 * listed under `explicitlySkippedThisPatch` are NOT run here — their harness in
 * `src/sim/experiments.ts` and `src/cli/experiment.ts` is retained unchanged.
 *
 * Reports measurements only. It never selects a threshold profile, never
 * switches the family-weighting baseline, and never edits content.
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
import type { SpeciesId, VisibleStat } from '../engine/types.js';
import { loadExperimentMatrix } from '../sim/experiments.js';
import {
  factionSeedIncidence,
  loadDiagnosticPlan,
  manifestationWindowProbe,
  spcSplit,
  targetedDiagnostic,
} from '../sim/phase1_2.js';
import { renderPhase12Report, type Phase12Payload } from '../sim/report.js';
import { runScenario } from '../sim/runner.js';
import { findScenario, type ScenarioDef } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — Phase 1.2 compact diagnostic

Usage:
  npm run diagnostic -- [options]

Options:
  --runs <n>      Scale factor override for every arm (default: the plan's own counts)
  --seed <string> Base seed (default "phase1_2")
  --out <dir>     Output directory (default ./reports)
  --quiet         Suppress progress output
  --help          Show this help
`.trim();

const MANIFEST_WINDOW = [18, 19, 20];

function archetypeAllocation(): AllocationPolicy {
  // The archetype priority lists live in the Phase 1.1 experiment matrix. Reading
  // them is not running the Phase 1.1 comparison: the plan names ARCHETYPE_SET as
  // the single baseline allocation and no other policy is exercised here.
  const matrix = loadExperimentMatrix();
  return {
    kind: 'archetype',
    archetypes: matrix.archetypePolicy.archetypes.map((archetype) => archetype.priority as VisibleStat[]),
  };
}

function allocationPolicy(name: string): AllocationPolicy {
  switch (name) {
    case 'BALANCED_RANDOM_FILL':
      return { kind: 'seeded_random' };
    case 'MINMAX_PRIMARY_SECONDARY':
      return { kind: 'minmax' };
    case 'ARCHETYPE_SET':
      return archetypeAllocation();
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

  let content: ContentBundle;
  try {
    content = loadContent(defaultContentPaths());
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED; refusing to run the Phase 1.2 diagnostic.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const plan = loadDiagnosticPlan();
  const baseSeed = stringFlag(args, 'seed', 'phase1_2');
  const quiet = boolFlag(args, 'quiet');
  const runsOverride = intFlag(args, 'runs', 0);
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });

  const note = (message: string): void => {
    if (!quiet) process.stderr.write(`${message}\n`);
  };
  const runCount = (planned: number): number => (runsOverride > 0 ? runsOverride : planned);

  // The plan pins the design baseline it expects to measure against. If canonical
  // balance ever diverges, say so rather than silently deriving a bundle.
  if (content.balance.familyWeightMode !== plan.baseline.familyWeightMode) {
    console.error(
      `plan expects familyWeightMode ${plan.baseline.familyWeightMode} but canonical balance is ` +
        `${content.balance.familyWeightMode}; refusing to derive a bundle for a compact diagnostic.`,
    );
    return 2;
  }

  // --- Baseline --------------------------------------------------------------
  const baselineScenario = findScenario(plan.baseline.talentScenario);
  if (!baselineScenario) {
    console.error(`plan names unknown talent scenario ${plan.baseline.talentScenario}`);
    return 2;
  }
  const baselineRuns = runCount(plan.baseline.runs);
  note(`baseline (${baselineRuns} runs, ${plan.baseline.allocationPolicy}, authored thresholds)`);
  const baseline = runScenario(content, baselineScenario, {
    runs: baselineRuns,
    baseSeed: `${baseSeed}|baseline`,
    speciesStratified: plan.baseline.speciesMode === 'STRATIFY_EQUALLY_BY_SPECIES',
    allocation: allocationPolicy(plan.baseline.allocationPolicy),
    keepRuns: true,
  });

  // --- Targeted A: T1023 SPC comparison --------------------------------------
  const spcPlan = targetedDiagnostic(plan, 'T1023_SPC_COMPARE');
  const spcRuns = runCount(spcPlan.runsPerArm ?? 1500);
  const spcArms: Phase12Payload['t1023Arms'] = [];
  for (const arm of spcPlan.arms ?? []) {
    note(`T1023_SPC_COMPARE ${arm.name} (${spcRuns} runs) — ${arm.talents.join(', ')}`);
    for (const talentId of arm.talents) {
      if (!content.talents.has(talentId)) throw new Error(`arm ${arm.name} names unknown talent ${talentId}`);
    }
    const scenario: ScenarioDef = {
      id: `T1023_SPC_COMPARE_${arm.name.toUpperCase()}`,
      label: arm.name,
      description: `Fixed talent arm from the Phase 1.2 diagnostic plan: ${arm.talents.join(', ')}.`,
      talents: { kind: 'fixed', talents: arm.talents },
    };
    const report = runScenario(content, scenario, {
      runs: spcRuns,
      baseSeed: `${baseSeed}|t1023`,
      speciesStratified: true,
      allocation: allocationPolicy(plan.baseline.allocationPolicy),
      keepRuns: true,
    });
    spcArms.push({
      name: arm.name,
      talents: arm.talents,
      metrics: report.metrics,
      spc: spcSplit(report.runs ?? []),
      factionSeeds: factionSeedIncidence(content, report.runs ?? []),
    });
  }

  // --- Targeted B: neutral-Human manifestation window ------------------------
  const manifestPlan = targetedDiagnostic(plan, 'NEUTRAL_HUMAN_MANIFEST_18_20');
  const manifestRuns = runCount(manifestPlan.runs ?? 2000);
  note(`NEUTRAL_HUMAN_MANIFEST_18_20 (${manifestRuns} runs, HUMAN, no talents)`);
  const probe = manifestationWindowProbe(content, MANIFEST_WINDOW);
  const neutralScenario: ScenarioDef = {
    id: 'NEUTRAL_HUMAN_MANIFEST_18_20',
    label: 'neutral-human',
    description:
      'HUMAN has no family tendencies and no refinement hooks; the arm holds no talents. Any skew in the ' +
      '18-20 window is therefore a property of content availability, not of species or talent evidence.',
    talents: { kind: 'none' },
  };
  const neutral = runScenario(content, neutralScenario, {
    runs: manifestRuns,
    baseSeed: `${baseSeed}|manifest`,
    speciesStratified: false,
    fixedSpecies: (manifestPlan.species ?? 'HUMAN') as SpeciesId,
    allocation: allocationPolicy(manifestPlan.allocationPolicy ?? 'BALANCED_RANDOM_FILL'),
    hooks: probe.hooks,
  });

  const payload: Phase12Payload = {
    generatedAt: new Date().toISOString(),
    contentVersion: content.contentVersion,
    balanceVersion: content.balance.version,
    planVersion: plan.version,
    planStatus: plan.status,
    planPurpose: plan.purpose,
    baseSeed,
    baseline: {
      settings: { ...plan.baseline, runs: baselineRuns },
      metrics: baseline.metrics,
      spc: spcSplit(baseline.runs ?? []),
      factionSeeds: factionSeedIncidence(content, baseline.runs ?? []),
    },
    t1023Arms: spcArms,
    neutralHuman: {
      runs: manifestRuns,
      species: manifestPlan.species ?? 'HUMAN',
      allocationPolicy: manifestPlan.allocationPolicy ?? 'BALANCED_RANDOM_FILL',
      metrics: neutral.metrics,
      probe: probe.finish(),
    },
    requiredBaselineMetrics: plan.requiredBaselineMetrics,
    explicitlySkippedThisPatch: plan.explicitlySkippedThisPatch,
    retentionPolicy: plan.retentionPolicy,
    stopCondition: plan.stopCondition,
  };

  const jsonPath = path.join(outDir, 'phase1_2-diagnostic.json');
  const mdPath = path.join(outDir, 'phase1_2-diagnostic.md');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderPhase12Report(content, payload), 'utf8');

  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  // `pre25CoveragePolicy: "strict"`. Defects are still measured and reported —
  // the run does not abort — but a nonzero count fails the diagnostic.
  const defects =
    baseline.metrics.coverageErrors +
    spcArms.reduce((sum, arm) => sum + arm.metrics.coverageErrors, 0) +
    neutral.metrics.coverageErrors;
  if (plan.baseline.pre25CoveragePolicy === 'strict' && defects > 0) {
    console.error(`STRICT pre-25 coverage policy violated: ${defects} run(s) hit an empty pre-25 event pool.`);
    return 1;
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
