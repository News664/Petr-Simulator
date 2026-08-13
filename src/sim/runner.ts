import type { ContentBundle } from '../engine/content/load.js';
import { runSimulation, type RunResult } from '../engine/simulation.js';
import type { AllocationPolicy, SetupPolicy } from '../engine/setup.js';
import { SPECIES_IDS, type SpeciesId } from '../engine/types.js';
import { aggregate, type MetricsSummary } from './metrics.js';
import type { ScenarioDef } from './scenarios.js';

export interface ScenarioRunOptions {
  runs: number;
  baseSeed: string;
  /** Allocation policy (Q-17). Defaults to BALANCED_RANDOM_FILL. */
  allocation?: AllocationPolicy;
  /** Equal stratification across species, per diagnosticSampling.speciesMode. */
  speciesStratified: boolean;
  /** Pin every run to one species. Overrides stratification. */
  fixedSpecies?: SpeciesId;
  maxAge?: number;
  /** Retain full run results. Off by default to keep memory flat at high run counts. */
  keepRuns?: boolean;
}

export interface ScenarioReport {
  scenarioId: string;
  scenarioLabel: string;
  scenarioDescription: string;
  options: {
    runs: number;
    baseSeed: string;
    speciesStratified: boolean;
    fixedSpecies: SpeciesId | null;
    maxAge: number;
    familyWeightMode: string;
  };
  metrics: MetricsSummary;
  /** Present only when keepRuns is set. */
  runs?: RunResult[];
}

/** Deterministic seed for one run. Same base seed => same set of runs. */
export function runSeed(baseSeed: string, scenarioId: string, index: number): string {
  return `${baseSeed}|${scenarioId}|${index}`;
}

export function runScenario(
  content: ContentBundle,
  scenario: ScenarioDef,
  options: ScenarioRunOptions,
): ScenarioReport {
  const maxAge = options.maxAge ?? content.balance.diagnosticSimulation.maxAge;
  const results: RunResult[] = [];

  for (let index = 0; index < options.runs; index++) {
    let species: SetupPolicy['species'];
    if (options.fixedSpecies) {
      species = { kind: 'fixed', species: options.fixedSpecies };
    } else if (options.speciesStratified) {
      species = { kind: 'fixed', species: SPECIES_IDS[index % SPECIES_IDS.length]! };
    } else {
      species = { kind: 'seeded_random' };
    }

    const policy: SetupPolicy = {
      species,
      talents: scenario.talents,
      allocation: options.allocation ?? { kind: 'seeded_random' },
    };

    results.push(runSimulation(runSeed(options.baseSeed, scenario.id, index), content, policy, { maxAge }));
  }

  const metrics = aggregate(content, results);
  const report: ScenarioReport = {
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    scenarioDescription: scenario.description,
    options: {
      runs: options.runs,
      baseSeed: options.baseSeed,
      speciesStratified: options.speciesStratified,
      fixedSpecies: options.fixedSpecies ?? null,
      maxAge,
      familyWeightMode: content.balance.familyWeightMode,
    },
    metrics,
  };
  if (options.keepRuns) report.runs = results;
  return report;
}
