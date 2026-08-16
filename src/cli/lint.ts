#!/usr/bin/env node
/**
 * H2B content consistency lints.
 *
 *   npm run lint:content            # fail on any male-coded player-facing prose
 *   npm run lint:content -- --report reports/h2b-content-lint.md
 *
 * Implements `docs/validation/SOLID_STATE_H2B_CONTENT_LINT_SPEC_v0.1.md`:
 * the all-female prose lint, the age-0/1 manual-review audit, and the
 * stat-curve audit — plus the hidden-token lint, which guards the H2A promise
 * that internal state never reaches a player.
 *
 * The gender and hidden-token lints are hard failures — all-female prose is a
 * design invariant, and a leaked `FIX` undoes the inference the whole playtest
 * is about. The other two are reports for human review: whether an age-0
 * household event implies implausible protagonist agency is a judgement this
 * tool must not make on its own.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ContentValidationError,
  defaultContentPaths,
  loadContent,
  REPO_ROOT,
  type ContentBundle,
} from '../engine/content/load.js';
import { genderLint, hiddenTokenLint, preschoolAudit, statCurveAudit } from '../engine/content/lint.js';
import { ALL_STATS, VISIBLE_STATS } from '../engine/types.js';
import { boolFlag, optionalStringFlag, parseArgs } from './args.js';

const USAGE = `
SOLID STATE — H2B content lints

Usage:
  npm run lint:content -- [options]

Options:
  --report <file>  Also write the full Markdown audit (default reports/h2b-content-lint.md)
  --quiet          Only report failures
  --help           Show this help
`.trim();

function renderReport(content: ContentBundle): string {
  const gender = genderLint(content);
  const hidden = hiddenTokenLint(content);
  const preschool = preschoolAudit(content);
  const curve = statCurveAudit(content);
  const out: string[] = [];

  out.push('# SOLID STATE — H2B Content Lint Report');
  out.push('');
  out.push('Generated from canonical content. **Reports only** — no lint rewrites prose.');
  out.push('');
  out.push(`Content fingerprint: \`${content.contentVersion}\``);
  out.push('');

  out.push('## 1. All-female prose lint');
  out.push('');
  out.push(
    `Scanned **${gender.scanned}** canonical player-facing English strings across events, endings, talents, ` +
      'species and factions for standalone male-coded terms. Designer notes are authoring commentary and are ' +
      'out of scope. Matching is case-insensitive and word-bounded, so `Human`, `woman` and `management` ' +
      'cannot false-positive.',
  );
  out.push('');
  if (gender.findings.length === 0) {
    out.push('**PASS — 0 findings.**');
  } else {
    out.push(`**FAIL — ${gender.findings.length} finding(s).** Exact strings for design replacement:`);
    out.push('');
    out.push('| Kind | ID | Field | Term | String |');
    out.push('|---|---|---|---|---|');
    for (const finding of gender.findings) {
      out.push(
        `| ${finding.kind} | \`${finding.id}\` | ${finding.field} | \`${finding.term}\` | ${finding.text.replace(/\|/g, '\\|')} |`,
      );
    }
  }
  out.push('');

  out.push('## 2. Hidden-token prose lint');
  out.push('');
  out.push(
    `Scanned the same **${hidden.scanned}** player-facing strings for internal identifiers that must never ` +
      'reach a player: word-bounded uppercase `FIX`, and the `ROUTE_` / `FAC_` namespaces. Conditions are not ' +
      'prose and are out of scope — `FIX>=28` in an `include` is correct authoring. Lowercase "fix" is an ' +
      'ordinary English word and is not matched.',
  );
  out.push('');
  if (hidden.findings.length === 0) {
    out.push('**PASS — 0 findings.**');
  } else {
    out.push(`**FAIL — ${hidden.findings.length} finding(s).**`);
    out.push('');
    out.push('| Kind | ID | Field | Token | String |');
    out.push('|---|---|---|---|---|');
    for (const finding of hidden.findings) {
      out.push(
        `| ${finding.kind} | \`${finding.id}\` | ${finding.field} | \`${finding.term}\` | ${finding.text.replace(/\|/g, '\\|')} |`,
      );
    }
  }
  out.push('');

  out.push('## 3. Age 0–1 audit');
  out.push('');
  out.push(
    `**${preschool.length}** event(s) can fire at age 0 or 1. Human review must confirm protagonist agency is ` +
      'age-plausible, that purchases and decisions belong to the family or guardians, and that household ' +
      'changes do not imply implausibly poor preparation for an ordinary new baby without an explicit reason.',
  );
  out.push('');
  for (const event of preschool) {
    out.push(
      `### \`${event.id}\` — ${event.channel}/${event.family}, ages ${event.ageMin}–${event.ageMax ?? '∞'}, ` +
        `${event.selectionMode}, ${event.weightClass}`,
    );
    out.push('');
    out.push(`Include: \`${event.include}\``);
    out.push('');
    for (const variant of event.variants) {
      const effects = Object.entries(variant.effects)
        .map(([stat, delta]) => `${stat} ${delta > 0 ? '+' : ''}${delta}`)
        .join(', ');
      out.push(`- \`${variant.when}\` — ${variant.textEn}`);
      out.push(`  - effects: ${effects || 'none'}${variant.addFlags.length > 0 ? ` · flags: ${variant.addFlags.join(', ')}` : ''}`);
    }
    out.push('');
  }

  out.push('## 4. Stat-curve audit');
  out.push('');
  out.push(
    'Authored variant deltas counted statically over the corpus. An event contributes to every age band its ' +
      'window overlaps, because that is the set of ages at which it can fire. What a *run* observes is measured ' +
      'separately by the H2B diagnostic.',
  );
  out.push('');
  out.push('### Corpus totals');
  out.push('');
  out.push('| Stat | + variants | + magnitude | − variants | − magnitude |');
  out.push('|---|---|---|---|---|');
  for (const stat of ALL_STATS) {
    const cell = curve.totals[stat]!;
    out.push(
      `| ${stat} | ${cell.positiveVariants} | +${cell.positiveMagnitude} | ${cell.negativeVariants} | ${cell.negativeMagnitude} |`,
    );
  }
  out.push('');
  if (curve.monotonicStats.length === 0) {
    out.push('**No visible stat is strictly monotonic** — every one has at least one authored negative delta.');
  } else {
    out.push(
      `**Strictly monotonic visible stat(s): ${curve.monotonicStats.join(', ')}** — no authored negative delta ` +
        'anywhere in the corpus. The lint spec calls this out for INT specifically.',
    );
  }
  out.push('');
  for (const stat of VISIBLE_STATS) {
    out.push(`### ${stat} by age band`);
    out.push('');
    out.push('| Band | + variants | + magnitude | − variants | − magnitude |');
    out.push('|---|---|---|---|---|');
    for (const band of curve.bands) {
      const cell = curve.byStat[stat]![band.label]!;
      out.push(
        `| ${band.label} | ${cell.positiveVariants} | +${cell.positiveMagnitude} | ${cell.negativeVariants} | ${cell.negativeMagnitude} |`,
      );
    }
    out.push('');
  }

  return out.join('\n');
}

function main(argv: string[]): number {
  const args = parseArgs(argv);
  if (boolFlag(args, 'help')) {
    console.log(USAGE);
    return 0;
  }

  let content: ContentBundle;
  try {
    content = loadContent(defaultContentPaths());
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED; refusing to lint.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  const quiet = boolFlag(args, 'quiet');
  const reportPath = path.resolve(
    optionalStringFlag(args, 'report') ?? path.join(REPO_ROOT, 'reports', 'h2b-content-lint.md'),
  );
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, renderReport(content), 'utf8');

  const gender = genderLint(content);
  const hidden = hiddenTokenLint(content);
  const preschool = preschoolAudit(content);
  const curve = statCurveAudit(content);

  if (!quiet) {
    console.log(`Content lint report: ${path.relative(process.cwd(), reportPath)}`);
    console.log(`  prose strings scanned  ${gender.scanned}`);
    console.log(`  age 0-1 events         ${preschool.length} (manual review)`);
    console.log(
      `  monotonic visible stats ${curve.monotonicStats.length === 0 ? 'none' : curve.monotonicStats.join(', ')}`,
    );
  }

  if (hidden.findings.length > 0) {
    console.error(`Hidden-token prose lint FAILED — ${hidden.findings.length} string(s) naming internal state:`);
    for (const finding of hidden.findings) {
      console.error(`  - ${finding.kind} ${finding.id} (${finding.field}) matched "${finding.term}"`);
      console.error(`      ${finding.text}`);
    }
    console.error('Rewrite the prose in the player\'s terms. Do not add the string to the allowlist to pass CI.');
    return 1;
  }
  if (!quiet) console.log('Hidden-token prose lint: PASS (0 findings).');

  if (gender.findings.length > 0) {
    console.error(`All-female prose lint FAILED — ${gender.findings.length} male-coded string(s):`);
    for (const finding of gender.findings) {
      console.error(`  - ${finding.kind} ${finding.id} (${finding.field}) matched "${finding.term}"`);
      console.error(`      ${finding.text}`);
    }
    console.error('These are listed for design replacement. Do not auto-rewrite non-pronoun prose.');
    return 1;
  }
  if (!quiet) console.log('All-female prose lint: PASS (0 findings).');
  return 0;
}

process.exitCode = main(process.argv.slice(2));
