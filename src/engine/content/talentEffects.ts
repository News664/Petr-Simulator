import { ALL_STATS, type StatKey } from '../types.js';

/**
 * Parses the Talent Registry's prose effect columns into structured stat deltas.
 *
 * The registry is canonical and stores effects as short human strings. Rather
 * than hand-maintaining a duplicate table (which could drift from the registry),
 * the engine parses the column with a strict grammar and fails loudly on
 * anything it does not recognise. Every row in
 * SOLID_STATE_TALENT_REGISTRY_v1.0.csv parses; a future row that does not will
 * break loading rather than be silently ignored.
 *
 * Recognised shapes:
 *   "INT +2"
 *   "STR +3, INT -1"
 *   "When INT >= 5: MNY +2"
 *   "When AGE >= 35 and CHR <= 5: CHR +4"
 *   "No direct attribute modifier"
 *   "No visible attribute modifier"
 *   "None."
 *   ""
 */

const STAT_SET = new Set<string>(ALL_STATS);

const NO_EFFECT_PATTERNS = [
  /^no\s+direct\s+attribute\s+modifier\.?$/i,
  /^no\s+visible\s+attribute\s+modifier\.?$/i,
  /^none\.?$/i,
  /^$/,
];

const DELTA_RE = /^([A-Z]{3})\s*([+-])\s*(\d+)$/;

export class TalentEffectParseError extends Error {
  constructor(talentId: string, column: string, value: string, detail: string) {
    super(`talent ${talentId}: cannot parse ${column} ${JSON.stringify(value)} — ${detail}`);
    this.name = 'TalentEffectParseError';
  }
}

/**
 * Extracts stat deltas from a registry effect string. The condition half of a
 * "When <cond>: <deltas>" string is ignored here; the machine-readable trigger
 * condition comes from the registry's own `condition` column.
 */
export function parseTalentEffects(
  talentId: string,
  column: string,
  raw: string,
): Partial<Record<StatKey, number>> {
  const value = raw.trim();
  if (NO_EFFECT_PATTERNS.some((re) => re.test(value))) return {};

  let body = value;
  const whenMatch = /^when\s+.+?:\s*(.+)$/i.exec(value);
  if (whenMatch) body = whenMatch[1]!.trim();

  const effects: Partial<Record<StatKey, number>> = {};
  for (const rawPart of body.split(',')) {
    const part = rawPart.trim().replace(/\.$/, '');
    if (part === '') continue;
    const match = DELTA_RE.exec(part);
    if (!match) {
      throw new TalentEffectParseError(talentId, column, raw, `unrecognised term ${JSON.stringify(part)}`);
    }
    const [, stat, sign, magnitude] = match as unknown as [string, string, string, string];
    if (!STAT_SET.has(stat)) {
      throw new TalentEffectParseError(talentId, column, raw, `unknown stat ${JSON.stringify(stat)}`);
    }
    const key = stat as StatKey;
    if (effects[key] !== undefined) {
      throw new TalentEffectParseError(talentId, column, raw, `stat ${stat} listed twice`);
    }
    effects[key] = sign === '-' ? -Number(magnitude) : Number(magnitude);
  }
  if (Object.keys(effects).length === 0) {
    throw new TalentEffectParseError(talentId, column, raw, 'no stat deltas found');
  }
  return effects;
}

/**
 * Normalises the registry's `condition` column into engine condition syntax.
 * The registry writes `AGE>=35 & CHR<=5`, which is already the DSL. Empty means
 * unconditional.
 */
export function normalizeTalentCondition(raw: string): string {
  const value = raw.trim();
  return value === '' ? '' : value;
}
