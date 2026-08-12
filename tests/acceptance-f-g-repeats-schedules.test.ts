import { describe, expect, it } from 'vitest';

import { runSimulation } from '../src/engine/simulation.js';
import type { SetupPolicy } from '../src/engine/setup.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';
import type { ScheduleSpec } from '../src/engine/types.js';

/**
 * Acceptance F — repeats.
 * Acceptance G — scheduling and priority.
 */
const noTalents: SetupPolicy = {
  species: { kind: 'fixed', species: 'HUMAN' },
  talents: { kind: 'none' },
  allocation: { kind: 'even' },
};

function schedule(overrides: Partial<ScheduleSpec> & Pick<ScheduleSpec, 'eventId'>): ScheduleSpec {
  return { offsetYears: 1, windowYears: 3, priority: 'scheduled', validityCondition: 'TRUE', ...overrides };
}

const filler = event({ id: 'EVT-ORD-GEN-9000' });

/**
 * A filler that steps aside at the given ages, so a trigger event scheduled for
 * one of those ages is the only eligible candidate and the test is exact rather
 * than probabilistic.
 */
function fillerExcept(ages: number[]) {
  return event({
    id: 'EVT-ORD-GEN-9000',
    exclude: ages.map((age) => `AGE=${age}`).join(' | '),
  });
}

function occurrences(history: { eventId: string; age: number }[], id: string): number[] {
  return history.filter((h) => h.eventId === id).map((h) => h.age);
}

describe('F. Repeats', () => {
  it('never repeats a once_per_run event', () => {
    const once = event({
      id: 'EVT-ORD-FAM-9001',
      family: 'FAM',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      repeatCooldownYears: 0,
      weightClass: 'VERY_HIGH',
    });
    const fixture = fixtureContent({ events: [once, filler] });
    for (let i = 0; i < 50; i++) {
      const result = runSimulation(`once-${i}`, fixture, noTalents, { maxAge: 40 });
      expect(occurrences(result.state.history, once.id).length).toBeLessThanOrEqual(1);
    }
  });

  it('respects repeatCooldownYears', () => {
    const cooling = event({
      id: 'EVT-ORD-SOC-9001',
      family: 'SOC',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 4,
      repeatMaxCount: null,
      weightClass: 'VERY_HIGH',
    });
    const fixture = fixtureContent({ events: [cooling, filler] });
    for (let i = 0; i < 40; i++) {
      const result = runSimulation(`cooldown-${i}`, fixture, noTalents, { maxAge: 60 });
      const ages = occurrences(result.state.history, cooling.id);
      expect(ages.length).toBeGreaterThan(1);
      for (let a = 1; a < ages.length; a++) {
        expect(ages[a]! - ages[a - 1]!, `gap after age ${ages[a - 1]}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('respects a finite repeatMaxCount', () => {
    const capped = event({
      id: 'EVT-ORD-SOC-9002',
      family: 'SOC',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 1,
      repeatMaxCount: 3,
      weightClass: 'VERY_HIGH',
    });
    const fixture = fixtureContent({ events: [capped, filler] });
    for (let i = 0; i < 40; i++) {
      const result = runSimulation(`capped-${i}`, fixture, noTalents, { maxAge: 60 });
      expect(occurrences(result.state.history, capped.id).length).toBeLessThanOrEqual(3);
    }
  });

  it('supports unlimited repeatMaxCount (null)', () => {
    const unlimited = event({
      id: 'EVT-ORD-GEN-9003',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
    });
    const fixture = fixtureContent({ events: [unlimited] });
    const result = runSimulation('unlimited', fixture, noTalents, { maxAge: 60 });
    expect(occurrences(result.state.history, unlimited.id).length).toBe(61);
  });

  it('resets occurrence tracking on a new reincarnation', () => {
    const once = event({
      id: 'EVT-ORD-FAM-9002',
      family: 'FAM',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
    });
    const fixture = fixtureContent({ events: [once, filler] });
    const first = runSimulation('reincarnate', fixture, noTalents, { maxAge: 20 });
    expect(occurrences(first.state.history, once.id).length).toBe(1);

    // A new run carries prior-run history for AEVT but a fresh repeat ledger.
    const second = runSimulation('reincarnate', fixture, {
      ...noTalents,
      reincarnationCount: 1,
      priorRunEventIds: first.state.history.map((h) => h.eventId),
    }, { maxAge: 20 });
    expect(occurrences(second.state.history, once.id).length).toBe(1);
    expect(second.state.repeats.get(once.id)?.count).toBe(1);
  });
});

describe('G. Scheduling and priority', () => {
  it('does not fire a scheduled event before its earliest target age', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9001',
      family: 'CAR',
      age: { min: 5, max: 5 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [variant({ schedules: [schedule({ eventId: 'EVT-ORD-CAR-9002', offsetYears: 6, windowYears: 4 })] })],
    });
    const target = event({
      id: 'EVT-ORD-CAR-9002',
      family: 'CAR',
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, target, fillerExcept([5])] });
    const result = runSimulation('earliest', fixture, noTalents, { maxAge: 30 });
    const ages = occurrences(result.state.history, target.id);
    expect(ages).toHaveLength(1);
    expect(ages[0]).toBeGreaterThanOrEqual(11);
    expect(ages[0]).toBeLessThanOrEqual(15);
  });

  it('lets a climax schedule displace an ordinary scheduled event in the same year', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9003',
      family: 'CAR',
      age: { min: 20, max: 20 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [
        variant({
          schedules: [
            schedule({ eventId: 'EVT-ORD-CAR-9004', offsetYears: 2, windowYears: 6, priority: 'scheduled' }),
            schedule({ eventId: 'EVT-INS-MUS-9005', offsetYears: 2, windowYears: 6, priority: 'climax' }),
          ],
        }),
      ],
    });
    const ordinary = event({
      id: 'EVT-ORD-CAR-9004',
      family: 'CAR',
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const climax = event({
      id: 'EVT-INS-MUS-9005',
      channel: 'INS',
      family: 'MUS',
      selectionMode: 'climax',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, ordinary, climax, fillerExcept([20])] });
    const result = runSimulation('displace', fixture, noTalents, { maxAge: 40 });

    const climaxAge = occurrences(result.state.history, climax.id)[0]!;
    const ordinaryAge = occurrences(result.state.history, ordinary.id)[0]!;
    expect(climaxAge).toBe(22);
    // The displaced schedule stays pending and fires later inside its window.
    expect(ordinaryAge).toBeGreaterThan(climaxAge);
    expect(ordinaryAge).toBeLessThanOrEqual(28);
    expect(result.state.diagnostics.priorityCollisionAges).toContain(22);
    expect(result.state.diagnostics.displacementCount).toBeGreaterThan(0);
  });

  it('lets a mandatory committed route outrank an ordinary scheduled event', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9005',
      family: 'CAR',
      age: { min: 20, max: 20 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [
        variant({
          schedules: [
            schedule({ eventId: 'EVT-ORD-CAR-9006', offsetYears: 2, windowYears: 6, priority: 'scheduled' }),
            schedule({ eventId: 'EVT-SPC-SECR-9007', offsetYears: 2, windowYears: 6, priority: 'mandatory' }),
          ],
        }),
      ],
    });
    const ordinary = event({
      id: 'EVT-ORD-CAR-9006',
      family: 'CAR',
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const mandatory = event({
      id: 'EVT-SPC-SECR-9007',
      channel: 'SPC',
      family: 'SECR',
      selectionMode: 'mandatory_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, ordinary, mandatory, fillerExcept([20])] });
    const result = runSimulation('mandatory', fixture, noTalents, { maxAge: 40 });
    expect(occurrences(result.state.history, mandatory.id)[0]).toBe(22);
    expect(occurrences(result.state.history, ordinary.id)[0]).toBeGreaterThan(22);
  });

  it('expires a schedule when its window closes', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9007',
      family: 'CAR',
      age: { min: 10, max: 10 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [
        variant({
          schedules: [
            // Target is not age-eligible during the whole window, so it can never fire.
            schedule({ eventId: 'EVT-ORD-CAR-9008', offsetYears: 2, windowYears: 3 }),
          ],
        }),
      ],
    });
    const target = event({
      id: 'EVT-ORD-CAR-9008',
      family: 'CAR',
      age: { min: 50, max: 60 },
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, target, fillerExcept([10])] });
    const result = runSimulation('expire', fixture, noTalents, { maxAge: 60 });
    expect(occurrences(result.state.history, target.id)).toHaveLength(0);
    expect(result.state.diagnostics.expiredSchedules).toContainEqual({
      eventId: target.id,
      age: 16,
      reason: 'window_closed',
    });
    expect(result.state.schedules).toHaveLength(0);
  });

  it('ignores a schedule whose validity condition never becomes true', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9009',
      family: 'CAR',
      age: { min: 10, max: 10 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [
        variant({
          schedules: [
            schedule({
              eventId: 'EVT-ORD-CAR-9010',
              offsetYears: 2,
              windowYears: 5,
              validityCondition: 'FLAG[ROUTE_COR_CONTRACT]',
            }),
          ],
        }),
      ],
    });
    const target = event({
      id: 'EVT-ORD-CAR-9010',
      family: 'CAR',
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, target, fillerExcept([10])] });
    const result = runSimulation('invalid-route', fixture, noTalents, { maxAge: 40 });
    expect(occurrences(result.state.history, target.id)).toHaveLength(0);
    expect(result.state.diagnostics.expiredSchedules.map((e) => e.eventId)).toContain(target.id);
  });

  it('treats validity as a fire-time gate, not a destruction test', () => {
    // ASSUMPTION A-4: canonical schedules are created while their condition is
    // false. The schedule must survive and fire when the condition turns true.
    const trigger = event({
      id: 'EVT-ORD-CAR-9011',
      family: 'CAR',
      age: { min: 10, max: 10 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [
        variant({
          schedules: [
            schedule({
              eventId: 'EVT-ORD-CAR-9012',
              offsetYears: 2,
              windowYears: 8,
              validityCondition: 'FLAG[ROUTE_COR_CONTRACT]',
            }),
          ],
        }),
      ],
    });
    const flagSetter = event({
      id: 'EVT-INS-COR-9013',
      channel: 'INS',
      family: 'COR',
      age: { min: 15, max: 15 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [variant({ addFlags: ['ROUTE_COR_CONTRACT'] })],
    });
    const target = event({
      id: 'EVT-ORD-CAR-9012',
      family: 'CAR',
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, flagSetter, target, fillerExcept([10, 15])] });
    const result = runSimulation('fire-gate', fixture, noTalents, { maxAge: 40 });
    const ages = occurrences(result.state.history, target.id);
    expect(ages).toHaveLength(1);
    // Created at 10 (window 12-20), gated until the flag arrives at 15.
    expect(ages[0]).toBe(16);
  });

  it('selects only one visible event even when several schedules are ready', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9014',
      family: 'CAR',
      age: { min: 10, max: 10 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      weightClass: 'VERY_HIGH',
      variants: [
        variant({
          schedules: [
            schedule({ eventId: 'EVT-ORD-CAR-9015', offsetYears: 2, windowYears: 10 }),
            schedule({ eventId: 'EVT-ORD-CAR-9016', offsetYears: 2, windowYears: 10 }),
            schedule({ eventId: 'EVT-ORD-CAR-9017', offsetYears: 2, windowYears: 10 }),
          ],
        }),
      ],
    });
    const targets = ['EVT-ORD-CAR-9015', 'EVT-ORD-CAR-9016', 'EVT-ORD-CAR-9017'].map((id) =>
      event({ id, family: 'CAR', selectionMode: 'scheduled_only', repeatPolicy: 'once_per_run', repeatMaxCount: 1 }),
    );
    const fixture = fixtureContent({ events: [trigger, ...targets, fillerExcept([10])] });
    const result = runSimulation('one-per-year', fixture, noTalents, { maxAge: 40 });
    const ages = result.state.history.map((h) => h.age);
    expect(new Set(ages).size).toBe(ages.length);
    // All three fire, one per year, in consecutive years from the window start.
    expect(targets.map((t) => occurrences(result.state.history, t.id)[0])).toEqual([12, 13, 14]);
  });

  it('ranks priority classes by the balance-configured ranks', () => {
    const fixture = fixtureContent({ events: [filler] });
    const ranks = fixture.balance.priorityClassRank;
    expect(ranks.ending_or_hidden_climax).toBeGreaterThan(ranks.mandatory_route);
    expect(ranks.mandatory_route).toBeGreaterThan(ranks.scheduled);
    expect(ranks.scheduled).toBeGreaterThan(ranks.normal);
  });
});
