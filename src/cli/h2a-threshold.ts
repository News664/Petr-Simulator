#!/usr/bin/env node
/**
 * H2A threshold calibration runner.
 *
 *   npm run h2a:threshold
 *   npm run h2a:threshold -- --runs 200 --quiet     # smoke run
 *
 * Executes exactly `SOLID_STATE_H2A_THRESHOLD_CALIBRATION_PLAN_v0.1.json`: four
 * arms (CURRENT_AUTHORED, LOW, MID, HIGH) at the plan's run count, with the
 * expanded telemetry from `SOLID_STATE_H2A_THRESHOLD_TELEMETRY_SPEC_v0.1.md`.
 *
 * This is a NEW H2A calibration. It writes to `reports/h2a-threshold-calibration.*`
 * and never touches the historical `reports/phase1_1-experiments.*` or the
 * semantics of the retained Phase 1.1 experiment matrix. The matrix is read for
 * two things only: the LOW/MID/HIGH threshold values and the canonical
 * ARCHETYPE_SET priority lists.
 *
 * Reports measurements only. It never selects or freezes a threshold profile,
 * never interpolates a new one, and never edits content.
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
import { applyThresholdProfile, loadExperimentMatrix, type ExperimentMatrix } from '../sim/experiments.js';
import { renderH2aThresholdReport, type H2aArm, type H2aThresholdPayload } from '../sim/h2aThresholdReport.js';
import {
  DEFAULT_CALIBRATION_PLAN,
  H2aTelemetryAccumulator,
  loadCalibrationPlan,
} from '../sim/h2aThresholdTelemetry.js';
import { FactionAccumulator } from '../sim/phase1_3.js';
import { runScenario } from '../sim/runner.js';
import { findScenario } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — H2A threshold calibration

Usage:
  npm run h2a:threshold -- [options]

Options:
  --runs <n>      Override runs per arm (default: the plan's 3000). Smoke use only.
  --seed <string> Base seed (default: the plan's own)
  --plan <file>   Calibration plan JSON under content/balance
  --out <dir>     Output directory (default ./reports)
  --quiet         Suppress progress output
  --help          Show this help
`.trim();

function allocationPolicy(name: string, matrix: ExperimentMatrix): AllocationPolicy {
  switch (name) {
    case 'BALANCED_RANDOM_FILL':
      return { kind: 'seeded_random' };
    case 'MINMAX_PRIMARY_SECONDARY':
      return { kind: 'minmax' };
    case 'ARCHETYPE_SET':
      // Canonical retained archetype definitions. Reading them is not running
      // the Phase 1.1 allocation comparison: this plan names ARCHETYPE_SET as
      // its single allocation policy and no other is exercised.
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
      console.error('Content validation FAILED; refusing to run the H2A threshold calibration.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const planFile = optionalStringFlag(args, 'plan') ?? DEFAULT_CALIBRATION_PLAN;
  const plan = loadCalibrationPlan(path.join(REPO_ROOT, 'content', 'balance', planFile));
  const matrix = loadExperimentMatrix();
  const runsOverride = intFlag(args, 'runs', 0);
  const runs = runsOverride > 0 ? runsOverride : plan.sampling.runsPerArm;
  const baseSeed = stringFlag(args, 'seed', plan.sampling.baseSeed);
  const quiet = boolFlag(args, 'quiet');
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });

  if (base.balance.familyWeightMode !== plan.sampling.familyWeightMode) {
    console.error(
      `plan expects familyWeightMode ${plan.sampling.familyWeightMode} but canonical balance is ` +
        `${base.balance.familyWeightMode}; refusing to derive a bundle for a calibration pass.`,
    );
    return 2;
  }

  const scenario = findScenario(plan.sampling.talentScenario);
  if (!scenario) {
    console.error(`plan names unknown talent scenario ${plan.sampling.talentScenario}`);
    return 2;
  }

  const allocation = allocationPolicy(plan.sampling.allocationPolicy, matrix);
  const speciesStratified = plan.sampling.speciesMode === 'STRATIFY_EQUALLY_BY_SPECIES';

  const arms: H2aArm[] = [];
  for (const profile of plan.profiles) {
    if (!quiet) process.stderr.write(`h2a threshold: ${profile.id} (${runs} runs)\n`);

    // CURRENT_AUTHORED is the true control: the canonical corpus, untouched.
    // Only LOW/MID/HIGH go through the retained reversible rewrite.
    let content = base;
    let gatesRewritten: number | null = null;
    let appliedThresholds: Record<string, number> | null = null;
    let eventsWithoutGate: string[] = [];
    if (profile.mode !== 'no_threshold_rewrite') {
      const result = applyThresholdProfile(base, matrix, profile.id);
      content = result.content;
      gatesRewritten = result.application.totalRewrites;
      appliedThresholds = matrix.thresholdProfiles[profile.id] ?? null;
      eventsWithoutGate = result.application.eventsWithoutGate;
      if (!quiet && eventsWithoutGate.length > 0) {
        process.stderr.write(`  note: no FIX gate found in ${eventsWithoutGate.join(', ')}\n`);
      }
    }

    const factions = new FactionAccumulator(content);
    const telemetry = new H2aTelemetryAccumulator(content, plan);
    const report = runScenario(content, scenario, {
      runs,
      baseSeed: `${baseSeed}|h2a-threshold`,
      speciesStratified,
      allocation,
      maxAge: plan.sampling.maxAge,
      hooks: { onBeforeYear: (state) => telemetry.beforeYear(state) },
      onRun: (result) => {
        factions.add(result);
        telemetry.add(result);
      },
    });

    arms.push({
      label: profile.id,
      mode: profile.mode,
      note: profile.note,
      contentVersion: content.contentVersion,
      gatesRewritten,
      appliedThresholds,
      eventsWithoutGate,
      metrics: report.metrics,
      factions: factions.summary(),
      telemetry: telemetry.summary(),
    });
  }

  const payload: H2aThresholdPayload = {
    generatedAt: new Date().toISOString(),
    contentVersion: base.contentVersion,
    balanceVersion: base.balance.version,
    matrixVersion: matrix.version,
    planVersion: plan.version,
    planStatus: plan.status,
    planPurpose: plan.purpose,
    baseCorpus: plan.baseCorpus,
    baseSeed,
    runsPerArm: runs,
    sampling: { ...plan.sampling, runsPerArm: runs },
    arms,
    requiredCoreMetrics: plan.requiredCoreMetrics,
    explicitlyNotRun: plan.explicitlyNotRun,
    retentionPolicy: plan.retentionPolicy,
    methodologyNotes: [
      'CURRENT_AUTHORED is the canonical corpus with no threshold rewrite at all. The Phase 1.1 ' +
        '`ORIGINAL_REFERENCE` profile is deliberately NOT used as the control: canonical gates changed after ' +
        'Phase 1.1, so that arm is historical rather than current.',
      'LOW/MID/HIGH use the retained reversible rewrite in `src/sim/experiments.ts`, which rewrites assigned ' +
        'event FIX gates and the validity conditions of schedules pointing at them, in memory only. Canonical ' +
        'event JSON is never written.',
      'Every arm uses the same base seed. A rewritten arm carries a derived content fingerprint, and the run ' +
        'seed is `contentVersion:seed`, so the arms are independent samples of the same sampling design rather ' +
        'than a paired comparison. This matches the retained Phase 1.1 experiment behaviour; at these run counts ' +
        'the sampling error on a rate near 50% is roughly ±0.9pp.',
      'Species are stratified equally, so a species roll cannot drift between arms.',
      'ARCHETYPE_SET priorities are read verbatim from the retained Phase 1.1 experiment matrix. No new ' +
        'archetype is invented and no allocation comparison is run.',
      'Visible stats are unclamped in the canonical balance constants, and this run adds no clamp and changes ' +
        'no stat effect.',
    ],
  };

  const jsonPath = path.join(outDir, 'h2a-threshold-calibration.json');
  const mdPath = path.join(outDir, 'h2a-threshold-calibration.md');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderH2aThresholdReport(base, payload), 'utf8');

  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  // Correctness counters are failures in every arm. Balance misses are not.
  const blockers: string[] = [];
  for (const arm of arms) {
    const m = arm.metrics;
    const f = arm.factions;
    const t = arm.telemetry;
    if (m.coverageErrors > 0) blockers.push(`${arm.label}: ${m.coverageErrors} pre-25 coverage defect(s)`);
    if (m.pre25FallbackYears > 0) {
      blockers.push(`${arm.label}: ${m.pre25FallbackYears} pre-25 generic fallback event(s)`);
    }
    if (f.illegalTransitionCount > 0) {
      blockers.push(`${arm.label}: ${f.illegalTransitionCount} illegal faction transition(s)`);
    }
    if (f.illegalLifecycleStateCount > 0) {
      blockers.push(`${arm.label}: ${f.illegalLifecycleStateCount} lifecycle collision(s)`);
    }
    if (f.personalEventsAfterExitCount > 0) {
      blockers.push(`${arm.label}: ${f.personalEventsAfterExitCount} personalized faction event(s) after a safe exit`);
    }
    if (t.earlyOutcomes.endingsBefore18 > 0) {
      blockers.push(`${arm.label}: ${t.earlyOutcomes.endingsBefore18} ending(s) before age 18`);
    }
    if (t.earlyOutcomes.materialCommitmentsBefore18 > 0) {
      blockers.push(
        `${arm.label}: ${t.earlyOutcomes.materialCommitmentsBefore18} Material Commitment(s) before age 18`,
      );
    }
  }
  if (blockers.length > 0) {
    console.error('H2A calibration correctness FAILURES:');
    for (const blocker of blockers) console.error(`  - ${blocker}`);
    return 1;
  }
  console.log('Correctness counters: all zero in all arms.');
  return 0;
}

process.exitCode = main(process.argv.slice(2));
