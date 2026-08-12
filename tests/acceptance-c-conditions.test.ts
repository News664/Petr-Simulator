import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { ConditionSyntaxError } from '../src/engine/conditions/ast.js';
import { evaluateCondition, type ConditionContext } from '../src/engine/conditions/evaluate.js';
import { parseCondition } from '../src/engine/conditions/parser.js';
import { REPO_ROOT, loadDefaultContent } from '../src/engine/content/load.js';

/**
 * Acceptance C — Condition parser.
 */
function ctx(overrides: Partial<ConditionContext> = {}): ConditionContext {
  return {
    AGE: 30,
    CHR: 5,
    INT: 7,
    STR: 4,
    MNY: 3,
    SPR: 6,
    FIX: 40,
    TMS: 2,
    SPECIES: 'ELF',
    RSPECIES: 'HUMAN',
    MAT: 'NONE',
    talents: new Set(['T1013']),
    events: new Set(['EVT-ORD-EDU-0001']),
    priorRunEvents: new Set(['EVT-INS-MUS-0001']),
    flags: new Set(['ROUTE_MUS_INTEREST']),
    achievements: new Set(['ACH_FIRST_FORM']),
    ...overrides,
  };
}

const evalIn = (source: string, overrides: Partial<ConditionContext> = {}): boolean =>
  evaluateCondition(source, ctx(overrides));

describe('C. Condition parser', () => {
  it('evaluates numeric comparisons', () => {
    expect(evalIn('AGE>=30')).toBe(true);
    expect(evalIn('AGE>30')).toBe(false);
    expect(evalIn('AGE=30')).toBe(true);
    expect(evalIn('AGE!=30')).toBe(false);
    expect(evalIn('CHR<=5')).toBe(true);
    expect(evalIn('CHR<5')).toBe(false);
    expect(evalIn('INT>=7 & STR<=4 & MNY<=3 & SPR>=6 & FIX>=40')).toBe(true);
  });

  it('supports negative integer literals', () => {
    expect(evalIn('CHR>=-3')).toBe(true);
    expect(evalIn('CHR<=-3', { CHR: -5 })).toBe(true);
  });

  it('evaluates SPECIES', () => {
    expect(evalIn('SPECIES=ELF')).toBe(true);
    expect(evalIn('SPECIES=HUMAN')).toBe(false);
    expect(evalIn('SPECIES!=HUMAN')).toBe(true);
  });

  it('evaluates RSPECIES separately from SPECIES', () => {
    expect(evalIn('RSPECIES=HUMAN')).toBe(true);
    expect(evalIn('SPECIES=HUMAN')).toBe(false);
    expect(evalIn('SPECIES=ELF & RSPECIES=HUMAN')).toBe(true);
  });

  it('evaluates MAT', () => {
    expect(evalIn('MAT=NONE')).toBe(true);
    expect(evalIn('MAT!=NONE')).toBe(false);
    expect(evalIn('MAT=CRYS', { MAT: 'CRYS' })).toBe(true);
  });

  it('evaluates TLT', () => {
    expect(evalIn('TLT[T1013]')).toBe(true);
    expect(evalIn('TLT[T1024]')).toBe(false);
  });

  it('evaluates EVT against the active run', () => {
    expect(evalIn('EVT[EVT-ORD-EDU-0001]')).toBe(true);
    expect(evalIn('EVT[EVT-INS-MUS-0001]')).toBe(false);
  });

  it('evaluates AEVT against completed prior runs only', () => {
    expect(evalIn('AEVT[EVT-INS-MUS-0001]')).toBe(true);
    expect(evalIn('AEVT[EVT-ORD-EDU-0001]')).toBe(false);
  });

  it('evaluates FLAG', () => {
    expect(evalIn('FLAG[ROUTE_MUS_INTEREST]')).toBe(true);
    expect(evalIn('FLAG[ROUTE_COR_EMPLOYEE]')).toBe(false);
  });

  it('evaluates ACH', () => {
    expect(evalIn('ACH[ACH_FIRST_FORM]')).toBe(true);
    expect(evalIn('ACH[ACH_NOTHING]')).toBe(false);
  });

  it('evaluates TMS', () => {
    expect(evalIn('TMS>=2')).toBe(true);
    expect(evalIn('TMS>=3')).toBe(false);
    expect(evalIn('TMS=0', { TMS: 0 })).toBe(true);
  });

  it('evaluates & | ! and parentheses', () => {
    expect(evalIn('TRUE & FALSE')).toBe(false);
    expect(evalIn('TRUE | FALSE')).toBe(true);
    expect(evalIn('!FALSE')).toBe(true);
    expect(evalIn('!TRUE')).toBe(false);
    expect(evalIn('!(TRUE & FALSE)')).toBe(true);
    expect(evalIn('(MAT=STON | MAT=NONE) & INT>=7')).toBe(true);
  });

  it('evaluates TRUE / FALSE literals', () => {
    expect(evalIn('TRUE')).toBe(true);
    expect(evalIn('FALSE')).toBe(false);
  });

  it('binds ! tighter than &, and & tighter than |', () => {
    // `!A & B` must be `(!A) & B`, not `!(A & B)`.
    expect(evalIn('!TRUE & TRUE')).toBe(false);
    expect(evalIn('!FALSE & TRUE')).toBe(true);
    // `A | B & C` must be `A | (B & C)`.
    expect(evalIn('TRUE | FALSE & FALSE')).toBe(true);
    expect(evalIn('FALSE | TRUE & FALSE')).toBe(false);
    expect(evalIn('(TRUE | FALSE) & FALSE')).toBe(false);

    const ast = parseCondition('A_UNUSED' in {} ? 'TRUE' : 'FALSE | TRUE & TRUE');
    expect(ast.kind).toBe('or');
  });

  it('ignores whitespace', () => {
    expect(evalIn('  AGE  >=  30   &   SPECIES = ELF ')).toBe(true);
  });

  it('rejects malformed expressions safely', () => {
    const malformed = [
      '',
      '   ',
      'AGE >=',
      'AGE >= CHR',
      '>= 5',
      'AGE 5',
      'TLT[',
      'TLT[T1013',
      'TLT T1013]',
      'FLAG[]',
      '(AGE>=5',
      'AGE>=5)',
      'AGE>=5 &',
      '& AGE>=5',
      'NOPE>=5',
      'SPECIES>=ELF',
      'MAT>5',
      'AGE>=5 && CHR>=1',
      'AGE>=5 || CHR>=1',
      'AGE >= 5; DROP TABLE',
      'process.exit(1)',
      '__proto__',
      'AGE>=1e5',
      'TRUE TRUE',
      'TLT[T1013] = 1',
    ];
    for (const source of malformed) {
      expect(() => parseCondition(source), `should reject ${JSON.stringify(source)}`).toThrow(
        ConditionSyntaxError,
      );
    }
  });

  it('reports the offending source and offset', () => {
    try {
      parseCondition('AGE>=5 & NOPE');
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ConditionSyntaxError);
      const err = error as ConditionSyntaxError;
      expect(err.source).toBe('AGE>=5 & NOPE');
      expect(err.position).toBe(9);
    }
  });

  it('uses no eval, Function constructor or equivalent', () => {
    const dir = path.join(REPO_ROOT, 'src');
    const offenders: string[] = [];
    const walk = (current: string): void => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith('.ts')) continue;
        const source = readFileSync(full, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:])\/\/.*$/gm, '$1');
        if (/\beval\s*\(/.test(source)) offenders.push(`${path.relative(REPO_ROOT, full)}: eval(`);
        if (/new\s+Function\s*\(/.test(source)) offenders.push(`${path.relative(REPO_ROOT, full)}: new Function(`);
        if (/\bvm\s*\.\s*run/.test(source)) offenders.push(`${path.relative(REPO_ROOT, full)}: vm.run`);
      }
    };
    walk(dir);
    expect(offenders).toEqual([]);
  });

  it('parses every condition string in canonical content', () => {
    const content = loadDefaultContent();
    let count = 0;
    for (const event of content.events) {
      for (const source of [event.include, event.exclude]) {
        expect(() => parseCondition(source)).not.toThrow();
        count++;
      }
      for (const variant of event.variants) {
        expect(() => parseCondition(variant.when)).not.toThrow();
        count++;
        for (const schedule of variant.schedules) {
          expect(() => parseCondition(schedule.validityCondition)).not.toThrow();
          count++;
        }
      }
    }
    expect(count).toBeGreaterThan(400);
  });

  it('parses every threshold talent condition', () => {
    const content = loadDefaultContent();
    for (const talent of content.talents.values()) {
      if (talent.trigger_type !== 'threshold_once') continue;
      expect(talent.condition).not.toBe('');
      expect(() => parseCondition(talent.condition)).not.toThrow();
    }
  });
});
