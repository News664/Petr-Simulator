import type { ContentBundle } from './load.js';
import { ALL_STATS, VISIBLE_STATS, type StatKey } from '../types.js';

/**
 * H2B content consistency lints.
 *
 * Implements `docs/validation/SOLID_STATE_H2B_CONTENT_LINT_SPEC_v0.1.md`.
 * Everything here reads canonical content and reports. No lint rewrites prose,
 * and no finding is silently suppressed — the allowlist is explicit and empty
 * until a string is actually reviewed.
 */

// ---------------------------------------------------------------------------
// All-female prose lint
// ---------------------------------------------------------------------------

/**
 * Male-coded standalone terms, from the lint spec.
 *
 * Word boundaries matter: `Human`, `management`, `woman` and `Dragonkin` must
 * not trip the scan, so every term is matched with `\b` on both sides.
 */
export const MALE_CODED_TERMS = [
  'he',
  'him',
  'his',
  'himself',
  'father',
  'dad',
  'son',
  'brother',
  'husband',
  'boyfriend',
  'boy',
  'man',
  'men',
  'male',
] as const;

/**
 * Reviewed exceptions.
 *
 * An entry is `${sourceId}:${field}:${term}`. Empty by design: the spec forbids
 * silent suppression, so a string only lands here after a human review that is
 * recorded in the design register.
 */
export const GENDER_LINT_ALLOWLIST: readonly string[] = [];

const MALE_TERM_RE = new RegExp(`\\b(${MALE_CODED_TERMS.join('|')})\\b`, 'gi');

export interface ProseFinding {
  /** `event` / `ending` / `talent` / `species` / `faction`. */
  kind: string;
  id: string;
  field: string;
  term: string;
  /** The full offending string, so a reviewer can replace it exactly. */
  text: string;
  excerpt: string;
}

interface ProseEntry {
  kind: string;
  id: string;
  field: string;
  text: string;
}

/**
 * Every canonical player-facing English string.
 *
 * Designer notes are deliberately excluded: they are authoring commentary, not
 * prose the player ever sees, and the spec scopes the lint to player-facing
 * text. `collectProse` is exported so the CLI can report the scanned surface.
 */
export function collectProse(content: ContentBundle): ProseEntry[] {
  const out: ProseEntry[] = [];
  for (const event of content.events) {
    event.variants.forEach((variant, index) => {
      out.push({ kind: 'event', id: event.id, field: `variant ${index + 1} text.en`, text: variant.text.en });
    });
  }
  for (const ending of content.endings.values()) {
    out.push({ kind: 'ending', id: ending.id, field: 'title_en', text: ending.title_en });
    out.push({ kind: 'ending', id: ending.id, field: 'description_en', text: ending.description_en });
    out.push({ kind: 'ending', id: ending.id, field: 'social_meaning', text: ending.socialMeaning });
    out.push({ kind: 'ending', id: ending.id, field: 'typical_forms', text: ending.typicalForms.join('; ') });
    out.push({ kind: 'ending', id: ending.id, field: 'legal_status', text: ending.legalStatus });
  }
  for (const talent of content.talents.values()) {
    out.push({ kind: 'talent', id: talent.id, field: 'name_en', text: talent.name_en });
    out.push({ kind: 'talent', id: talent.id, field: 'description_en', text: talent.description_en });
  }
  for (const species of content.species.values()) {
    out.push({ kind: 'species', id: species.id, field: 'name_en', text: species.name_en });
    out.push({ kind: 'species', id: species.id, field: 'colloquial_en', text: species.colloquial_en });
  }
  for (const faction of content.factions.values()) {
    out.push({ kind: 'faction', id: faction.id, field: 'name_en', text: faction.name_en });
    out.push({ kind: 'faction', id: faction.id, field: 'intent', text: faction.intent });
  }
  return out.filter((entry) => entry.text.length > 0);
}

export function genderLint(content: ContentBundle): { scanned: number; findings: ProseFinding[] } {
  const entries = collectProse(content);
  const findings: ProseFinding[] = [];
  for (const entry of entries) {
    MALE_TERM_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = MALE_TERM_RE.exec(entry.text)) !== null) {
      const term = match[0];
      if (GENDER_LINT_ALLOWLIST.includes(`${entry.id}:${entry.field}:${term.toLowerCase()}`)) continue;
      findings.push({
        kind: entry.kind,
        id: entry.id,
        field: entry.field,
        term,
        text: entry.text,
        excerpt: entry.text.slice(Math.max(0, match.index - 45), match.index + term.length + 45),
      });
    }
  }
  return { scanned: entries.length, findings };
}

// ---------------------------------------------------------------------------
// Hidden-token prose lint
// ---------------------------------------------------------------------------

/**
 * Internal identifiers that must never reach a player.
 *
 * `FIX` is the hidden fixation stat: the whole H2A premise is that a player
 * infers transformation pressure from what happens, not from a number, and a
 * single line of prose naming it undoes that for the run that draws it. The
 * prefixes are the machine-facing namespaces — a route flag or faction flag in
 * prose is a leaked implementation detail either way.
 *
 * This is deliberately a *static* check on canonical text. The UI already has a
 * runtime test asserting no hidden token reaches the rendered DOM, but that test
 * plays a randomly seeded life, so it only catches a leak on the runs that
 * happen to draw the offending event. This lint reads every authored string
 * every time.
 *
 * Scope is narrow on purpose: uppercase, word-bounded `FIX`, and the two
 * obvious identifier prefixes. Lowercase "fix" is an ordinary English word and
 * is not matched. Only player-facing prose is scanned — `include` / `when`
 * conditions legitimately contain `FIX>=28` and `FLAG[FAC_CRI_STATE_ENGAGED]`,
 * and are not prose.
 */
export const HIDDEN_TOKEN_PATTERNS: readonly { name: string; re: RegExp }[] = [
  { name: 'FIX', re: /\bFIX\b/g },
  { name: 'ROUTE_', re: /\bROUTE_[A-Z0-9_]*/g },
  { name: 'FAC_', re: /\bFAC_[A-Z0-9_]*/g },
];

/**
 * Reviewed exceptions, same contract as the gender allowlist: an entry is
 * `${sourceId}:${field}:${term}`, and it stays empty until a human decides a
 * given string really is meant to say this.
 */
export const HIDDEN_TOKEN_ALLOWLIST: readonly string[] = [];

/** Player-facing prose naming an internal token. Hard failure. */
export function hiddenTokenLint(content: ContentBundle): { scanned: number; findings: ProseFinding[] } {
  const entries = collectProse(content);
  const findings: ProseFinding[] = [];
  for (const entry of entries) {
    for (const pattern of HIDDEN_TOKEN_PATTERNS) {
      pattern.re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.re.exec(entry.text)) !== null) {
        const term = match[0];
        if (HIDDEN_TOKEN_ALLOWLIST.includes(`${entry.id}:${entry.field}:${term}`)) continue;
        findings.push({
          kind: entry.kind,
          id: entry.id,
          field: entry.field,
          term,
          text: entry.text,
          excerpt: entry.text.slice(Math.max(0, match.index - 45), match.index + term.length + 45),
        });
      }
    }
  }
  return { scanned: entries.length, findings };
}

// ---------------------------------------------------------------------------
// Age 0-1 audit
// ---------------------------------------------------------------------------

export interface PreschoolVariantRow {
  when: string;
  textEn: string;
  effects: Partial<Record<StatKey, number>>;
  addFlags: string[];
}

export interface PreschoolEventRow {
  id: string;
  channel: string;
  family: string;
  ageMin: number;
  ageMax: number | null;
  selectionMode: string;
  weightClass: string;
  include: string;
  variants: PreschoolVariantRow[];
}

/**
 * Every event that can fire at age 0 or 1.
 *
 * The audit is a report for human review, not a pass/fail rule: whether a
 * household event implies implausible protagonist agency is a judgement no
 * regex can make.
 */
export function preschoolAudit(content: ContentBundle): PreschoolEventRow[] {
  return content.events
    .filter((event) => event.age.min <= 1)
    .map((event) => ({
      id: event.id,
      channel: event.channel,
      family: event.family,
      ageMin: event.age.min,
      ageMax: event.age.max,
      selectionMode: event.selectionMode,
      weightClass: event.weightClass,
      include: event.include,
      variants: event.variants.map((variant) => ({
        when: variant.when,
        textEn: variant.text.en,
        effects: variant.effects,
        addFlags: variant.addFlags,
      })),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// Stat-curve audit
// ---------------------------------------------------------------------------

export interface LintAgeBand {
  label: string;
  minAge: number;
  maxAge: number | null;
}

/** The canonical age bands, read from Balance Constants rather than hard-coded. */
function lintBands(content: ContentBundle): LintAgeBand[] {
  return content.balance.ageChannelWeights.map((band) => ({
    label: band.maxAge === null ? `${band.minAge}+` : `${band.minAge}-${band.maxAge}`,
    minAge: band.minAge,
    maxAge: band.maxAge,
  }));
}

export interface StatCurveCell {
  positiveVariants: number;
  negativeVariants: number;
  positiveMagnitude: number;
  negativeMagnitude: number;
}

export interface StatCurveAudit {
  bands: LintAgeBand[];
  /** stat -> band label -> counts. */
  byStat: Record<string, Record<string, StatCurveCell>>;
  /** stat -> corpus totals across all ages. */
  totals: Record<string, StatCurveCell>;
  /** Stats with no authored negative delta anywhere. The spec calls these out. */
  monotonicStats: string[];
}

/**
 * Authored stat deltas by stat and age band, counted statically over the corpus.
 *
 * An event contributes to every band its age window overlaps, because that is
 * the set of ages at which its variants can actually fire. This is a corpus
 * shape check; what a *run* observes is measured separately by the diagnostic.
 */
export function statCurveAudit(content: ContentBundle): StatCurveAudit {
  const bands = lintBands(content);
  const byStat: Record<string, Record<string, StatCurveCell>> = {};
  const totals: Record<string, StatCurveCell> = {};
  const blank = (): StatCurveCell => ({
    positiveVariants: 0,
    negativeVariants: 0,
    positiveMagnitude: 0,
    negativeMagnitude: 0,
  });
  for (const stat of ALL_STATS) {
    byStat[stat] = {};
    totals[stat] = blank();
    for (const band of bands) byStat[stat]![band.label] = blank();
  }

  for (const event of content.events) {
    const overlapping = bands.filter(
      (band) =>
        event.age.min <= (band.maxAge ?? Number.POSITIVE_INFINITY) &&
        (event.age.max ?? Number.POSITIVE_INFINITY) >= band.minAge,
    );
    for (const variant of event.variants) {
      for (const stat of ALL_STATS) {
        const delta = variant.effects[stat];
        if (delta === undefined || delta === 0) continue;
        const apply = (cell: StatCurveCell): void => {
          if (delta > 0) {
            cell.positiveVariants += 1;
            cell.positiveMagnitude += delta;
          } else {
            cell.negativeVariants += 1;
            cell.negativeMagnitude += delta;
          }
        };
        apply(totals[stat]!);
        for (const band of overlapping) apply(byStat[stat]![band.label]!);
      }
    }
  }

  const monotonicStats = VISIBLE_STATS.filter((stat) => totals[stat]!.negativeVariants === 0);
  return { bands, byStat, totals, monotonicStats: [...monotonicStats] };
}
