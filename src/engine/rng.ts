/**
 * Deterministic seeded RNG.
 *
 * Contract section 4:
 *  - one explicit seeded RNG abstraction;
 *  - identical content version + seed + starting selections => identical result;
 *  - Node and browser must agree;
 *  - never Math.random() inside engine logic;
 *  - the seed must serialize.
 *
 * Implementation: cyrb128 string seeding into sfc32. All arithmetic is 32-bit
 * integer / IEEE-754 double work that behaves identically in every JS engine.
 */

export interface RngState {
  a: number;
  b: number;
  c: number;
  d: number;
}

/** Hash an arbitrary seed string to four 32-bit words. */
export function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ];
}

export class Rng {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  /** Number of draws taken. Diagnostic only; not part of the RNG state. */
  private draws = 0;

  private constructor(a: number, b: number, c: number, d: number) {
    this.a = a >>> 0;
    this.b = b >>> 0;
    this.c = c >>> 0;
    this.d = d >>> 0;
  }

  static fromSeed(seed: string): Rng {
    const [a, b, c, d] = cyrb128(seed);
    const rng = new Rng(a, b, c, d);
    // Discard a short warmup so that near-identical seed strings diverge quickly.
    for (let i = 0; i < 12; i++) rng.nextUint32();
    rng.draws = 0;
    return rng;
  }

  static fromState(state: RngState): Rng {
    return new Rng(state.a, state.b, state.c, state.d);
  }

  /** Serializable state. */
  getState(): RngState {
    return { a: this.a, b: this.b, c: this.c, d: this.d };
  }

  get drawCount(): number {
    return this.draws;
  }

  /** Derive an independent stream from this generator's current state. */
  fork(label: string): Rng {
    const s = this.getState();
    return Rng.fromSeed(`${s.a}:${s.b}:${s.c}:${s.d}:${label}`);
  }

  nextUint32(): number {
    this.draws++;
    // sfc32
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** Uniform in [0, 1). */
  nextFloat(): number {
    return this.nextUint32() / 4294967296;
  }

  /** Uniform integer in [0, boundExclusive). Rejection-sampled, so unbiased. */
  nextInt(boundExclusive: number): number {
    if (!Number.isInteger(boundExclusive) || boundExclusive <= 0) {
      throw new RangeError(`nextInt bound must be a positive integer, got ${boundExclusive}`);
    }
    if (boundExclusive === 1) return 0;
    const limit = Math.floor(4294967296 / boundExclusive) * boundExclusive;
    let value = this.nextUint32();
    while (value >= limit) value = this.nextUint32();
    return value % boundExclusive;
  }

  /** Uniform choice. Throws on an empty array so silent no-ops cannot hide. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new RangeError('pick() on empty array');
    return items[this.nextInt(items.length)]!;
  }

  /**
   * Weighted choice over parallel arrays. Weights must be finite and >= 0 with a
   * positive sum. Selection is index-stable for a given weight vector, which is
   * what makes renormalization after empty-pool removal reproducible.
   */
  weightedIndex(weights: readonly number[]): number {
    let total = 0;
    for (const w of weights) {
      if (!Number.isFinite(w) || w < 0) throw new RangeError(`invalid weight ${w}`);
      total += w;
    }
    if (total <= 0) throw new RangeError('weightedIndex requires a positive total weight');
    const target = this.nextFloat() * total;
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i]!;
      if (target < acc) return i;
    }
    // Floating-point tail guard: return the last index with non-zero weight.
    for (let i = weights.length - 1; i >= 0; i--) {
      if (weights[i]! > 0) return i;
    }
    /* c8 ignore next */
    throw new RangeError('weightedIndex fell through');
  }

  weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length !== weights.length) {
      throw new RangeError('weightedPick requires items and weights of equal length');
    }
    return items[this.weightedIndex(weights)]!;
  }

  /** Fisher-Yates over a copy. Used for talent drafting. */
  shuffled<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      const tmp = out[i]!;
      out[i] = out[j]!;
      out[j] = tmp;
    }
    return out;
  }
}
