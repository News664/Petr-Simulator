import { ConditionSyntaxError } from './ast.js';

export type TokenType =
  | 'ident'
  | 'number'
  | 'op'
  | 'lparen'
  | 'rparen'
  | 'lbracket'
  | 'rbracket'
  | 'and'
  | 'or'
  | 'not'
  | 'eof';

export interface Token {
  type: TokenType;
  text: string;
  pos: number;
}

const IDENT_START = /[A-Za-z_]/;
const IDENT_BODY = /[A-Za-z0-9_.\-]/;

/**
 * Tokenizes a condition expression. Rejects any character outside the grammar,
 * which is what keeps arbitrary text from reaching an evaluator.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i]!;
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen', text: ch, pos: i++ });
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', text: ch, pos: i++ });
      continue;
    }
    if (ch === '[') {
      tokens.push({ type: 'lbracket', text: ch, pos: i++ });
      continue;
    }
    if (ch === ']') {
      tokens.push({ type: 'rbracket', text: ch, pos: i++ });
      continue;
    }
    if (ch === '&') {
      // Accept `&&` as a typo-tolerant alias for `&`? No: the grammar is `&`.
      if (source[i + 1] === '&') {
        throw new ConditionSyntaxError('unsupported operator `&&`; use `&`', source, i);
      }
      tokens.push({ type: 'and', text: ch, pos: i++ });
      continue;
    }
    if (ch === '|') {
      if (source[i + 1] === '|') {
        throw new ConditionSyntaxError('unsupported operator `||`; use `|`', source, i);
      }
      tokens.push({ type: 'or', text: ch, pos: i++ });
      continue;
    }
    if (ch === '!') {
      if (source[i + 1] === '=') {
        tokens.push({ type: 'op', text: '!=', pos: i });
        i += 2;
        continue;
      }
      tokens.push({ type: 'not', text: ch, pos: i++ });
      continue;
    }
    if (ch === '>' || ch === '<') {
      if (source[i + 1] === '=') {
        tokens.push({ type: 'op', text: ch + '=', pos: i });
        i += 2;
        continue;
      }
      tokens.push({ type: 'op', text: ch, pos: i++ });
      continue;
    }
    if (ch === '=') {
      if (source[i + 1] === '=') {
        tokens.push({ type: 'op', text: '=', pos: i });
        i += 2;
        continue;
      }
      tokens.push({ type: 'op', text: '=', pos: i++ });
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      const start = i;
      while (i < source.length && source[i]! >= '0' && source[i]! <= '9') i++;
      tokens.push({ type: 'number', text: source.slice(start, i), pos: start });
      continue;
    }
    if (ch === '-' && source[i + 1] !== undefined && source[i + 1]! >= '0' && source[i + 1]! <= '9') {
      const start = i;
      i++;
      while (i < source.length && source[i]! >= '0' && source[i]! <= '9') i++;
      tokens.push({ type: 'number', text: source.slice(start, i), pos: start });
      continue;
    }
    if (IDENT_START.test(ch)) {
      const start = i;
      while (i < source.length && IDENT_BODY.test(source[i]!)) i++;
      tokens.push({ type: 'ident', text: source.slice(start, i), pos: start });
      continue;
    }
    throw new ConditionSyntaxError(`unexpected character ${JSON.stringify(ch)}`, source, i);
  }
  tokens.push({ type: 'eof', text: '', pos: source.length });
  return tokens;
}
