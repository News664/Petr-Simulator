import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { selectVariantIndex } from '../src/engine/eligibility.js';
import { runSimulation } from '../src/engine/simulation.js';
import { SPECIES_IDS, type GameEvent } from '../src/engine/types.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';

/**
 * H2B.1B Part A — first-occurrence repeat semantics.
 *
 * A repeated ordinary circumstance keeps its narrative density but stops
 * granting the same permanent personal growth. The mechanism is the existing
 * condition grammar, not a new meter: `EVT[<self>]` is false while the event is
 * being resolved for the first time and true on every later occurrence, because
 * the annual loop selects the variant against PRE-EVENT state and only then
 * records the occurrence.
 *
 * These tests pin that ordering, because the whole patch depends on it.
 */

const content = loadDefaultContent();

/**
 * Events the Part A ledger converts to first-occurrence-only growth, and the
 * stats a later occurrence of each may no longer raise.
 *
 * The scope is per event because the ledger is: `EVT-ORD-SOC-0003` loses only
 * repeated CHR, `EVT-ORD-FAM-0007` only repeated INT, and `EVT-ORD-FAM-0005`
 * only the SPR +2 branch. Nothing here is a corpus-wide transformation.
 */
const CONVERTED: { id: string; stats: readonly ('INT' | 'CHR' | 'SPR')[]; everyBranch: boolean }[] = [
  { id: 'EVT-ORD-EDU-0004', stats: ['INT', 'SPR'], everyBranch: true },
  { id: 'EVT-ORD-EDU-0007', stats: ['INT', 'SPR'], everyBranch: true },
  { id: 'EVT-ORD-SOC-0001', stats: ['CHR', 'SPR'], everyBranch: true },
  { id: 'EVT-ORD-SOC-0002', stats: ['CHR', 'SPR'], everyBranch: true },
  { id: 'EVT-ORD-SOC-0004', stats: ['CHR', 'SPR'], everyBranch: true },
  { id: 'EVT-ORD-SOC-0006', stats: ['SPR'], everyBranch: true },
  { id: 'EVT-ORD-SOC-0007', stats: ['CHR', 'SPR'], everyBranch: true },
  { id: 'EVT-ORD-SOC-0008', stats: ['SPR'], everyBranch: true },
  { id: 'EVT-ORD-HEA-0002', stats: ['SPR'], everyBranch: true },
  // Partially converted: only the branch the ledger names is guarded, so the
  // unguarded branch still behaves exactly as it did before.
  { id: 'EVT-ORD-SOC-0003', stats: ['CHR'], everyBranch: false },
  { id: 'EVT-ORD-FAM-0005', stats: ['SPR'], everyBranch: false },
  { id: 'EVT-ORD-FAM-0007', stats: ['INT'], everyBranch: false },
];

describe('H2B.1B-A — the first-occurrence mechanism', () => {
  it('does not see the current event in history while its variant is chosen', () => {
    // A two-variant event whose first variant only matches once the event is
    // already in history. On the first resolution the TRUE fallback must win.
    const id = 'EVT-ORD-GEN-9100';
    const subject: GameEvent = event({
      id,
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [
        variant({ when: `EVT[${id}]`, effects: {}, text: { en: 'again', 'zh-TW': '' } }),
        variant({ when: 'TRUE', effects: { INT: 1 }, text: { en: 'first', 'zh-TW': '' } }),
      ],
    });
    const bundle = fixtureContent({ events: [subject] });
    const result = runSimulation('first-occurrence', bundle, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    }, { maxAge: 5 });

    const chosen = result.state.history.map((occurrence) => occurrence.variantIndex);
    expect(chosen[0]).toBe(1);
    // Every later year is a repeat, so the guarded variant wins from then on.
    expect(chosen.slice(1).every((index) => index === 0)).toBe(true);
  });

  it('grants the authored growth exactly once however often the event repeats', () => {
    const id = 'EVT-ORD-GEN-9101';
    const subject: GameEvent = event({
      id,
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [
        variant({ when: `EVT[${id}]`, effects: {} }),
        variant({ when: 'TRUE', effects: { INT: 1 } }),
      ],
    });
    const bundle = fixtureContent({ events: [subject] });
    const result = runSimulation('once-only', bundle, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'explicit', allocation: { CHR: 4, INT: 0, STR: 4, MNY: 10, SPR: 3 } },
    }, { maxAge: 20 });

    expect(result.state.history.length).toBe(21);
    // 21 occurrences, exactly one INT point.
    expect(result.state.stats.INT).toBe(1);
  });

  it('keeps the narrative density: a later occurrence still produces a visible year', () => {
    const id = 'EVT-ORD-GEN-9102';
    const subject: GameEvent = event({
      id,
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [
        variant({ when: `EVT[${id}]`, effects: {}, text: { en: 'the same thing happens again', 'zh-TW': '' } }),
        variant({ when: 'TRUE', effects: { INT: 1 }, text: { en: 'it happens', 'zh-TW': '' } }),
      ],
    });
    const bundle = fixtureContent({ events: [subject] });
    const result = runSimulation('density', bundle, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    }, { maxAge: 4 });

    expect(result.state.history.map((o) => o.textEn)).toEqual([
      'it happens',
      'the same thing happens again',
      'the same thing happens again',
      'the same thing happens again',
      'the same thing happens again',
    ]);
  });
});

describe('H2B.1B-A — canonical first-occurrence content', () => {
  it('guards every converted event with its own history predicate', () => {
    for (const { id } of CONVERTED) {
      const subject = content.eventsById.get(id);
      expect(subject, `${id} must exist`).toBeDefined();
      const guarded = subject!.variants.filter((v) => v.when.includes(`EVT[${id}]`));
      expect(guarded.length, `${id} must carry at least one later-occurrence variant`).toBeGreaterThan(0);
    }
  });

  it('places every later-occurrence variant before its first-occurrence twin', () => {
    // First match wins, so a guarded variant sitting after an unguarded one can
    // never be reached. This is the failure mode the ordering protects against.
    for (const { id } of CONVERTED) {
      const subject = content.eventsById.get(id)!;
      const lastGuarded = subject.variants.reduce(
        (last, v, index) => (v.when.includes(`EVT[${id}]`) ? index : last),
        -1,
      );
      const firstUnguarded = subject.variants.findIndex((v) => !v.when.includes(`EVT[${id}]`));
      expect(lastGuarded, `${id}: guarded variants must precede unguarded ones`).toBeLessThan(firstUnguarded);
    }
  });

  it('never grants the converted stat on a guarded later-occurrence variant', () => {
    for (const { id, stats } of CONVERTED) {
      const subject = content.eventsById.get(id)!;
      for (const [index, v] of subject.variants.entries()) {
        if (!v.when.includes(`EVT[${id}]`)) continue;
        for (const stat of stats) {
          expect(
            v.effects[stat] ?? 0,
            `${id} variant ${index} may not raise ${stat} on a repeat`,
          ).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it('grants a guarded variant no more than its own first-occurrence twin', () => {
    // A guard exists to withhold growth, never to add any. Each guarded variant
    // wraps one authored branch, so it is compared against that branch alone.
    // Only the positive part is compared: some ledger entries drop the whole
    // effect block on a repeat, which removes an authored penalty too, and that
    // is the instruction rather than a regression.
    const growth = (value: number | undefined): number => Math.max(value ?? 0, 0);
    for (const { id } of CONVERTED) {
      const subject = content.eventsById.get(id)!;
      const prefix = `EVT[${id}]`;
      for (const guardedVariant of subject.variants) {
        if (!guardedVariant.when.startsWith(prefix)) continue;
        const inner = guardedVariant.when === prefix
          ? 'TRUE'
          : guardedVariant.when.slice(`${prefix} & (`.length, -1);
        const twin = subject.variants.find((v) => v.when === inner);
        expect(twin, `${id}: guarded variant ${guardedVariant.when} has no authored twin`).toBeDefined();
        for (const stat of ['INT', 'CHR', 'SPR', 'STR', 'MNY'] as const) {
          expect(
            growth(guardedVariant.effects[stat]),
            `${id} ${guardedVariant.when}: ${stat} growth exceeds the first occurrence`,
          ).toBeLessThanOrEqual(growth(twin!.effects[stat]));
        }
      }
    }
  });

  it('caps the late reunion at two occurrences', () => {
    const reunion = content.eventsById.get('EVT-ORD-SOC-0004')!;
    expect(reunion.repeatMaxCount).toBe(2);
  });

  it('stops the growth after the first occurrence in real runs', () => {
    // The structural checks above prove the shape; this proves the behaviour,
    // by walking complete simulated lives and looking at what each repeat
    // actually applied.
    const fullyConverted = CONVERTED.filter((entry) => entry.everyBranch);
    let repeatsObserved = 0;

    for (let index = 0; index < 400; index++) {
      const result = runSimulation(`repeat-semantics-${index}`, content, {
        species: { kind: 'fixed', species: SPECIES_IDS[index % SPECIES_IDS.length]! },
        talents: { kind: 'seeded_random_compatible' },
        allocation: { kind: 'seeded_random' },
      }, { maxAge: 120 });

      const seen = new Map<string, number>();
      for (const occurrence of result.state.history) {
        const entry = fullyConverted.find((candidate) => candidate.id === occurrence.eventId);
        if (!entry) continue;
        const count = (seen.get(entry.id) ?? 0) + 1;
        seen.set(entry.id, count);
        if (count === 1) continue;
        repeatsObserved += 1;
        const variant = content.eventsById.get(entry.id)!.variants[occurrence.variantIndex]!;
        for (const stat of entry.stats) {
          expect(
            variant.effects[stat] ?? 0,
            `${entry.id} occurrence ${count} at age ${occurrence.age} raised ${stat}`,
          ).toBeLessThanOrEqual(0);
        }
      }
    }

    // The assertion above is vacuous if no repeat ever fired, so pin that too.
    expect(repeatsObserved).toBeGreaterThan(100);
  });
});
