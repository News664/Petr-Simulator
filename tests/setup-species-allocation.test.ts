import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { Rng } from '../src/engine/rng.js';
import { allocateStats, createRun, SetupError, type SetupPolicy } from '../src/engine/setup.js';
import { SPECIES_IDS, VISIBLE_STATS } from '../src/engine/types.js';
import { fillerEvent, fixtureContent } from './helpers/fixture.js';

/**
 * Setup flow: Core Contract section 5, plus the registered/true species
 * separation required by Acceptance section M and Contract section 21.
 */
const content = loadDefaultContent();
const fixture = fixtureContent({ events: [fillerEvent()] });

const base: SetupPolicy = {
  species: { kind: 'fixed', species: 'HUMAN' },
  talents: { kind: 'none' },
  allocation: { kind: 'seeded_random' },
};

describe('Starting allocation', () => {
  it('gives Human 21 free points and every other species 20', () => {
    expect(content.species.get('HUMAN')!.allocation_points).toBe(21);
    for (const id of SPECIES_IDS.filter((s) => s !== 'HUMAN')) {
      expect(content.species.get(id)!.allocation_points).toBe(20);
    }
  });

  it('spends exactly the species allocation within the 0-10 pre-modifier range', () => {
    const range = content.adapters.engineRules.startingAllocationRange;
    expect(range).toEqual({ min: 0, max: 10 });
    for (const species of SPECIES_IDS) {
      const points = content.species.get(species)!.allocation_points;
      for (let i = 0; i < 200; i++) {
        const rng = Rng.fromSeed(`alloc-${species}-${i}`);
        const allocation = allocateStats(rng, content, points, { kind: 'seeded_random' });
        const total = VISIBLE_STATS.reduce((sum, stat) => sum + allocation[stat], 0);
        expect(total).toBe(points);
        for (const stat of VISIBLE_STATS) {
          expect(allocation[stat]).toBeGreaterThanOrEqual(range.min);
          expect(allocation[stat]).toBeLessThanOrEqual(range.max);
        }
      }
    }
  });

  it('supports a deterministic even allocation', () => {
    const rng = Rng.fromSeed('unused');
    const allocation = allocateStats(rng, content, 21, { kind: 'even' });
    expect(VISIBLE_STATS.reduce((sum, stat) => sum + allocation[stat], 0)).toBe(21);
    expect(rng.drawCount).toBe(0);
  });

  it('rejects an explicit allocation that violates the constraints', () => {
    expect(() =>
      allocateStats(Rng.fromSeed('x'), content, 21, {
        kind: 'explicit',
        allocation: { CHR: 5, INT: 5, STR: 5, MNY: 5, SPR: 5 },
      }),
    ).toThrow(SetupError);
    expect(() =>
      allocateStats(Rng.fromSeed('x'), content, 21, {
        kind: 'explicit',
        allocation: { CHR: 11, INT: 5, STR: 5, MNY: 0, SPR: 0 },
      }),
    ).toThrow(SetupError);
  });
});

describe('Species modifiers', () => {
  it('applies registry modifiers on top of the allocation', () => {
    for (const species of SPECIES_IDS) {
      const def = content.species.get(species)!;
      const { state, setup } = createRun(`species-${species}`, fixture, {
        ...base,
        species: { kind: 'fixed', species },
      });
      for (const stat of VISIBLE_STATS) {
        expect(state.stats[stat], `${species}.${stat}`).toBe(setup.allocation[stat] + (def.modifiers[stat] ?? 0));
      }
    }
  });

  it('collapses species tendencies onto transformation family codes', () => {
    const dwarf = content.speciesFamilyTendencies.get('DWARF')!;
    expect([...dwarf.primary].sort()).toEqual(['METL', 'STON']);
    const dragon = content.speciesFamilyTendencies.get('DRAGONKIN')!;
    expect([...dragon.primary].sort()).toEqual(['CRYS', 'METL']);
    // Human has no material tendency at all.
    const human = content.speciesFamilyTendencies.get('HUMAN')!;
    expect(human.primary.size + human.secondary.size + human.uncommon.size).toBe(0);
  });

  it('lets the strongest tier win when refinement labels collapse', () => {
    // WINGED_KIN: STON_FINE is primary, CONCRETE_CRUDE is uncommon; both map to STON.
    const winged = content.speciesFamilyTendencies.get('WINGED_KIN')!;
    expect(winged.primary.has('STON')).toBe(true);
    expect(winged.uncommon.has('STON')).toBe(false);
    expect(winged.secondary.has('STON')).toBe(false);
  });

  it('never hard-locks material from a species tendency', () => {
    for (const species of SPECIES_IDS) {
      const { state } = createRun(`lock-${species}`, fixture, { ...base, species: { kind: 'fixed', species } });
      expect(state.material).toBe('NONE');
    }
  });
});

describe('Registered vs true species', () => {
  it('defaults registered species to the true species', () => {
    for (const species of SPECIES_IDS) {
      const { state } = createRun(`reg-${species}`, fixture, { ...base, species: { kind: 'fixed', species } });
      expect(state.registeredSpecies).toBe(species);
      expect(state.species).toBe(species);
    }
  });

  it('lets T1025 mark the registered species unavailable without changing biology', () => {
    const { state } = createRun('unregistered', fixture, {
      ...base,
      species: { kind: 'fixed', species: 'ELF' },
      talents: { kind: 'fixed', talents: ['T1025'] },
    });
    expect(state.species).toBe('ELF');
    expect(state.registeredSpecies).toBe('UNREGISTERED');
    // Biological tendencies still use the true species.
    expect(content.speciesFamilyTendencies.get(state.species)!.primary.has('WOOD')).toBe(true);
  });

  it('lets T1030 assign a different registered species while biology stays true', () => {
    const { state } = createRun('wrong-cert', fixture, {
      ...base,
      species: { kind: 'fixed', species: 'DWARF' },
      talents: { kind: 'fixed', talents: ['T1030'] },
    });
    expect(state.species).toBe('DWARF');
    expect(state.registeredSpecies).not.toBe('DWARF');
    expect(SPECIES_IDS).toContain(state.registeredSpecies as never);
    expect(content.speciesFamilyTendencies.get('DWARF')!.primary.has('STON')).toBe(true);
  });
});

describe('Setup ordering', () => {
  it('follows the contract order: species, draft, choose, allocate, modifiers, start talents, thresholds', () => {
    // T1002 (INT>=5 -> MNY+2) must be able to fire from a start talent's INT.
    // T1001 grants INT+2; with an allocation of INT 3 the threshold is only
    // reached after start talents, proving checkpoint 2 runs after step 7.
    const { state } = createRun('order', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1001', 'T1002'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 3, STR: 5, MNY: 5, SPR: 3 } },
    });
    expect(state.stats.INT).toBe(5);
    expect(state.triggeredTalents.has('T1002')).toBe(true);
    expect(state.stats.MNY).toBe(7);
  });

  it('begins life at age 0 with an empty timeline', () => {
    const { state } = createRun('age-zero', fixture, base);
    expect(state.age).toBe(0);
    expect(state.history).toHaveLength(0);
    expect(state.ending).toBeNull();
  });

  it('drafts 10 talents even when the scenario selects none', () => {
    const { setup } = createRun('draft-none', fixture, base);
    expect(setup.draftedTalents).toHaveLength(10);
    expect(setup.chosenTalents).toHaveLength(0);
  });
});
