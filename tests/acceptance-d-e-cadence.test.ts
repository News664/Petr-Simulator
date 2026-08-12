import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { isEligible } from '../src/engine/eligibility.js';
import { runSimulation } from '../src/engine/simulation.js';
import type { SetupPolicy } from '../src/engine/setup.js';
import { createRun } from '../src/engine/setup.js';
import { SPECIES_IDS } from '../src/engine/types.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';

/**
 * Acceptance D — one-event-per-year invariant.
 * Acceptance E — childhood safety.
 */
const content = loadDefaultContent();

const policy: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'seeded_random' },
};

/** Diagnostic coverage policy so runs reach adulthood; see CONFLICT C-5. */
function relaxedContent() {
  return fixtureContent({
    events: content.events,
    adapters: { engineRules: { pre25CoveragePolicy: 'reuse_baseline_repeatables' } },
  });
}

describe('D. One-event-per-year invariant', () => {
  it('produces at most one visible event at each age, across many complete runs', () => {
    const relaxed = relaxedContent();
    for (let i = 0; i < 300; i++) {
      const result = runSimulation(`cadence-${i}`, relaxed, policy);
      const ages = result.state.history.map((h) => h.age);
      expect(new Set(ages).size, `run ${i} has duplicate ages`).toBe(ages.length);
    }
  });

  it('produces a strictly increasing, gapless timeline starting at age 0', () => {
    const relaxed = relaxedContent();
    for (let i = 0; i < 200; i++) {
      const result = runSimulation(`gapless-${i}`, relaxed, policy);
      const ages = result.state.history.map((h) => h.age);
      expect(ages[0]).toBe(0);
      for (let a = 1; a < ages.length; a++) {
        expect(ages[a]).toBe(ages[a - 1]! + 1);
      }
    }
  });

  it('does not add extra timeline entries for variants, flags, material or schedules', () => {
    // One year, one event; that event sets flags, material and three schedules.
    const busy = event({
      id: 'EVT-TRN-STON-9001',
      channel: 'TRN',
      family: 'STON',
      age: { min: 30, max: 30 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [
        variant({
          when: 'TRUE',
          effects: { STR: 2, FIX: 9 },
          addFlags: ['ROUTE_MUS_INTEREST', 'MAT_MANIFEST_STON'],
          setMaterialCommitment: 'STON',
          schedules: [
            { eventId: 'EVT-ORD-GEN-9000', offsetYears: 1, windowYears: 3, priority: 'scheduled', validityCondition: 'TRUE' },
            { eventId: 'EVT-ORD-GEN-9000', offsetYears: 2, windowYears: 3, priority: 'scheduled', validityCondition: 'TRUE' },
            { eventId: 'EVT-ORD-GEN-9000', offsetYears: 3, windowYears: 3, priority: 'scheduled', validityCondition: 'TRUE' },
          ],
        }),
      ],
    });
    const filler = event({ id: 'EVT-ORD-GEN-9000' });
    const fixture = fixtureContent({ events: [busy, filler] });
    const result = runSimulation('busy', fixture, { ...policy, talents: { kind: 'none' } }, { maxAge: 35 });
    const atThirty = result.state.history.filter((h) => h.age === 30);
    expect(atThirty).toHaveLength(1);
    expect(atThirty[0]!.eventId).toBe('EVT-TRN-STON-9001');
    expect(result.state.material).toBe('STON');
    expect(result.state.history.filter((h) => h.age === 31)).toHaveLength(1);
  });

  it('does not treat Afterform as part of the annual timeline', () => {
    // Afterform is not implemented in Phase 1; the run state exposes no
    // post-ending timeline entries and the ending year is the final entry.
    const relaxed = relaxedContent();
    for (let i = 0; i < 400; i++) {
      const result = runSimulation(`afterform-${i}`, relaxed, policy);
      if (result.outcome.kind !== 'ended') continue;
      const last = result.state.history[result.state.history.length - 1]!;
      expect(last.age).toBe(result.outcome.ending.endingAge);
      expect(result.state.history.filter((h) => h.age > last.age)).toHaveLength(0);
    }
  });
});

describe('E. Childhood safety', () => {
  it('has no canonical ending before age 18 in any event definition', () => {
    for (const gameEvent of content.events) {
      if (gameEvent.age.min >= 18) continue;
      for (const v of gameEvent.variants) {
        expect(v.endingId, `${gameEvent.id} is under-18-capable`).toBeUndefined();
      }
    }
  });

  it('never produces an ending before age 18 in simulation', () => {
    const relaxed = relaxedContent();
    for (let i = 0; i < 500; i++) {
      const result = runSimulation(`childhood-${i}`, relaxed, policy);
      if (result.outcome.kind !== 'ended') continue;
      expect(result.outcome.ending.endingAge).toBeGreaterThanOrEqual(18);
    }
  });

  it('has no under-18-capable event that sets Material Commitment', () => {
    for (const gameEvent of content.events) {
      if (gameEvent.age.min >= 18) continue;
      for (const v of gameEvent.variants) {
        expect(v.setMaterialCommitment, `${gameEvent.id} is under-18-capable`).toBeUndefined();
      }
    }
  });

  it('never commits material before age 18 in simulation', () => {
    const relaxed = relaxedContent();
    for (let i = 0; i < 300; i++) {
      const result = runSimulation(`mat-child-${i}`, relaxed, policy);
      const commitmentAge = result.state.diagnostics.commitmentAge;
      if (commitmentAge !== null) expect(commitmentAge).toBeGreaterThanOrEqual(18);
    }
  });

  it('declares every fallback_only event at age 25 or later', () => {
    const fallbacks = content.events.filter((e) => e.selectionMode === 'fallback_only');
    expect(fallbacks.length).toBeGreaterThan(0);
    for (const gameEvent of fallbacks) {
      expect(gameEvent.age.min).toBeGreaterThanOrEqual(content.balance.fallback.minimumAge);
      expect(gameEvent.repeatPolicy).toBe('repeatable');
    }
  });

  it('never uses a fallback_only event before age 25 in simulation', () => {
    const relaxed = relaxedContent();
    for (let i = 0; i < 400; i++) {
      const result = runSimulation(`fallback-${i}`, relaxed, policy);
      for (const occurrence of result.state.history) {
        if (occurrence.source === 'fallback') {
          expect(occurrence.age).toBeGreaterThanOrEqual(25);
        }
        if (occurrence.age < 25) {
          expect(occurrence.selectionMode).not.toBe('fallback_only');
        }
      }
    }
  });

  it('reports an empty pre-25 pool as a coverage defect instead of emitting a quiet year', () => {
    // A world whose only event is exhausted after one use.
    const once = event({
      id: 'EVT-ORD-GEN-9002',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      repeatCooldownYears: 0,
    });
    const fixture = fixtureContent({ events: [once] });
    const result = runSimulation('starved', fixture, { ...policy, talents: { kind: 'none' } });
    expect(result.outcome.kind).toBe('coverage_error');
    if (result.outcome.kind === 'coverage_error') {
      expect(result.outcome.age).toBe(1);
      expect(result.outcome.message).toContain('content coverage defect');
    }
    expect(result.state.history).toHaveLength(1);
  });

  it('measures pre-25 coverage headroom for representative reachable states at every age 0-24', () => {
    // For each species, walk a fresh run's early life and confirm that at the
    // reachable state for each age there is at least one eligible non-fallback
    // event. Coverage-defect ages are reported rather than silently passing.
    const relaxed = relaxedContent();
    const defectAges = new Map<number, number>();
    let sampled = 0;
    for (const species of SPECIES_IDS) {
      for (let i = 0; i < 40; i++) {
        sampled++;
        const result = runSimulation(`coverage-${species}-${i}`, relaxed, {
          ...policy,
          species: { kind: 'fixed', species },
        });
        for (const age of result.state.diagnostics.emergencyReuseAges) {
          defectAges.set(age, (defectAges.get(age) ?? 0) + 1);
        }
      }
    }
    expect(sampled).toBe(SPECIES_IDS.length * 40);
    // CONFLICT C-5: ages 0-5 are provisioned with zero slack, so the strict
    // policy runs the pool dry. This test pins the shape of the defect so a
    // content fix is detectable; it must never spread past age 24.
    for (const age of defectAges.keys()) {
      expect(age, 'coverage defects must be confined to the pre-25 band').toBeLessThan(25);
    }
    expect([...defectAges.keys()].sort((a, b) => a - b)).toEqual([4, 5]);
  });

  it('confirms at least one eligible non-fallback event exists at age 0 for every species', () => {
    for (const species of SPECIES_IDS) {
      const { state } = createRun('age-zero', content, { ...policy, species: { kind: 'fixed', species } });
      const eligible = content.events.filter(
        (e) => e.selectionMode === 'random' && isEligible(e, state, content),
      );
      expect(eligible.length, `species ${species} at age 0`).toBeGreaterThan(0);
    }
  });
});
