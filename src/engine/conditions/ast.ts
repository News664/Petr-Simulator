/**
 * Condition AST.
 *
 * Grammar (Content Schema v0.2 / Core Contract section 12):
 *
 *   expr        := orExpr
 *   orExpr      := andExpr ( '|' andExpr )*
 *   andExpr     := unary  ( '&' unary  )*
 *   unary       := '!' unary | primary
 *   primary     := '(' expr ')' | literal | comparison | predicate
 *   literal     := 'TRUE' | 'FALSE'
 *   comparison  := numericRef numOp INTEGER | enumRef enumOp IDENT
 *   numericRef  := AGE | CHR | INT | STR | MNY | SPR | FIX | TMS
 *   enumRef     := SPECIES | RSPECIES | MAT
 *   numOp       := '>=' | '<=' | '!=' | '=' | '==' | '>' | '<'
 *   enumOp      := '=' | '==' | '!='
 *   predicate   := ('TLT'|'EVT'|'AEVT'|'FLAG'|'ACH') '[' IDENT ']'
 *
 * Precedence: '!' binds tighter than '&', which binds tighter than '|'.
 */

export const NUMERIC_REFS = ['AGE', 'CHR', 'INT', 'STR', 'MNY', 'SPR', 'FIX', 'TMS'] as const;
export type NumericRef = (typeof NUMERIC_REFS)[number];

export const ENUM_REFS = ['SPECIES', 'RSPECIES', 'MAT'] as const;
export type EnumRef = (typeof ENUM_REFS)[number];

export const PREDICATE_REFS = ['TLT', 'EVT', 'AEVT', 'FLAG', 'ACH'] as const;
export type PredicateRef = (typeof PREDICATE_REFS)[number];

export type NumericOp = '>=' | '<=' | '!=' | '=' | '>' | '<';
export type EnumOp = '=' | '!=';

export type ConditionNode =
  | { kind: 'literal'; value: boolean }
  | { kind: 'not'; operand: ConditionNode }
  | { kind: 'and'; left: ConditionNode; right: ConditionNode }
  | { kind: 'or'; left: ConditionNode; right: ConditionNode }
  | { kind: 'numeric'; ref: NumericRef; op: NumericOp; value: number }
  | { kind: 'enum'; ref: EnumRef; op: EnumOp; value: string }
  | { kind: 'predicate'; ref: PredicateRef; id: string };

export class ConditionSyntaxError extends Error {
  readonly source: string;
  readonly position: number;

  constructor(message: string, source: string, position: number) {
    super(`${message} (in \`${source}\` at offset ${position})`);
    this.name = 'ConditionSyntaxError';
    this.source = source;
    this.position = position;
  }
}
