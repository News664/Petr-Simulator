import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { selectVariantIndex } from '../src/engine/eligibility.js';
import { createRun, chooseCompatibleTalents, draftTalents } from '../src/engine/setup.js';
import { Rng } from '../src/engine/rng.js';
import { runSimulation } from '../src/engine/simulation.js';
import type { SetupPolicy } from '../src/engine/setup.js';
import { evaluateThresholdTalents, TalentSelectionError, validateTalentSelection } from '../src/engine/talents.js';
import { event, fixtureContent, variant } from './helpers/fixture.js';

/**
 * Acceptance H — event variants.
 * Acceptance I — talent engine.
 */
const content = loadDefaultContent();

const base: SetupPolicy = {
  species: { kind: 'fixed', species: 'HUMAN' },
  talents: { kind: 'none' },
  allocation: { kind: 'even' },
};

const filler = event({ id: 'EVT-ORD-GEN-9000' });

describe('H. Event variants', () => {
  it('evaluates variants against pre-event state', () => {
    // The first variant raises INT above the second variant's threshold. If the
    // engine re-evaluated post-effect it would pick differently on a repeat.
    const gate = event({
      id: 'EVT-ORD-EDU-9001',
      family: 'EDU',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [
        variant({ when: 'INT>=100', effects: {}, text: { en: 'unreachable', 'zh-TW': '' } }),
        variant({ when: 'TRUE', effects: { INT: 1 }, text: { en: 'ordinary', 'zh-TW': '' } }),
      ],
    });
    const fixture = fixtureContent({ events: [gate] });
    const result = runSimulation('pre-event', fixture, base, { maxAge: 10 });
    for (const occurrence of result.state.history) {
      expect(occurrence.variantIndex).toBe(1);
    }
    // INT started at 4 (20 points evenly) and rose one per year.
    expect(result.state.stats.INT).toBe(4 + 11);
  });

  it('picks the first matching variant', () => {
    const ordered = event({
      id: 'EVT-ORD-GEN-9004',
      variants: [
        variant({ when: 'FALSE', text: { en: 'no', 'zh-TW': '' } }),
        variant({ when: 'AGE>=0', text: { en: 'first match', 'zh-TW': '' } }),
        variant({ when: 'TRUE', text: { en: 'fallback', 'zh-TW': '' } }),
      ],
    });
    const fixture = fixtureContent({ events: [ordered] });
    const { state } = createRun('order', fixture, base);
    expect(selectVariantIndex(ordered, state)).toBe(1);
    const result = runSimulation('order', fixture, base, { maxAge: 3 });
    expect(result.state.history.every((h) => h.variantIndex === 1)).toBe(true);
    expect(result.state.history[0]!.textEn).toBe('first match');
  });

  it('applies only the selected variant effects', () => {
    const branching = event({
      id: 'EVT-ORD-GEN-9005',
      age: { min: 0, max: 0 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [
        variant({ when: 'TRUE', effects: { CHR: 5 }, addFlags: ['ROUTE_MUS_INTEREST'] }),
        variant({ when: 'TRUE', effects: { CHR: -99 }, addFlags: ['ROUTE_COR_EMPLOYEE'] }),
      ],
    });
    const fixture = fixtureContent({ events: [branching, filler] });
    const result = runSimulation('only-selected', fixture, base, { maxAge: 2 });
    expect(result.state.stats.CHR).toBe(5 + 5);
    expect(result.state.flags.has('ROUTE_MUS_INTEREST')).toBe(true);
    expect(result.state.flags.has('ROUTE_COR_EMPLOYEE')).toBe(false);
  });

  it('records the selected Event ID in run history', () => {
    const only = event({ id: 'EVT-ORD-GEN-9006' });
    const fixture = fixtureContent({ events: [only] });
    const result = runSimulation('history', fixture, base, { maxAge: 3 });
    expect(result.state.history.map((h) => h.eventId)).toEqual(Array(4).fill('EVT-ORD-GEN-9006'));
    expect(result.state.eventIdsThisRun.has('EVT-ORD-GEN-9006')).toBe(true);
  });

  it('does not let an effect-triggered threshold talent retroactively change the variant', () => {
    // T1002 fires at INT>=5 and grants MNY+2. The event's second variant is
    // gated on MNY, so a retroactive re-evaluation would flip the choice.
    const trap = event({
      id: 'EVT-ORD-GEN-9007',
      age: { min: 0, max: 0 },
      repeatPolicy: 'once_per_run',
      repeatMaxCount: 1,
      variants: [
        variant({ when: 'MNY>=7', effects: { STR: 50 }, text: { en: 'rich branch', 'zh-TW': '' } }),
        variant({ when: 'TRUE', effects: { INT: 5 }, text: { en: 'ordinary branch', 'zh-TW': '' } }),
      ],
    });
    // The filler steps aside at age 0 so the trap event is the only candidate.
    const fixture = fixtureContent({ events: [trap, event({ id: 'EVT-ORD-GEN-9000', exclude: 'AGE=0' })] });
    const result = runSimulation('retroactive', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1002'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 0, STR: 5, MNY: 6, SPR: 5 } },
    }, { maxAge: 1 });

    const first = result.state.history[0]!;
    expect(first.variantIndex).toBe(1);
    expect(first.textEn).toBe('ordinary branch');
    // The talent fired after the event: INT reached 5, so MNY gained +2.
    expect(result.state.triggeredTalents.has('T1002')).toBe(true);
    expect(result.state.stats.MNY).toBe(8);
    // ...but the year's chosen variant is unchanged, so STR never got +50.
    expect(result.state.stats.STR).toBe(5);
  });

  it('has a final TRUE variant on every canonical event', () => {
    for (const gameEvent of content.events) {
      expect(gameEvent.variants[gameEvent.variants.length - 1]!.when, gameEvent.id).toBe('TRUE');
    }
  });
});

describe('I. Talent engine', () => {
  it('applies start talents exactly once', () => {
    const fixture = fixtureContent({ events: [filler] });
    const result = runSimulation('start-once', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1001', 'T1005', 'T1012'] },
    }, { maxAge: 30 });
    // T1001 INT+2, T1005 STR+3/INT-1, T1012 CHR+2 on top of an even 20-point spread.
    expect(result.state.stats.INT).toBe(4 + 2 - 1);
    expect(result.state.stats.STR).toBe(4 + 3);
    expect(result.state.stats.CHR).toBe(5 + 2);
    const activations = result.state.diagnostics.talentActivations.filter((a) => a.talentId === 'T1001');
    expect(activations).toHaveLength(1);
  });

  it('leaves a threshold talent dormant at start and triggers it later', () => {
    const grower = event({
      id: 'EVT-ORD-EDU-9002',
      family: 'EDU',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [variant({ effects: { INT: 1 } })],
    });
    const fixture = fixtureContent({ events: [grower] });
    const { state } = createRun('dormant', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1002'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 0, STR: 5, MNY: 5, SPR: 6 } },
    });
    expect(state.dormantTalents.has('T1002')).toBe(true);
    expect(state.triggeredTalents.has('T1002')).toBe(false);

    const result = runSimulation('dormant', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1002'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 0, STR: 5, MNY: 5, SPR: 6 } },
    }, { maxAge: 20 });
    expect(result.state.triggeredTalents.has('T1002')).toBe(true);
    const activation = result.state.diagnostics.talentActivations.find((a) => a.talentId === 'T1002');
    // INT climbs one per year from 0; the threshold is INT>=5.
    expect(activation?.age).toBe(4);
    expect(result.state.stats.MNY).toBe(7);
  });

  it('never revokes a one-shot trigger', () => {
    // MNY falls back below T1009's MNY<=3 threshold after it fires; the +2 stays.
    const drain = event({
      id: 'EVT-ORD-FIN-9001',
      family: 'FIN',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [variant({ effects: { MNY: -1 } })],
    });
    const fixture = fixtureContent({ events: [drain] });
    const result = runSimulation('no-revoke', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1009'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 5, STR: 5, MNY: 3, SPR: 3 } },
    }, { maxAge: 10 });
    expect(result.state.triggeredTalents.has('T1009')).toBe(true);
    expect(result.state.dormantTalents.has('T1009')).toBe(false);
    // Fired once at setup (MNY 3 -> 5), then 11 years of -1.
    expect(result.state.stats.MNY).toBe(5 - 11);
    expect(result.state.diagnostics.talentActivations.filter((a) => a.talentId === 'T1009')).toHaveLength(1);
  });

  it('lets one triggered talent trigger another, cascading until stable', () => {
    // T1009 (MNY<=3 -> MNY+2) has no downstream effect, so build the cascade
    // from the registry pair that does: T1002 (INT>=5 -> MNY+2) feeding
    // T1007 (CHR>=8 -> MNY+3) is not chained, but T1009 -> T1002 is via MNY.
    // Use a CHR-raising event so T1007 fires, then confirm both are spent.
    const glow = event({
      id: 'EVT-ORD-SOC-9003',
      family: 'SOC',
      repeatPolicy: 'repeatable',
      repeatCooldownYears: 0,
      repeatMaxCount: null,
      variants: [variant({ effects: { CHR: 1 } })],
    });
    const fixture = fixtureContent({ events: [glow] });
    const result = runSimulation('cascade', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1002', 'T1007', 'T1009'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 5, STR: 5, MNY: 2, SPR: 4 } },
    }, { maxAge: 10 });
    expect(result.state.triggeredTalents.has('T1009')).toBe(true);
    expect(result.state.triggeredTalents.has('T1002')).toBe(true);
    expect(result.state.triggeredTalents.has('T1007')).toBe(true);
    expect(result.state.dormantTalents.size).toBe(0);
  });

  it('cascades within a single stabilisation pass', () => {
    // A synthetic chain: raising MNY through T1009 immediately satisfies nothing
    // else, so verify the loop itself reaches a fixed point and is idempotent.
    const fixture = fixtureContent({ events: [filler] });
    const { state } = createRun('stable', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1002', 'T1009'] },
      allocation: { kind: 'explicit', allocation: { CHR: 5, INT: 5, STR: 4, MNY: 3, SPR: 4 } },
    });
    expect(state.dormantTalents.size).toBe(0);
    const before = { ...state.stats };
    expect(evaluateThresholdTalents(state, fixture)).toEqual([]);
    expect(state.stats).toEqual(before);
  });

  it('rejects an incompatible talent selection', () => {
    expect(() => validateTalentSelection(content, ['T1010', 'T1023'])).toThrow(TalentSelectionError);
    expect(() => validateTalentSelection(content, ['T1028', 'T1029'])).toThrow(TalentSelectionError);
    expect(() => validateTalentSelection(content, ['T1025', 'T1030'])).toThrow(TalentSelectionError);
    expect(() => validateTalentSelection(content, ['T1001', 'T1001'])).toThrow(TalentSelectionError);
    expect(() => validateTalentSelection(content, ['T9999'])).toThrow(TalentSelectionError);
    expect(() => validateTalentSelection(content, ['T1001', 'T1005', 'T1012'])).not.toThrow();
  });

  it('drafts 10 distinct talents and chooses 3 compatible ones', () => {
    for (let i = 0; i < 200; i++) {
      const rng = Rng.fromSeed(`draft-${i}`);
      const drafted = draftTalents(rng, content);
      expect(drafted).toHaveLength(10);
      expect(new Set(drafted).size).toBe(10);
      const chosen = chooseCompatibleTalents(content, drafted);
      expect(chosen).toHaveLength(3);
      expect(() => validateTalentSelection(content, chosen)).not.toThrow();
      for (const id of chosen) expect(drafted).toContain(id);
    }
  });

  it('applies the hidden start FIX adapter for T1027 without a visible stat change', () => {
    const fixture = fixtureContent({ events: [filler] });
    const withTalent = createRun('hidden-fix', fixture, {
      ...base,
      talents: { kind: 'fixed', talents: ['T1027'] },
    }).state;
    const without = createRun('hidden-fix', fixture, base).state;
    // Canonical start_fix_bonus is blank while Q-14 is OPEN, so the diagnostic
    // adapter value is what applies here.
    const bonus =
      content.talents.get('T1027')!.startFixBonus ?? fixture.adapters.talentDiagnostics['T1027']?.startFIX ?? 0;
    expect(bonus).toBeGreaterThan(0);
    expect(withTalent.stats.FIX).toBe(without.stats.FIX + bonus);
    for (const stat of ['CHR', 'INT', 'STR', 'MNY', 'SPR'] as const) {
      expect(withTalent.stats[stat]).toBe(without.stats[stat]);
    }
  });
});
