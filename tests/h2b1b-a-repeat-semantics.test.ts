import { describe, expect, it } from 'vitest';

import { runSimulation } from '../src/engine/simulation.js';
import type { GameEvent } from '../src/engine/types.js';
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
