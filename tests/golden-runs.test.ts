import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { REPO_ROOT, loadDefaultContent } from '../src/engine/content/load.js';
import { runSimulation } from '../src/engine/simulation.js';
import type { SetupPolicy } from '../src/engine/setup.js';
import { SPECIES_IDS } from '../src/engine/types.js';

/**
 * Golden runs.
 *
 * Acceptance B recommends a snapshot test over several known seeds. The golden
 * file pins the full timeline, setup and outcome so any behavioural drift in
 * drafting, scheduling, talents, material or endings shows up as a diff.
 *
 * Regenerate deliberately with UPDATE_GOLDEN=1 when a change is intended; the
 * diff is then the review artifact.
 */
const content = loadDefaultContent();
const GOLDEN_PATH = path.join(REPO_ROOT, 'tests', '__golden__', 'runs.json');

const SEEDS = ['golden-a', 'golden-b', 'golden-c', 'golden-d', 'golden-e', '12345'];

interface GoldenRun {
  seed: string;
  species: string;
  chosenTalents: string[];
  allocation: Record<string, number>;
  outcome: string;
  endingId: string | null;
  endingAge: number | null;
  primaryMaterial: string;
  priorMaterials: string[];
  awareness: string | null;
  finalStats: Record<string, number>;
  years: number;
  timeline: string[];
  flags: string[];
}

function goldenRun(seed: string, species: (typeof SPECIES_IDS)[number]): GoldenRun {
  const policy: SetupPolicy = {
    species: { kind: 'fixed', species },
    talents: { kind: 'seeded_random_compatible' },
    allocation: { kind: 'seeded_random' },
  };
  const result = runSimulation(seed, content, policy);
  const ending = result.outcome.kind === 'ended' ? result.outcome.ending : null;
  return {
    seed,
    species,
    chosenTalents: result.setup.chosenTalents,
    allocation: result.setup.allocation,
    outcome: result.outcome.kind,
    endingId: ending?.endingId ?? null,
    endingAge: ending?.endingAge ?? null,
    primaryMaterial: result.state.material,
    priorMaterials: result.state.priorMaterials,
    awareness: ending?.awareness ?? null,
    finalStats: { ...result.state.stats },
    years: result.state.history.length,
    timeline: result.state.history.map((h) => `${h.age}:${h.eventId}#${h.variantIndex}:${h.source}`),
    flags: [...result.state.flags].sort(),
  };
}

function buildGolden(): { contentVersion: string; runs: GoldenRun[] } {
  const runs: GoldenRun[] = [];
  for (const seed of SEEDS) {
    for (const species of SPECIES_IDS) {
      runs.push(goldenRun(`${seed}/${species}`, species));
    }
  }
  return { contentVersion: content.contentVersion, runs };
}

describe('Golden runs', () => {
  const current = buildGolden();

  if (process.env['UPDATE_GOLDEN'] === '1' || !existsSync(GOLDEN_PATH)) {
    mkdirSync(path.dirname(GOLDEN_PATH), { recursive: true });
    writeFileSync(GOLDEN_PATH, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
  }

  const golden = JSON.parse(readFileSync(GOLDEN_PATH, 'utf8')) as { contentVersion: string; runs: GoldenRun[] };

  it('matches the committed content fingerprint', () => {
    expect(current.contentVersion).toBe(golden.contentVersion);
  });

  it('covers every seed and species', () => {
    expect(current.runs).toHaveLength(SEEDS.length * SPECIES_IDS.length);
    expect(golden.runs).toHaveLength(current.runs.length);
  });

  for (let i = 0; i < SEEDS.length * SPECIES_IDS.length; i++) {
    it(`reproduces golden run ${i}`, () => {
      expect(current.runs[i]).toEqual(golden.runs[i]);
    });
  }

  it('is stable across repeated generation', () => {
    expect(buildGolden()).toEqual(current);
  });
});
