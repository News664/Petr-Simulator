import type { ContentBundle } from '../engine/content/load.js';
import type { Material, SpeciesDef, VisibleStat } from '../engine/types.js';

/**
 * Player-facing wording for internal codes.
 *
 * Normal mode must never render a `MAT` code, an event ID, a route flag or a
 * channel/family. Everything the player sees about internal state passes through
 * here first.
 */

const MATERIAL_LABEL: Record<Exclude<Material, 'NONE'>, string> = {
  STON: 'STONE TRAJECTORY',
  METL: 'METAL TRAJECTORY',
  CRYS: 'CRYSTAL TRAJECTORY',
  WOOD: 'WOOD TRAJECTORY',
  GLAS: 'GLASS TRAJECTORY',
  CERA: 'CERAMIC TRAJECTORY',
  SYNT: 'SYNTHETIC TRAJECTORY',
  TEMP: 'TEMPORAL TRAJECTORY',
  MIXD: 'MIXED TRAJECTORY',
  ANOM: 'ANOMALOUS TRAJECTORY',
};

/** `MOBILE` before commitment; a readable trajectory afterwards. Never the code. */
export function materialLabel(material: Material, mobileLabel: string): string {
  if (material === 'NONE') return mobileLabel;
  return MATERIAL_LABEL[material] ?? mobileLabel;
}

export const STAT_ORDER: readonly VisibleStat[] = ['CHR', 'INT', 'STR', 'MNY', 'SPR'];

export function speciesDisplayName(def: SpeciesDef): string {
  return def.name_en;
}

/** Shown only when it adds something beyond the formal name. */
export function speciesColloquial(def: SpeciesDef): string | null {
  const colloquial = def.colloquial_en?.trim();
  if (!colloquial || colloquial === def.name_en) return null;
  return colloquial;
}

export interface TalentCardData {
  id: string;
  name: string;
  rarity: string;
  description: string;
  incompatibleWith: string[];
}

/**
 * Talent data safe to render.
 *
 * Deliberately drops drafting hooks, unlock/redirect tags, hidden effects and
 * designer notes: those are the levers behind the curtain, and the playtest
 * question is whether a player can infer causes *without* them.
 */
export function talentCard(content: ContentBundle, talentId: string): TalentCardData | null {
  const talent = content.talents.get(talentId);
  if (!talent) return null;
  return {
    id: talent.id,
    name: talent.name_en,
    rarity: talent.rarity,
    description: talent.description_en,
    incompatibleWith: talent.incompatibleWith,
  };
}

export function talentName(content: ContentBundle, talentId: string): string {
  return content.talents.get(talentId)?.name_en ?? talentId;
}

/** Rarity as a small star count, with the label kept for non-colour meaning. */
export function rarityStars(rarity: string): number {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 1;
    case 'uncommon':
      return 2;
    case 'rare':
      return 3;
    case 'very rare':
    case 'veryrare':
      return 4;
    case 'legendary':
      return 5;
    default:
      return 1;
  }
}

export function formatDelta(value: number): string {
  // Unicode minus reads better than a hyphen at small sizes.
  return value > 0 ? `+${value}` : `−${Math.abs(value)}`;
}
