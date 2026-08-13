import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { parseCondition } from '../src/engine/conditions/parser.js';
import { eventContextScalar } from '../src/engine/drafting.js';
import { eligibleLoreFallbackEvents, eligibleNormalEvents } from '../src/engine/eligibility.js';
import {
  applyFactionTransition,
  factionRoles,
  factionState,
  IllegalFactionTransitionError,
  lifecycleStatesHeld,
  satisfiableAfterExit,
} from '../src/engine/factions.js';
import { createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { SPECIES_IDS, type FactionDef } from '../src/engine/types.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';

/**
 * Phase 1.3 — faction lifecycle FSM, safe exits and the lore-fallback tier.
 *
 * Faction identity is not alignment and not a meter: lifecycle is a handful of
 * registered flags, roles are orthogonal flags, and a safe exit really ends the
 * personalized chain while the world keeps talking about the faction.
 */
const content = loadDefaultContent();

const diagnostic: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'seeded_random' },
};

const faction = (id: string): FactionDef => content.factions.get(id)!;

/** A run state with nothing in it, for direct FSM exercise. */
function blankRun() {
  return createRun('p13-fsm', content, {
    species: { kind: 'fixed', species: 'HUMAN' },
    talents: { kind: 'none' },
    allocation: { kind: 'even' },
  }).state;
}

describe('Phase 1.3 — faction lifecycle FSM', () => {
  it('loads the v0.2 registry with a lifecycle FSM and orthogonal roles', () => {
    expect(content.factions.size).toBe(6);
    expect(content.factionRules.initialState).toBe('NONE');
    expect(content.factionRules.activeContextStates).toEqual(['CONTACTED', 'ENGAGED', 'COMMITTED']);
    expect(content.factionRules.personalTerminalStates).toEqual(['OPTED_OUT', 'CLOSED']);
    for (const def of content.factions.values()) {
      expect(Object.keys(def.lifecycleFlags).sort()).toEqual(
        ['CLOSED', 'COMMITTED', 'CONTACTED', 'ENGAGED', 'OPTED_OUT'].sort(),
      );
      expect(def.allowedRoles.length).toBeGreaterThan(0);
    }
  });

  it('walks the whole legal ladder NONE -> CONTACTED -> ENGAGED -> COMMITTED', () => {
    const state = blankRun();
    const cri = faction('FCT-CRI');
    expect(factionState(state.flags, cri)).toBe('NONE');
    for (const to of ['CONTACTED', 'ENGAGED', 'COMMITTED'] as const) {
      applyFactionTransition(state, cri, content.factionRules, { factionId: cri.id, to });
      expect(factionState(state.flags, cri)).toBe(to);
      expect(lifecycleStatesHeld(state.flags, cri)).toEqual([to]);
    }
  });

  it('rejects illegal transitions instead of applying them', () => {
    const rules = content.factionRules;
    const cri = faction('FCT-CRI');

    // NONE -> ENGAGED skips contact entirely.
    const fresh = blankRun();
    expect(() => applyFactionTransition(fresh, cri, rules, { factionId: cri.id, to: 'ENGAGED' })).toThrow(
      IllegalFactionTransitionError,
    );
    expect(factionState(fresh.flags, cri)).toBe('NONE');
    expect(fresh.flags.size).toBe(0);

    // COMMITTED has no routine safe opt-out.
    const committed = blankRun();
    applyFactionTransition(committed, cri, rules, { factionId: cri.id, to: 'CONTACTED' });
    applyFactionTransition(committed, cri, rules, { factionId: cri.id, to: 'COMMITTED' });
    expect(() => applyFactionTransition(committed, cri, rules, { factionId: cri.id, to: 'OPTED_OUT' })).toThrow(
      IllegalFactionTransitionError,
    );
    expect(factionState(committed.flags, cri)).toBe('COMMITTED');
    // CLOSED is the one authored way out.
    expect(() =>
      applyFactionTransition(committed, cri, rules, { factionId: cri.id, to: 'CLOSED' }),
    ).not.toThrow();

    // A terminal state is terminal: nothing reopens it.
    const exited = blankRun();
    applyFactionTransition(exited, cri, rules, { factionId: cri.id, to: 'CONTACTED' });
    applyFactionTransition(exited, cri, rules, { factionId: cri.id, to: 'OPTED_OUT' });
    for (const to of ['CONTACTED', 'ENGAGED', 'COMMITTED', 'CLOSED'] as const) {
      expect(() => applyFactionTransition(exited, cri, rules, { factionId: cri.id, to })).toThrow(
        IllegalFactionTransitionError,
      );
    }
    expect(factionState(exited.flags, cri)).toBe('OPTED_OUT');
  });

  it('never holds two lifecycle states for one faction', () => {
    const state = blankRun();
    const cri = faction('FCT-CRI');
    applyFactionTransition(state, cri, content.factionRules, { factionId: cri.id, to: 'CONTACTED' });
    applyFactionTransition(state, cri, content.factionRules, { factionId: cri.id, to: 'ENGAGED' });
    expect(lifecycleStatesHeld(state.flags, cri)).toEqual(['ENGAGED']);
    expect(state.flags.has(cri.lifecycleFlags.CONTACTED)).toBe(false);
  });

  it('lets multiple orthogonal roles coexist and rejects unregistered ones', () => {
    const state = blankRun();
    const cri = faction('FCT-CRI');
    applyFactionTransition(state, cri, content.factionRules, { factionId: cri.id, to: 'CONTACTED' });
    applyFactionTransition(state, cri, content.factionRules, {
      factionId: cri.id,
      to: 'ENGAGED',
      addRoles: ['SUBJECT', 'AFFILIATE'],
    });
    expect(factionRoles(state.flags, cri).sort()).toEqual(['AFFILIATE', 'SUBJECT']);

    // MEMBER belongs to Last Posture, not to CRI.
    expect(() =>
      applyFactionTransition(state, cri, content.factionRules, {
        factionId: cri.id,
        to: 'COMMITTED',
        addRoles: ['MEMBER'],
      }),
    ).toThrow(/not registered/);
    // The refused transition left the state exactly as it was.
    expect(factionState(state.flags, cri)).toBe('ENGAGED');
    expect(factionRoles(state.flags, cri).sort()).toEqual(['AFFILIATE', 'SUBJECT']);
  });

  it('clears every role flag on OPTED_OUT and on CLOSED', () => {
    for (const terminal of ['OPTED_OUT', 'CLOSED'] as const) {
      const state = blankRun();
      const ledger = faction('FCT-BLACK-LEDGER');
      applyFactionTransition(state, ledger, content.factionRules, { factionId: ledger.id, to: 'CONTACTED' });
      applyFactionTransition(state, ledger, content.factionRules, {
        factionId: ledger.id,
        to: 'ENGAGED',
        addRoles: ['DEBTOR', 'TARGETED'],
      });
      expect(factionRoles(state.flags, ledger).length).toBe(2);
      applyFactionTransition(state, ledger, content.factionRules, { factionId: ledger.id, to: terminal });
      expect(factionRoles(state.flags, ledger), terminal).toEqual([]);
      expect(factionState(state.flags, ledger)).toBe(terminal);
    }
  });

  it('keeps the historical FAC_*_CONTACT marker across the whole lifecycle', () => {
    const state = blankRun();
    const dmms = faction('FCT-DMMS');
    state.flags.add('FAC_DMMS_CONTACT');
    for (const to of ['CONTACTED', 'ENGAGED', 'CLOSED'] as const) {
      applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to });
      expect(state.flags.has('FAC_DMMS_CONTACT'), to).toBe(true);
    }
  });
});

describe('Phase 1.3 — route context follows lifecycle, not history', () => {
  const factionEvent = content.events.find(
    (e) => e.factionInteraction === 'personal' && e.channel !== 'TRN',
  )!;
  const routeFavor = content.balance.familyEvidenceScalar.routeFavor;

  it('gives no route favor for a historical contact marker alone', () => {
    const state = blankRun();
    const neutral = eventContextScalar(factionEvent, state, content);
    for (const def of content.factions.values()) for (const flag of def.historyFlags) state.flags.add(flag);
    expect(eventContextScalar(factionEvent, state, content)).toBe(neutral);
  });

  it('gives no route favor after OPTED_OUT or CLOSED', () => {
    for (const terminal of ['OPTED_OUT', 'CLOSED'] as const) {
      const state = blankRun();
      const neutral = eventContextScalar(factionEvent, state, content);
      for (const def of content.factions.values()) state.flags.add(def.lifecycleFlags[terminal]);
      expect(eventContextScalar(factionEvent, state, content), terminal).toBe(neutral);
    }
  });

  it('gives exactly one route-favor scalar while a lifecycle state is active', () => {
    for (const active of ['CONTACTED', 'ENGAGED', 'COMMITTED'] as const) {
      const state = blankRun();
      const neutral = eventContextScalar(factionEvent, state, content);
      for (const def of content.factions.values()) state.flags.add(def.lifecycleFlags[active]);
      expect(eventContextScalar(factionEvent, state, content) / neutral, active).toBeCloseTo(routeFavor, 10);
    }
  });

  it('registers `faction_news` as metadata that never grants favor', () => {
    const news = content.routeTags.get('faction_news')!;
    expect(news.activeEventFavor).toBe(false);
    expect(news.allowTransformationEventFavor).toBe(false);
    expect(news.flagPrefixes).toEqual([]);
  });
});

describe('Phase 1.3 — safe exit holds', () => {
  it('proves no personalized faction event survives a safe exit', () => {
    let checked = 0;
    for (const gameEvent of content.events) {
      if (gameEvent.factionInteraction !== 'personal' && gameEvent.factionInteraction !== 'climax') continue;
      const include = parseCondition(gameEvent.include);
      for (const factionId of gameEvent.factionIds) {
        for (const terminal of content.factionRules.personalTerminalStates) {
          expect(
            satisfiableAfterExit(include, faction(factionId), content.factionRules, terminal),
            `${gameEvent.id} after ${factionId} ${terminal}`,
          ).toBe(false);
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('leaves news and lore reachable after a safe exit, without reopening state', () => {
    const state = blankRun();
    state.age = 60;
    const dmms = faction('FCT-DMMS');
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'CONTACTED' });
    applyFactionTransition(state, dmms, content.factionRules, { factionId: dmms.id, to: 'OPTED_OUT' });

    const lore = eligibleLoreFallbackEvents(state, content);
    expect(lore.some((e) => e.factionIds.includes('FCT-DMMS'))).toBe(true);

    // News is ordinary drafted content and stays available...
    const news = content.events.filter((e) => e.factionInteraction === 'news');
    expect(news.length).toBe(12);
    for (const item of news) {
      expect(item.variants.every((v) => (v.factionTransitions ?? []).length === 0), item.id).toBe(true);
      expect(item.variants.every((v) => v.addFlags.length === 0 && v.removeFlags.length === 0), item.id).toBe(true);
    }
    // ...and the personal chain does not come back.
    const personal = eligibleNormalEvents(state, content).filter(
      (e) => e.factionInteraction === 'personal' && e.factionIds.includes('FCT-DMMS'),
    );
    expect(personal).toEqual([]);
    expect(factionState(state.flags, dmms)).toBe('OPTED_OUT');
  });

  it('rejects a personalized faction event that would survive a safe exit', () => {
    // The guarantee is a real check, not a vacuous one: an event gated only on
    // the historical marker is still satisfiable after opting out.
    const dmms = faction('FCT-DMMS');
    const reopens = parseCondition('FLAG[FAC_DMMS_CONTACT]');
    expect(satisfiableAfterExit(reopens, dmms, content.factionRules, 'OPTED_OUT')).toBe(true);
    const gated = parseCondition('FLAG[FAC_DMMS_STATE_ENGAGED] | FLAG[FAC_DMMS_STATE_COMMITTED]');
    expect(satisfiableAfterExit(gated, dmms, content.factionRules, 'OPTED_OUT')).toBe(false);
  });
});

describe('Phase 1.3 — lore fallback tier', () => {
  const loreEvents = content.events.filter((e) => e.selectionMode === 'lore_fallback_only');

  it('ships one rare repeatable bulletin per faction', () => {
    expect(loreEvents.length).toBe(6);
    expect(new Set(loreEvents.flatMap((e) => e.factionIds)).size).toBe(6);
    for (const item of loreEvents) {
      expect(item.repeatPolicy, item.id).toBe('repeatable');
      expect(item.age.min, item.id).toBeGreaterThanOrEqual(25);
    }
  });

  it('has no mechanical effect of any kind', () => {
    for (const item of loreEvents) {
      for (const v of item.variants) {
        expect(Object.keys(v.effects), item.id).toEqual([]);
        expect(v.addFlags, item.id).toEqual([]);
        expect(v.removeFlags, item.id).toEqual([]);
        expect(v.factionTransitions ?? [], item.id).toEqual([]);
        expect(v.schedules, item.id).toEqual([]);
        expect(v.setMaterialCommitment, item.id).toBeUndefined();
        expect(v.endingId, item.id).toBeUndefined();
      }
    }
  });

  it('never participates in normal hierarchical drafting', () => {
    const state = blankRun();
    for (let age = 25; age <= 90; age++) {
      state.age = age;
      expect(eligibleNormalEvents(state, content).some((e) => e.selectionMode === 'lore_fallback_only')).toBe(
        false,
      );
    }
  });

  it('fires after the normal pool is empty and before generic fallback', () => {
    // Covers 0-24 so the run is legal, then leaves the normal pool empty.
    const normal = event({ id: 'EVT-ORD-GEN-9100', age: { min: 0, max: 24 } });
    const lore = event({
      id: 'EVT-INS-CIV-9101',
      channel: 'INS',
      family: 'CIV',
      selectionMode: 'lore_fallback_only',
      age: { min: 25, max: null },
      variants: [variant({ text: { en: 'a bulletin nobody acts on', 'zh-TW': '' } })],
    });
    const generic = event({
      id: 'EVT-ORD-GEN-9102',
      selectionMode: 'fallback_only',
      age: { min: 25, max: null },
      variants: [variant({ text: { en: 'a quiet year', 'zh-TW': '' } })],
    });
    const bundle = fixtureContent({ events: [normal, lore, generic] });
    const result = runSimulation('p13-lore-tier', bundle, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });

    expect(result.outcome.kind).toBe('nonterminal');
    const sources = new Map(result.state.history.map((h) => [h.age, h]));
    // Ages 0-24 draft normally; no fallback of either kind is legal there.
    for (let age = 0; age <= 24; age++) {
      expect(sources.get(age)!.eventId, `age ${age}`).toBe('EVT-ORD-GEN-9100');
      expect(sources.get(age)!.source, `age ${age}`).toBe('normal');
    }
    // From 25 the normal pool is exhausted, so lore wins every year and the
    // generic quiet year is never reached.
    for (let age = 25; age <= 120; age++) {
      expect(sources.get(age)!.eventId, `age ${age}`).toBe('EVT-INS-CIV-9101');
      expect(sources.get(age)!.source, `age ${age}`).toBe('lore_fallback');
    }
    expect(result.state.diagnostics.loreFallbackYears.length).toBe(96);
    expect(result.state.diagnostics.fallbackYears).toEqual([]);
  });

  it('falls through to generic fallback when no lore bulletin is eligible', () => {
    const normal = event({ id: 'EVT-ORD-GEN-9100', age: { min: 0, max: 24 } });
    const lore = event({
      id: 'EVT-INS-CIV-9101',
      channel: 'INS',
      family: 'CIV',
      selectionMode: 'lore_fallback_only',
      // Never eligible: the run is over before the window opens.
      age: { min: 118, max: null },
      variants: [variant({ text: { en: 'a bulletin nobody acts on', 'zh-TW': '' } })],
    });
    const generic = event({
      id: 'EVT-ORD-GEN-9102',
      selectionMode: 'fallback_only',
      age: { min: 25, max: null },
      variants: [variant({ text: { en: 'a quiet year', 'zh-TW': '' } })],
    });
    const bundle = fixtureContent({ events: [normal, lore, generic] });
    const result = runSimulation('p13-lore-fallthrough', bundle, {
      species: { kind: 'fixed', species: 'HUMAN' },
      talents: { kind: 'none' },
      allocation: { kind: 'even' },
    });
    const at30 = result.state.history.find((h) => h.age === 30)!;
    expect(at30.eventId).toBe('EVT-ORD-GEN-9102');
    expect(at30.source).toBe('fallback');
    expect(result.state.diagnostics.fallbackYears.length).toBeGreaterThan(0);
  });
});

describe('Phase 1.3 — invariants across full runs', () => {
  const results = Array.from({ length: 400 }, (_, i) => runSimulation(`p13-run-${i}`, content, diagnostic));

  it('never records an illegal transition or a lifecycle collision', () => {
    for (const result of results) {
      expect(result.state.diagnostics.illegalFactionTransitions).toEqual([]);
      for (const def of content.factions.values()) {
        expect(lifecycleStatesHeld(result.state.flags, def).length, def.id).toBeLessThanOrEqual(1);
      }
    }
  });

  it('never fires a personalized faction event after that faction was exited', () => {
    for (const result of results) {
      expect(result.state.diagnostics.personalEventsAfterExit).toEqual([]);
    }
  });

  it('applies every transition through a registered legal edge', () => {
    let applied = 0;
    for (const result of results) {
      for (const record of result.state.diagnostics.factionTransitions) {
        expect(content.factionRules.legalTransitions[record.from]).toContain(record.to);
        const def = faction(record.factionId);
        for (const role of [...record.addedRoles, ...record.removedRoles]) {
          expect(def.allowedRoles, `${def.id} ${role}`).toContain(role);
        }
        applied += 1;
      }
    }
    expect(applied).toBeGreaterThan(0);
  });

  it('reaches ENGAGED, COMMITTED and both safe exits through ordinary play', () => {
    const seen = new Set<string>();
    for (const result of results) {
      for (const record of result.state.diagnostics.factionTransitions) seen.add(record.to);
    }
    for (const state of ['CONTACTED', 'ENGAGED', 'COMMITTED', 'OPTED_OUT', 'CLOSED']) {
      expect(seen.has(state), `${state} never reached`).toBe(true);
    }
  });

  it('keeps exactly one visible event per age', () => {
    for (const result of results) {
      const ages = result.state.history.map((h) => h.age);
      expect(new Set(ages).size).toBe(ages.length);
      expect(ages).toEqual([...ages].sort((a, b) => a - b));
    }
  });

  it('produces no ending and no Material Commitment before 18', () => {
    for (const result of results) {
      if (result.outcome.kind === 'ended') {
        expect(result.outcome.ending.endingAge).toBeGreaterThanOrEqual(18);
      }
      const commitment = result.state.diagnostics.commitmentAge;
      if (commitment !== null) expect(commitment).toBeGreaterThanOrEqual(18);
    }
  });

  it('keeps strict pre-25 coverage across every species', () => {
    for (const species of SPECIES_IDS) {
      for (let i = 0; i < 40; i++) {
        const result = runSimulation(`p13-cov-${species}-${i}`, content, {
          ...diagnostic,
          species: { kind: 'fixed', species },
        });
        expect(result.outcome.kind).not.toBe('coverage_error');
        expect(result.state.diagnostics.fallbackYears.filter((age) => age < 25)).toEqual([]);
        expect(result.state.diagnostics.loreFallbackYears.filter((age) => age < 25)).toEqual([]);
      }
    }
  });

  it('stays reproducible for identical seeds', () => {
    const again = runSimulation('p13-run-7', content, diagnostic);
    const first = results[7]!;
    expect(again.state.history).toEqual(first.state.history);
    expect(again.state.diagnostics.factionTransitions).toEqual(first.state.diagnostics.factionTransitions);
    expect([...again.state.flags].sort()).toEqual([...first.state.flags].sort());
  });
});

describe('Phase 1.3 — content deltas', () => {
  it('still leaves the two late-life FIX>=40 climax gates alone', () => {
    expect(content.eventsById.get('EVT-INS-MED-0012')!.include).toContain('FIX>=40');
    expect(content.eventsById.get('EVT-ORD-FAM-0011')!.include).toContain('FIX>=40');
  });

  it('tightened the late-life entries into conjunctions of prior route history', () => {
    const med = content.eventsById.get('EVT-INS-MED-0011')!;
    expect(med.include).toBe(
      'FIX>=25 & FLAG[ROUTE_MED_PRESERVATION_CONSULT] & (FLAG[ROUTE_MED_DIRECTIVE] | FLAG[ROUTE_MED_SYNTH_OPTION]) & !FLAG[ROUTE_MED_LATE_CONTINUITY]',
    );
    // Historical faction contact can no longer reopen the late medical route.
    expect(med.include).not.toContain('FAC_');
    const fam = content.eventsById.get('EVT-ORD-FAM-0010')!;
    expect(fam.include).toBe(
      'FLAG[ROUTE_FAM_PLACEMENT] & FLAG[ROUTE_FAM_DIRECTIVE] & !FLAG[ROUTE_FAM_LATE_LEGACY]',
    );
  });

  it('moved faction climaxes behind COMMITTED and up to age 25', () => {
    const climaxes = content.events.filter((e) => e.factionInteraction === 'climax');
    expect(climaxes.length).toBe(6);
    for (const climax of climaxes) {
      expect(climax.age.min, climax.id).toBeGreaterThanOrEqual(25);
      const def = faction(climax.factionIds[0]!);
      expect(climax.include, climax.id).toContain(def.lifecycleFlags.COMMITTED);
    }
  });

  it('makes contact seeds schedule dispositions rather than climaxes', () => {
    const seeds = content.events.filter((e) => e.factionInteraction === 'contact');
    expect(seeds.length).toBe(6);
    for (const seed of seeds) {
      const scheduled = seed.variants.flatMap((v) => v.schedules);
      expect(scheduled.length, seed.id).toBeGreaterThan(0);
      for (const schedule of scheduled) {
        const target = content.eventsById.get(schedule.eventId)!;
        expect(schedule.priority, `${seed.id} -> ${target.id}`).toBe('scheduled');
        expect(target.factionInteraction, target.id).toBe('personal');
      }
      // The seed still records that contact happened, and moves to CONTACTED.
      const transitions = seed.variants.flatMap((v) => v.factionTransitions ?? []);
      expect(transitions.every((t) => t.to === 'CONTACTED'), seed.id).toBe(true);
      expect(seed.variants.some((v) => v.addFlags.some((f) => f.endsWith('_CONTACT'))), seed.id).toBe(true);
    }
  });

  it('added 30 Batch 007 events with no duplicate ID anywhere in the corpus', () => {
    const batch = content.batches.find((b) => b.batchId === 'EVENT_BATCH_007')!;
    expect(batch.events.length).toBe(30);
    const ids = content.events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(content.eventsById.get('EVT-INS-ACA-0011')!.sourceBatchId).toBe('EVENT_BATCH_005');
    expect(content.eventsById.get('EVT-INS-ACA-0012')!.sourceBatchId).toBe('EVENT_BATCH_006');
  });
});
