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
import {
  renderRouteTagRegistryMarkdown,
  renderTalentRegistryMarkdown,
  type RouteTagRegistryRaw,
} from '../engine/content/registryMirror.js';
import { optionalStringFlag, parseArgs } from './args.js';

/**
 * Registry review mirrors.
 *
 * Route Tag and Talent registry Markdown is generated the same way batch
 * Markdown is, so a registry version bump cannot silently desynchronise its
 * review mirror. The intro paragraphs are content, not derived data, so they
 * live here beside the renderer.
 */
const ROUTE_TAG_INTRO =
  'Every event `routeTag` must be registered. Route-context matching is an event-level favor under the Phase 1.1 uniform-family baseline. Multiple matching tags do not stack. `academic` explicitly cannot favor Transformation events. Phase 1.2 adds six faction route-context tags, cross-validated against the Faction Registry.';

const TALENT_INTRO = [
  'Typed drafting fields use stable targets such as `channel:SPC` or `family:MUS`. Unlock/redirect/narrative tags do not automatically become probability multipliers; authored events still check talent IDs directly where appropriate.',
  '`registered_species_rule` canonically resolves Q-15. `start_fix_bonus` remains blank for T1027 because Q-14 is intentionally deferred to sensitivity testing.',
  'Phase 1.2 lowers only the T1017 age floor from 35 to 25; the CHR threshold and the +4 effect are unchanged.',
];

interface RegistryMirror {
  source: string;
  markdown: string;
  render: () => string;
}

function registryMirrors(root: string): RegistryMirror[] {
  const registries = path.join(root, 'registries');
  const routeTagJson = path.join(registries, 'SOLID_STATE_ROUTE_TAG_REGISTRY_v1.1.json');
  const talentCsv = path.join(registries, 'SOLID_STATE_TALENT_REGISTRY_v1.2.csv');
  return [
    {
      source: routeTagJson,
      markdown: path.join(registries, 'SOLID_STATE_ROUTE_TAG_REGISTRY_v1.1.md'),
      render: () =>
        renderRouteTagRegistryMarkdown(
          JSON.parse(readFileSync(routeTagJson, 'utf8')) as RouteTagRegistryRaw,
          ROUTE_TAG_INTRO,
        ),
    },
    {
      source: talentCsv,
      markdown: path.join(registries, 'SOLID_STATE_TALENT_REGISTRY_v1.2.md'),
      render: () =>
        renderTalentRegistryMarkdown(readFileSync(talentCsv, 'utf8'), {
          version: '1.2',
          csvFileName: 'SOLID_STATE_TALENT_REGISTRY_v1.2.csv',
          intro: TALENT_INTRO,
        }),
    },
  ];
}

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

  for (const registry of registryMirrors(path.dirname(eventsDir))) {
    const rendered = registry.render();
    const name = path.basename(registry.markdown);
    if (command === 'render') {
      writeFileSync(registry.markdown, rendered, 'utf8');
      console.log(`rendered ${name}`);
      continue;
    }
    let actual: string;
    try {
      actual = readFileSync(registry.markdown, 'utf8');
    } catch {
      console.error(`MISSING: ${name} does not exist`);
      failures++;
      continue;
    }
    if (actual === rendered) {
      console.log(`OK: ${name} exactly matches its canonical registry`);
    } else {
      console.error(`MISMATCH: ${name} is not the deterministic render of ${path.basename(registry.source)}`);
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
