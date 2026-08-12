#!/usr/bin/env node
/**
 * Content validation CLI.
 *
 *   npm run validate
 *   npm run validate -- --content ./content
 *
 * Loads and cross-validates every canonical content source. Exits non-zero on
 * any validation issue. Only canonical JSON/CSV is read; generated event
 * Markdown is never loaded as runtime content.
 */
import { ContentValidationError, defaultContentPaths, loadContent } from '../engine/content/load.js';
import { parseArgs, optionalStringFlag } from './args.js';

function main(argv: string[]): number {
  const args = parseArgs(argv);
  const contentRoot = optionalStringFlag(args, 'content');
  const paths = contentRoot ? defaultContentPaths(contentRoot) : defaultContentPaths();

  try {
    const content = loadContent(paths);
    console.log('Content validation OK');
    console.log(`  event batches      ${content.batches.length}`);
    console.log(`  events             ${content.events.length}`);
    console.log(`  species            ${content.species.size}`);
    console.log(`  talents            ${content.talents.size}`);
    console.log(`  endings            ${content.endings.size}`);
    console.log(`  balance constants  v${content.balance.version} (${content.balance.status ?? 'unversioned status'})`);
    console.log(`  balance adapters   v${content.adapters.version}`);
    console.log(`  content fingerprint ${content.contentVersion}`);
    return 0;
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error('Content validation FAILED');
      for (const issue of error.issues) console.error(`  - ${issue}`);
      return 2;
    }
    throw error;
  }
}

process.exitCode = main(process.argv.slice(2));
