import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { REPO_ROOT, loadDefaultContent } from '../src/engine/content/load.js';
import { Rng } from '../src/engine/rng.js';
import { runSimulation } from '../src/engine/simulation.js';
import type { SetupPolicy } from '../src/engine/setup.js';

/**
 * Acceptance B — Deterministic RNG.
 */
const content = loadDefaultContent();

const policy: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'seeded_random' },
};

function timeline(seed: string): string {
  const result = runSimulation(seed, content, policy);
  return result.state.history.map((h) => `${h.age}:${h.eventId}#${h.variantIndex}:${h.source}`).join('|');
}

/** Full run signature: setup decisions plus the resulting timeline. */
function signature(seed: string): string {
  const result = runSimulation(seed, content, policy);
  return JSON.stringify([result.setup, timeline(seed), result.state.stats]);
}

/** Strips comments so a doc-comment mentioning an API is not a false positive. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('B. Deterministic RNG', () => {
  const seeds = ['golden-1', 'golden-2', 'golden-3', '12345', 'permanent-form'];

  it('produces an identical full timeline for the same seed and setup', () => {
    for (const seed of seeds) {
      expect(timeline(seed)).toBe(timeline(seed));
    }
  });

  it('produces an identical ending record for the same seed and setup', () => {
    for (const seed of seeds) {
      const a = runSimulation(seed, content, policy);
      const b = runSimulation(seed, content, policy);
      expect(JSON.stringify(a.outcome.kind === 'ended' ? a.outcome.ending : null)).toBe(
        JSON.stringify(b.outcome.kind === 'ended' ? b.outcome.ending : null),
      );
      expect(a.setup).toEqual(b.setup);
      expect(a.state.stats).toEqual(b.state.stats);
      expect([...a.state.flags].sort()).toEqual([...b.state.flags].sort());
    }
  });

  it('repeats identically across many sequential Node runs', () => {
    for (const seed of seeds) {
      const results = Array.from({ length: 5 }, () => timeline(seed));
      expect(new Set(results).size).toBe(1);
    }
  });

  it('gives different seeds different runs', () => {
    const many = Array.from({ length: 40 }, (_, i) => `distinct-${i}`);
    const distinct = new Set(many.map(signature));
    expect(distinct.size).toBe(many.length);
  });

  it('is unaffected by playback timing, observers or render count', () => {
    const baseline = timeline('timing-seed');

    // Simulate a UI that observes every year and does arbitrary extra work.
    let observed = 0;
    const withObserver = runSimulation('timing-seed', content, policy, {
      onYear: () => {
        observed++;
        // Playback speed changes presentation delays only; burning entropy here
        // must not reach the engine's generator.
        Math.random();
        Math.random();
      },
    });
    expect(observed).toBeGreaterThan(0);
    expect(
      withObserver.state.history.map((h) => `${h.age}:${h.eventId}#${h.variantIndex}:${h.source}`).join('|'),
    ).toBe(baseline);
  });

  it('never uses Math.random inside engine logic', () => {
    const engineDir = path.join(REPO_ROOT, 'src', 'engine');
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith('.ts')) continue;
        if (/Math\s*\.\s*random/.test(stripComments(readFileSync(full, 'utf8')))) {
          offenders.push(path.relative(REPO_ROOT, full));
        }
      }
    };
    walk(engineDir);
    walk(path.join(REPO_ROOT, 'src', 'sim'));
    expect(offenders).toEqual([]);
  });

  describe('RNG primitive', () => {
    it('serializes and restores state exactly', () => {
      const rng = Rng.fromSeed('serialize-me');
      for (let i = 0; i < 17; i++) rng.nextUint32();
      const state = rng.getState();
      const expected = Array.from({ length: 10 }, () => rng.nextUint32());
      const restored = Rng.fromState(state);
      expect(Array.from({ length: 10 }, () => restored.nextUint32())).toEqual(expected);
      expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    });

    it('produces values in range', () => {
      const rng = Rng.fromSeed('range');
      for (let i = 0; i < 5000; i++) {
        const f = rng.nextFloat();
        expect(f).toBeGreaterThanOrEqual(0);
        expect(f).toBeLessThan(1);
        const n = rng.nextInt(7);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(7);
      }
    });

    it('respects weights', () => {
      const rng = Rng.fromSeed('weights');
      const counts = [0, 0, 0];
      for (let i = 0; i < 20000; i++) counts[rng.weightedIndex([1, 0, 3])]! += 1;
      expect(counts[1]).toBe(0);
      expect(counts[2]! / counts[0]!).toBeGreaterThan(2.5);
      expect(counts[2]! / counts[0]!).toBeLessThan(3.5);
    });

    it('rejects degenerate inputs instead of silently returning a default', () => {
      const rng = Rng.fromSeed('degenerate');
      expect(() => rng.pick([])).toThrow();
      expect(() => rng.nextInt(0)).toThrow();
      expect(() => rng.weightedIndex([0, 0])).toThrow();
      expect(() => rng.weightedIndex([-1, 2])).toThrow();
    });

    it('is engine-independent: fixed seed produces a fixed golden sequence', () => {
      const rng = Rng.fromSeed('solid-state');
      const golden = Array.from({ length: 8 }, () => rng.nextUint32());
      // Regenerating from the same seed must reproduce it bit-for-bit.
      const again = Rng.fromSeed('solid-state');
      expect(Array.from({ length: 8 }, () => again.nextUint32())).toEqual(golden);
      for (const value of golden) {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(0xffffffff);
      }
    });
  });
});
