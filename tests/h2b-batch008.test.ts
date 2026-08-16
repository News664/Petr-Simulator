import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { genderLint, hiddenTokenLint, preschoolAudit, statCurveAudit } from '../src/engine/content/lint.js';
import { factionSlotAllows, isEligible } from '../src/engine/eligibility.js';
import { activeFaction, applyFactionTransition, factionState } from '../src/engine/factions.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { applyStateTriggers } from '../src/engine/triggers.js';
import { SPECIES_IDS, type FactionDef, type GameEvent } from '../src/engine/types.js';
import { loadExperimentMatrix } from '../src/sim/experiments.js';
import { gatingStatOf, H2B_BATCH_ID, rescueBand, RELOCATION_TAG } from '../src/sim/h2bDiagnostic.js';

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
  it('loads the H2B batch and the new ending', () => {
    const batch = content.batches.find((b) => b.batchId === H2B_BATCH_ID);
    expect(batch).toBeDefined();
    // 28 Batch 008 blueprints plus the H2B.1A financial maturation event.
    expect(batch!.events.length).toBe(29);
    expect(content.events.length).toBe(215);
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

describe('H2B.1A — working canonical balance and state triggers', () => {
  it('applied LOW to every gate-assigned event and its schedule validity terms', () => {
    const LOW: Record<string, number> = {
      commitment_standard: 28,
      climax_temporal: 34,
      climax_medical: 36,
      climax_standard: 40,
      climax_anomalous: 36,
      climax_late: 36,
    };
    const matrix = loadExperimentMatrix();
    const expected = new Map<string, number>();
    for (const [gate, ids] of Object.entries(matrix.gateAssignments)) {
      for (const id of ids) expected.set(id, LOW[gate]!);
    }
    for (const [eventId, threshold] of expected) {
      const event = content.eventsById.get(eventId)!;
      const own = /FIX\s*>=\s*(\d+)/.exec(event.include);
      if (own) expect(Number(own[1]), eventId).toBe(threshold);
    }
    // Both gate sites move together: no schedule may still point at an old value.
    for (const event of content.events) {
      for (const variant of event.variants) {
        for (const schedule of variant.schedules) {
          const threshold = expected.get(schedule.eventId);
          if (threshold === undefined) continue;
          const found = /FIX\s*>=\s*(\d+)/.exec(schedule.validityCondition);
          if (found) expect(Number(found[1]), `${event.id} -> ${schedule.eventId}`).toBe(threshold);
        }
      }
    }
  });

  it('loads the state-trigger registry as canonical data, not code', () => {
    expect(content.stateTriggers.length).toBeGreaterThan(0);
    for (const trigger of content.stateTriggers) {
      // Authored future events only.
      expect(content.eventsById.has(trigger.schedule.eventId)).toBe(true);
      expect(trigger.schedule.offsetYears).toBeGreaterThanOrEqual(1);
    }
    const review = content.stateTriggers.find((t) => t.id === 'BASIC_CONTINUITY_REVIEW');
    expect(review).toBeDefined();
    expect(review!.schedule.eventId).toBe('EVT-INS-MED-2001');
  });

  it('fires the continuity review from state alone, and refuses to duplicate it', () => {
    const state = blankRun();
    state.age = 30;
    state.stats.STR = -5;

    applyStateTriggers(state, content);
    const queued = state.schedules.filter((p) => p.eventId === 'EVT-INS-MED-2001');
    expect(queued.length).toBe(1);
    // A trigger may only reach a future year, so it cannot add a second visible
    // entry for this age.
    expect(queued[0]!.earliestAge).toBeGreaterThan(state.age);
    expect(state.diagnostics.stateTriggerFirings.length).toBe(1);

    // Already pending: the trigger stays quiet.
    applyStateTriggers(state, content);
    expect(state.schedules.filter((p) => p.eventId === 'EVT-INS-MED-2001').length).toBe(1);

    // Suppressed while a review is already open.
    const suppressed = blankRun();
    suppressed.age = 40;
    suppressed.stats.STR = -5;
    suppressed.flags.add('PRESS_STR_REVIEW');
    applyStateTriggers(suppressed, content);
    expect(suppressed.schedules.length).toBe(0);

    // Below the trigger's own condition it does nothing at all.
    const healthy = blankRun();
    healthy.age = 40;
    healthy.stats.STR = 4;
    applyStateTriggers(healthy, content);
    expect(healthy.schedules.length).toBe(0);
  });

  it('never records two trigger firings for the same target in consecutive years', () => {
    for (let i = 0; i < 120; i++) {
      const result = runSimulation(`h2b1a-trigger-${i}`, content, diagnostic);
      const perEvent = new Map<string, number[]>();
      for (const firing of result.state.diagnostics.stateTriggerFirings) {
        const ages = perEvent.get(firing.eventId) ?? [];
        ages.push(firing.age);
        perEvent.set(firing.eventId, ages);
      }
      for (const ages of perEvent.values()) {
        const sorted = [...ages].sort((a, b) => a - b);
        for (let a = 1; a < sorted.length; a++) expect(sorted[a]! - sorted[a - 1]!).toBeGreaterThan(1);
      }
    }
  });

  it('keeps one visible event per year even when a trigger fires', () => {
    for (let i = 0; i < 60; i++) {
      const result = runSimulation(`h2b1a-cadence-${i}`, content, diagnostic);
      const ages = result.state.history.map((o) => o.age);
      for (let a = 0; a < ages.length; a++) expect(ages[a]).toBe(a);
    }
  });

  it('never lets an ambiguous manifestation pick a material in the new chains', () => {
    for (const eventId of ['EVT-INS-FIN-2004', 'EVT-INS-MED-2003']) {
      const event = content.eventsById.get(eventId)!;
      for (const variant of event.variants) {
        if (!variant.setMaterialCommitment) continue;
        if (variant.when === 'TRUE') {
          // Only the STR chain's explicit synthetic fallback may commit on TRUE.
          expect(eventId).toBe('EVT-INS-MED-2003');
          expect(variant.setMaterialCommitment).toBe('SYNT');
          continue;
        }
        // Otherwise the branch must positively assert its own family and
        // exclude every other one.
        const family = variant.setMaterialCommitment;
        expect(variant.when).toContain(`FLAG[MAT_MANIFEST_${family}]`);
        expect(variant.when).toContain('!FLAG[MAT_MANIFEST_');
      }
    }
  });

  it('keeps the A-01/A-03/A-09 corrections', () => {
    // Recovery no longer cancels the obligation.
    expect(eventById('EVT-INS-FIN-2002').variants[0]!.when).toBe('TLT[T1013] | MNY>=10');
    // Black Ledger escalation follows the obligation, not continued poverty.
    const escalation = eventById('EVT-SPC-SECR-0023').variants[1]!;
    expect(escalation.when).toContain('FAC_BLACK_LEDGER_ROLE_DEBTOR');
    expect(escalation.when).not.toContain('MNY');
    // The lottery is a genuine escape valve at the very bottom only.
    expect(eventById('EVT-ORD-FIN-2003').include).toContain('MNY<=0');
    // Architectural self-ownership is reached by flag, not by talent at the climax.
    expect(eventById('EVT-INS-ARC-2003').variants[0]!.when).toBe('FLAG[ROUTE_ARC_SELF_OWNED]');
  });
});

describe('H2B — content lints', () => {
  it('finds no male-coded player-facing prose', () => {
    const result = genderLint(content);
    expect(result.scanned).toBeGreaterThan(500);
    expect(result.findings).toEqual([]);
  });

  it('finds no internal identifier in player-facing prose', () => {
    const result = hiddenTokenLint(content);
    expect(result.scanned).toBeGreaterThan(500);
    expect(result.findings).toEqual([]);
  });

  it('catches a hidden token wherever it hides in player prose', () => {
    // The runtime hidden-state test plays a randomly seeded life, so it only
    // catches a leak on the runs that happen to draw the offending event —
    // which is exactly how `EVT-INS-ACA-0012` survived until CI drew it. This
    // lint reads every authored string every time, so it must actually match.
    const leaked = {
      ...content,
      events: [
        {
          ...content.events[0]!,
          id: 'EVT-TEST-LEAK-0001',
          variants: [
            {
              ...content.events[0]!.variants[0]!,
              text: { en: 'The dataset improves; your FIX reading does too.', 'zh-TW': '' },
            },
          ],
        },
      ],
    };

    const result = hiddenTokenLint(leaked as typeof content);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]!.term).toBe('FIX');
    expect(result.findings[0]!.id).toBe('EVT-TEST-LEAK-0001');
  });

  it('reads conditions as machinery, and lowercase "fix" as English', () => {
    // `FIX>=28` in an include and "a quick fix" in prose are both correct; only
    // uppercase, word-bounded FIX in player-facing text is a leak.
    const benign = {
      ...content,
      events: [
        {
          ...content.events[0]!,
          id: 'EVT-TEST-BENIGN-0001',
          include: 'FIX>=28 & FLAG[FAC_CRI_STATE_ENGAGED]',
          variants: [
            {
              ...content.events[0]!.variants[0]!,
              when: 'FIX>=30',
              text: { en: 'The technician promises a quick fix and prefixes the form number.', 'zh-TW': '' },
            },
          ],
        },
      ],
    };

    expect(hiddenTokenLint(benign as typeof content).findings).toEqual([]);
  });

  it('catches leaked route and faction namespaces too', () => {
    const leaked = {
      ...content,
      events: [
        {
          ...content.events[0]!,
          id: 'EVT-TEST-LEAK-0002',
          variants: [
            {
              ...content.events[0]!.variants[0]!,
              text: { en: 'Your file is annotated ROUTE_ARC_SELF_OWNED by FAC_CRI staff.', 'zh-TW': '' },
            },
          ],
        },
      ],
    };

    const terms = hiddenTokenLint(leaked as typeof content).findings.map((finding) => finding.term);
    expect(terms).toEqual(['ROUTE_ARC_SELF_OWNED', 'FAC_CRI']);
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

  it('reads relocation from the canonical route tag, and every tagged event is housing', () => {
    expect(content.routeTags.has(RELOCATION_TAG)).toBe(true);
    // A-10: metadata only — no flag prefix, no favor, no transformation influence.
    const def = content.routeTags.get(RELOCATION_TAG)!;
    expect(def.kind).toBe('metadata');
    expect(def.flagPrefixes).toEqual([]);
    expect(def.activeEventFavor).toBe(false);
    expect(def.allowTransformationEventFavor).toBe(false);

    const tagged = content.events.filter((event) => event.routeTags.includes(RELOCATION_TAG));
    expect(tagged.length).toBeGreaterThan(0);
    for (const event of tagged) expect(event.routeTags).toContain('housing');
  });
});
