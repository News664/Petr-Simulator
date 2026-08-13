import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { CONTENT_ROOT, loadDefaultContent } from '../src/engine/content/load.js';
import { eventContextScalar, familyEvidenceScalar, talentChannelScalar } from '../src/engine/drafting.js';
import { isEligible } from '../src/engine/eligibility.js';
import { resolveAwareness } from '../src/engine/endings.js';
import { Rng } from '../src/engine/rng.js';
import { rankCandidates } from '../src/engine/schedules.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { applyThresholdProfile, loadExperimentMatrix, withFamilyWeightMode, withT1027StartFix } from '../src/sim/experiments.js';
import { SPECIES_IDS, type PendingSchedule } from '../src/engine/types.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';

/**
 * SOLID_STATE_PHASE1_1_ACCEPTANCE_ADDENDUM_v0.1.md
 *
 * Run in addition to the full Phase-1 suite.
 */
const content = loadDefaultContent();
const matrix = loadExperimentMatrix();

const diagnostic: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'seeded_random' },
};

describe('1. Strict childhood schedulability', () => {
  it('no longer exposes the reuse_baseline_repeatables escape hatch', () => {
    // The policy switch is gone from the adapter file...
    const adapters = JSON.parse(
      readFileSync(
        path.join(CONTENT_ROOT, 'balance', 'SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json'),
        'utf8',
      ),
    ) as Record<string, unknown>;
    expect(adapters['engineRules']).toBeUndefined();
    expect(JSON.stringify(adapters)).not.toContain('pre25CoveragePolicy');

    // ...and behaviourally there is no rescue path: a world whose only event is
    // consumed after one year still reports a coverage defect rather than
    // silently reusing a baseline repeatable.
    const once = event({
      id: 'EVT-ORD-GEN-9900',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      routeTags: ['baseline'],
    });
    const starved = fixtureContent({ events: [once] });
    const result = runSimulation('starved', starved, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    expect(result.outcome.kind).toBe('coverage_error');
    expect(result.state.diagnostics.emergencyReuseAges).toEqual([]);
  });

  it('never terminates a run from a pre-25 coverage defect', () => {
    let runs = 0;
    for (const species of SPECIES_IDS) {
      for (let i = 0; i < 120; i++) {
        runs++;
        const result = runSimulation(`strict-${species}-${i}`, content, {
          ...diagnostic,
          species: { kind: 'fixed', species },
        });
        expect(result.outcome.kind, `strict-${species}-${i}`).not.toBe('coverage_error');
      }
    }
    expect(runs).toBe(SPECIES_IDS.length * 120);
  });

  /**
   * Deterministic reachability check.
   *
   * Walks each simulated run year by year and counts the eligible non-fallback
   * events at the ACTUAL reachable state, so once-per-run consumption, repeat
   * cooldowns, repeat max counts, age windows and include/exclude conditions are
   * all modelled — not merely per-age theoretical capacity (Content Schema v0.3
   * "v0.3 coverage validation").
   */
  it('keeps substantial slack at every reachable age 0-24, measured after consumption', () => {
    const minEligibleByAge = new Map<number, number>();
    for (const species of SPECIES_IDS) {
      for (let i = 0; i < 40; i++) {
        const seed = `slack-${species}-${i}`;
        const result = runSimulation(seed, content, { ...diagnostic, species: { kind: 'fixed', species } });
        // Replay the run, recomputing eligibility at each reachable state.
        const replay = createRun(seed, content, { ...diagnostic, species: { kind: 'fixed', species } });
        const state = replay.state;
        for (const occurrence of result.state.history) {
          if (occurrence.age > 24) break;
          state.age = occurrence.age;
          const eligible = content.events.filter(
            (e) => e.selectionMode === 'random' && isEligible(e, state, content),
          ).length;
          const previous = minEligibleByAge.get(occurrence.age);
          if (previous === undefined || eligible < previous) minEligibleByAge.set(occurrence.age, eligible);
          // Advance the replay state to mirror the real run's consumption.
          const consumed = content.eventsById.get(occurrence.eventId)!;
          const record = state.repeats.get(consumed.id);
          if (record) {
            record.count += 1;
            record.lastAge = occurrence.age;
          } else {
            state.repeats.set(consumed.id, { count: 1, lastAge: occurrence.age });
          }
          state.eventIdsThisRun.add(consumed.id);
          const variantUsed = consumed.variants[occurrence.variantIndex]!;
          for (const flag of variantUsed.removeFlags) state.flags.delete(flag);
          for (const flag of variantUsed.addFlags) state.flags.add(flag);
        }
      }
    }

    for (let age = 0; age <= 24; age++) {
      const eligible = minEligibleByAge.get(age);
      if (eligible === undefined) continue;
      expect(eligible, `age ${age} has no eligible non-fallback event`).toBeGreaterThan(0);
    }
    // Addendum: ages 0-5 must have substantial slack, not an exact-capacity fit.
    for (let age = 0; age <= 5; age++) {
      expect(minEligibleByAge.get(age) ?? 0, `age ${age} slack`).toBeGreaterThanOrEqual(2);
    }
  });

  it('still emits no fallback_only event before age 25', () => {
    for (let i = 0; i < 300; i++) {
      const result = runSimulation(`fallback-${i}`, content, diagnostic);
      for (const occurrence of result.state.history) {
        if (occurrence.age < 25) expect(occurrence.selectionMode).not.toBe('fallback_only');
      }
    }
  });
});

describe('2. Route tag registry integrity', () => {
  it('registers every event routeTag', () => {
    for (const gameEvent of content.events) {
      for (const tag of gameEvent.routeTags) {
        expect(content.routeTags.has(tag), `${gameEvent.id} -> ${tag}`).toBe(true);
      }
    }
  });

  it('has no duplicate registered tags and well-formed prefixes', () => {
    const raw = JSON.parse(
      readFileSync(path.join(CONTENT_ROOT, 'registries', 'SOLID_STATE_ROUTE_TAG_REGISTRY_v1.2.json'), 'utf8'),
    ) as { tags: { tag: string; flagPrefixes: string[] }[] };
    const tags = raw.tags.map((t) => t.tag);
    expect(new Set(tags).size).toBe(tags.length);
    for (const entry of raw.tags) {
      for (const prefix of entry.flagPrefixes) expect(prefix).toMatch(/^[A-Z][A-Z0-9_]*$/);
    }
  });

  it('asserts `academic` does not alter TRN event weight', () => {
    const academic = content.routeTags.get('academic')!;
    expect(academic.allowTransformationEventFavor).toBe(false);

    const { state } = createRun('academic', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    state.age = 30;
    const trnAcademic = content.events.filter((e) => e.channel === 'TRN' && e.routeTags.includes('academic'));
    expect(trnAcademic.length).toBeGreaterThan(0);
    for (const gameEvent of trnAcademic) {
      const before = eventContextScalar(gameEvent, state, content);
      state.flags.add('ROUTE_ACA_RESEARCH');
      const after = eventContextScalar(gameEvent, state, content);
      state.flags.delete('ROUTE_ACA_RESEARCH');
      expect(after, gameEvent.id).toBe(before);
    }
  });

  it('applies at most one route-favor scalar per event', () => {
    // A fixture event carrying three active route tags must gain exactly one
    // routeFavor multiplier, not three.
    const multi = event({
      id: 'EVT-INS-MUS-9500',
      channel: 'INS',
      family: 'MUS',
      routeTags: ['museum', 'medical', 'legal'],
    });
    const fixture = fixtureContent({ events: [multi] });
    const { state } = createRun('stacking', fixture, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    const neutral = eventContextScalar(multi, state, fixture);
    state.flags.add('ROUTE_MUS_INTEREST');
    const one = eventContextScalar(multi, state, fixture);
    state.flags.add('ROUTE_MED_SCREENED');
    state.flags.add('ROUTE_LEG_STATUS_CASE');
    const three = eventContextScalar(multi, state, fixture);
    expect(one / neutral).toBeCloseTo(content.balance.familyEvidenceScalar.routeFavor, 10);
    expect(three).toBe(one);
  });

  it('does not let route tags alter family probability', () => {
    const { state } = createRun('route-family', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    for (const family of ['MUS', 'MED', 'TEMP', 'STON']) {
      const before = familyEvidenceScalar('INS', family, state, content);
      state.flags.add('ROUTE_MUS_INTEREST');
      state.flags.add('ROUTE_MED_SCREENED');
      const after = familyEvidenceScalar('INS', family, state, content);
      state.flags.delete('ROUTE_MUS_INTEREST');
      state.flags.delete('ROUTE_MED_SCREENED');
      expect(after, family).toBe(before);
    }
  });
});

describe('3. Species refinement integrity', () => {
  it('rejects unknown refinementTags', () => {
    for (const gameEvent of content.events) {
      for (const tag of gameEvent.refinementTags) {
        expect(content.refinementTags.has(tag), `${gameEvent.id} -> ${tag}`).toBe(true);
      }
    }
  });

  it('applies family tendencies only at the family layer', () => {
    const { state } = createRun('tendency', content, {
      species: { kind: 'fixed', species: 'ELF' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    // ELF has CRYS/WOOD primary: the family layer reflects that.
    const crys = familyEvidenceScalar('TRN', 'CRYS', state, content);
    const cera = familyEvidenceScalar('TRN', 'CERA', state, content);
    expect(crys).toBeGreaterThan(cera);

    // ...and no transformation event gains it at the event layer.
    const trnEvent = content.events.find((e) => e.channel === 'TRN' && e.family === 'CRYS' && e.refinementTags.length === 0)!;
    expect(eventContextScalar(trnEvent, state, content)).toBe(1);
  });

  it('applies refinement hooks only at the event layer, and only on tagged events', () => {
    const tagged = content.events.filter((e) => e.refinementTags.length > 0);
    expect(tagged.length).toBeGreaterThan(0);

    for (const species of SPECIES_IDS) {
      const { state } = createRun(`refine-${species}`, content, {
        species: { kind: 'fixed', species },
        talents: { kind: 'none' },
        allocation: { kind: 'even' },
      });
      const def = content.species.get(species)!;
      for (const gameEvent of tagged) {
        const hook = def.refinementHooks.find((h) => gameEvent.refinementTags.includes(h.tag));
        const scalar = eventContextScalar(gameEvent, state, content);
        if (!hook || hook.operation === 'unlock') {
          expect(scalar, `${species} / ${gameEvent.id}`).toBe(1);
        } else {
          expect(scalar, `${species} / ${gameEvent.id}`).not.toBe(1);
        }
      }
      // A refinement tag never reaches the family layer.
      for (const family of ['STON', 'METL', 'CRYS']) {
        const withHooks = familyEvidenceScalar('TRN', family, state, content);
        const tendencies = content.speciesFamilyTendencies.get(species)!;
        const expected = tendencies.primary.has(family)
          ? content.balance.familyEvidenceScalar.speciesPrimary
          : tendencies.secondary.has(family)
            ? content.balance.familyEvidenceScalar.speciesSecondary
            : tendencies.uncommon.has(family)
              ? content.balance.familyEvidenceScalar.speciesUncommon
              : 1;
        expect(withHooks, `${species}/${family}`).toBeCloseTo(expected, 10);
      }
    }
  });

  it('gives MAGICAL_SEAL no broad material-family scalar', () => {
    expect(content.refinementTags.get('MAGICAL_SEAL')!.family).toBeNull();
    // No event carries it, and no species family tendency lists it.
    for (const species of content.species.values()) {
      for (const tier of ['primary', 'secondary', 'uncommon'] as const) {
        expect(species.familyTendencies[tier]).not.toContain('MAGICAL_SEAL');
      }
    }
  });

  it('has no extra refinement drafting stage', () => {
    const source = readFileSync(path.join(CONTENT_ROOT, '..', 'src', 'engine', 'drafting.ts'), 'utf8');
    // The draft has exactly three weightedPick stages: channel, family, event.
    expect(source.match(/rng\.weightedPick\(/g)?.length).toBe(3);
  });
});

describe('4. Talent typed operations', () => {
  it('loads Talent Registry v1.1 typed fields', () => {
    const t1023 = content.talents.get('T1023')!;
    expect(t1023.draftingStronglyFavor).toEqual([{ kind: 'channel', code: 'SPC' }]);
    expect(t1023.draftingSuppress).toEqual([{ kind: 'family', code: 'GEN' }]);
    const t1002 = content.talents.get('T1002')!;
    expect(t1002.draftingFavor).toEqual([
      { kind: 'family', code: 'CAR' },
      { kind: 'family', code: 'COR' },
    ]);
  });

  it('lets T1023 strongly favor SPC and suppress GEN', () => {
    const { state } = createRun('t1023', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'fixed', talents: ['T1023'] },
      allocation: { kind: 'even' },
    });
    const scalars = content.balance.familyEvidenceScalar;
    expect(talentChannelScalar('SPC', state, content)).toBeCloseTo(scalars.talentStronglyFavor, 10);
    expect(talentChannelScalar('ORD', state, content)).toBe(1);
    expect(familyEvidenceScalar('ORD', 'GEN', state, content)).toBeCloseTo(scalars.talentSuppress, 10);
  });

  it('does not turn unlock/redirect/narrative tags into multipliers', () => {
    const withTags = [...content.talents.values()].filter(
      (t) =>
        (t.unlockTags.length > 0 || t.redirectTags.length > 0 || t.narrativeTags.length > 0) &&
        t.draftingFavor.length === 0 &&
        t.draftingStronglyFavor.length === 0 &&
        t.draftingSuppress.length === 0,
    );
    expect(withTags.length).toBeGreaterThan(0);

    for (const talent of withTags) {
      const { state } = createRun(`tags-${talent.id}`, content, {
        species: { kind: 'fixed', species: 'HUMAN' },
        talents: { kind: 'fixed', talents: [talent.id] },
        allocation: { kind: 'even' },
      });
      for (const channel of ['ORD', 'INS', 'TRN', 'SPC'] as const) {
        expect(talentChannelScalar(channel, state, content), `${talent.id}/${channel}`).toBe(1);
      }
      for (const family of ['GEN', 'MUS', 'MED', 'STON']) {
        expect(familyEvidenceScalar('INS', family, state, content), `${talent.id}/${family}`).toBe(1);
      }
    }
  });

  it('keeps talent incompatibilities unchanged', () => {
    expect(content.talents.get('T1010')!.incompatibleWith).toEqual(['T1023']);
    expect(content.talents.get('T1028')!.incompatibleWith).toEqual(['T1029']);
    expect(content.talents.get('T1025')!.incompatibleWith).toEqual(['T1030']);
  });

  it('reads Q-15 registered-species rules from the registry', () => {
    expect(content.talents.get('T1025')!.registeredSpeciesRule).toBe('UNREGISTERED');
    expect(content.talents.get('T1030')!.registeredSpeciesRule).toBe('SEEDED_OTHER_SPECIES');
  });

  it('keeps T1027 start_fix_bonus canonically blank while Q-14 is open', () => {
    expect(content.talents.get('T1027')!.startFixBonus).toBeNull();
  });

  it('fixes the T1030 registered species once for the run', () => {
    for (let i = 0; i < 20; i++) {
      const seed = `t1030-${i}`;
      const policy: SetupPolicy = {
        species: { kind: 'fixed', species: 'DWARF' },
        talents: { kind: 'fixed', talents: ['T1030'] },
        allocation: { kind: 'seeded_random' },
      };
      const a = runSimulation(seed, content, policy);
      const b = runSimulation(seed, content, policy);
      expect(a.state.registeredSpecies).toBe(b.state.registeredSpecies);
      expect(a.state.registeredSpecies).not.toBe('DWARF');
      expect(a.state.species).toBe('DWARF');
    }
  });
});

describe('5. Awareness registry', () => {
  it('loads structured awareness without parsing prose alternatives', () => {
    // No prose-alternative table remains, and the loader exposes typed fields.
    const source = readFileSync(path.join(CONTENT_ROOT, '..', 'src', 'engine', 'endings.ts'), 'utf8');
    expect(source).not.toContain('endingAwarenessRules');
    expect(source).not.toContain('defaultAwarenessRaw');
    for (const ending of content.endings.values()) {
      // Every value is a single canonical state, never an "A or B" string.
      expect(ending.defaultAwareness).not.toMatch(/ or |;/);
      if (ending.awarenessIfTemporal) expect(ending.awarenessIfTemporal).not.toMatch(/ or |;/);
    }
    const anoOne = content.endings.get('END-ANO-001')!;
    expect(anoOne.defaultAwareness).toBe('Continuous');
    expect(anoOne.authorizationRequiredStates).toEqual(['Continuous', 'Intermittent']);
    expect(anoOne.authorizingTalents).toEqual(['T1028']);
  });

  it('requires no authorization for Uncertain', () => {
    const uncertain = [...content.endings.values()].filter((e) => e.defaultAwareness === 'Uncertain');
    expect(uncertain.length).toBeGreaterThan(0);
    const { state } = createRun('uncertain', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    for (const ending of uncertain) {
      expect(ending.authorizationRequiredStates).not.toContain('Uncertain');
      expect(resolveAwareness(content, ending.id, 'CRYS', state, undefined).awareness).toBe('Uncertain');
    }
  });

  it('requires T1028 for END-ANO-001 and T1029 for END-ANO-002', () => {
    const plain = createRun('plain', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    }).state;
    expect(resolveAwareness(content, 'END-ANO-001', 'STON', plain, undefined).awareness).toBe('Unconscious');
    expect(resolveAwareness(content, 'END-ANO-002', 'STON', plain, undefined).awareness).toBe('Unconscious');

    const withT1028 = createRun('t1028', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'fixed', talents: ['T1028'] },
      allocation: { kind: 'even' },
    }).state;
    expect(resolveAwareness(content, 'END-ANO-001', 'STON', withT1028, undefined).awareness).toBe('Continuous');

    const withT1029 = createRun('t1029', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'fixed', talents: ['T1029'] },
      allocation: { kind: 'even' },
    }).state;
    expect(resolveAwareness(content, 'END-ANO-002', 'STON', withT1029, undefined).awareness).toBe('Displaced');
    // T1029 does not authorize END-ANO-001.
    expect(resolveAwareness(content, 'END-ANO-001', 'STON', withT1029, undefined).awareness).toBe('Unconscious');
  });

  it('uses Suspended for ordinary temporal outcomes', () => {
    const { state } = createRun('temporal', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    for (const ending of content.endings.values()) {
      if (!ending.awarenessIfTemporal) continue;
      expect(resolveAwareness(content, ending.id, 'TEMP', state, undefined).awareness).toBe(
        ending.awarenessIfTemporal,
      );
    }
    expect(resolveAwareness(content, 'END-TMP-001', 'TEMP', state, undefined).awareness).toBe('Suspended');
  });
});

describe('6. Schedule priorityOrder', () => {
  const makeSchedule = (seq: number, priorityOrder: number): PendingSchedule => ({
    seq,
    eventId: `EVT-ORD-GEN-000${seq}`,
    earliestAge: 20,
    latestAge: 30,
    priority: 'scheduled',
    priorityOrder,
    validityCondition: 'TRUE',
    createdAtAge: 18,
    createdByEventId: 'EVT-ORD-GEN-0001',
  });

  const candidate = (schedule: PendingSchedule, rank = 200) => ({
    schedule,
    event: event({ id: schedule.eventId }),
    rank,
  });

  it('defaults existing schedules to priorityOrder 0', () => {
    const trigger = event({
      id: 'EVT-ORD-CAR-9600',
      family: 'CAR',
      age: { min: 10, max: 10 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [
        variant({
          schedules: [
            { eventId: 'EVT-ORD-CAR-9601', offsetYears: 1, windowYears: 3, priority: 'scheduled', validityCondition: 'TRUE' },
          ],
        }),
      ],
    });
    const target = event({
      id: 'EVT-ORD-CAR-9601',
      family: 'CAR',
      selectionMode: 'scheduled_only',
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
    });
    const fixture = fixtureContent({ events: [trigger, target, event({ id: 'EVT-ORD-GEN-9000', exclude: 'AGE=10' })] });
    const result = runSimulation('default-order', fixture, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    }, { maxAge: 20 });
    expect(result.state.history.some((h) => h.eventId === 'EVT-ORD-CAR-9601')).toBe(true);
  });

  it('lets the higher priorityOrder win inside a class', () => {
    const low = candidate(makeSchedule(1, 0));
    const high = candidate(makeSchedule(2, 10));
    const ranked = rankCandidates([low, high], Rng.fromSeed('x'));
    expect(ranked[0]!.schedule.priorityOrder).toBe(10);
  });

  it('breaks an actual tie with seeded RNG, reproducibly', () => {
    const a = candidate(makeSchedule(1, 5));
    const b = candidate(makeSchedule(2, 5));
    const c = candidate(makeSchedule(3, 5));

    const winners = new Set<number>();
    for (let i = 0; i < 60; i++) {
      winners.add(rankCandidates([a, b, c], Rng.fromSeed(`tie-${i}`))[0]!.schedule.seq);
    }
    // The tiebreak actually varies rather than always picking creation order.
    expect(winners.size).toBeGreaterThan(1);

    // ...and the same seed always produces the same winner.
    for (let i = 0; i < 10; i++) {
      const first = rankCandidates([a, b, c], Rng.fromSeed('stable'))[0]!.schedule.seq;
      const second = rankCandidates([a, b, c], Rng.fromSeed('stable'))[0]!.schedule.seq;
      expect(first).toBe(second);
    }
  });

  it('still ranks priority class above priorityOrder', () => {
    const scheduled = candidate(makeSchedule(1, 99), 200);
    const climax = candidate(makeSchedule(2, 0), 400);
    expect(rankCandidates([scheduled, climax], Rng.fromSeed('x'))[0]!.rank).toBe(400);
  });
});

describe('7. SPC and mandatory content', () => {
  it('observes non-zero SPC use, mandatory events, and both anomalous endings', () => {
    let spcYears = 0;
    let mandatoryYears = 0;
    const endings = new Set<string>();
    for (let i = 0; i < 600; i++) {
      const result = runSimulation(`spc-${i}`, content, diagnostic);
      spcYears += result.state.history.filter((h) => h.channel === 'SPC').length;
      mandatoryYears += result.state.history.filter((h) => h.selectionMode === 'mandatory_only').length;
      if (result.outcome.kind === 'ended') endings.add(result.outcome.ending.endingId);
    }
    expect(spcYears).toBeGreaterThan(0);
    expect(mandatoryYears).toBeGreaterThan(0);
    expect(endings.has('END-ANO-001')).toBe(true);
    expect(endings.has('END-ANO-002')).toBe(true);
  });

  it('reaches the anomalous endings in the targeted talent scenario', () => {
    const endings = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const result = runSimulation(`ano-${i}`, content, {
        species: { kind: 'seeded_random' },
        talents: { kind: 'fixed', talents: ['T1027', 'T1028', 'T1030'] },
        allocation: { kind: 'seeded_random' },
      });
      if (result.outcome.kind === 'ended') endings.add(result.outcome.ending.endingId);
    }
    expect(endings.has('END-ANO-001')).toBe(true);
  });

  it('keeps one visible event per year through mandatory sequences', () => {
    for (let i = 0; i < 200; i++) {
      const result = runSimulation(`mandatory-cadence-${i}`, content, diagnostic);
      const ages = result.state.history.map((h) => h.age);
      expect(new Set(ages).size).toBe(ages.length);
    }
  });
});

describe('8. Late-life ending reachability', () => {
  it('demonstrates at least one canonical ending at age 65+', () => {
    let lateEndings = 0;
    for (let i = 0; i < 1500; i++) {
      const result = runSimulation(`late-${i}`, content, diagnostic);
      if (result.outcome.kind === 'ended' && result.outcome.ending.endingAge >= 65) lateEndings++;
    }
    expect(lateEndings).toBeGreaterThan(0);
  });

  it('has canonical climax content whose age window reaches past 64', () => {
    const late = content.events.filter(
      (e) => e.selectionMode === 'climax' && (e.age.max === null || e.age.max > 64),
    );
    expect(late.length).toBeGreaterThan(0);
  });
});

describe('9. FIX threshold experiment', () => {
  it('authorizes no passive FIX drift', () => {
    // The balance field exists solely to pin it at null (Q-26).
    expect(content.balance.fixAnnualDrift).toBeNull();

    // Behavioural proof: FIX changes only in years whose resolved variant has a
    // FIX effect, and never merely because a year passed.
    for (let i = 0; i < 60; i++) {
      const result = runSimulation(`nodrift-${i}`, content, diagnostic);
      const replay = createRun(`nodrift-${i}`, content, diagnostic);
      let fix = replay.state.stats.FIX;
      for (const occurrence of result.state.history) {
        const resolved = content.eventsById.get(occurrence.eventId)!.variants[occurrence.variantIndex]!;
        const delta = resolved.effects.FIX ?? 0;
        fix = Math.max(0, fix + delta);
      }
      // Talent effects never touch FIX beyond the start bonus already applied.
      expect(result.state.stats.FIX, `run ${i}`).toBe(fix);
    }
  });

  it('applies each threshold profile reversibly, rewriting both gate sites', () => {
    for (const profileName of Object.keys(matrix.thresholdProfiles)) {
      const { content: derived, application } = applyThresholdProfile(content, matrix, profileName);
      expect(application.totalRewrites).toBeGreaterThan(0);
      expect(application.eventsWithoutGate, `${profileName} left a gate unrewritten`).toEqual([]);

      const profile = matrix.thresholdProfiles[profileName]!;
      for (const [gate, eventIds] of Object.entries(matrix.gateAssignments)) {
        const expected = profile[gate]!;
        for (const eventId of eventIds) {
          const gameEvent = derived.eventsById.get(eventId)!;
          const found = /FIX\s*>=\s*(\d+)/.exec(gameEvent.include);
          expect(found, `${eventId} include has no FIX gate`).not.toBeNull();
          expect(Number(found![1]), `${eventId} include gate`).toBe(expected);
        }
      }
      // Schedules pointing at gate-assigned events are rewritten too.
      for (const gameEvent of derived.events) {
        for (const v of gameEvent.variants) {
          for (const schedule of v.schedules) {
            const target = application.applied.get(schedule.eventId);
            if (target === undefined) continue;
            const found = /FIX\s*>=\s*(\d+)/.exec(schedule.validityCondition);
            if (!found) continue;
            expect(Number(found[1]), `${gameEvent.id} -> ${schedule.eventId}`).toBe(target);
          }
        }
      }
      // The base bundle is untouched.
      expect(content.eventsById.get('EVT-INS-ACA-0005')!.include).toContain('FIX>=55');
    }
  });

  it('produces different outcomes across profiles', () => {
    const completion = new Map<string, number>();
    for (const profileName of ['LOW', 'ORIGINAL_REFERENCE']) {
      const { content: derived } = applyThresholdProfile(content, matrix, profileName);
      let ended = 0;
      for (let i = 0; i < 200; i++) {
        if (runSimulation(`thr-${i}`, derived, diagnostic).outcome.kind === 'ended') ended++;
      }
      completion.set(profileName, ended);
    }
    expect(completion.get('LOW')!).toBeGreaterThan(completion.get('ORIGINAL_REFERENCE')!);
  });
});

describe('10. Family-weighting A/B', () => {
  it('has uniform as the design baseline', () => {
    expect(content.balance.familyWeightMode).toBe('uniform');
  });

  it('does not let event count become family probability under uniform', () => {
    // Two families in the same channel, one with five events and one with one.
    const dense = Array.from({ length: 5 }, (_, i) =>
      event({ id: `EVT-ORD-EDU-96${i}0`, family: 'EDU' }),
    );
    const sparse = event({ id: 'EVT-ORD-HOU-9700', family: 'HOU' });
    const fixture = fixtureContent({ events: [...dense, sparse] });

    let eduYears = 0;
    let houYears = 0;
    for (let i = 0; i < 60; i++) {
      const result = runSimulation(`uniform-${i}`, fixture, {
        species: { kind: 'fixed', species: 'HUMAN' },
        talents: { kind: 'none' },
        allocation: { kind: 'even' },
      }, { maxAge: 40 });
      eduYears += result.state.history.filter((h) => h.family === 'EDU').length;
      houYears += result.state.history.filter((h) => h.family === 'HOU').length;
    }
    // Uniform families: roughly 50/50 despite the 5:1 event count.
    const ratio = eduYears / houYears;
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(1.25);
  });

  it('lets sum_of_event_weights follow content density, as the diagnostic comparison', () => {
    const dense = Array.from({ length: 5 }, (_, i) =>
      event({ id: `EVT-ORD-EDU-97${i}0`, family: 'EDU' }),
    );
    const sparse = event({ id: 'EVT-ORD-HOU-9800', family: 'HOU' });
    const fixture = withFamilyWeightMode(
      fixtureContent({ events: [...dense, sparse] }),
      'sum_of_event_weights',
    );

    let eduYears = 0;
    let houYears = 0;
    for (let i = 0; i < 60; i++) {
      const result = runSimulation(`density-${i}`, fixture, {
        species: { kind: 'fixed', species: 'HUMAN' },
        talents: { kind: 'none' },
        allocation: { kind: 'even' },
      }, { maxAge: 40 });
      eduYears += result.state.history.filter((h) => h.family === 'EDU').length;
      houYears += result.state.history.filter((h) => h.family === 'HOU').length;
    }
    expect(eduYears / houYears).toBeGreaterThan(3);
  });
});

describe('11. Allocation policies', () => {
  it('produces materially different builds per policy', () => {
    const spread = (policy: SetupPolicy['allocation']): number => {
      let total = 0;
      for (let i = 0; i < 200; i++) {
        const { setup } = createRun(`alloc-${i}`, content, {
          species: { kind: 'fixed', species: 'HUMAN' },
          talents: { kind: 'none' },
          allocation: policy,
        });
        const values = Object.values(setup.allocation);
        total += Math.max(...values) - Math.min(...values);
      }
      return total / 200;
    };
    const balanced = spread({ kind: 'seeded_random' });
    const minmax = spread({ kind: 'minmax' });
    const archetype = spread({
      kind: 'archetype',
      archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as never),
    });
    // Min-max and archetype builds are far more extreme than balanced fill.
    expect(minmax).toBeGreaterThan(balanced);
    expect(archetype).toBeGreaterThan(balanced);
  });

  it('keeps every policy inside the species point budget and 0-10 cap', () => {
    for (const species of SPECIES_IDS) {
      const points = content.species.get(species)!.allocation_points;
      for (const policy of [
        { kind: 'seeded_random' } as const,
        { kind: 'minmax' } as const,
        {
          kind: 'archetype' as const,
          archetypes: matrix.archetypePolicy.archetypes.map((a) => a.priority as never),
        },
      ]) {
        for (let i = 0; i < 40; i++) {
          const { setup } = createRun(`budget-${species}-${i}`, content, {
            species: { kind: 'fixed', species },
            talents: { kind: 'none' },
            allocation: policy,
          });
          const values = Object.values(setup.allocation);
          expect(values.reduce((a, b) => a + b, 0)).toBe(points);
          for (const value of values) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(10);
          }
        }
      }
    }
  });
});

describe('12. First manifestation neutrality diagnostic', () => {
  it('no longer lets WOOD dominate a neutral Human', () => {
    const counts = new Map<string, number>();
    let withManifestation = 0;
    for (let i = 0; i < 800; i++) {
      const result = runSimulation(`neutral-${i}`, content, {
        species: { kind: 'fixed', species: 'HUMAN' },
        talents: { kind: 'none' },
        allocation: { kind: 'seeded_random' },
      });
      const family = result.state.diagnostics.firstManifestationFamily;
      if (!family) continue;
      withManifestation++;
      counts.set(family, (counts.get(family) ?? 0) + 1);
    }
    expect(withManifestation).toBeGreaterThan(100);
    const wood = (counts.get('WOOD') ?? 0) / withManifestation;
    // Addendum section 12: WOOD above 50% is a failure of opportunity balance.
    expect(wood, `WOOD first-manifestation share ${(wood * 100).toFixed(1)}%`).toBeLessThanOrEqual(0.5);
    // Several families must be reachable, not just two.
    expect(counts.size).toBeGreaterThanOrEqual(5);
  });

  it('has adolescent manifestation content beyond WOOD', () => {
    const adolescent = content.events.filter(
      (e) =>
        e.channel === 'TRN' &&
        e.age.min < 18 &&
        e.variants.some((v) => v.addFlags.some((f) => f.startsWith('MAT_MANIFEST_'))),
    );
    const families = new Set(adolescent.map((e) => e.family));
    expect(families.size).toBeGreaterThan(1);
  });
});

describe('14. Deferred questions stay open', () => {
  it('does not resolve Q-14 automatically', () => {
    // Canonical registry value stays blank; only the diagnostic adapter has one.
    expect(content.talents.get('T1027')!.startFixBonus).toBeNull();
    expect(content.adapters.talentDiagnostics['T1027']?.startFIX).toBeDefined();
    // And the sweep produces a range rather than a single value.
    expect(matrix.t1027Sensitivity.startFIXValues.length).toBeGreaterThan(1);
    const derived = withT1027StartFix(content, 8);
    expect(derived.talents.get('T1027')!.startFixBonus).toBe(8);
    expect(content.talents.get('T1027')!.startFixBonus).toBeNull();
  });
});
