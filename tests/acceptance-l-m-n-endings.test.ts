import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { eventContextScalar, familyEvidenceScalar } from '../src/engine/drafting.js';
import { buildEndingRecord, EndingResolutionError, resolveAwareness } from '../src/engine/endings.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { AUTHORIZATION_REQUIRED_AWARENESS } from '../src/engine/types.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';

/**
 * Acceptance L — academic research.
 * Acceptance M — ending resolution.
 * Acceptance N — headless diagnostic maximum.
 */
const content = loadDefaultContent();

const base: SetupPolicy = {
  species: { kind: 'fixed', species: 'HUMAN' },
  talents: { kind: 'none' },
  allocation: { kind: 'even' },
};

const filler = (exclude = 'FALSE') => event({ id: 'EVT-ORD-GEN-9000', exclude });

describe('L. Academic research', () => {
  const specializationFlags = ['ROUTE_ACA_MATERIALS', 'ROUTE_ACA_CONTINUITY', 'ROUTE_ACA_POLICY'];

  it('establishes specialization automatically, with no player choice', () => {
    // Specializations are authored variants of one event, resolved from state
    // and seeded RNG. No engine API exposes a mid-life decision point.
    const specializer = content.events.find((e) =>
      e.variants.some((v) => v.addFlags.includes('ROUTE_ACA_SPECIALIZATION')),
    );
    expect(specializer).toBeDefined();
    expect(specializer!.selectionMode).toBe('random');
    const directions = specializer!.variants.flatMap((v) => v.addFlags.filter((f) => specializationFlags.includes(f)));
    expect(new Set(directions).size).toBeGreaterThan(1);
  });

  it('keeps specialization flags mutually coherent', () => {
    // No single authored variant may set more than one research direction.
    for (const gameEvent of content.events) {
      for (const v of gameEvent.variants) {
        const set = v.addFlags.filter((f) => specializationFlags.includes(f));
        expect(set.length, `${gameEvent.id}: ${set.join(', ')}`).toBeLessThanOrEqual(1);
      }
    }
    // And no run ends up holding two of them.
    const relaxed = content;
    let sawSpecialization = false;
    for (let i = 0; i < 400; i++) {
      const result = runSimulation(`aca-${i}`, relaxed, {
        species: { kind: 'seeded_random' },
        talents: { kind: 'seeded_random_compatible' },
        allocation: { kind: 'seeded_random' },
      });
      const held = specializationFlags.filter((f) => result.state.flags.has(f));
      expect(held.length, `run ${i} holds ${held.join(', ')}`).toBeLessThanOrEqual(1);
      if (held.length === 1) sawSpecialization = true;
    }
    expect(sawSpecialization).toBe(true);
  });

  it('does not let Comparative Materials hard-select a material', () => {
    // No variant that sets ROUTE_ACA_MATERIALS may also set Material Commitment,
    // and the route grants no per-family evidence scalar.
    for (const gameEvent of content.events) {
      for (const v of gameEvent.variants) {
        if (!v.addFlags.includes('ROUTE_ACA_MATERIALS')) continue;
        expect(v.setMaterialCommitment, `${gameEvent.id}`).toBeUndefined();
      }
    }
    // Q-07a is now canonical data: Route Tag Registry v1.0 marks `academic` as
    // allowTransformationEventFavor=false, replacing the Phase-1 adapter rule.
    const academic = content.routeTags.get('academic')!;
    expect(academic.flagPrefixes).toContain('ROUTE_ACA_');
    expect(academic.allowTransformationEventFavor).toBe(false);

    const academicTransformation = content.events.filter(
      (e) => e.channel === 'TRN' && e.routeTags.includes('academic'),
    );
    expect(academicTransformation.length).toBeGreaterThan(0);

    const { state } = createRun('comparative', content, base);
    state.age = 30;
    for (const gameEvent of academicTransformation) {
      const neutral = eventContextScalar(gameEvent, state, content);
      state.flags.add('ROUTE_ACA_RESEARCH');
      state.flags.add('ROUTE_ACA_MATERIALS');
      const withRoute = eventContextScalar(gameEvent, state, content);
      state.flags.delete('ROUTE_ACA_RESEARCH');
      state.flags.delete('ROUTE_ACA_MATERIALS');
      expect(withRoute, `${gameEvent.id} must not gain weight from the academic route`).toBe(neutral);
    }

    // Route tags never touch the family layer under the uniform-family baseline.
    const familyBefore = familyEvidenceScalar('TRN', 'TEMP', state, content);
    state.flags.add('ROUTE_ACA_MATERIALS');
    const familyAfter = familyEvidenceScalar('TRN', 'TEMP', state, content);
    state.flags.delete('ROUTE_ACA_MATERIALS');
    expect(familyAfter).toBe(familyBefore);

    // The same tag still counts for non-transformation channels.
    const academicInstitutional = content.events.find(
      (e) => e.channel === 'INS' && e.routeTags.includes('academic'),
    )!;
    const before = eventContextScalar(academicInstitutional, state, content);
    state.flags.add('ROUTE_ACA_RESEARCH');
    const after = eventContextScalar(academicInstitutional, state, content);
    state.flags.delete('ROUTE_ACA_RESEARCH');
    expect(after).toBeGreaterThan(before);
  });

  it('does not let Continuity research change ordinary awareness defaults', () => {
    const relaxed = content;
    const { state } = createRun('continuity', relaxed, base);
    state.flags.add('ROUTE_ACA_CONTINUITY');
    state.flags.add('ROUTE_ACA_CONTINUITY_EXPOSED');
    // An ordinary solid ending still defaults to Unconscious.
    expect(resolveAwareness(content, 'END-ACA-001', 'STON', state, undefined).awareness).toBe('Unconscious');
    // Temporal still defaults to Suspended.
    expect(resolveAwareness(content, 'END-TMP-001', 'TEMP', state, undefined).awareness).toBe('Suspended');
  });

  it('reflects substantive specialization in the tenure chain, per current event data', () => {
    const tenureReview = content.eventsById.get('EVT-INS-ACA-0004')!;
    expect(tenureReview.include).toContain('ROUTE_ACA_TENURE_TRACK');
    // Tenure track is only reachable after research plus a specialization.
    const tenureTrackSetters = content.events.filter((e) =>
      e.variants.some((v) => v.addFlags.includes('ROUTE_ACA_TENURE_TRACK')),
    );
    expect(tenureTrackSetters.length).toBeGreaterThan(0);
    for (const setter of tenureTrackSetters) {
      const gate = `${setter.include} ${setter.exclude}`;
      expect(gate, `${setter.id} must require academic route state`).toMatch(/ROUTE_ACA_/);
    }
    // Tenure is one consequence, not the route's only outcome.
    const academicEndings = new Set(
      content.events
        .filter((e) => e.family === 'ACA')
        .flatMap((e) => e.variants.map((v) => v.endingId).filter(Boolean)),
    );
    expect(academicEndings.has('END-ACA-001')).toBe(true);
    expect(academicEndings.has('END-ACA-002')).toBe(true);
  });
});

describe('M. Ending resolution', () => {
  it('resolves every canonical ending event id to a known Ending ID', () => {
    let endingVariants = 0;
    for (const gameEvent of content.events) {
      for (const v of gameEvent.variants) {
        if (!v.endingId) continue;
        endingVariants++;
        expect(content.endings.has(v.endingId), `${gameEvent.id} -> ${v.endingId}`).toBe(true);
      }
    }
    expect(endingVariants).toBe(80);
  });

  it('preserves the current material in the Ending Record', () => {
    const ending = event({
      id: 'EVT-INS-MUS-9301',
      channel: 'INS',
      family: 'MUS',
      age: { min: 40, max: 40 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [variant({ endingId: 'END-MUS-001' })],
    });
    const commit = event({
      id: 'EVT-TRN-WOOD-9302',
      channel: 'TRN',
      family: 'WOOD',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [variant({ setMaterialCommitment: 'WOOD' })],
    });
    const fixture = fixtureContent({ events: [commit, ending, filler('AGE=30 | AGE=40')] });
    const result = runSimulation('ending-material', fixture, base, { maxAge: 60 });
    expect(result.outcome.kind).toBe('ended');
    if (result.outcome.kind !== 'ended') return;
    expect(result.outcome.ending.primaryMaterial).toBe('WOOD');
    expect(result.outcome.ending.endingId).toBe('END-MUS-001');
    expect(result.outcome.ending.endingAge).toBe(40);
  });

  it('does not let an ending casually replace a committed material', () => {
    // The ending event carries no setMaterialCommitment, so MAT is untouched.
    const commit = event({
      id: 'EVT-TRN-CRYS-9303',
      channel: 'TRN',
      family: 'CRYS',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [variant({ setMaterialCommitment: 'CRYS' })],
    });
    // END-MUS-001's allowed materials list does not include crystal-only, but
    // the engine must still report the committed material rather than override.
    const ending = event({
      id: 'EVT-INS-MUS-9304',
      channel: 'INS',
      family: 'MUS',
      age: { min: 40, max: 40 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [variant({ endingId: 'END-FAM-001' })],
    });
    const fixture = fixtureContent({ events: [commit, ending, filler('AGE=30 | AGE=40')] });
    const result = runSimulation('no-replace', fixture, base, { maxAge: 60 });
    if (result.outcome.kind !== 'ended') expect.unreachable('expected an ending');
    else expect(result.outcome.ending.primaryMaterial).toBe('CRYS');
  });

  it('records an authored transition performed by the climax itself', () => {
    const commit = event({
      id: 'EVT-TRN-STON-9305',
      channel: 'TRN',
      family: 'STON',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [variant({ setMaterialCommitment: 'STON' })],
    });
    const climax = event({
      id: 'EVT-TRN-MIXD-9306',
      channel: 'TRN',
      family: 'MIXD',
      age: { min: 40, max: 40 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      materialTags: ['transition', 'mixed'],
      variants: [variant({ setMaterialCommitment: 'MIXD', endingId: 'END-MUS-004' })],
    });
    const fixture = fixtureContent({ events: [commit, climax, filler('AGE=30 | AGE=40')] });
    const result = runSimulation('climax-transition', fixture, base, { maxAge: 60 });
    if (result.outcome.kind !== 'ended') expect.unreachable('expected an ending');
    else {
      expect(result.outcome.ending.primaryMaterial).toBe('MIXD');
      expect(result.outcome.ending.priorMaterials).toEqual(['STON']);
    }
  });

  it('defaults ordinary solid material to Unconscious', () => {
    const { state } = createRun('awareness', content, base);
    for (const material of ['STON', 'METL', 'CRYS', 'WOOD', 'GLAS', 'CERA', 'SYNT', 'MIXD'] as const) {
      expect(resolveAwareness(content, 'END-FAM-001', material, state, undefined).awareness).toBe('Unconscious');
    }
  });

  it('defaults temporal to Suspended', () => {
    const { state } = createRun('awareness-temp', content, base);
    expect(resolveAwareness(content, 'END-TMP-001', 'TEMP', state, undefined).awareness).toBe('Suspended');
    // END-COR-002's registry default is "Unconscious; Suspended if temporal".
    expect(resolveAwareness(content, 'END-COR-002', 'TEMP', state, undefined).awareness).toBe('Suspended');
    expect(resolveAwareness(content, 'END-COR-002', 'SYNT', state, undefined).awareness).toBe('Unconscious');
  });

  it('requires explicit authorization for Continuous / Intermittent / Displaced', () => {
    const { state: plain } = createRun('auth-none', content, base);
    // END-ANO-001's registry default is "Continuous or Intermittent"; without
    // the authorizing talent the engine falls back to the contract default.
    expect(resolveAwareness(content, 'END-ANO-001', 'STON', plain, undefined).awareness).toBe('Unconscious');
    expect(resolveAwareness(content, 'END-ANO-002', 'STON', plain, undefined).awareness).toBe('Unconscious');

    const { state: authorized } = createRun('auth-yes', content, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1028'] },
    });
    const resolved = resolveAwareness(content, 'END-ANO-001', 'STON', authorized, undefined);
    expect(resolved.awareness).toBe('Continuous');
    expect(resolved.authorized).toBe(true);

    // An override asking for a restricted state without authorization is refused.
    expect(() => resolveAwareness(content, 'END-FAM-001', 'STON', plain, 'Continuous')).toThrow(
      EndingResolutionError,
    );
    for (const restricted of AUTHORIZATION_REQUIRED_AWARENESS) {
      expect(() => resolveAwareness(content, 'END-FAM-001', 'STON', plain, restricted)).toThrow();
    }
  });

  it('never infers permanent awareness merely from immobility', () => {
    // Every canonical ending event resolves to a non-permanent awareness state
    // unless its registry entry authorises otherwise.
    const { state } = createRun('immobile', content, base);
    for (const ending of content.endings.values()) {
      const authorizers = ending.authorizingTalents;
      if (authorizers.length > 0) continue;
      const resolved = resolveAwareness(content, ending.id, 'STON', state, undefined);
      expect(AUTHORIZATION_REQUIRED_AWARENESS, `${ending.id}`).not.toContain(resolved.awareness);
    }
  });

  it('keeps consent, autonomy, ownership and legal status as separate fields', () => {
    const endingEvent = content.eventsById.get('EVT-INS-MUS-0003')!;
    const variantIndex = endingEvent.variants.findIndex((v) => v.endingId !== undefined);
    const chosen = endingEvent.variants[variantIndex]!;
    const { state } = createRun('fields', content, base);
    state.age = 40;
    state.material = 'CRYS';
    const record = buildEndingRecord(content, state, endingEvent, variantIndex, chosen);
    const keys = ['awareness', 'conversionConsent', 'autonomy', 'ownership', 'legalStatus'] as const;
    for (const key of keys) expect(record[key], key).toBeTypeOf('string');
    // Distinct fields: none is derived from another.
    expect(record.awareness).toBe('Uncertain'); // END-MUS-003 registry default
    expect(record.ownership).not.toBe(record.autonomy);
    expect(record.legalStatus).not.toBe(record.awareness);
  });

  it('applies authored endingOverrides', () => {
    const endingEvent = content.eventsById.get('EVT-INS-ARC-0002')!;
    const variantIndex = endingEvent.variants.findIndex((v) => v.endingOverrides !== undefined);
    expect(variantIndex).toBeGreaterThanOrEqual(0);
    const chosen = endingEvent.variants[variantIndex]!;
    const { state } = createRun('overrides', content, base);
    state.age = 45;
    state.material = 'STON';
    const record = buildEndingRecord(content, state, endingEvent, variantIndex, chosen);
    expect(record.ownership).toBe('Self');
    expect(record.autonomy).toBe('Represented');
  });

  it('terminates the annual simulation on an ending', () => {
    const ending = event({
      id: 'EVT-ORD-FAM-9307',
      family: 'FAM',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [variant({ endingId: 'END-FAM-002' })],
    });
    const fixture = fixtureContent({ events: [ending, filler('AGE=30')] });
    const result = runSimulation('terminate', fixture, base, { maxAge: 120 });
    expect(result.outcome.kind).toBe('ended');
    expect(result.state.history[result.state.history.length - 1]!.age).toBe(30);
    expect(result.state.history.some((h) => h.age > 30)).toBe(false);
    expect(result.state.ending).not.toBeNull();
  });

  it('gives every ending event an age floor of 18 or higher', () => {
    for (const gameEvent of content.events) {
      if (!gameEvent.variants.some((v) => v.endingId)) continue;
      expect(gameEvent.age.min, gameEvent.id).toBeGreaterThanOrEqual(18);
    }
  });
});

describe('N. Headless diagnostic maximum', () => {
  it('stops at the diagnostic maximum age and marks the run nonterminal', () => {
    const endless = event({ id: 'EVT-ORD-GEN-9401' });
    const fixture = fixtureContent({ events: [endless] });
    const result = runSimulation('endless', fixture, base, { maxAge: 120 });
    expect(result.outcome.kind).toBe('nonterminal');
    if (result.outcome.kind === 'nonterminal') expect(result.outcome.reachedAge).toBe(120);
    expect(result.state.history).toHaveLength(121);
  });

  it('does not synthesize a fake ending', () => {
    const endless = event({ id: 'EVT-ORD-GEN-9402' });
    const fixture = fixtureContent({ events: [endless] });
    const result = runSimulation('no-fake', fixture, base, { maxAge: 40 });
    expect(result.state.ending).toBeNull();
    expect(result.outcome.kind).toBe('nonterminal');
  });

  it('uses the balance-configured diagnostic maximum by default', () => {
    expect(content.balance.diagnosticSimulation.maxAge).toBe(120);
    expect(content.balance.diagnosticSimulation.onMaxAgeWithoutEnding).toBe(
      'COUNT_AS_NONTERMINAL_DIAGNOSTIC_FAILURE',
    );
    const endless = event({ id: 'EVT-ORD-GEN-9403' });
    const fixture = fixtureContent({ events: [endless] });
    const result = runSimulation('default-max', fixture, base);
    expect(result.state.history).toHaveLength(121);
  });
});
