import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { materialLockAllows, isEligible } from '../src/engine/eligibility.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';
import type { GameEvent } from '../src/engine/types.js';

/**
 * Acceptance J — EVT / AEVT.
 * Acceptance K — material continuity.
 */
const content = loadDefaultContent();

const base: SetupPolicy = {
  species: { kind: 'fixed', species: 'HUMAN' },
  talents: { kind: 'none' },
  allocation: { kind: 'even' },
};

const filler = (exclude = 'FALSE'): GameEvent => event({ id: 'EVT-ORD-GEN-9000', exclude });

describe('J. EVT / AEVT', () => {
  it('EVT sees events from the active run', () => {
    const first = event({
      id: 'EVT-ORD-FAM-9101',
      family: 'FAM',
      age: { min: 0, max: 0 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const gated = event({
      id: 'EVT-ORD-FAM-9102',
      family: 'FAM',
      age: { min: 1, max: null },
      include: 'EVT[EVT-ORD-FAM-9101]',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [first, gated, filler('AGE<=1')] });
    const result = runSimulation('evt', fixture, base, { maxAge: 5 });
    expect(result.state.history[0]!.eventId).toBe('EVT-ORD-FAM-9101');
    expect(result.state.history[1]!.eventId).toBe('EVT-ORD-FAM-9102');
  });

  it('AEVT does not include the active run before completion', () => {
    const marker = event({
      id: 'EVT-ORD-FAM-9103',
      family: 'FAM',
      age: { min: 0, max: 0 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    // Gated on AEVT of the very event resolved this run; must never fire.
    const gated = event({
      id: 'EVT-ORD-FAM-9104',
      family: 'FAM',
      include: 'AEVT[EVT-ORD-FAM-9103]',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
    });
    const fixture = fixtureContent({ events: [marker, gated, filler('AGE=0')] });
    const result = runSimulation('aevt-active', fixture, base, { maxAge: 20 });
    expect(result.state.history.some((h) => h.eventId === 'EVT-ORD-FAM-9103')).toBe(true);
    expect(result.state.history.some((h) => h.eventId === 'EVT-ORD-FAM-9104')).toBe(false);
    expect(result.state.priorRunEventIds.size).toBe(0);
  });

  it('AEVT sees completed prior runs, so history becomes available to the next run', () => {
    const marker = event({
      id: 'EVT-ORD-FAM-9105',
      family: 'FAM',
      age: { min: 0, max: 0 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const gated = event({
      id: 'EVT-ORD-FAM-9106',
      family: 'FAM',
      include: 'AEVT[EVT-ORD-FAM-9105]',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
    });
    const fixture = fixtureContent({ events: [marker, gated, filler('AGE=0')] });

    const firstRun = runSimulation('aevt-1', fixture, base, { maxAge: 10 });
    expect(firstRun.state.history.some((h) => h.eventId === 'EVT-ORD-FAM-9106')).toBe(false);

    // Run completion is what promotes this run's history into AEVT.
    const secondRun = runSimulation('aevt-2', fixture, {
      ...base,
      reincarnationCount: 1,
      priorRunEventIds: [...firstRun.state.eventIdsThisRun],
    }, { maxAge: 10 });
    expect(secondRun.state.history.some((h) => h.eventId === 'EVT-ORD-FAM-9106')).toBe(true);
  });

  it('exposes the reincarnation count as TMS', () => {
    const gated = event({
      id: 'EVT-ORD-GEN-9107',
      include: 'TMS>=2',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
    });
    const fixture = fixtureContent({ events: [gated, filler()] });
    const firstLife = runSimulation('tms', fixture, base, { maxAge: 5 });
    expect(firstLife.state.history.some((h) => h.eventId === gated.id)).toBe(false);
    const thirdLife = runSimulation('tms', fixture, { ...base, reincarnationCount: 2 }, { maxAge: 5 });
    expect(thirdLife.state.history.some((h) => h.eventId === gated.id)).toBe(true);
  });
});

describe('K. Material continuity', () => {
  const hintEvent = event({
    id: 'EVT-TRN-WOOD-9201',
    channel: 'TRN',
    family: 'WOOD',
    age: { min: 5, max: 5 },
    repeatPolicy: 'once_per_run',
    repeatMaxCount: 1,
    materialTags: ['hint'],
    variants: [variant({ addFlags: ['MAT_HINT_WOOD'] })],
  });

  it('a hint does not set MAT', () => {
    const fixture = fixtureContent({ events: [hintEvent, filler('AGE=5')] });
    const result = runSimulation('hint', fixture, base, { maxAge: 10 });
    expect(result.state.flags.has('MAT_HINT_WOOD')).toBe(true);
    expect(result.state.material).toBe('NONE');
    expect(result.state.diagnostics.firstHintFamily).toBe('WOOD');
  });

  it('a manifestation does not set MAT', () => {
    const manifest = event({
      id: 'EVT-TRN-CRYS-9202',
      channel: 'TRN',
      family: 'CRYS',
      age: { min: 20, max: 20 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['manifestation'],
      variants: [variant({ addFlags: ['MAT_MANIFEST_CRYS'], effects: { FIX: 5 } })],
    });
    const fixture = fixtureContent({ events: [manifest, filler('AGE=20')] });
    const result = runSimulation('manifest', fixture, base, { maxAge: 25 });
    expect(result.state.flags.has('MAT_MANIFEST_CRYS')).toBe(true);
    expect(result.state.material).toBe('NONE');
    expect(result.state.diagnostics.firstManifestationFamily).toBe('CRYS');
  });

  it('lets multiple distinct manifestations coexist', () => {
    const wood = event({
      id: 'EVT-TRN-WOOD-9203',
      channel: 'TRN',
      family: 'WOOD',
      age: { min: 20, max: 20 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['manifestation'],
      variants: [variant({ addFlags: ['MAT_MANIFEST_WOOD'] })],
    });
    const crys = event({
      id: 'EVT-TRN-CRYS-9204',
      channel: 'TRN',
      family: 'CRYS',
      age: { min: 21, max: 21 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['manifestation'],
      variants: [variant({ addFlags: ['MAT_MANIFEST_CRYS'] })],
    });
    const fixture = fixtureContent({ events: [wood, crys, filler('AGE=20 | AGE=21')] });
    const result = runSimulation('multi', fixture, base, { maxAge: 25 });
    expect(result.state.flags.has('MAT_MANIFEST_WOOD')).toBe(true);
    expect(result.state.flags.has('MAT_MANIFEST_CRYS')).toBe(true);
    expect(result.state.material).toBe('NONE');
    expect(result.state.diagnostics.manifestationFamilies.sort()).toEqual(['CRYS', 'WOOD']);
  });

  it('canonical manifestations occur together in real runs', () => {
    const relaxed = content;
    let multi = 0;
    for (let i = 0; i < 200; i++) {
      const result = runSimulation(`canon-multi-${i}`, relaxed, {
        species: { kind: 'seeded_random' },
        talents: { kind: 'seeded_random_compatible' },
        allocation: { kind: 'seeded_random' },
      });
      if (result.state.diagnostics.manifestationFamilies.length > 1) multi++;
    }
    expect(multi).toBeGreaterThan(0);
  });

  it('a commitment event sets MAT', () => {
    const commit = event({
      id: 'EVT-TRN-STON-9205',
      channel: 'TRN',
      family: 'STON',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['commitment'],
      variants: [variant({ setMaterialCommitment: 'STON' })],
    });
    const fixture = fixtureContent({ events: [commit, filler('AGE=30')] });
    const result = runSimulation('commit', fixture, base, { maxAge: 35 });
    expect(result.state.material).toBe('STON');
    expect(result.state.diagnostics.commitmentAge).toBe(30);
  });

  it('excludes unrelated ordinary transformation families after commitment', () => {
    for (const family of ['WOOD', 'METL', 'CRYS', 'GLAS', 'CERA', 'SYNT', 'TEMP']) {
      const ordinary = event({
        id: `EVT-TRN-${family}-9206`,
        channel: 'TRN',
        family,
        materialTags: ['manifestation'],
      });
      expect(materialLockAllows(ordinary, 'STON'), `${family} after STON`).toBe(false);
      expect(materialLockAllows(ordinary, 'NONE'), `${family} before commitment`).toBe(true);
    }
    // The committed family itself stays eligible.
    const committed = event({ id: 'EVT-TRN-STON-9207', channel: 'TRN', family: 'STON', materialTags: ['manifestation'] });
    expect(materialLockAllows(committed, 'STON')).toBe(true);
    // Non-transformation channels are untouched.
    const institutional = event({ id: 'EVT-INS-MUS-9208', channel: 'INS', family: 'MUS' });
    expect(materialLockAllows(institutional, 'STON')).toBe(true);
  });

  it('lets explicit transition, mixed and anomaly events bypass the exclusion', () => {
    const transition = event({
      id: 'EVT-TRN-METL-9209',
      channel: 'TRN',
      family: 'METL',
      materialTags: ['transition'],
    });
    expect(materialLockAllows(transition, 'STON')).toBe(true);

    const mixed = event({ id: 'EVT-TRN-MIXD-9210', channel: 'TRN', family: 'MIXD', materialTags: ['mixed'] });
    expect(materialLockAllows(mixed, 'STON')).toBe(true);

    const anomaly = event({ id: 'EVT-TRN-ANOM-9211', channel: 'TRN', family: 'ANOM', materialTags: [] });
    expect(materialLockAllows(anomaly, 'STON')).toBe(true);
  });

  it('the canonical MIXD transition is reachable after commitment', () => {
    const mixd = content.eventsById.get('EVT-TRN-MIXD-0001')!;
    expect(mixd.materialTags).toContain('transition');
    expect(mixd.materialTags).toContain('mixed');
    expect(materialLockAllows(mixd, 'STON')).toBe(true);
    expect(materialLockAllows(mixd, 'CRYS')).toBe(true);
  });

  it('preserves prior primary material metadata when transitioning to MIXD', () => {
    const commit = event({
      id: 'EVT-TRN-CRYS-9212',
      channel: 'TRN',
      family: 'CRYS',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['commitment'],
      variants: [variant({ setMaterialCommitment: 'CRYS' })],
    });
    const transition = event({
      id: 'EVT-TRN-MIXD-9213',
      channel: 'TRN',
      family: 'MIXD',
      age: { min: 34, max: 34 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['transition', 'mixed', 'commitment'],
      include: 'MAT!=NONE & MAT!=MIXD',
      variants: [variant({ setMaterialCommitment: 'MIXD', addFlags: ['MAT_PREVIOUS_RECORDED'] })],
    });
    const fixture = fixtureContent({ events: [commit, transition, filler('AGE=30 | AGE=34')] });
    const result = runSimulation('mixd', fixture, base, { maxAge: 40 });
    expect(result.state.material).toBe('MIXD');
    expect(result.state.priorMaterials).toEqual(['CRYS']);
    expect(result.state.flags.has('MAT_PREVIOUS_RECORDED')).toBe(true);
  });

  it('applies the material lock during real drafting', () => {
    const commit = event({
      id: 'EVT-TRN-STON-9214',
      channel: 'TRN',
      family: 'STON',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['commitment'],
      variants: [variant({ setMaterialCommitment: 'STON' })],
    });
    const rival = event({
      id: 'EVT-TRN-WOOD-9215',
      channel: 'TRN',
      family: 'WOOD',
      materialTags: ['manifestation'],
      weightClass: 'VERY_HIGH',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
    });
    const fixture = fixtureContent({ events: [commit, rival, filler('AGE=30')] });
    const result = runSimulation('lock-draft', fixture, base, { maxAge: 60 });
    const rivalAges = result.state.history.filter((h) => h.eventId === rival.id).map((h) => h.age);
    expect(rivalAges.length).toBeGreaterThan(0);
    expect(Math.max(...rivalAges)).toBeLessThan(30);

    const { state } = createRun('lock-draft', fixture, base);
    state.material = 'STON';
    state.age = 40;
    expect(isEligible(rival, state, fixture)).toBe(false);
  });
});
