#!/usr/bin/env node
/**
 * Phase 1.3 sanity diagnostic runner.
 *
 *   npm run sanity
 *   npm run sanity -- --runs 500 --seed smoke
 *
 * Executes exactly `SOLID_STATE_PHASE1_3_SANITY_PLAN_v0.1.json`: one primary
 * 5 000-run pass, no targeted arms, no sweeps. Everything the plan lists under
 * `explicitlyNotRun` stays unrun and its harness stays in place for H2B.
 *
 * Reports measurements only. It never selects a threshold profile, never
 * switches the design baseline, and never edits content.
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
import { loadExperimentMatrix } from '../sim/experiments.js';
import { FactionAccumulator, loadSanityPlan } from '../sim/phase1_3.js';
import { renderPhase13Report, type Phase13Payload } from '../sim/report.js';
import { runScenario } from '../sim/runner.js';
import { findScenario } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — Phase 1.3 sanity diagnostic

Usage:
  npm run sanity -- [options]

Options:
  --runs <n>      Override the plan's run count (default: the plan's own 5000)
  --seed <string> Base seed (default "phase1_3")
  --out <dir>     Output directory (default ./reports)
  --quiet         Suppress progress output
  --help          Show this help
`.trim();

function allocationPolicy(name: string): AllocationPolicy {
  switch (name) {
    case 'BALANCED_RANDOM_FILL':
      return { kind: 'seeded_random' };
    case 'MINMAX_PRIMARY_SECONDARY':
      return { kind: 'minmax' };
    case 'ARCHETYPE_SET': {
      // The archetype priority lists live in the Phase 1.1 experiment matrix.
      // Reading them is not running the Phase 1.1 comparison: the plan names
      // ARCHETYPE_SET as the single allocation policy and no other is exercised.
      const matrix = loadExperimentMatrix();
      return {
        kind: 'archetype',
        archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as VisibleStat[]),
      };
    }
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
      console.error('Content validation FAILED; refusing to run the Phase 1.3 sanity diagnostic.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const plan = loadSanityPlan();
  const baseSeed = stringFlag(args, 'seed', 'phase1_3');
  const quiet = boolFlag(args, 'quiet');
  const runsOverride = intFlag(args, 'runs', 0);
  const runs = runsOverride > 0 ? runsOverride : plan.primary.runs;
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });

  if (content.balance.familyWeightMode !== plan.primary.familyWeightMode) {
    console.error(
      `plan expects familyWeightMode ${plan.primary.familyWeightMode} but canonical balance is ` +
        `${content.balance.familyWeightMode}; refusing to derive a bundle for a sanity pass.`,
    );
    return 2;
  }

  const scenario = findScenario(plan.primary.talentScenario);
  if (!scenario) {
    console.error(`plan names unknown talent scenario ${plan.primary.talentScenario}`);
    return 2;
  }

  if (!quiet) {
    process.stderr.write(
      `Phase 1.3 sanity: ${runs} runs, ${plan.primary.speciesMode}, ${plan.primary.allocationPolicy}, ` +
        `${plan.primary.thresholdMode}\n`,
    );
  }

  // The faction accumulator consumes each run as it finishes, so a 5 000-run
  // pass never holds every timeline in memory at once.
  const factions = new FactionAccumulator(content);
  const report = runScenario(content, scenario, {
    runs,
    baseSeed: `${baseSeed}|sanity`,
    speciesStratified: plan.primary.speciesMode === 'STRATIFY_EQUALLY_BY_SPECIES',
    allocation: allocationPolicy(plan.primary.allocationPolicy),
    onRun: (result) => factions.add(result),
  });

  const payload: Phase13Payload = {
    generatedAt: new Date().toISOString(),
    contentVersion: content.contentVersion,
    balanceVersion: content.balance.version,
    planVersion: plan.version,
    planStatus: plan.status,
    planPurpose: plan.purpose,
    baseSeed,
    settings: { ...plan.primary, runs },
    metrics: report.metrics,
    factions: factions.summary(),
    requiredMetrics: plan.requiredMetrics,
    explicitlyNotRun: plan.explicitlyNotRun,
    retentionPolicy: plan.retentionPolicy,
    h2aDecisionRule: plan.h2aDecisionRule,
    stopCondition: plan.stopCondition,
  };

  const jsonPath = path.join(outDir, 'phase1_3-sanity.json');
  const mdPath = path.join(outDir, 'phase1_3-sanity.md');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderPhase13Report(content, payload), 'utf8');

  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  // Hard correctness counters. These are the H2A blockers the plan defers to;
  // balance misses are reported as warnings and never fail the run.
  const summary = payload.factions;
  const blockers: string[] = [];
  if (plan.primary.pre25CoveragePolicy === 'strict' && report.metrics.coverageErrors > 0) {
    blockers.push(`${report.metrics.coverageErrors} run(s) hit an empty pre-25 event pool`);
  }
  if (report.metrics.pre25FallbackYears > 0) {
    blockers.push(`${report.metrics.pre25FallbackYears} pre-25 generic fallback event(s)`);
  }
  if (summary.illegalTransitionCount > 0) {
    blockers.push(`${summary.illegalTransitionCount} illegal faction transition(s)`);
  }
  if (summary.illegalLifecycleStateCount > 0) {
    blockers.push(`${summary.illegalLifecycleStateCount} run(s) held two lifecycle states for one faction`);
  }
  if (summary.personalEventsAfterExitCount > 0) {
    blockers.push(`${summary.personalEventsAfterExitCount} personalized faction event(s) after a safe exit`);
  }
  if (blockers.length > 0) {
    console.error('H2A hard correctness blockers FAILED:');
    for (const blocker of blockers) console.error(`  - ${blocker}`);
    return 1;
  }
  console.log('H2A hard correctness counters: all zero.');
  return 0;
}

process.exitCode = main(process.argv.slice(2));
