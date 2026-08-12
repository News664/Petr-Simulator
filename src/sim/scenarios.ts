import type { SetupPolicy } from '../engine/setup.js';
import type { SpeciesId } from '../engine/types.js';

/**
 * Diagnostic talent scenarios.
 *
 * Names come from `diagnosticSampling.talentScenarios` in the provisional
 * balance constants. Uniform talent sampling is explicitly diagnostic: final
 * rarity/meta draw distributions are not frozen.
 *
 * Targeted scenarios pick concrete, mutually compatible talents that exercise
 * the mechanic named by the scenario. They are simulation inputs, not design.
 */

export interface ScenarioDef {
  id: string;
  label: string;
  description: string;
  talents: SetupPolicy['talents'];
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'NO_TALENTS_BASELINE',
    label: 'no-talents',
    description: 'No talents selected. Isolates content and balance from talent effects.',
    talents: { kind: 'none' },
  },
  {
    id: 'UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC',
    label: 'uniform-three',
    description: 'Three mutually compatible talents drawn uniformly from a 10-talent draft.',
    talents: { kind: 'seeded_random_compatible' },
  },
  {
    id: 'TARGETED_THRESHOLD_TALENT_CASES',
    label: 'threshold-talents',
    description: 'All three chosen talents are threshold_once, exercising mid-life activation.',
    talents: { kind: 'fixed', talents: ['T1002', 'T1007', 'T1017'] },
  },
  {
    id: 'TARGETED_MATERIAL_TALENT_CASES',
    label: 'material-talents',
    description: 'Talents carrying material/route family hooks (stone, metal, museum).',
    talents: { kind: 'fixed', talents: ['T1011', 'T1021', 'T1018'] },
  },
  {
    id: 'TARGETED_ANOMALOUS_TALENT_CASES',
    label: 'anomalous-talents',
    description: 'Hidden-FIX, anomalous-continuity and registration-anomaly talents.',
    talents: { kind: 'fixed', talents: ['T1027', 'T1028', 'T1030'] },
  },
];

export function findScenario(nameOrId: string): ScenarioDef | undefined {
  const needle = nameOrId.trim().toLowerCase();
  return SCENARIOS.find((s) => s.id.toLowerCase() === needle || s.label.toLowerCase() === needle);
}

export function scenarioNames(): string[] {
  return SCENARIOS.map((s) => s.label);
}

export interface RunPlanEntry {
  runIndex: number;
  seed: string;
  species: SpeciesId | null;
}
