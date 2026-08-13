/**
 * Deterministic registry review-mirror renderers.
 *
 * Event batches have `tools/SOLID_STATE_CONTENT_TOOL_v0.2.py`; the Route Tag and
 * Talent registries did not, so their `.md` review mirrors were hand-authored by
 * design. Phase 1.2 bumps both registries, so these renderers reproduce the
 * existing v1.0 / v1.1 mirrors byte-for-byte and then generate the new versions,
 * making the mirrors machine-verifiable the same way batch Markdown is.
 *
 * The canonical JSON/CSV remains the source of truth; nothing reads these files
 * at runtime.
 */

import { parseCsvRecords } from './csv.js';

const DASH = '—';

function table(headers: string[], rows: string[][]): string[] {
  return [
    `| ${headers.join(' | ')} |`,
    `|${headers.map(() => '---').join('|')}|`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ];
}

export interface RouteTagRegistryRaw {
  version: string;
  tags: {
    tag: string;
    kind: string;
    flagPrefixes: string[];
    activeEventFavor: boolean;
    allowTransformationEventFavor: boolean;
  }[];
}

export function renderRouteTagRegistryMarkdown(data: RouteTagRegistryRaw, intro: string): string {
  const lines: string[] = [
    '# SOLID STATE — Route Tag Registry',
    `## Version ${data.version}`,
    '',
    `**Canonical source:** \`SOLID_STATE_ROUTE_TAG_REGISTRY_v${data.version}.json\``,
    '',
    intro,
    '',
    ...table(
      ['Tag', 'Kind', 'Flag prefix(es)', 'Active event favor', 'TRN event favor'],
      data.tags.map((tag) => [
        `\`${tag.tag}\``,
        tag.kind,
        tag.flagPrefixes.length > 0 ? tag.flagPrefixes.join(', ') : DASH,
        tag.activeEventFavor ? 'yes' : 'no',
        tag.allowTransformationEventFavor ? 'yes' : 'no',
      ]),
    ),
  ];
  return `${lines.join('\n')}\n`;
}

export interface TalentMirrorOptions {
  version: string;
  csvFileName: string;
  intro: string[];
}

export function renderTalentRegistryMarkdown(csvText: string, options: TalentMirrorOptions): string {
  const records = parseCsvRecords(csvText);
  const cell = (value: string | undefined): string => {
    const trimmed = (value ?? '').trim();
    return trimmed === '' ? DASH : trimmed;
  };
  // Within a field the separator is `;`; the two fields are joined with `; `.
  const unlockRedirect = (record: Record<string, string>): string => {
    const parts = [record['unlock_tags'] ?? '', record['redirect_tags'] ?? '']
      .map((v) => v.trim())
      .filter((v) => v !== '');
    return parts.length === 0 ? DASH : parts.join('; ');
  };

  const lines: string[] = [
    '# SOLID STATE — Talent Registry',
    `## Version ${options.version} — structured machine operations`,
    '',
    `**Canonical source:** \`${options.csvFileName}\``,
    '',
    ...options.intro.flatMap((paragraph) => [paragraph, '']),
    ...table(
      ['ID', 'Talent', 'Favor', 'Strong Favor', 'Suppress', 'Registered species', 'Unlock / Redirect'],
      records
        .filter((record) => (record['id'] ?? '') !== '')
        .map((record) => [
          `\`${record['id']}\``,
          record['name_en'] ?? '',
          cell(record['drafting_favor']),
          cell(record['drafting_strongly_favor']),
          cell(record['drafting_suppress']),
          cell(record['registered_species_rule']),
          unlockRedirect(record),
        ]),
    ),
  ];
  return `${lines.join('\n')}\n`;
}
