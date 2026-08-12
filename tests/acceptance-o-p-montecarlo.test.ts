import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { REPO_ROOT, loadDefaultContent } from '../src/engine/content/load.js';
import { aggregate } from '../src/sim/metrics.js';
import { runScenario, runSeed } from '../src/sim/runner.js';
import { renderMarkdownReport, type SimulationReport } from '../src/sim/report.js';
import { SCENARIOS, findScenario, scenarioNames } from '../src/sim/scenarios.js';
import { runSimulation } from '../src/engine/simulation.js';

/**
 * Acceptance O — Monte Carlo CLI.
 * Acceptance P — required Monte Carlo metrics.
 */
const content = loadDefaultContent();

function runCli(args: string[]): string {
  return execFileSync(
    process.execPath,
    [path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs'), path.join(REPO_ROOT, 'src', 'cli', 'simulate.ts'), ...args],
    { encoding: 'utf8', cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

describe('O. Monte Carlo CLI', () => {
  const outDir = mkdtempSync(path.join(tmpdir(), 'solid-state-reports-'));

  it('accepts run count, base seed and scenario, and writes both outputs', () => {
    const stdout = runCli([
      '--runs', '25',
      '--seed', '12345',
      '--scenario', 'no-talents',
      '--pre25-coverage', 'reuse_baseline_repeatables',
      '--out', outDir,
      '--name', 'cli-basic',
      '--quiet',
    ]);
    expect(stdout).toContain('cli-basic.json');
    expect(stdout).toContain('cli-basic.md');

    const json = JSON.parse(readFileSync(path.join(outDir, 'cli-basic.json'), 'utf8')) as SimulationReport;
    expect(json.scenarios).toHaveLength(1);
    expect(json.scenarios[0]!.scenarioLabel).toBe('no-talents');
    expect(json.scenarios[0]!.options.runs).toBe(25);
    expect(json.scenarios[0]!.options.baseSeed).toBe('12345');
    expect(json.contentVersion).toBe(content.contentVersion);

    const md = readFileSync(path.join(outDir, 'cli-basic.md'), 'utf8');
    expect(md).toContain('# SOLID STATE — Phase-1 Monte Carlo Report');
    expect(md).toContain('Scenario `no-talents`');
  });

  it('accepts a balance constants path', () => {
    const balancePath = path.join(REPO_ROOT, 'content', 'balance', 'SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json');
    const adaptersPath = path.join(REPO_ROOT, 'content', 'balance', 'SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json');
    const stdout = runCli([
      '--runs', '10',
      '--scenario', 'no-talents',
      '--balance', balancePath,
      '--adapters', adaptersPath,
      '--out', outDir,
      '--name', 'cli-balance',
      '--quiet',
    ]);
    expect(stdout).toContain('cli-balance.json');
    const json = JSON.parse(readFileSync(path.join(outDir, 'cli-balance.json'), 'utf8')) as SimulationReport;
    expect(json.balanceVersion).toBe('0.1');
    expect(json.adaptersVersion).toBe('0.1');
  });

  it('supports species-stratified mode', () => {
    const report = runScenario(content, SCENARIOS[0]!, {
      runs: 12,
      baseSeed: 'strat',
      speciesStratified: true,
    });
    expect(report.options.speciesStratified).toBe(true);
    const counts = report.metrics.finalMaterialBySpecies;
    const perSpecies = Object.values(counts).map((c) => Object.values(c).reduce((a, b) => a + b, 0));
    // 12 runs over 6 species: exactly two each.
    expect(perSpecies).toEqual([2, 2, 2, 2, 2, 2]);
  });

  it('supports pinning one species', () => {
    const stdout = runCli([
      '--runs', '8',
      '--scenario', 'no-talents',
      '--species', 'DWARF',
      '--out', outDir,
      '--name', 'cli-species',
      '--quiet',
    ]);
    expect(stdout).toContain('cli-species.json');
    const json = JSON.parse(readFileSync(path.join(outDir, 'cli-species.json'), 'utf8')) as SimulationReport;
    expect(json.scenarios[0]!.options.fixedSpecies).toBe('DWARF');
    const bySpecies = json.scenarios[0]!.metrics.finalMaterialBySpecies;
    const dwarfRuns = Object.values(bySpecies['DWARF']!).reduce((a, b) => a + b, 0);
    expect(dwarfRuns).toBe(8);
  });

  it('supports talent scenario selection, including every registered scenario', () => {
    const declared = content.balance.diagnosticSampling.talentScenarios;
    expect(SCENARIOS.map((s) => s.id).sort()).toEqual([...declared].sort());
    for (const name of scenarioNames()) {
      expect(findScenario(name)).toBeDefined();
    }
    const stdout = runCli([
      '--runs', '5',
      '--scenario', 'all',
      '--pre25-coverage', 'reuse_baseline_repeatables',
      '--out', outDir,
      '--name', 'cli-all',
      '--quiet',
    ]);
    expect(stdout).toContain('cli-all.json');
    const json = JSON.parse(readFileSync(path.join(outDir, 'cli-all.json'), 'utf8')) as SimulationReport;
    expect(json.scenarios).toHaveLength(SCENARIOS.length);
  });

  it('rejects an unknown scenario instead of silently defaulting', () => {
    expect(() => runCli(['--runs', '2', '--scenario', 'nope', '--out', outDir, '--quiet'])).toThrow();
  });

  it('shows help', () => {
    expect(runCli(['--help'])).toContain('headless Monte Carlo simulator');
  });

  it('is reproducible: the same base seed produces the same report', () => {
    const first = runScenario(content, SCENARIOS[1]!, { runs: 20, baseSeed: 'repro', speciesStratified: true });
    const second = runScenario(content, SCENARIOS[1]!, { runs: 20, baseSeed: 'repro', speciesStratified: true });
    expect(JSON.stringify(first.metrics)).toBe(JSON.stringify(second.metrics));
  });

  it('derives a deterministic per-run seed', () => {
    expect(runSeed('base', 'SCEN', 7)).toBe('base|SCEN|7');
    const a = runSimulation(runSeed('base', 'SCEN', 7), content, SCENARIOS[0]!.talents ? {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: SCENARIOS[0]!.talents,
      allocation: { kind: 'seeded_random' },
    } : { species: { kind: 'seeded_random' }, talents: { kind: 'none' }, allocation: { kind: 'even' } });
    const b = runSimulation(runSeed('base', 'SCEN', 7), content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: SCENARIOS[0]!.talents,
      allocation: { kind: 'seeded_random' },
    });
    expect(a.state.history.map((h) => h.eventId)).toEqual(b.state.history.map((h) => h.eventId));
  });
});

describe('P. Required Monte Carlo metrics', () => {
  const report = runScenario(
    { ...content, adapters: { ...content.adapters, engineRules: { ...content.adapters.engineRules, pre25CoveragePolicy: 'reuse_baseline_repeatables' } } },
    SCENARIOS[1]!,
    { runs: 400, baseSeed: 'metrics', speciesStratified: true },
  );
  const m = report.metrics;

  it('reports completed vs nonterminal rate', () => {
    expect(m.completed + m.nonterminal + m.coverageErrors).toBe(m.runs);
    expect(m.completedRate + m.nonterminalRate + m.coverageErrorRate).toBeCloseTo(1, 10);
  });

  it('reports an ending age histogram and target buckets', () => {
    expect(m.endingAgeHistogram).toBeTypeOf('object');
    expect(m.endingAgeShareByTargetBucket).toHaveLength(content.balance.targetEndingAgeShare.length);
    for (const bucket of m.endingAgeShareByTargetBucket) {
      expect(bucket).toHaveProperty('observedShare');
      expect(bucket).toHaveProperty('targetMin');
      expect(bucket).toHaveProperty('withinTarget');
    }
  });

  it('reports average/median ending age and average run length', () => {
    expect(m).toHaveProperty('averageEndingAge');
    expect(m).toHaveProperty('medianEndingAge');
    expect(m.averageRunLengthYears).toBeGreaterThan(0);
  });

  it('reports channel and family counts by age band', () => {
    const bands = content.balance.ageChannelWeights.length;
    expect(Object.keys(m.channelCountsByAgeBand)).toHaveLength(bands);
    expect(Object.keys(m.familyCountsByAgeBand)).toHaveLength(bands);
    const totalByChannel = Object.values(m.channelCountsByAgeBand).reduce(
      (sum, counts) => sum + counts.ORD + counts.INS + counts.TRN + counts.SPC,
      0,
    );
    expect(totalByChannel).toBe(m.totalEventYears);
  });

  it('reports fallback use rate', () => {
    expect(m.fallbackUseRate).toBeGreaterThanOrEqual(0);
    expect(m.fallbackUseRate).toBeLessThanOrEqual(1);
    expect(m.pre25FallbackYears).toBe(0);
  });

  it('reports route entry, climax and abandonment/expiry rates', () => {
    for (const key of ['routeEntryRate', 'routeClimaxRate', 'routeAbandonmentRate'] as const) {
      expect(m[key]).toBeGreaterThanOrEqual(0);
      expect(m[key]).toBeLessThanOrEqual(1);
    }
    expect(m.routeEntryRate).toBeGreaterThan(0);
    expect(Object.keys(m.routeEntryCountsByRoute).length).toBeGreaterThan(0);
    expect(m.expiredScheduleCount).toBeGreaterThan(0);
  });

  it('reports schedule collision and displacement rates', () => {
    expect(m.priorityCollisionRate).toBeGreaterThanOrEqual(0);
    expect(m.priorityCollisionYears).toBeGreaterThanOrEqual(0);
    expect(m.scheduleDisplacementPerRun).toBeGreaterThanOrEqual(0);
  });

  it('reports final material distribution overall and by species', () => {
    const total = Object.values(m.finalMaterialDistribution).reduce((a, b) => a + b, 0);
    expect(total).toBe(m.runs);
    expect(Object.keys(m.finalMaterialBySpecies)).toHaveLength(6);
    expect(m.materialEntropyBitsOverall).toBeGreaterThan(0);
    for (const value of Object.values(m.materialEntropyBitsBySpecies)) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it('reports P(final X | hint X) and P(final X | first manifestation X)', () => {
    expect(Object.keys(m.pFinalGivenFirstManifestation).length).toBeGreaterThan(0);
    for (const stats of Object.values(m.pFinalGivenFirstManifestation)) {
      expect(stats.probability).toBeGreaterThanOrEqual(0);
      expect(stats.probability).toBeLessThanOrEqual(1);
      expect(stats.sameMaterial).toBeLessThanOrEqual(stats.manifestationRuns);
    }
    for (const stats of Object.values(m.pFinalGivenHint)) {
      expect(stats.sameMaterial).toBeLessThanOrEqual(stats.hintRuns);
    }
  });

  it('reports multiple-manifestation rate and average hint/manifestation/commitment ages', () => {
    expect(m.multipleManifestationBeforeCommitmentRate).toBeGreaterThan(0);
    expect(m.averageFirstManifestationAge).toBeGreaterThan(0);
    expect(m).toHaveProperty('averageHintAge');
    expect(m).toHaveProperty('averageCommitmentAge');
  });

  it('reports talent activation rate and activation age', () => {
    expect(Object.keys(m.talentActivationRate).length).toBeGreaterThan(0);
    for (const [talentId, activationRate] of Object.entries(m.talentActivationRate)) {
      expect(activationRate, talentId).toBeGreaterThanOrEqual(0);
      expect(content.talents.has(talentId)).toBe(true);
    }
    expect(Object.keys(m.talentActivationAverageAge).length).toBe(Object.keys(m.talentActivationRate).length);
  });

  it('reports ending distribution and distinct ending coverage', () => {
    expect(m.distinctEndingsInRegistry).toBe(24);
    expect(m.distinctEndingsObserved).toBe(Object.keys(m.endingDistribution).length);
    expect(m.endingCoverageShare).toBeCloseTo(m.distinctEndingsObserved / 24, 10);
    expect(m.rareEndingRate).toBeGreaterThanOrEqual(0);
    expect(m.hiddenEndingRate).toBeGreaterThanOrEqual(0);
  });

  it('surfaces guardrail findings rather than tuning content', () => {
    expect(Array.isArray(m.guardrails)).toBe(true);
    for (const finding of m.guardrails) {
      expect(['warning', 'failure']).toContain(finding.severity);
      expect(finding.message.length).toBeGreaterThan(0);
    }
  });

  it('renders a Markdown report covering every required metric heading', () => {
    const rendered = renderMarkdownReport(content, {
      generatedAt: '2026-01-01T00:00:00.000Z',
      contentVersion: content.contentVersion,
      balanceVersion: content.balance.version,
      adaptersVersion: content.adapters.version,
      sourceFiles: content.sourceFiles,
      scenarios: [report],
    });
    for (const heading of [
      'Outcome rates',
      'Ending age',
      'Channel counts by age band',
      'Family counts by age band',
      'Fallback and coverage',
      'Routes, schedules and priority',
      'Material',
      'Talents',
      'Endings',
      'Final stats',
      'Guardrail findings',
    ]) {
      expect(rendered, heading).toContain(heading);
    }
  });

  it('aggregates an empty result set without throwing', () => {
    const empty = aggregate(content, []);
    expect(empty.runs).toBe(0);
    expect(empty.averageEndingAge).toBeNull();
    expect(empty.completedRate).toBe(0);
  });
});
