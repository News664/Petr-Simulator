#!/usr/bin/env node
/**
 * Headless Monte Carlo CLI.
 *
 *   npm run simulate -- --runs 10000 --scenario no-talents --seed 12345
 *   npm run simulate -- --runs 2000 --scenario all --species-stratified
 *   npm run simulate -- --runs 500 --balance ./my-balance.json --adapters ./my-adapters.json
 *
 * Emits a machine-readable JSON summary and a human-readable Markdown report.
 * Reports measurements only; it never tunes content or balance.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ContentValidationError,
  defaultContentPaths,
  loadContent,
  REPO_ROOT,
  type ContentPaths,
} from '../engine/content/load.js';
import { SPECIES_IDS, type SpeciesId } from '../engine/types.js';
import { renderMarkdownReport, type SimulationReport } from '../sim/report.js';
import { runScenario, type ScenarioReport } from '../sim/runner.js';
import { findScenario, SCENARIOS, scenarioNames } from '../sim/scenarios.js';
import { boolFlag, intFlag, optionalStringFlag, parseArgs, stringFlag } from './args.js';

const USAGE = `
SOLID STATE — headless Monte Carlo simulator

Usage:
  npm run simulate -- [options]

Options:
  --runs <n>              Runs per scenario (default: balance defaultRunsPerScenario)
  --seed <string>         Base seed; identical seeds reproduce identical runs (default: "phase1")
  --scenario <name|all>   Talent scenario (default: all)
                          ${scenarioNames().join(', ')}
  --species <ID>          Pin every run to one species (${SPECIES_IDS.join(', ')})
  --species-stratified    Stratify runs equally across species (default: on unless --species)
  --balance <path>        Balance constants JSON
  --adapters <path>       Balance adapters JSON
  --content <dir>         Content root (default: ./content)
  --max-age <n>           Diagnostic maximum age (default: balance diagnosticSimulation.maxAge)
  --out <dir>             Output directory (default: ./reports)
  --name <prefix>         Output file prefix (default: monte-carlo)
  --quiet                 Suppress progress output
  --help                  Show this help
`.trim();

function main(argv: string[]): number {
  const args = parseArgs(argv);
  if (boolFlag(args, 'help')) {
    console.log(USAGE);
    return 0;
  }

  const contentRoot = optionalStringFlag(args, 'content');
  const paths: ContentPaths = contentRoot ? defaultContentPaths(contentRoot) : defaultContentPaths();
  const balanceOverride = optionalStringFlag(args, 'balance');
  const adaptersOverride = optionalStringFlag(args, 'adapters');
  if (balanceOverride) paths.balanceConstants = path.resolve(balanceOverride);
  if (adaptersOverride) paths.balanceAdapters = path.resolve(adaptersOverride);

  let content;
  try {
    content = loadContent(paths);
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED; refusing to simulate.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const runs = intFlag(args, 'runs', content.balance.diagnosticSimulation.defaultRunsPerScenario);
  if (runs < 1) {
    console.error('--runs must be at least 1');
    return 2;
  }
  const baseSeed = stringFlag(args, 'seed', 'phase1');
  const maxAge = intFlag(args, 'max-age', content.balance.diagnosticSimulation.maxAge);

  const speciesFlag = optionalStringFlag(args, 'species');
  let fixedSpecies: SpeciesId | undefined;
  if (speciesFlag) {
    const upper = speciesFlag.toUpperCase() as SpeciesId;
    if (!SPECIES_IDS.includes(upper)) {
      console.error(`--species must be one of ${SPECIES_IDS.join(', ')}`);
      return 2;
    }
    fixedSpecies = upper;
  }
  // diagnosticSampling.speciesMode is STRATIFY_EQUALLY_BY_SPECIES, so stratify
  // by default unless a single species was pinned.
  const speciesStratified = fixedSpecies ? false : boolFlag(args, 'species-stratified') || !args.flags.has('species-stratified');

  const scenarioArg = stringFlag(args, 'scenario', 'all');
  const scenarios =
    scenarioArg.toLowerCase() === 'all'
      ? SCENARIOS
      : (() => {
          const found = findScenario(scenarioArg);
          if (!found) {
            console.error(`unknown scenario ${JSON.stringify(scenarioArg)}; expected one of: all, ${scenarioNames().join(', ')}`);
            return null;
          }
          return [found];
        })();
  if (!scenarios) return 2;

  const quiet = boolFlag(args, 'quiet');
  const reports: ScenarioReport[] = [];
  for (const scenario of scenarios) {
    if (!quiet) process.stderr.write(`running ${scenario.label} (${runs} runs)... `);
    const started = Date.now();
    reports.push(
      runScenario(content, scenario, { runs, baseSeed, speciesStratified, fixedSpecies, maxAge }),
    );
    if (!quiet) process.stderr.write(`${((Date.now() - started) / 1000).toFixed(1)}s\n`);
  }

  const report: SimulationReport = {
    generatedAt: new Date().toISOString(),
    contentVersion: content.contentVersion,
    balanceVersion: content.balance.version,
    adaptersVersion: content.adapters.version,
    sourceFiles: content.sourceFiles,
    scenarios: reports,
  };

  const outDir = path.resolve(optionalStringFlag(args, 'out') ?? path.join(REPO_ROOT, 'reports'));
  mkdirSync(outDir, { recursive: true });
  const prefix = stringFlag(args, 'name', 'monte-carlo');
  const jsonPath = path.join(outDir, `${prefix}.json`);
  const mdPath = path.join(outDir, `${prefix}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, renderMarkdownReport(content, report), 'utf8');

  console.log(`JSON summary:    ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  const failures = reports.flatMap((scenario) =>
    scenario.metrics.guardrails.filter((finding) => finding.severity === 'failure'),
  );
  if (failures.length > 0) {
    console.log('');
    console.log(`Guardrail failures: ${failures.length}`);
    for (const finding of failures) console.log(`  - ${finding.id}: ${finding.message}`);
  }
  // Guardrail findings describe content/balance state, not tool failure, so the
  // CLI still exits 0. Design review decides what to do about them.
  return 0;
}

process.exitCode = main(process.argv.slice(2));
