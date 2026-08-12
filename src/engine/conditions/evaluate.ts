import type { ConditionNode, NumericRef } from './ast.js';
import { parseCondition } from './parser.js';

/**
 * Everything a condition may read. Deliberately a narrow interface rather than
 * the whole RunState so that conditions cannot mutate simulation state and so
 * that tests can build minimal contexts.
 */
export interface ConditionContext {
  AGE: number;
  CHR: number;
  INT: number;
  STR: number;
  MNY: number;
  SPR: number;
  FIX: number;
  /** Reincarnation count: completed prior runs. See docs/PHASE1_ASSUMPTIONS.md A-1. */
  TMS: number;
  SPECIES: string;
  RSPECIES: string;
  MAT: string;
  /** Talents held for this run. */
  talents: ReadonlySet<string>;
  /** Event IDs resolved in the ACTIVE run. */
  events: ReadonlySet<string>;
  /** Event IDs from COMPLETED prior runs only. Contract section 12. */
  priorRunEvents: ReadonlySet<string>;
  flags: ReadonlySet<string>;
  achievements: ReadonlySet<string>;
}

function numericValue(ctx: ConditionContext, ref: NumericRef): number {
  switch (ref) {
    case 'AGE':
      return ctx.AGE;
    case 'CHR':
      return ctx.CHR;
    case 'INT':
      return ctx.INT;
    case 'STR':
      return ctx.STR;
    case 'MNY':
      return ctx.MNY;
    case 'SPR':
      return ctx.SPR;
    case 'FIX':
      return ctx.FIX;
    case 'TMS':
      return ctx.TMS;
  }
}

export function evaluateNode(node: ConditionNode, ctx: ConditionContext): boolean {
  switch (node.kind) {
    case 'literal':
      return node.value;
    case 'not':
      return !evaluateNode(node.operand, ctx);
    case 'and':
      return evaluateNode(node.left, ctx) && evaluateNode(node.right, ctx);
    case 'or':
      return evaluateNode(node.left, ctx) || evaluateNode(node.right, ctx);
    case 'numeric': {
      const left = numericValue(ctx, node.ref);
      switch (node.op) {
        case '>=':
          return left >= node.value;
        case '<=':
          return left <= node.value;
        case '>':
          return left > node.value;
        case '<':
          return left < node.value;
        case '=':
          return left === node.value;
        case '!=':
          return left !== node.value;
      }
      break;
    }
    case 'enum': {
      const left = node.ref === 'SPECIES' ? ctx.SPECIES : node.ref === 'RSPECIES' ? ctx.RSPECIES : ctx.MAT;
      return node.op === '=' ? left === node.value : left !== node.value;
    }
    case 'predicate': {
      switch (node.ref) {
        case 'TLT':
          return ctx.talents.has(node.id);
        case 'EVT':
          return ctx.events.has(node.id);
        case 'AEVT':
          return ctx.priorRunEvents.has(node.id);
        case 'FLAG':
          return ctx.flags.has(node.id);
        case 'ACH':
          return ctx.achievements.has(node.id);
      }
    }
  }
  /* c8 ignore next */
  throw new Error(`unhandled condition node ${JSON.stringify(node)}`);
}

/** Parse (memoized) and evaluate a condition string. */
export function evaluateCondition(source: string, ctx: ConditionContext): boolean {
  return evaluateNode(parseCondition(source), ctx);
}
