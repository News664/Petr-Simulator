#!/usr/bin/env node
/**
 * Event batch JSON -> Markdown mirror tool.
 *
 *   npm run mirror:check
 *   tsx src/cli/mirror.ts render
 *
 * `check` fails when a checked-in batch Markdown file is not byte-for-byte
 * identical to a fresh deterministic render of its canonical JSON, which is the
 * invariant required by Content Schema v0.2 and Event Taxonomy v0.2.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { CONTENT_ROOT } from '../engine/content/load.js';
import { renderBatchMarkdown, type RawBatch } from '../engine/content/mirror.js';
import { optionalStringFlag, parseArgs } from './args.js';

function main(argv: string[]): number {
  const args = parseArgs(argv);
  const command = args.positional[0] ?? 'check';
  const eventsDir = optionalStringFlag(args, 'events') ?? path.join(CONTENT_ROOT, 'events');

  const batchFiles = readdirSync(eventsDir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  if (batchFiles.length === 0) {
    console.error(`no event batch JSON found in ${eventsDir}`);
    return 2;
  }

  let failures = 0;
  for (const name of batchFiles) {
    const jsonPath = path.join(eventsDir, name);
    const mdPath = path.join(eventsDir, name.replace(/\.json$/, '.md'));
    const batch = JSON.parse(readFileSync(jsonPath, 'utf8')) as RawBatch;
    const rendered = renderBatchMarkdown(batch);

    if (command === 'render') {
      writeFileSync(mdPath, rendered, 'utf8');
      console.log(`rendered ${path.basename(mdPath)}`);
      continue;
    }

    let actual: string;
    try {
      actual = readFileSync(mdPath, 'utf8');
    } catch {
      console.error(`MISSING: ${path.basename(mdPath)} does not exist`);
      failures++;
      continue;
    }
    if (actual === rendered) {
      console.log(`OK: ${path.basename(mdPath)} exactly matches canonical JSON`);
    } else {
      console.error(`MISMATCH: ${path.basename(mdPath)} is not the deterministic render of ${name}`);
      failures++;
    }
  }

  if (command !== 'check' && command !== 'render') {
    console.error(`unknown command ${JSON.stringify(command)}; expected \`check\` or \`render\``);
    return 2;
  }
  return failures > 0 ? 3 : 0;
}

process.exitCode = main(process.argv.slice(2));
