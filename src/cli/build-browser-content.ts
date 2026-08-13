#!/usr/bin/env node
/**
 * Generates the browser content snapshot from canonical content.
 *
 *   npm run content:browser         # regenerate
 *   npm run content:browser:check   # fail if the committed snapshot is stale
 *
 * The canonical Node loader validates the corpus; this only serialises what it
 * produced. The generated file is a derived artifact and never a second creative
 * source of truth — editing it by hand is always wrong, and `check` (part of
 * `npm run verify`) proves it still matches the corpus.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ContentValidationError,
  defaultContentPaths,
  loadContent,
  REPO_ROOT,
} from '../engine/content/load.js';
import { serializeSnapshot, toBrowserSnapshot } from '../engine/content/browserSnapshot.js';
import { boolFlag, optionalStringFlag, parseArgs } from './args.js';

export const SNAPSHOT_PATH = path.join(REPO_ROOT, 'src', 'app', 'generated', 'content.snapshot.json');

const USAGE = `
SOLID STATE — browser content snapshot

Usage:
  npm run content:browser          Regenerate src/app/generated/content.snapshot.json
  npm run content:browser:check    Verify the committed snapshot is up to date
`.trim();

function main(argv: string[]): number {
  const args = parseArgs(argv);
  if (boolFlag(args, 'help')) {
    console.log(USAGE);
    return 0;
  }
  const check = boolFlag(args, 'check') || args.positional[0] === 'check';
  const target = path.resolve(optionalStringFlag(args, 'out') ?? SNAPSHOT_PATH);

  let serialized: string;
  try {
    serialized = serializeSnapshot(toBrowserSnapshot(loadContent(defaultContentPaths())));
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED; refusing to generate a browser snapshot.');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }

  if (check) {
    let committed: string;
    try {
      committed = readFileSync(target, 'utf8');
    } catch {
      console.error(`MISSING: ${path.relative(REPO_ROOT, target)} does not exist. Run \`npm run content:browser\`.`);
      return 3;
    }
    if (committed !== serialized) {
      console.error(
        `STALE: ${path.relative(REPO_ROOT, target)} does not match canonical content. ` +
          'Run `npm run content:browser` and commit the result.',
      );
      return 3;
    }
    console.log(`OK: ${path.relative(REPO_ROOT, target)} matches canonical content`);
    return 0;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, serialized, 'utf8');
  console.log(`wrote ${path.relative(REPO_ROOT, target)}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
