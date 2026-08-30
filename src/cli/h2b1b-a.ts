#!/usr/bin/env node
/**
 * H2B.1B Part A diagnostic.
 *
 *   npm run h2b1b:a
 *   npm run h2b1b:a -- --runs 200 --targeted-runs 60 --quiet   # smoke run
 *   npm run h2b1b:a -- --baseline reports/prepatch.json          # compare
 *
 * One general arm plus six targeted allocation arms, per
 * `03_PART_A_DIAGNOSTIC_AND_ACCEPTANCE.md`. Sampling for the general arm
 * matches the H2B.1A regression exactly (species stratified, uniform-three
 * talents, ARCHETYPE_SET, uniform family weighting, max age 120) so the two are
 * comparable; the targeted arms swap only the allocation policy.
 *
 * Writes `reports/h2b1b-a-regression.{json,md}`.
 *
 * The run seed is `contentVersion:seed`, so a pre-patch run cannot be
 * reproduced once canonical content changes. `--baseline` therefore takes the
 * JSON that run wrote, and the report records both fingerprints.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
import { explicitAllocationFor, H2b1bAccumulator, median, spearman } from '../sim/h2b1bDiagnostic.js';
import {
  baselineFrom,
  evaluateBands,
  renderH2b1bReport,
  type BaselineReference,
  type H2b1bArm,
  type H2b1bPayload,
} from '../sim/h2b1bReport.js';
import { runScenario } from '../sim/runner.js';
import { findScenario } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — H2B.1B Part A diagnostic

Usage:
  npm run h2b1b:a -- [options]

Options:
  --runs <n>           General-arm run count (default 4000)
  --targeted-runs <n>  Per targeted allocation arm (default 600)
  --seed <string>      Base seed (default "h2b1b_a")
  --baseline <file>    Earlier payload JSON to compare against
  --out <dir>          Output directory (default ./reports)
  --name <stem>        Output file stem (default "h2b1b-a-regression")
  --quiet              Suppress progress output
  --help               Show this help
`.trim();

const SAMPLING = {
  runs: 4000,
  targetedRuns: 600,
  speciesMode: 'STRATIFY_EQUALLY_BY_SPECIES',
  talentScenario: 'UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC',
  generalAllocationPolicy: 'ARCHETYPE_SET',
  familyWeightMode: 'uniform',
  maxAge: 120,
} as const;

/**
 * Targeted arms, exactly as the acceptance plan states them. Each totals 20
 * points before species modifiers.
 */
const TARGETED_ARMS: { id: string; label: string; allocation: Record<VisibleStat, number> }[] = [
  { id: 'int-0', label: 'allocation INT 0', allocation: { CHR: 4, INT: 0, STR: 3, MNY: 10, SPR: 3 } },
  { id: 'int-5', label: 'allocation INT 5', allocation: { CHR: 4, INT: 5, STR: 3, MNY: 5, SPR: 3 } },
  { id: 'int-10', label: 'allocation INT 10', allocation: { CHR: 4, INT: 10, STR: 3, MNY: 0, SPR: 3 } },
  { id: 'chr-0', label: 'allocation CHR 0', allocation: { CHR: 0, INT: 4, STR: 3, MNY: 10, SPR: 3 } },
  { id: 'chr-5', label: 'allocation CHR 5', allocation: { CHR: 5, INT: 4, STR: 3, MNY: 5, SPR: 3 } },
  { id: 'chr-10', label: 'allocation CHR 10', allocation: { CHR: 10, INT: 4, STR: 3, MNY: 0, SPR: 3 } },
];

function loadBaseline(file: string): BaselineReference {
  const payload = JSON.parse(readFileSync(file, 'utf8')) as H2b1bPayload;
  return baselineFrom(payload);
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
      console.error('Content validation FAILED; refusing to run the H2B.1B Part A diagnostic.');
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
  const targetedRuns = intFlag(args, 'targeted-runs', 0) || SAMPLING.targetedRuns;
  const baseSeed = stringFlag(args, 'seed', 'h2b1b_a');
  const quiet = boolFlag(args, 'quiet');
  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  const stem = stringFlag(args, 'name', 'h2b1b-a-regression');
  const baselineFile = optionalStringFlag(args, 'baseline');
  mkdirSync(outDir, { recursive: true });

  const arms: H2b1bArm[] = [];
  const accumulators = new Map<string, H2b1bAccumulator>();

  // --- General arm ----------------------------------------------------------
  if (!quiet) process.stderr.write(`h2b1b-a: general arm (${runs} runs)\n`);
  const general = new H2b1bAccumulator(content);
  runScenario(content, scenario, {
    runs,
    baseSeed: `${baseSeed}|general`,
    speciesStratified: true,
    allocation: {
      kind: 'archetype',
      archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as VisibleStat[]),
    },
    maxAge: SAMPLING.maxAge,
    hooks: { onBeforeYear: (state) => general.beforeYear(state) },
    onRun: (result) => general.add(result),
  });
  accumulators.set('general', general);
  arms.push({
    id: 'general',
    label: 'general population (ARCHETYPE_SET)',
    runs,
    allocation: null,
    summary: general.summary(),
  });

  // --- Targeted allocation arms --------------------------------------------
  // Every targeted arm shares one base seed, and `explicit` allocation consumes
  // no RNG, so species and drafted/chosen talents are identical run-for-run
  // across the six arms. Only the allocation differs.
  for (const targeted of TARGETED_ARMS) {
    if (!quiet) process.stderr.write(`h2b1b-a: ${targeted.label} (${targetedRuns} runs)\n`);
    const accumulator = new H2b1bAccumulator(content, {
      includeContributors: false,
      includeFactions: false,
    });
    runScenario(content, scenario, {
      runs: targetedRuns,
      baseSeed: `${baseSeed}|targeted`,
      speciesStratified: true,
      allocation: { kind: 'explicit', allocation: targeted.allocation },
      maxAge: SAMPLING.maxAge,
      hooks: { onBeforeYear: (state) => accumulator.beforeYear(state) },
      onRun: (result) => accumulator.add(result),
      // Human has 21 free points to the other species' 20; the spare one goes to
      // STR so the arm's own stat is untouched.
      allocationOverride: (species) =>
        explicitAllocationFor(targeted.allocation, content.species.get(species)!.allocation_points),
    });
    accumulators.set(targeted.id, accumulator);
    arms.push({
      id: targeted.id,
      label: targeted.label,
      runs: targetedRuns,
      allocation: targeted.allocation,
      summary: accumulator.summary(),
    });
  }

  // --- Derived --------------------------------------------------------------
  const combined = (stat: VisibleStat, ids: string[]): (readonly [number, number])[] =>
    ids.flatMap((id) => [...(accumulators.get(id)?.pairs(stat) ?? [])]);
  const medianAge18 = (id: string, stat: VisibleStat): number | null => {
    const pairs = accumulators.get(id)?.pairs(stat) ?? [];
    return median(pairs.map(([, value]) => value));
  };
  const gap = (low: string, high: string, stat: VisibleStat): number | null => {
    const a = medianAge18(low, stat);
    const b = medianAge18(high, stat);
    return a === null || b === null ? null : b - a;
  };

  const payload: H2b1bPayload = {
    generatedAt: new Date().toISOString(),
    contentVersion: content.contentVersion,
    balanceVersion: content.balance.version,
    baseSeed,
    sampling: { ...SAMPLING, runs, targetedRuns },
    arms,
    derived: {
      intSpearman: spearman(combined('INT', ['int-0', 'int-5', 'int-10'])),
      chrSpearman: spearman(combined('CHR', ['chr-0', 'chr-5', 'chr-10'])),
      intMedianGap0to10: gap('int-0', 'int-10', 'INT'),
      chrMedianGap0to10: gap('chr-0', 'chr-10', 'CHR'),
    },
    baseline: baselineFile ? loadBaseline(path.resolve(baselineFile)) : null,
  };

  const jsonPath = path.join(outDir, `${stem}.json`);
  const mdPath = path.join(outDir, `${stem}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderH2b1bReport(content, payload), 'utf8');
  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  const bands = evaluateBands(payload);
  for (const row of bands) {
    if (row.verdict === 'PASS' || row.verdict === 'MEASURED') continue;
    console.log(`${row.verdict.padEnd(6)} ${row.id} ${row.description}: ${row.measured} (want ${row.target})`);
  }
  const failures = bands.filter((row) => row.verdict === 'FAIL');
  if (failures.length > 0) {
    console.error(`H2B.1B Part A: ${failures.length} FAIL band(s).`);
    return 1;
  }
  const reviews = bands.filter((row) => row.verdict === 'REVIEW');
  console.log(
    reviews.length === 0
      ? 'All review bands PASS; correctness counters all zero.'
      : `${reviews.length} band(s) need review; no FAIL. Correctness counters all zero.`,
  );
  return 0;
}

process.exitCode = main(process.argv.slice(2));
