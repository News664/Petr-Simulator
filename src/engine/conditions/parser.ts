import {
  ConditionSyntaxError,
  ENUM_REFS,
  NUMERIC_REFS,
  PREDICATE_REFS,
  type ConditionNode,
  type EnumOp,
  type EnumRef,
  type NumericOp,
  type NumericRef,
  type PredicateRef,
} from './ast.js';
import { tokenize, type Token } from './lexer.js';

const NUMERIC_SET = new Set<string>(NUMERIC_REFS);
const ENUM_SET = new Set<string>(ENUM_REFS);
const PREDICATE_SET = new Set<string>(PREDICATE_REFS);
const NUMERIC_OPS = new Set(['>=', '<=', '!=', '=', '>', '<']);
const ENUM_OPS = new Set(['=', '!=']);

class Parser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(
    private readonly source: string,
    tokens: Token[],
  ) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.index]!;
  }

  private next(): Token {
    return this.tokens[this.index++]!;
  }

  private fail(message: string, token: Token = this.peek()): never {
    throw new ConditionSyntaxError(message, this.source, token.pos);
  }

  parse(): ConditionNode {
    const node = this.parseOr();
    const token = this.peek();
    if (token.type !== 'eof') this.fail(`unexpected token ${JSON.stringify(token.text)}`, token);
    return node;
  }

  private parseOr(): ConditionNode {
    let left = this.parseAnd();
    while (this.peek().type === 'or') {
      this.next();
      const right = this.parseAnd();
      left = { kind: 'or', left, right };
    }
    return left;
  }

  private parseAnd(): ConditionNode {
    let left = this.parseUnary();
    while (this.peek().type === 'and') {
      this.next();
      const right = this.parseUnary();
      left = { kind: 'and', left, right };
    }
    return left;
  }

  private parseUnary(): ConditionNode {
    if (this.peek().type === 'not') {
      this.next();
      return { kind: 'not', operand: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ConditionNode {
    const token = this.peek();
    if (token.type === 'lparen') {
      this.next();
      const inner = this.parseOr();
      if (this.peek().type !== 'rparen') this.fail('expected `)`');
      this.next();
      return inner;
    }
    if (token.type !== 'ident') this.fail(`expected a reference or literal, got ${JSON.stringify(token.text)}`);
    this.next();
    const name = token.text;

    if (name === 'TRUE') return { kind: 'literal', value: true };
    if (name === 'FALSE') return { kind: 'literal', value: false };

    if (PREDICATE_SET.has(name)) return this.parsePredicate(name as PredicateRef);
    if (NUMERIC_SET.has(name)) return this.parseNumericComparison(name as NumericRef);
    if (ENUM_SET.has(name)) return this.parseEnumComparison(name as EnumRef);

    this.fail(`unknown reference ${JSON.stringify(name)}`, token);
  }

  private parsePredicate(ref: PredicateRef): ConditionNode {
    if (this.peek().type !== 'lbracket') this.fail(`expected \`[\` after ${ref}`);
    this.next();
    const idToken = this.peek();
    if (idToken.type !== 'ident' && idToken.type !== 'number') {
      this.fail(`expected an identifier inside ${ref}[...]`);
    }
    this.next();
    if (this.peek().type !== 'rbracket') this.fail(`expected \`]\` closing ${ref}[...]`);
    this.next();
    return { kind: 'predicate', ref, id: idToken.text };
  }

  private parseNumericComparison(ref: NumericRef): ConditionNode {
    const opToken = this.peek();
    if (opToken.type !== 'op' || !NUMERIC_OPS.has(opToken.text)) {
      this.fail(`expected a comparison operator after ${ref}`);
    }
    this.next();
    const valueToken = this.peek();
    if (valueToken.type !== 'number') this.fail(`expected an integer after ${ref} ${opToken.text}`);
    this.next();
    const value = Number.parseInt(valueToken.text, 10);
    if (!Number.isInteger(value)) this.fail('expected an integer literal', valueToken);
    return { kind: 'numeric', ref, op: opToken.text as NumericOp, value };
  }

  private parseEnumComparison(ref: EnumRef): ConditionNode {
    const opToken = this.peek();
    if (opToken.type !== 'op' || !ENUM_OPS.has(opToken.text)) {
      this.fail(`expected \`=\` or \`!=\` after ${ref}`);
    }
    this.next();
    const valueToken = this.peek();
    if (valueToken.type !== 'ident') this.fail(`expected an identifier after ${ref} ${opToken.text}`);
    this.next();
    return { kind: 'enum', ref, op: opToken.text as EnumOp, value: valueToken.text };
  }
}

const cache = new Map<string, ConditionNode>();

/** Parse a condition string into an AST. Results are memoized by source text. */
export function parseCondition(source: string): ConditionNode {
  const cached = cache.get(source);
  if (cached) return cached;
  if (typeof source !== 'string') {
    throw new ConditionSyntaxError('condition must be a string', String(source), 0);
  }
  if (source.trim() === '') {
    throw new ConditionSyntaxError('empty condition', source, 0);
  }
  const node = new Parser(source, tokenize(source)).parse();
  cache.set(source, node);
  return node;
}

/** Test helper: clears the parse cache. */
export function clearConditionCache(): void {
  cache.clear();
}
