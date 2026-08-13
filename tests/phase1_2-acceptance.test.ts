import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { CONTENT_ROOT, loadDefaultContent } from '../src/engine/content/load.js';
import { eventContextScalar, familyEvidenceScalar } from '../src/engine/drafting.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { SPECIES_IDS, TRANSFORMATION_FAMILIES } from '../src/engine/types.js';
import {
  applyThresholdProfile,
  loadExperimentMatrix,
  withFamilyWeightMode,
  withT1027StartFix,
} from '../src/sim/experiments.js';
import {
  factionSeedIncidence,
  loadDiagnosticPlan,
  manifestationWindowProbe,
  spcSplit,
  targetedDiagnostic,
} from '../src/sim/phase1_2.js';
import { runScenario } from '../src/sim/runner.js';

/**
 * Phase 1.2 — faction layer, content-shape patch and diagnostic plan.
 *
 * Factions are a lightweight authored context: discrete flags only, no
 * reputation meter, no player faction choice, and CONTACT never means
 * membership.
 */
const content = loadDefaultContent();

const diagnostic: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'seeded_random' },
};

const FACTION_TAGS = ['dmms', 'everlasting', 'meridian', 'continuity_institute', 'black_ledger', 'last_posture'];

describe('Phase 1.2 — faction registry integrity', () => {
  it('loads six factions with registered tags and flags', () => {
    expect(content.factions.size).toBe(6);
    for (const faction of content.factions.values()) {
      expect(content.routeTags.has(faction.routeTag), `${faction.id} routeTag`).toBe(true);
      expect(faction.flags.length).toBeGreaterThan(0);
      for (const flag of faction.flags) expect(flag.startsWith(faction.flagPrefix)).toBe(true);
    }
    expect([...content.factions.values()].map((f) => f.routeTag).sort()).toEqual([...FACTION_TAGS].sort());
  });

  it('pins the no-meter / no-choice rules in canonical data', () => {
    const raw = JSON.parse(
      readFileSync(path.join(CONTENT_ROOT, 'registries', 'SOLID_STATE_FACTION_REGISTRY_v0.1.json'), 'utf8'),
    ) as { rules: Record<string, unknown> };
    expect(raw.rules['stateModel']).toBe('discrete_flags_only');
    expect(raw.rules['numericReputationMeter']).toBe(false);
    expect(raw.rules['playerChoosesFaction']).toBe(false);
    expect(raw.rules['contactDoesNotEqualMembership']).toBe(true);
    expect(raw.rules['automaticMaterialBiasFromFaction']).toBe(false);
    expect(raw.rules['alignmentStyleFactionSystem']).toBe('DEFERRED');
  });

  it('registers every FAC_* flag used by canonical content', () => {
    const registered = new Set([...content.factions.values()].flatMap((f) => f.flags));
    const used = new Set<string>();
    for (const gameEvent of content.events) {
      for (const v of gameEvent.variants) {
        for (const flag of [...v.addFlags, ...v.removeFlags]) {
          if (flag.startsWith('FAC_')) used.add(flag);
        }
      }
    }
    expect(used.size).toBe(6);
    for (const flag of used) expect(registered.has(flag), flag).toBe(true);
  });

  it('gives faction context no material-family bias', () => {
    // Faction tags must not allow Transformation event favor...
    for (const tag of FACTION_TAGS) {
      expect(content.routeTags.get(tag)!.allowTransformationEventFavor, tag).toBe(false);
    }
    // ...and faction flags must not move the family layer at all.
    const { state } = createRun('faction-bias', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    state.age = 30;
    const families = ['STON', 'METL', 'SYNT', 'TEMP', 'CRYS'];
    const before = families.map((f) => familyEvidenceScalar('TRN', f, state, content));
    for (const faction of content.factions.values()) for (const flag of faction.flags) state.flags.add(flag);
    const after = families.map((f) => familyEvidenceScalar('TRN', f, state, content));
    expect(after).toEqual(before);
  });

  it('still applies at most one faction route-favor scalar per event', () => {
    const factionEvent = content.events.find(
      (e) => e.routeTags.filter((t) => FACTION_TAGS.includes(t)).length >= 1 && e.channel !== 'TRN',
    )!;
    const { state } = createRun('faction-stack', content, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    const neutral = eventContextScalar(factionEvent, state, content);
    for (const faction of content.factions.values()) for (const flag of faction.flags) state.flags.add(flag);
    const all = eventContextScalar(factionEvent, state, content);
    expect(all / neutral).toBeCloseTo(content.balance.familyEvidenceScalar.routeFavor, 10);
  });

  it('keeps faction contact age-appropriate and endings 18+', () => {
    for (const faction of content.factions.values()) {
      expect(faction.entryAgeMin).toBeGreaterThanOrEqual(16);
    }
    // No faction seed event can produce an ending, and no ending before 18.
    for (const gameEvent of content.events) {
      const setsFaction = gameEvent.variants.some((v) => v.addFlags.some((f) => f.startsWith('FAC_')));
      if (!setsFaction) continue;
      for (const v of gameEvent.variants) expect(v.endingId, gameEvent.id).toBeUndefined();
    }
    for (const gameEvent of content.events) {
      if (gameEvent.variants.some((v) => v.endingId)) {
        expect(gameEvent.age.min, gameEvent.id).toBeGreaterThanOrEqual(18);
      }
    }
  });
});

describe('Phase 1.2 — content deltas', () => {
  it('kept the two late-life FIX>=40 gates unchanged', () => {
    expect(content.eventsById.get('EVT-INS-MED-0012')!.include).toContain('FIX>=40');
    expect(content.eventsById.get('EVT-ORD-FAM-0011')!.include).toContain('FIX>=40');
  });

  it('made the late-life entries history-specific rather than universal', () => {
    const med = content.eventsById.get('EVT-INS-MED-0011')!;
    expect(med.include).toContain('FIX>=25');
    expect(med.include).toMatch(/FAC_MERIDIAN_CONTACT|ROUTE_MED_/);
    const fam = content.eventsById.get('EVT-ORD-FAM-0010')!;
    expect(fam.include).toMatch(/ROUTE_FAM_PLACEMENT|ROUTE_FAM_DIRECTIVE/);
  });

  it('applied only the T1017 age-floor delta', () => {
    const t1017 = content.talents.get('T1017')!;
    expect(t1017.condition).toBe('AGE>=25 & CHR<=5');
    expect(t1017.effects).toEqual({ CHR: 4 });
    expect(t1017.rarity).toBe('Uncommon');
    expect(t1017.name_en).toBe('Late Bloomer');
  });

  it('renumbered only the colliding new event, leaving the published one intact', () => {
    // CONFLICT P12-C1: Batch 006 shipped EVT-INS-ACA-0011, already published in
    // Batch 005. The published event keeps its ID; the new one became 0012.
    const published = content.eventsById.get('EVT-INS-ACA-0011')!;
    expect(published.sourceBatchId).toBe('EVENT_BATCH_005');
    expect(published.include).toContain('ROUTE_ACA_MATERIALS');
    const renumbered = content.eventsById.get('EVT-INS-ACA-0012')!;
    expect(renumbered.sourceBatchId).toBe('EVENT_BATCH_006');
    expect(renumbered.include).toContain('FAC_CRI_CONTACT');
  });
});

describe('Phase 1.2 — faction reachability', () => {
  const results = Array.from({ length: 600 }, (_, i) => runSimulation(`p12-${i}`, content, diagnostic));

  it('reaches every faction through ordinary drafting', () => {
    const contacted = new Map<string, number>();
    for (const result of results) {
      for (const faction of content.factions.values()) {
        if (faction.flags.some((f) => result.state.flags.has(f))) {
          contacted.set(faction.id, (contacted.get(faction.id) ?? 0) + 1);
        }
      }
    }
    for (const faction of content.factions.values()) {
      expect(contacted.get(faction.id) ?? 0, `${faction.shortName} never contacted`).toBeGreaterThan(0);
    }
  });

  it('produces faction climax endings', () => {
    const factionClimaxIds = new Set(
      content.events
        .filter((e) => e.selectionMode === 'climax' && e.routeTags.some((t) => FACTION_TAGS.includes(t)))
        .map((e) => e.id),
    );
    expect(factionClimaxIds.size).toBe(6);
    const fired = new Set<string>();
    for (const result of results) {
      if (result.outcome.kind !== 'ended') continue;
      if (factionClimaxIds.has(result.outcome.ending.sourceEventId)) {
        fired.add(result.outcome.ending.sourceEventId);
      }
    }
    expect(fired.size, `only ${[...fired].join(', ')} fired`).toBeGreaterThan(0);
  });

  it('keeps one visible event per year with faction routes active', () => {
    for (const result of results) {
      const ages = result.state.history.map((h) => h.age);
      expect(new Set(ages).size).toBe(ages.length);
    }
  });

  it('has no pre-25 coverage defect after the patch', () => {
    for (const species of SPECIES_IDS) {
      for (let i = 0; i < 60; i++) {
        const result = runSimulation(`p12-cov-${species}-${i}`, content, {
          ...diagnostic,
          species: { kind: 'fixed', species },
        });
        expect(result.outcome.kind).not.toBe('coverage_error');
      }
    }
  });

  it('never produces an ending before 18 despite age-16 faction contact', () => {
    for (const result of results) {
      if (result.outcome.kind !== 'ended') continue;
      expect(result.outcome.ending.endingAge).toBeGreaterThanOrEqual(18);
    }
  });
});

describe('Phase 1.2 — compact diagnostic harness', () => {
  const plan = loadDiagnosticPlan();

  it('loads the diagnostic plan and pins the design baseline it measures against', () => {
    expect(plan.baseline.familyWeightMode).toBe('uniform');
    expect(plan.baseline.familyWeightMode).toBe(content.balance.familyWeightMode);
    expect(plan.baseline.thresholdMode).toBe('AUTHORED_CURRENT_CONTENT');
    expect(plan.baseline.pre25CoveragePolicy).toBe('strict');
    expect(plan.baseline.speciesMode).toBe('STRATIFY_EQUALLY_BY_SPECIES');
    const spc = targetedDiagnostic(plan, 'T1023_SPC_COMPARE');
    expect(spc.arms?.map((arm) => arm.name)).toEqual(['control', 'main_character']);
    for (const arm of spc.arms ?? []) {
      for (const talentId of arm.talents) expect(content.talents.has(talentId), talentId).toBe(true);
    }
    expect(targetedDiagnostic(plan, 'NEUTRAL_HUMAN_MANIFEST_18_20').species).toBe('HUMAN');
  });

  it('keeps the four skipped Phase 1.1 experiment tools intact, not retired', () => {
    // The plan names them as skipped-this-patch with `notDropped: true`. Each
    // must still be constructible, so a future patch can simply re-run them.
    expect(plan.retentionPolicy.notDropped).toBe(true);
    expect(plan.explicitlySkippedThisPatch.length).toBe(4);

    const matrix = loadExperimentMatrix();
    for (const profile of ['LOW', 'MID', 'HIGH', 'ORIGINAL_REFERENCE']) {
      const { application } = applyThresholdProfile(content, matrix, profile);
      expect(application.totalRewrites, profile).toBeGreaterThan(0);
    }
    expect(withFamilyWeightMode(content, 'sum_of_event_weights').balance.familyWeightMode).toBe(
      'sum_of_event_weights',
    );
    expect(matrix.t1027Sensitivity.startFIXValues.length).toBeGreaterThan(0);
    expect(withT1027StartFix(content, 10).talents.get('T1027')!.startFixBonus).toBe(10);
    expect(matrix.archetypePolicy.archetypes.length).toBeGreaterThan(0);
  });

  it('leaves canonical thresholds untouched when no profile is applied', () => {
    // The Phase 1.2 baseline is AUTHORED_CURRENT_CONTENT: the diagnostic must
    // read the same bundle the tests do, with no derived rewrite.
    expect(content.contentVersion).not.toContain('threshold=');
    expect(content.eventsById.get('EVT-INS-MED-0012')!.include).toContain('FIX>=40');
  });

  it('splits SPC by outcome and attributes faction seeds', () => {
    const report = runScenario(content, {
      id: 'PHASE1_2_HARNESS_SMOKE',
      label: 'smoke',
      description: 'Harness smoke test.',
      talents: { kind: 'fixed', talents: ['T1023', 'T1013', 'T1015'] },
    }, { runs: 120, baseSeed: 'p12-harness', speciesStratified: true, keepRuns: true });

    const spc = spcSplit(report.runs!);
    expect(spc.completedRuns + spc.noncompletedRuns).toBe(120);
    // T1023 strongly favors SPC, so the channel must actually be reachable.
    expect(spc.anySpcRate).toBeGreaterThan(0.5);

    const seeds = factionSeedIncidence(content, report.runs!);
    expect(seeds.anyContactRuns).toBeGreaterThan(0);
    // Contact ages must respect each faction's registered entry floor.
    for (const faction of content.factions.values()) {
      const age = seeds.meanFirstContactAgeByFaction[faction.shortName];
      if (age === null || age === undefined) continue;
      expect(age, faction.shortName).toBeGreaterThanOrEqual(faction.entryAgeMin);
    }
  });

  it('measures the 18-20 manifestation window against pre-event state', () => {
    const probe = manifestationWindowProbe(content, [18, 19, 20]);
    const report = runScenario(content, {
      id: 'PHASE1_2_MANIFEST_SMOKE',
      label: 'neutral-human',
      description: 'Neutral Human manifestation window smoke test.',
      talents: { kind: 'none' },
    }, { runs: 200, baseSeed: 'p12-manifest', speciesStratified: false, fixedSpecies: 'HUMAN', hooks: probe.hooks });
    expect(report.metrics.runs).toBe(200);

    const measured = probe.finish();
    // Every run reaches 18 uncommitted, so age 18 must be observed 200 times.
    expect(measured.observationsByAge['18']).toBe(200);
    expect(measured.observations).toBeGreaterThanOrEqual(measured.observationsByAge['18']!);
    // Eligibility is sampled at draft time, so the pool is never empty pre-25.
    for (const age of measured.ages) {
      expect(measured.eligibleFamiliesByAge[String(age)]!.min, `age ${age}`).toBeGreaterThan(0);
    }
    // "Unprompted" must exclude manifestations that followed matching evidence.
    expect(measured.unpromptedTotal).toBeGreaterThan(0);
    expect(measured.unpromptedProbability).toBeCloseTo(measured.unpromptedTotal / measured.observations, 10);
    // Families are read back off `MAT_MANIFEST_*` flags, so they must be real
    // Transformation family codes rather than flag fragments.
    for (const family of Object.keys(measured.unpromptedByFamily)) {
      expect(TRANSFORMATION_FAMILIES, family).toContain(family);
    }
  });
});
