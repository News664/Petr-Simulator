import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { isPersonallyActive, factionState } from '../src/engine/factions.js';
import { runSimulation } from '../src/engine/simulation.js';
import { SPECIES_IDS, type GameEvent, type ScheduleSpec } from '../src/engine/types.js';
import { COMPRESSED_CHAIN_IDS } from '../src/sim/h2b1bDiagnostic.js';

/**
 * H2B.1B Part A — faction continuity.
 *
 * Part A compresses the ENGAGED chain's schedule timing and nothing else. These
 * tests pin both halves of that: the two links that moved, and the far longer
 * list of things that were required to stay exactly where they were.
 */

const content = loadDefaultContent();

/** contact -> disposition -> middle touchpoint -> escalation -> climax, per faction. */
const CHAINS = [
  { faction: 'FCT-DMMS', contact: 'EVT-SPC-SECR-0001', disposition: 'EVT-SPC-SECR-0013', middle: 'EVT-SPC-SECR-2001', escalation: 'EVT-SPC-SECR-0019', climax: 'EVT-SPC-SECR-0007' },
  { faction: 'FCT-MERIDIAN', contact: 'EVT-SPC-SECR-0002', disposition: 'EVT-SPC-SECR-0014', middle: 'EVT-SPC-SECR-2002', escalation: 'EVT-SPC-SECR-0020', climax: 'EVT-SPC-SECR-0008' },
  { faction: 'FCT-CRI', contact: 'EVT-SPC-SECR-0003', disposition: 'EVT-SPC-SECR-0015', middle: 'EVT-SPC-SECR-2003', escalation: 'EVT-SPC-SECR-0021', climax: 'EVT-SPC-SECR-0009' },
  { faction: 'FCT-EVERLASTING', contact: 'EVT-SPC-SECR-0004', disposition: 'EVT-SPC-SECR-0016', middle: 'EVT-SPC-SECR-2004', escalation: 'EVT-SPC-SECR-0022', climax: 'EVT-SPC-SECR-0010' },
  { faction: 'FCT-BLACK-LEDGER', contact: 'EVT-SPC-SECR-0005', disposition: 'EVT-SPC-SECR-0017', middle: 'EVT-SPC-SECR-2005', escalation: 'EVT-SPC-SECR-0023', climax: 'EVT-SPC-SECR-0011' },
  { faction: 'FCT-LAST-POSTURE', contact: 'EVT-SPC-SECR-0006', disposition: 'EVT-SPC-SECR-0018', middle: 'EVT-SPC-SECR-2006', escalation: 'EVT-SPC-SECR-0024', climax: 'EVT-SPC-SECR-0012' },
] as const;

/** Contact ages the ledger requires to be untouched. */
const CONTACT_AGES: Record<string, { min: number; max: number }> = {
  'EVT-SPC-SECR-0001': { min: 16, max: 20 },
  'EVT-SPC-SECR-0002': { min: 17, max: 22 },
  'EVT-SPC-SECR-0003': { min: 18, max: 23 },
  'EVT-SPC-SECR-0004': { min: 18, max: 23 },
  'EVT-SPC-SECR-0005': { min: 18, max: 24 },
  'EVT-SPC-SECR-0006': { min: 16, max: 22 },
};

/** contact -> disposition offsets. Black Ledger is deliberately the fast one. */
const CONTACT_OFFSETS: Record<string, number> = {
  'EVT-SPC-SECR-0001': 2,
  'EVT-SPC-SECR-0002': 2,
  'EVT-SPC-SECR-0003': 2,
  'EVT-SPC-SECR-0004': 2,
  'EVT-SPC-SECR-0005': 1,
  'EVT-SPC-SECR-0006': 2,
};

function schedulesTo(event: GameEvent, targetId: string): ScheduleSpec[] {
  return event.variants.flatMap((variant) => variant.schedules.filter((s) => s.eventId === targetId));
}

describe('H2B.1B-A — the compressed ENGAGED chain', () => {
  it('schedules the middle touchpoint at +2 years with a 2-year window', () => {
    for (const chain of CHAINS) {
      const specs = schedulesTo(content.eventsById.get(chain.disposition)!, chain.middle);
      expect(specs.length, `${chain.disposition} must still schedule ${chain.middle}`).toBeGreaterThan(0);
      for (const spec of specs) {
        expect(spec.offsetYears, `${chain.disposition} -> ${chain.middle}`).toBe(2);
        expect(spec.windowYears, `${chain.disposition} -> ${chain.middle}`).toBe(2);
      }
    }
  });

  it('schedules the escalation at +1 year with a 2-year window', () => {
    for (const chain of CHAINS) {
      const specs = schedulesTo(content.eventsById.get(chain.middle)!, chain.escalation);
      expect(specs.length, `${chain.middle} must still schedule ${chain.escalation}`).toBeGreaterThan(0);
      for (const spec of specs) {
        expect(spec.offsetYears, `${chain.middle} -> ${chain.escalation}`).toBe(1);
        expect(spec.windowYears, `${chain.middle} -> ${chain.escalation}`).toBe(2);
      }
    }
  });

  it('keeps every other schedule field on the compressed links', () => {
    for (const chain of CHAINS) {
      const links: [string, string, string][] = [
        [chain.disposition, chain.middle, `FLAG[${content.factions.get(chain.faction)!.lifecycleFlags.ENGAGED}]`],
        [chain.middle, chain.escalation, `FLAG[${content.factions.get(chain.faction)!.lifecycleFlags.ENGAGED}]`],
      ];
      for (const [sourceId, targetId, validity] of links) {
        for (const spec of schedulesTo(content.eventsById.get(sourceId)!, targetId)) {
          expect(spec.priority).toBe('scheduled');
          expect(spec.priorityOrder).toBe(15);
          expect(spec.validityCondition).toBe(validity);
        }
      }
    }
  });

  it('reaches the escalation inside the compressed window at the earliest legal ages', () => {
    // The compression only works if the target event's own age gate still lets
    // it fire: disposition at 18 -> middle at 20 -> escalation at 21.
    for (const chain of CHAINS) {
      const middle = content.eventsById.get(chain.middle)!;
      const escalation = content.eventsById.get(chain.escalation)!;
      const earliestMiddle = Math.max(middle.age.min, content.eventsById.get(chain.disposition)!.age.min + 2);
      const escalationWindowEnd = earliestMiddle + 1 + 2;
      expect(
        escalation.age.min,
        `${chain.escalation} must be reachable inside its compressed window`,
      ).toBeLessThanOrEqual(escalationWindowEnd);
    }
  });
});

describe('H2B.1B-A — faction continuity Part A must not disturb', () => {
  it('still has exactly six factions', () => {
    expect(content.factions.size).toBe(6);
    for (const chain of CHAINS) expect(content.factions.get(chain.faction)).toBeDefined();
  });

  it('leaves the lifecycle FSM alone', () => {
    const rules = content.factionRules;
    expect(rules.initialState).toBe('NONE');
    expect(rules.legalTransitions.NONE).toEqual(['CONTACTED']);
    expect(rules.legalTransitions.CONTACTED).toEqual(['ENGAGED', 'COMMITTED', 'OPTED_OUT', 'CLOSED']);
    expect(rules.legalTransitions.ENGAGED).toEqual(['COMMITTED', 'OPTED_OUT', 'CLOSED']);
    expect(rules.activeContextStates).toEqual(['CONTACTED', 'ENGAGED', 'COMMITTED']);
    expect(rules.personalTerminalStates).toEqual(['OPTED_OUT', 'CLOSED']);
  });

  it('leaves the contact ages alone', () => {
    for (const [id, age] of Object.entries(CONTACT_AGES)) {
      const event = content.eventsById.get(id)!;
      expect(event.age.min, `${id} age.min`).toBe(age.min);
      expect(event.age.max, `${id} age.max`).toBe(age.max);
    }
  });

  it('leaves contact -> disposition timing alone', () => {
    for (const chain of CHAINS) {
      const specs = schedulesTo(content.eventsById.get(chain.contact)!, chain.disposition);
      expect(specs.length).toBeGreaterThan(0);
      for (const spec of specs) {
        expect(spec.offsetYears, `${chain.contact} -> ${chain.disposition}`).toBe(CONTACT_OFFSETS[chain.contact]);
        expect(spec.windowYears, `${chain.contact} -> ${chain.disposition}`).toBe(3);
      }
    }
  });

  it('leaves escalation -> climax timing alone', () => {
    for (const chain of CHAINS) {
      const specs = schedulesTo(content.eventsById.get(chain.escalation)!, chain.climax);
      expect(specs.length).toBeGreaterThan(0);
      for (const spec of specs) {
        expect(spec.offsetYears, `${chain.escalation} -> ${chain.climax}`).toBe(1);
        expect(spec.windowYears, `${chain.escalation} -> ${chain.climax}`).toBe(6);
        expect(spec.priority).toBe('climax');
      }
    }
  });

  it('keeps the commitment and ending gates on the climax schedules', () => {
    const gates: Record<string, string> = {
      'EVT-SPC-SECR-0019': 'FLAG[FAC_DMMS_STATE_COMMITTED] & (FIX>=8 | MAT!=NONE)',
      'EVT-SPC-SECR-0020': 'FLAG[FAC_MERIDIAN_STATE_COMMITTED] & (FIX>=10 | MAT!=NONE | CHR>=8)',
      'EVT-SPC-SECR-0021': 'FLAG[FAC_CRI_STATE_COMMITTED] & FIX>=12',
      'EVT-SPC-SECR-0022': 'FLAG[FAC_EVERLASTING_STATE_COMMITTED] & MNY<=3',
      'EVT-SPC-SECR-0023': 'FLAG[FAC_BLACK_LEDGER_STATE_COMMITTED] & (FIX>=8 | MAT!=NONE)',
      'EVT-SPC-SECR-0024': 'FLAG[FAC_LAST_POSTURE_STATE_COMMITTED] & FIX>=8',
    };
    for (const chain of CHAINS) {
      for (const spec of schedulesTo(content.eventsById.get(chain.escalation)!, chain.climax)) {
        expect(spec.validityCondition, chain.escalation).toBe(gates[chain.escalation]);
      }
    }
  });

  it('keeps the first-disposition exit conditions', () => {
    // Part A re-measures these rather than retuning them, so the authored
    // conditions must be byte-identical to the pre-patch corpus.
    const exits: Record<string, string> = {
      'EVT-SPC-SECR-0013': 'TLT[T1013] | TLT[T1024] | (INT>=9 & SPR>=6)',
      'EVT-SPC-SECR-0014': 'TLT[T1010] | (SPR>=9 & INT>=7)',
      'EVT-SPC-SECR-0015': 'INT<=3 | TLT[T1010]',
      'EVT-SPC-SECR-0016': 'TLT[T1013] | MNY>=8',
      'EVT-SPC-SECR-0017': 'TLT[T1013] | MNY>=7',
      'EVT-SPC-SECR-0018': 'TLT[T1010] | (INT>=9 & SPR>=7)',
    };
    for (const [id, condition] of Object.entries(exits)) {
      expect(content.eventsById.get(id)!.variants[0]!.when, id).toBe(condition);
    }
  });

  it('keeps every faction ending id reachable from its own chain', () => {
    const endingIds = new Set<string>();
    for (const chain of CHAINS) {
      for (const id of [chain.disposition, chain.escalation, chain.climax]) {
        for (const variant of content.eventsById.get(id)!.variants) {
          if (variant.endingId) endingIds.add(variant.endingId);
        }
      }
    }
    for (const id of endingIds) expect(content.endings.get(id), `${id} must be registered`).toBeDefined();
    expect(endingIds.size).toBeGreaterThanOrEqual(6);
  });

  it('adds no visible faction meter or stage label', () => {
    // Lifecycle stays flag-backed: no numeric faction field anywhere in an
    // event, and no player-facing prose naming a stage.
    for (const event of content.events) {
      for (const variant of event.variants) {
        expect(Object.keys(variant.effects).every((key) => !key.startsWith('FAC'))).toBe(true);
        expect(variant.text.en).not.toMatch(/\b(CONTACTED|ENGAGED|COMMITTED|OPTED_OUT|CLOSED)\b/);
        expect(variant.text.en).not.toMatch(/\b(DMMS|CRI)\s+\d+\s*\/\s*\d+/);
      }
    }
  });

  it('holds the single-active-faction rule and the safe exit across full runs', () => {
    for (let index = 0; index < 300; index++) {
      let maxActive = 0;
      const result = runSimulation(`faction-cadence-${index}`, content, {
        species: { kind: 'fixed', species: SPECIES_IDS[index % SPECIES_IDS.length]! },
        talents: { kind: 'seeded_random_compatible' },
        allocation: { kind: 'seeded_random' },
      }, {
        maxAge: 120,
        onBeforeYear: (state) => {
          let active = 0;
          for (const faction of content.factions.values()) {
            if (isPersonallyActive(content.factionRules, factionState(state.flags, faction))) active += 1;
          }
          if (active > maxActive) maxActive = active;
        },
      });

      expect(maxActive, `run ${index} held more than one active faction`).toBeLessThanOrEqual(1);
      expect(result.state.diagnostics.illegalFactionTransitions).toEqual([]);
      expect(result.state.diagnostics.personalEventsAfterExit).toEqual([]);
    }
  });

  it('does not expire the compressed chain', () => {
    // The whole point of a shorter offset with a 2-year window is that the
    // event still lands. A schedule dropped for `window_closed` would be the
    // compression costing a touchpoint instead of moving it closer.
    let expiries = 0;
    let chainEvents = 0;
    for (let index = 0; index < 300; index++) {
      const result = runSimulation(`faction-expiry-${index}`, content, {
        species: { kind: 'fixed', species: SPECIES_IDS[index % SPECIES_IDS.length]! },
        talents: { kind: 'seeded_random_compatible' },
        allocation: { kind: 'seeded_random' },
      }, { maxAge: 120 });

      for (const expired of result.state.diagnostics.expiredSchedules) {
        if (COMPRESSED_CHAIN_IDS.includes(expired.eventId)) expiries += 1;
      }
      for (const occurrence of result.state.history) {
        if (COMPRESSED_CHAIN_IDS.includes(occurrence.eventId)) chainEvents += 1;
      }
    }
    expect(chainEvents, 'the compressed chain must actually be exercised').toBeGreaterThan(50);
    expect(expiries).toBe(0);
  });
});
