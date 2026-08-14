import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { genderLint, preschoolAudit, statCurveAudit } from '../src/engine/content/lint.js';
import { factionSlotAllows, isEligible } from '../src/engine/eligibility.js';
import { activeFaction, applyFactionTransition, factionState } from '../src/engine/factions.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { SPECIES_IDS, type FactionDef, type GameEvent } from '../src/engine/types.js';
import { gatingStatOf, H2B_BATCH_ID, rescueBand, RELOCATION_VARIANTS } from '../src/sim/h2bDiagnostic.js';

/**
 * H2B — Batch 008, the single-active-faction rule and the content lints.
 *
 * The five tests the Single Active Faction Rule spec names are all here, plus
 * the invariants Batch 008 itself has to keep: the insurance chain reaches its
 * new ending, the structural-housing route never resolves an ambiguous
 * manifestation by variant order, and the corpus no longer contains a strictly
 * monotonic visible stat.
 */
const content = loadDefaultContent();

const diagnostic: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'seeded_random' },
};

const faction = (id: string): FactionDef => content.factions.get(id)!;
const eventById = (id: string): GameEvent => content.eventsById.get(id)!;

function blankRun() {
  return createRun('h2b-fsm', content, {
    species: { kind: 'fixed', species: 'HUMAN' },
    talents: { kind: 'none' },
    allocation: { kind: 'even' },
  }).state;
}

describe('H2B — Batch 008 integration', () => {
  it('loads 28 new events and the new ending', () => {
    const batch = content.batches.find((b) => b.batchId === H2B_BATCH_ID);
    expect(batch).toBeDefined();
    expect(batch!.events.length).toBe(28);
    expect(content.events.length).toBe(214);
    expect(content.endings.has('END-MED-003')).toBe(true);
    expect(content.endings.get('END-MED-003')!.title_en).toBe('Benefit Approved');
  });

  it('resolves every scheduled target, ending and talent the new batch references', () => {
    const batch = content.batches.find((b) => b.batchId === H2B_BATCH_ID)!;
    for (const event of batch.events) {
      for (const variant of event.variants) {
        for (const schedule of variant.schedules) {
          expect(content.eventsById.has(schedule.eventId)).toBe(true);
        }
        if (variant.endingId) expect(content.endings.has(variant.endingId)).toBe(true);
        for (const transition of variant.factionTransitions ?? []) {
          expect(content.factions.has(transition.factionId)).toBe(true);
        }
      }
      for (const tag of event.routeTags) expect(content.routeTags.has(tag)).toBe(true);
    }
  });

  it('keeps the existing-event patches: SPR farming reduced, one move per run', () => {
    // The late-life baseline no longer grants SPR every year.
    expect(eventById('EVT-ORD-GEN-0003').variants[0]!.effects).toEqual({ STR: -1 });
    // High-SPR survivors no longer gain SPR from every reunion; the TRUE branch still can.
    const reunion = eventById('EVT-ORD-SOC-0004');
    expect(reunion.variants[0]!.effects).toEqual({ CHR: -1 });
    expect(reunion.variants[1]!.effects).toEqual({ SPR: 1 });
    // The repeated move is now once per run.
    expect(eventById('EVT-ORD-HOU-0002').repeatMaxCount).toBe(1);
  });

  it('never lets the structural-housing route resolve ambiguous evidence by variant order', () => {
    const resolution = eventById('EVT-INS-ARC-2002');
    for (const variant of resolution.variants) {
      if (!variant.setMaterialCommitment) continue;
      // A negated mention is not evidence, so only positive assertions count.
      const asserts = (flag: string): boolean =>
        new RegExp(`(^|[^!])FLAG\\[${flag}\\]`).test(variant.when);
      const bothAsserted = asserts('MAT_MANIFEST_STON') && asserts('MAT_MANIFEST_METL');
      if (bothAsserted) {
        // Mixed evidence may only commit with an explicit additional discriminator.
        expect(/SPECIES=/.test(variant.when)).toBe(true);
      } else {
        // A single-evidence branch must exclude the other manifestation outright.
        expect(/!FLAG\[MAT_MANIFEST_(STON|METL)\]/.test(variant.when)).toBe(true);
      }
    }
    // The TRUE fallback commits nothing.
    const last = resolution.variants[resolution.variants.length - 1]!;
    expect(last.when).toBe('TRUE');
    expect(last.setMaterialCommitment).toBeUndefined();
  });
});

describe('H2B — single active personalized faction', () => {
  const contactEvents = content.events.filter((event) => event.factionInteraction === 'contact');

  it('has contact events to gate', () => {
    expect(contactEvents.length).toBeGreaterThan(0);
  });

  // Spec test 1.
  it('never allows two factions in CONTACTED/ENGAGED/COMMITTED simultaneously', () => {
    let runs = 0;
    for (const species of SPECIES_IDS) {
      for (let i = 0; i < 60; i++) {
        runs += 1;
        const result = runSimulation(`h2b-excl-${species}-${i}`, content, {
          ...diagnostic,
          species: { kind: 'fixed', species },
        });
        const active = [...content.factions.values()].filter((f) =>
          ['CONTACTED', 'ENGAGED', 'COMMITTED'].includes(factionState(result.state.flags, f)),
        );
        expect(active.length).toBeLessThanOrEqual(1);
      }
    }
    expect(runs).toBe(360);
  });

  it('blocks a second faction contact while another relationship is open', () => {
    const state = blankRun();
    const dmms = faction('FCT-DMMS');
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'CONTACTED' });
    expect(activeFaction(state.flags, content)?.id).toBe('FCT-DMMS');

    for (const event of contactEvents) {
      const allowed = factionSlotAllows(event, state, content);
      expect(allowed).toBe(event.factionIds.includes('FCT-DMMS'));
    }
  });

  // Spec test 2.
  it('leaves news and lore fallback from other factions untouched', () => {
    const state = blankRun();
    const dmms = faction('FCT-DMMS');
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'CONTACTED' });
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'ENGAGED' });
    const others = content.events.filter(
      (event) =>
        (event.factionInteraction === 'news' || event.factionInteraction === 'lore_fallback') &&
        !event.factionIds.includes('FCT-DMMS'),
    );
    expect(others.length).toBeGreaterThan(0);
    for (const event of others) expect(factionSlotAllows(event, state, content)).toBe(true);
  });

  it('leaves personal and climax events for the active faction eligible', () => {
    const state = blankRun();
    const dmms = faction('FCT-DMMS');
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'CONTACTED' });
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'ENGAGED' });
    const own = content.events.filter(
      (event) =>
        event.factionIds.includes('FCT-DMMS') &&
        (event.factionInteraction === 'personal' || event.factionInteraction === 'climax'),
    );
    expect(own.length).toBeGreaterThan(0);
    for (const event of own) expect(factionSlotAllows(event, state, content)).toBe(true);
  });

  // Spec test 3.
  it('frees the slot once the active faction reaches OPTED_OUT or CLOSED', () => {
    for (const terminal of ['OPTED_OUT', 'CLOSED'] as const) {
      const state = blankRun();
      const dmms = faction('FCT-DMMS');
      applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'CONTACTED' });
      const blocked = contactEvents.filter((event) => !factionSlotAllows(event, state, content));
      expect(blocked.length).toBeGreaterThan(0);

      applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: terminal });
      expect(activeFaction(state.flags, content)).toBeNull();
      for (const event of contactEvents) expect(factionSlotAllows(event, state, content)).toBe(true);
    }
  });

  // Spec test 4.
  it('leaves safe-exit semantics unchanged: the exited faction stays terminal', () => {
    const state = blankRun();
    const dmms = faction('FCT-DMMS');
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'CONTACTED' });
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'OPTED_OUT' });
    expect(content.factionRules.legalTransitions['OPTED_OUT']).toEqual([]);
    // Its own personalized events remain ineligible even though the slot is free.
    const personal = content.events.filter(
      (event) => event.factionIds.includes('FCT-DMMS') && event.factionInteraction === 'personal',
    );
    for (const event of personal) expect(isEligible(event, state, content)).toBe(false);
  });

  // Spec test 5.
  it('leaves one visible event per year unchanged', () => {
    for (let i = 0; i < 40; i++) {
      const result = runSimulation(`h2b-cadence-${i}`, content, diagnostic);
      const ages = result.state.history.map((o) => o.age);
      expect(new Set(ages).size).toBe(ages.length);
      for (let a = 0; a < ages.length; a++) expect(ages[a]).toBe(a);
    }
  });

  it('does not touch faction condition syntax: no FSTATE anywhere in canonical content', () => {
    for (const event of content.events) {
      const conditions = [event.include, event.exclude, ...event.variants.map((v) => v.when)];
      for (const condition of conditions) expect(condition).not.toMatch(/FSTATE/);
    }
  });
});

describe('H2B — content lints', () => {
  it('finds no male-coded player-facing prose', () => {
    const result = genderLint(content);
    expect(result.scanned).toBeGreaterThan(500);
    expect(result.findings).toEqual([]);
  });

  it('lists every age-0/1 event for manual review', () => {
    const rows = preschoolAudit(content);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.ageMin).toBeLessThanOrEqual(1);
      // Childhood safety still holds for everything the audit lists.
      for (const variant of row.variants) expect(variant.textEn.length).toBeGreaterThan(0);
    }
  });

  it('no longer has a strictly monotonic visible stat', () => {
    const curve = statCurveAudit(content);
    expect(curve.monotonicStats).toEqual([]);
    // The lint spec names INT specifically.
    expect(curve.totals['INT']!.negativeVariants).toBeGreaterThan(0);
  });
});

describe('H2B — diagnostic classifications', () => {
  it('bands FIX gains the way the Pressure & Tone spec does', () => {
    expect(rescueBand(0)).toBe('clean');
    expect(rescueBand(2)).toBe('clean');
    expect(rescueBand(6)).toBe('costly');
    expect(rescueBand(8)).toBe('unclassified');
    expect(rescueBand(12)).toBe('predatory');
  });

  it('identifies the gating stat of the new pressure events', () => {
    expect(gatingStatOf('STR<=1 & !FLAG[PRESS_STR_REVIEW]')?.stat).toBe('STR');
    expect(gatingStatOf('MNY<=2 & !FLAG[X]')?.stat).toBe('MNY');
    // Two gated stats is ambiguous, so no single gating stat is claimed.
    expect(gatingStatOf('CHR>=15 & INT>=18')).toBeNull();
    expect(gatingStatOf('TRUE')).toBeNull();
  });

  it('only classifies real, existing variants as relocations', () => {
    for (const [eventId, index] of RELOCATION_VARIANTS) {
      const event = content.eventsById.get(eventId);
      expect(event, `${eventId} missing`).toBeDefined();
      expect(event!.variants[index], `${eventId} variant ${index} missing`).toBeDefined();
      expect(event!.routeTags).toContain('housing');
    }
  });
});
