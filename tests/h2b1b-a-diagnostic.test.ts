import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import {
  AGE18,
  ENDING_AGE_BANDS,
  explicitAllocationFor,
  HUMAN_SPARE_POINT_STAT,
  COMPRESSED_CHAIN_IDS,
  DISPOSITION_IDS,
  H2b1bAccumulator,
  distribution,
  mean,
  median,
  quantile,
  spearman,
} from '../src/sim/h2b1bDiagnostic.js';
import { evaluateBands, type H2b1bPayload } from '../src/sim/h2b1bReport.js';
import { runScenario } from '../src/sim/runner.js';
import { findScenario } from '../src/sim/scenarios.js';
import { SPECIES_IDS, VISIBLE_STATS, type VisibleStat } from '../src/engine/types.js';

/**
 * H2B.1B Part A — diagnostic calculations.
 *
 * The findings document is only as trustworthy as these functions, so the
 * statistics are pinned against hand-computed values and the accumulator is
 * pinned against a tiny run whose properties can be checked independently.
 */

const content = loadDefaultContent();

describe('H2B.1B-A statistics', () => {
  it('computes mean, median and quantiles on an odd sample', () => {
    const values = [1, 2, 3, 4, 5];
    expect(mean(values)).toBe(3);
    expect(median(values)).toBe(3);
    expect(quantile(values, 0)).toBe(1);
    expect(quantile(values, 1)).toBe(5);
    // Linear interpolation between ranks: p10 of five points sits at index 0.4.
    expect(quantile(values, 0.1)).toBeCloseTo(1.4, 10);
    expect(quantile(values, 0.9)).toBeCloseTo(4.6, 10);
  });

  it('averages the two middle values on an even sample', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('returns null rather than NaN on an empty sample', () => {
    expect(mean([])).toBeNull();
    expect(median([])).toBeNull();
    expect(quantile([], 0.5)).toBeNull();
    const empty = distribution([]);
    expect(empty.samples).toBe(0);
    expect(empty.mean).toBeNull();
    expect(empty.min).toBeNull();
  });

  it('reports a perfect monotone relationship as rho = 1', () => {
    const pairs: [number, number][] = [
      [0, 3],
      [1, 5],
      [2, 9],
      [3, 40],
    ];
    expect(spearman(pairs)).toBeCloseTo(1, 10);
  });

  it('reports a perfect inversion as rho = -1', () => {
    const pairs: [number, number][] = [
      [0, 9],
      [1, 6],
      [2, 4],
      [3, 1],
    ];
    expect(spearman(pairs)).toBeCloseTo(-1, 10);
  });

  it('handles ties with averaged ranks', () => {
    // x is constant, so there is no rank variation and no correlation to report.
    expect(spearman([
      [5, 1],
      [5, 2],
      [5, 3],
    ])).toBeNull();

    // A hand-checked tied case: averaged ranks x = [1.5, 1.5, 3.5, 3.5],
    // y = [1.5, 1.5, 3.5, 3.5], which is a perfect match.
    expect(
      spearman([
        [0, 10],
        [0, 10],
        [1, 20],
        [1, 20],
      ]),
    ).toBeCloseTo(1, 10);
  });

  it('needs at least two points', () => {
    expect(spearman([])).toBeNull();
    expect(spearman([[1, 1]])).toBeNull();
  });
});

describe('H2B.1B-A targeted allocation arms', () => {
  it('leaves a 20-point arm alone for the 20-point species', () => {
    const arm: Record<VisibleStat, number> = { CHR: 4, INT: 0, STR: 3, MNY: 10, SPR: 3 };
    expect(explicitAllocationFor(arm, 20)).toEqual(arm);
  });

  it("puts Human's spare point on a stat no arm varies", () => {
    const arm: Record<VisibleStat, number> = { CHR: 4, INT: 0, STR: 3, MNY: 10, SPR: 3 };
    const human = explicitAllocationFor(arm, 21);
    expect(human[HUMAN_SPARE_POINT_STAT]).toBe(arm[HUMAN_SPARE_POINT_STAT] + 1);
    expect(VISIBLE_STATS.reduce((sum, stat) => sum + human[stat], 0)).toBe(21);
    expect(human.INT).toBe(0);
    expect(human.CHR).toBe(4);
  });

  it('refuses a mismatch it cannot legitimately absorb', () => {
    const arm: Record<VisibleStat, number> = { CHR: 4, INT: 0, STR: 3, MNY: 10, SPR: 3 };
    expect(() => explicitAllocationFor(arm, 25)).toThrow(/allocation points/);
  });

  it('fits every species the registry defines', () => {
    const arm: Record<VisibleStat, number> = { CHR: 4, INT: 10, STR: 3, MNY: 0, SPR: 3 };
    for (const id of SPECIES_IDS) {
      const points = content.species.get(id)!.allocation_points;
      const allocation = explicitAllocationFor(arm, points);
      expect(VISIBLE_STATS.reduce((sum, stat) => sum + allocation[stat], 0)).toBe(points);
      // The stat the arm is about survives the fit-up untouched.
      expect(allocation.INT).toBe(10);
    }
  });
});

describe('H2B.1B-A accumulator', () => {
  const scenario = findScenario('UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC')!;

  function smallArm(runs = 24) {
    const accumulator = new H2b1bAccumulator(content);
    runScenario(content, scenario, {
      runs,
      baseSeed: 'h2b1b-a-test',
      speciesStratified: true,
      allocation: { kind: 'even' },
      maxAge: 120,
      hooks: { onBeforeYear: (state) => accumulator.beforeYear(state) },
      onRun: (result) => accumulator.add(result),
    });
    return accumulator.summary();
  }

  it('snapshots the state entering age 18, not after the age-18 event', () => {
    const accumulator = new H2b1bAccumulator(content, { includeContributors: false, includeFactions: false });
    let observed: number | null = null;
    let afterEighteen: number | null = null;
    runScenario(content, scenario, {
      runs: 1,
      baseSeed: 'h2b1b-a-age18',
      speciesStratified: true,
      allocation: { kind: 'even' },
      maxAge: 30,
      hooks: {
        onBeforeYear: (state) => {
          accumulator.beforeYear(state);
          if (state.age === AGE18) observed = state.stats.INT;
        },
        onYear: (_occurrence, state) => {
          if (state.age === AGE18) afterEighteen = state.stats.INT;
        },
      },
      onRun: (result) => accumulator.add(result),
    });

    const row = accumulator.summary().stats.find((r) => r.stat === 'INT')!;
    expect(observed).not.toBeNull();
    expect(row.age18.median).toBe(observed);
    // Guards the definition: if the age-18 event moved INT, the two differ and
    // the snapshot must still be the earlier one.
    if (afterEighteen !== observed) expect(row.age18.median).not.toBe(afterEighteen);
  });

  it('counts every run once and only counts age-18 values for runs that got there', () => {
    const summary = smallArm();
    expect(summary.runs).toBe(24);
    expect(summary.runsReachingAge18).toBeLessThanOrEqual(summary.runs);
    for (const row of summary.stats) {
      expect(row.effectiveStart.samples).toBe(summary.runs);
      expect(row.age18.samples).toBe(summary.runsReachingAge18);
      expect(row.drift.samples).toBe(summary.runsReachingAge18);
    }
  });

  it('reports drift as the age-18 value minus the effective start', () => {
    const summary = smallArm();
    for (const row of summary.stats) {
      if (row.age18.mean === null || row.drift.mean === null) continue;
      // Only comparable when every run reached 18, which this small arm does.
      if (row.age18.samples !== row.effectiveStart.samples) continue;
      expect(row.drift.mean).toBeCloseTo(row.age18.mean - row.effectiveStart.mean!, 8);
    }
  });

  it('keeps the correctness counters at zero on canonical content', () => {
    const c = smallArm().correctness;
    expect(c.endingsBefore18).toBe(0);
    expect(c.materialCommitmentsBefore18).toBe(0);
    expect(c.coverageDefects).toBe(0);
    expect(c.pre25FallbackYears).toBe(0);
    expect(c.multipleVisibleEventsInAYear).toBe(0);
    expect(c.illegalFactionTransitions).toBe(0);
    expect(c.lifecycleCollisions).toBe(0);
    expect(c.personalEventsAfterTerminalExit).toBe(0);
    expect(c.runsWithTwoActiveFactions).toBe(0);
    expect(c.contactWhileAnotherActive).toBe(0);
  });

  it('splits every run into exactly one outcome bucket', () => {
    const summary = smallArm();
    const o = summary.outcomes;
    expect(o.completedRuns + o.nonterminalRuns + o.coverageErrorRuns).toBe(summary.runs);
    expect(o.completedRuns).toBe(summary.completedRuns);
    expect(o.completionRate).toBeCloseTo(o.completedRuns / summary.runs, 10);
    expect(o.endingAge.samples).toBe(o.completedRuns);
  });

  it('bands every ending age exactly once, and never below 18', () => {
    const o = smallArm().outcomes;
    const banded = Object.values(o.endingAgeCountByBand).reduce((a, b) => a + b, 0);
    expect(banded).toBe(o.completedRuns);
    if (o.endingAge.min !== null) expect(o.endingAge.min).toBeGreaterThanOrEqual(18);
    for (const band of ENDING_AGE_BANDS) {
      expect(o.endingAgeShareByBand[band.label]).toBeCloseTo(
        (o.endingAgeCountByBand[band.label] ?? 0) / Math.max(o.completedRuns, 1),
        10,
      );
    }
  });

  it('never sees more than one personally-active faction', () => {
    const factions = smallArm().factions!;
    expect(factions.overall.maxSimultaneouslyActive).toBeLessThanOrEqual(1);
  });

  it('attributes contributors to the age band the event fired in', () => {
    const audit = smallArm().contributors!;
    expect(audit.bands).toEqual(['0-17', '18-34', '35-64', '65+']);
    for (const stat of Object.keys(audit.byStat)) {
      for (const band of audit.bands) {
        const cell = audit.byStat[stat]![band]!;
        for (const row of cell.positive) {
          expect(row.totalMagnitude).toBeGreaterThan(0);
          expect(row.totalMagnitude).toBe(row.delta * row.occurrences);
          expect(row.band).toBe(band);
        }
        for (const row of cell.negative) expect(row.totalMagnitude).toBeLessThan(0);
        // Ranked by magnitude, strongest first.
        const positives = cell.positive.map((row) => row.totalMagnitude);
        expect(positives).toEqual([...positives].sort((a, b) => b - a));
      }
    }
  });

  it('names the chain events the Part A schedule compression touches', () => {
    expect(COMPRESSED_CHAIN_IDS).toHaveLength(12);
    expect(DISPOSITION_IDS).toHaveLength(6);
    for (const id of [...COMPRESSED_CHAIN_IDS, ...DISPOSITION_IDS]) {
      expect(content.eventsById.get(id), `${id} must exist in canonical content`).toBeDefined();
    }
  });
});

describe('H2B.1B-A review bands', () => {
  /** A payload skeleton whose numbers can be nudged one band at a time. */
  function payload(overrides: Partial<H2b1bPayload> = {}): H2b1bPayload {
    const emptyDist = distribution([]);
    const statRow = (stat: VisibleStat) => ({
      stat,
      allocatedStart: emptyDist,
      effectiveStart: emptyDist,
      age18: emptyDist,
      drift: emptyDist,
      shareAge18AtLeast5: 0,
      shareAge18AtLeast8: 0,
      shareAge18AtLeast10: 0,
      shareAge18AtLeast15: 0,
    });
    return {
      generatedAt: '2026-01-01T00:00:00.000Z',
      contentVersion: 'test',
      balanceVersion: '0.2',
      baseSeed: 'test',
      sampling: {},
      arms: [
        {
          id: 'general',
          label: 'general',
          runs: 0,
          allocation: null,
          summary: {
            runs: 0,
            runsReachingAge18: 0,
            completedRuns: 0,
            outcomes: {
              completedRuns: 0,
              nonterminalRuns: 0,
              coverageErrorRuns: 0,
              completionRate: 0,
              endingAge: emptyDist,
              endingAgeShareByBand: {},
              endingAgeCountByBand: {},
            },
            stats: [statRow('INT'), statRow('CHR'), statRow('SPR')],
            driftSnapshots: [],
            spr15At65: { activeRuns: 0, atLeast15: 0, share: null },
            contributors: { bands: ['0-17', '18-34', '35-64', '65+'], byStat: {}, repeatableOutliers: [] },
            factions: null,
            correctness: {
              endingsBefore18: 0,
              materialCommitmentsBefore18: 0,
              coverageDefects: 0,
              pre25FallbackYears: 0,
              multipleVisibleEventsInAYear: 0,
              illegalFactionTransitions: 0,
              lifecycleCollisions: 0,
              personalEventsAfterTerminalExit: 0,
              runsWithTwoActiveFactions: 0,
              contactWhileAnotherActive: 0,
              compressedChainScheduleExpiries: 0,
              compressedChainExpiriesByEvent: {},
            },
          },
        },
      ],
      derived: { intSpearman: null, chrSpearman: null, intMedianGap0to10: null, chrMedianGap0to10: null },
      baseline: null,
      ...overrides,
    };
  }

  function verdict(rows: ReturnType<typeof evaluateBands>, id: string): string {
    return rows.find((row) => row.id === id)!.verdict;
  }

  function withIntDrift(value: number, baselineDrift: number | null) {
    const base = payload();
    const int = base.arms[0]!.summary.stats.find((r) => r.stat === 'INT')!;
    int.drift = { ...int.drift, mean: value };
    if (baselineDrift !== null) {
      base.baseline = {
        contentVersion: 'pre',
        meanIntDriftAge18: baselineDrift,
        meanChrDriftAge18: null,
        spr15At65Share: null,
        engagedThreePlusShare: null,
        medianGapYears: null,
        p90GapYears: null,
        contactRate: null,
        factionEndingShare: null,
      };
    }
    return base;
  }

  it('PASSes a value inside its band', () => {
    expect(verdict(evaluateBands(withIntDrift(3.6, 9.25)), 'S1')).toBe('PASS');
  });

  it('REVIEWs a value outside its band that still improved', () => {
    expect(verdict(evaluateBands(withIntDrift(2.4, 9.25)), 'S1')).toBe('REVIEW');
  });

  it('FAILs a value that moved away from its band', () => {
    expect(verdict(evaluateBands(withIntDrift(10.1, 9.25)), 'S1')).toBe('FAIL');
  });

  it('REVIEWs rather than FAILs when there is no baseline to compare against', () => {
    expect(verdict(evaluateBands(withIntDrift(10.1, null)), 'S1')).toBe('REVIEW');
  });

  it('FAILs any non-zero hard correctness counter', () => {
    const base = payload();
    base.arms[0]!.summary.correctness.endingsBefore18 = 1;
    expect(verdict(evaluateBands(base), 'C1')).toBe('FAIL');
    expect(verdict(evaluateBands(base), 'C2')).toBe('PASS');
  });

  it('FAILs an unlimited repeatable flagged as a late-CHR outlier', () => {
    const base = payload();
    base.arms[0]!.summary.contributors!.repeatableOutliers = [
      {
        stat: 'CHR',
        band: '65+',
        eventId: 'EVT-ORD-SOC-0004',
        variantIndex: 0,
        delta: -1,
        occurrences: 11835,
        totalMagnitude: -11835,
        repeatPolicy: 'repeatable',
        repeatMaxCount: null,
        repeatableOutlier: true,
      },
    ];
    expect(verdict(evaluateBands(base), 'S10')).toBe('FAIL');
  });

  it('does not judge the bands the plan says are measured only', () => {
    const rows = evaluateBands(payload());
    expect(verdict(rows, 'F7')).toBe('MEASURED');
  });

  it('covers every band the acceptance plan lists', () => {
    const ids = evaluateBands(payload()).map((row) => row.id);
    expect(ids).toEqual([
      'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7',
      'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11',
    ]);
  });
});
