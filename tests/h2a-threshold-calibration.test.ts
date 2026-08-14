import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { CONTENT_ROOT, loadDefaultContent } from '../src/engine/content/load.js';
import { VISIBLE_STATS } from '../src/engine/types.js';
import { applyThresholdProfile, loadExperimentMatrix } from '../src/sim/experiments.js';
import {
  DEFAULT_CALIBRATION_PLAN,
  H2aTelemetryAccumulator,
  loadCalibrationPlan,
} from '../src/sim/h2aThresholdTelemetry.js';
import { runScenario } from '../src/sim/runner.js';
import { findScenario } from '../src/sim/scenarios.js';

/**
 * H2A threshold calibration harness.
 *
 * The calibration is a measurement instrument, so what is tested here is that it
 * measures what the plan says: the true control is the untouched corpus, housing
 * is found through the canonical route tag, snapshot denominators are honest,
 * and nothing in the telemetry path can reach content or the RNG.
 */
const content = loadDefaultContent();
const plan = loadCalibrationPlan(path.join(CONTENT_ROOT, 'balance', DEFAULT_CALIBRATION_PLAN));
const matrix = loadExperimentMatrix();

describe('H2A calibration — plan', () => {
  it('names exactly the four arms, with the current corpus as the control', () => {
    expect(plan.profiles.map((p) => p.id)).toEqual(['CURRENT_AUTHORED', 'LOW', 'MID', 'HIGH']);
    expect(plan.profiles[0]!.mode).toBe('no_threshold_rewrite');
    // ORIGINAL_REFERENCE is a historical Phase 1.1 arm and must not be the control.
    expect(plan.profiles.map((p) => p.id)).not.toContain('ORIGINAL_REFERENCE');
  });

  it('uses the retained matrix for LOW/MID/HIGH and for ARCHETYPE_SET', () => {
    for (const profile of plan.profiles.slice(1)) {
      expect(matrix.thresholdProfiles[profile.id]).toBeDefined();
    }
    expect(plan.sampling.allocationPolicy).toBe('ARCHETYPE_SET');
    expect(matrix.archetypePolicy.archetypes.length).toBeGreaterThan(0);
  });

  it('names a scenario the runner knows', () => {
    expect(findScenario(plan.sampling.talentScenario)).toBeDefined();
  });
});

describe('H2A calibration — control arm is the untouched corpus', () => {
  it('leaves the canonical fingerprint alone, and every rewritten arm changes it', () => {
    const fingerprints = new Set([content.contentVersion]);
    for (const profile of ['LOW', 'MID', 'HIGH']) {
      const { content: derived, application } = applyThresholdProfile(content, matrix, profile);
      expect(derived.contentVersion).not.toBe(content.contentVersion);
      expect(application.totalRewrites).toBeGreaterThan(0);
      fingerprints.add(derived.contentVersion);
    }
    expect(fingerprints.size).toBe(4);
  });
});

describe('H2A calibration — telemetry', () => {
  const scenario = findScenario(plan.sampling.talentScenario)!;
  const telemetry = new H2aTelemetryAccumulator(content, plan);
  runScenario(content, scenario, {
    runs: 24,
    baseSeed: 'h2a-threshold-test',
    speciesStratified: true,
    allocation: { kind: 'even' },
    maxAge: plan.sampling.maxAge,
    hooks: { onBeforeYear: (state) => telemetry.beforeYear(state) },
    onRun: (result) => telemetry.add(result),
  });
  const summary = telemetry.summary();

  it('reports one snapshot per planned age plus the final state', () => {
    const labels = summary.statSnapshots.map((s) => s.label);
    expect(labels).toEqual(['start (post-setup)', 'age 18', 'age 25', 'age 35', 'age 50', 'age 65', 'final']);
    expect(summary.runs).toBe(24);
  });

  it('counts only runs still active at each fixed age, and never more than the run count', () => {
    const fixed = summary.statSnapshots.filter((s) => s.age !== null && s.label !== 'start (post-setup)');
    let previous = summary.runs;
    for (const snapshot of fixed) {
      expect(snapshot.activeRuns).toBeLessThanOrEqual(previous);
      for (const stat of VISIBLE_STATS) {
        // The denominator printed on the row is the denominator actually used.
        expect(snapshot.byStat[stat].activeRuns).toBe(snapshot.activeRuns);
      }
      previous = snapshot.activeRuns;
    }
  });

  it('measures drift against the post-setup baseline, so start drift is exactly zero', () => {
    const start = summary.statSnapshots.find((s) => s.label === 'start (post-setup)')!;
    for (const stat of VISIBLE_STATS) expect(start.byStat[stat].meanDriftFromStart).toBe(0);
  });

  it('identifies housing through the canonical route tag, not text or one event ID', () => {
    const tagged = content.events.filter((event) => event.routeTags.includes('housing')).map((e) => e.id);
    expect(tagged.length).toBeGreaterThan(1);
    expect(summary.housing.routeTag).toBe('housing');
    expect(summary.housing.eventIds).toEqual([...tagged].sort());
    for (const id of Object.keys(summary.housing.countsByEventId)) expect(tagged).toContain(id);
  });

  it('keeps low-stat person-years consistent across bands and stats', () => {
    const totals = VISIBLE_STATS.map((stat) =>
      summary.lowStatRisk.byStat[stat].reduce((sum, row) => sum + row.personYears, 0),
    );
    // Every stat classifies the same set of age-18+ person-years.
    expect(new Set(totals).size).toBe(1);
    expect(totals[0]).toBe(summary.lowStatRisk.totalPersonYears);
    expect(summary.lowStatRisk.ageMinimum).toBe(18);
    for (const stat of VISIBLE_STATS) {
      for (const row of summary.lowStatRisk.byStat[stat]) {
        for (const horizon of row.horizons) {
          // Censored person-years are dropped, never counted as "no event".
          expect(horizon.observedPersonYears).toBeLessThanOrEqual(row.personYears);
          expect(horizon.commitmentEligiblePersonYears).toBeLessThanOrEqual(horizon.observedPersonYears);
        }
      }
    }
  });

  it('bounds faction-chain counters by the contact count for that faction', () => {
    for (const row of summary.factionChains) {
      const buckets = row.personalizedEventBuckets;
      expect(buckets.zero + buckets.one + buckets.two + buckets.threePlus).toBe(row.contactRuns);
      expect(row.everReachedRuns['COMMITTED']!).toBeLessThanOrEqual(row.contactRuns);
      expect(row.firstDispositionExitRuns).toBeLessThanOrEqual(row.firstDispositionRuns);
      expect(row.endingRuns).toBeLessThanOrEqual(row.contactRuns);
    }
  });

  it('reports event frequency against the run-year denominator', () => {
    expect(summary.runYears).toBeGreaterThan(0);
    for (const row of summary.topEvents) {
      expect(row.runsSeen).toBeLessThanOrEqual(summary.runs);
      expect(row.runsRepeated).toBeLessThanOrEqual(row.runsSeen);
      expect(row.occurrences).toBeGreaterThanOrEqual(row.runsSeen);
      expect(row.occurrencesPer1000RunYears).toBeCloseTo((row.occurrences * 1000) / summary.runYears, 6);
    }
    // Sorted by occurrence, most frequent first.
    const counts = summary.topEvents.map((row) => row.occurrences);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });

  it('holds the age-18 floor: no ending and no Material Commitment before 18', () => {
    expect(summary.earlyOutcomes.endingsBefore18).toBe(0);
    expect(summary.earlyOutcomes.materialCommitmentsBefore18).toBe(0);
  });
});
