import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  hydrateBrowserSnapshot,
  SNAPSHOT_SCHEMA_VERSION,
  SnapshotSchemaError,
  toBrowserSnapshot,
  type BrowserContentSnapshot,
} from '../src/engine/content/browserSnapshot.js';
import { loadDefaultContent, REPO_ROOT } from '../src/engine/content/load.js';
import { computePlayback } from '../src/engine/playback.js';
import { previewPlayerSetup } from '../src/engine/preview.js';
import { chooseCompatibleTalents, createRun, type SetupPolicy } from '../src/engine/setup.js';
import { runSimulation } from '../src/engine/simulation.js';
import { VISIBLE_STATS, type VisibleStat } from '../src/engine/types.js';

/**
 * H2A engine/browser bridge.
 *
 * Three properties keep the browser honest: the committed snapshot is not stale,
 * a hydrated bundle is indistinguishable from a Node-loaded one, and the setup
 * the player previews is the setup the run actually uses.
 */
const node = loadDefaultContent();

/** Round-robin spend that respects the 0-10 per-stat range. */
function spreadPoints(points: number): Record<VisibleStat, number> {
  const allocation = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) allocation[stat] = 0;
  let remaining = points;
  while (remaining > 0) {
    const before = remaining;
    for (const stat of VISIBLE_STATS) {
      if (remaining === 0) break;
      if (allocation[stat] >= 10) continue;
      allocation[stat] += 1;
      remaining -= 1;
    }
    if (remaining === before) break;
  }
  return allocation;
}
const committedPath = path.join(REPO_ROOT, 'src', 'app', 'generated', 'content.snapshot.json');
const committed = JSON.parse(readFileSync(committedPath, 'utf8')) as BrowserContentSnapshot;
const hydrated = hydrateBrowserSnapshot(committed);

describe('H2A — browser content snapshot', () => {
  it('is not stale', () => {
    // Byte-for-byte, the same check `npm run content:browser:check` performs.
    const fresh = `${JSON.stringify(toBrowserSnapshot(node), null, 2)}\n`;
    expect(readFileSync(committedPath, 'utf8')).toBe(fresh);
  });

  it('carries the exact canonical content fingerprint', () => {
    expect(committed.snapshotSchemaVersion).toBe(SNAPSHOT_SCHEMA_VERSION);
    expect(committed.contentVersion).toBe(node.contentVersion);
    expect(hydrated.contentVersion).toBe(node.contentVersion);
  });

  it('rebuilds every entity map with matching ids and counts', () => {
    expect(hydrated.events.length).toBe(node.events.length);
    expect([...hydrated.eventsById.keys()].sort()).toEqual([...node.eventsById.keys()].sort());
    expect([...hydrated.species.keys()].sort()).toEqual([...node.species.keys()].sort());
    expect([...hydrated.talents.keys()].sort()).toEqual([...node.talents.keys()].sort());
    expect([...hydrated.endings.keys()].sort()).toEqual([...node.endings.keys()].sort());
    expect([...hydrated.routeTags.keys()].sort()).toEqual([...node.routeTags.keys()].sort());
    expect([...hydrated.factions.keys()].sort()).toEqual([...node.factions.keys()].sort());
    expect([...hydrated.refinementTags.keys()].sort()).toEqual([...node.refinementTags.keys()].sort());
    expect(hydrated.factionRules).toEqual(node.factionRules);
    expect(hydrated.balance).toEqual(node.balance);
    expect(hydrated.adapters).toEqual(node.adapters);
  });

  it('rebuilds species family tendencies as real Sets', () => {
    for (const [species, tendencies] of node.speciesFamilyTendencies) {
      const rebuilt = hydrated.speciesFamilyTendencies.get(species)!;
      expect(rebuilt.primary).toBeInstanceOf(Set);
      expect([...rebuilt.primary].sort()).toEqual([...tendencies.primary].sort());
      expect([...rebuilt.secondary].sort()).toEqual([...tendencies.secondary].sort());
      expect([...rebuilt.uncommon].sort()).toEqual([...tendencies.uncommon].sort());
    }
  });

  it('rejects a snapshot from a different schema version', () => {
    expect(() => hydrateBrowserSnapshot({ ...committed, snapshotSchemaVersion: 99 })).toThrow(SnapshotSchemaError);
  });

  it('produces identical runs from Node-loaded and hydrated content', () => {
    const policies: SetupPolicy[] = [
      { species: { kind: 'seeded_random' }, talents: { kind: 'seeded_random_compatible' }, allocation: { kind: 'seeded_random' } },
      { species: { kind: 'fixed', species: 'DWARF' }, talents: { kind: 'none' }, allocation: { kind: 'even' } },
      { species: { kind: 'seeded_random' }, talents: { kind: 'fixed', talents: ['T1013', 'T1015', 'T1004'] }, allocation: { kind: 'minmax' } },
    ];
    for (const [index, policy] of policies.entries()) {
      for (const seed of ['h2a-a', 'h2a-b', 'h2a-c']) {
        const a = runSimulation(seed, node, policy);
        const b = runSimulation(seed, hydrated, policy);
        expect(b.setup, `${index}/${seed} setup`).toEqual(a.setup);
        expect(b.state.history, `${index}/${seed} timeline`).toEqual(a.state.history);
        expect(b.outcome.kind, `${index}/${seed} outcome`).toBe(a.outcome.kind);
        expect([...b.state.flags].sort()).toEqual([...a.state.flags].sort());
      }
    }
  });

  it('keeps Node-only code out of the browser bundle', () => {
    // `content/load.ts` reads the filesystem, so browser code may reference its
    // *types* (erased at build time) but must never import a value from it, and
    // must never import a Node builtin at all.
    const appDir = path.join(REPO_ROOT, 'src', 'app');
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;
        const relative = path.relative(REPO_ROOT, full);
        for (const line of readFileSync(full, 'utf8').split('\n')) {
          if (/^\s*import\s+(?!type\b)[^;]*from\s+'[^']*content\/load\.js'/.test(line)) {
            offenders.push(`${relative}: value import of the Node content loader`);
          }
          if (/^\s*(import|export)\s[^;]*from\s+'node:/.test(line)) {
            offenders.push(`${relative}: Node builtin import`);
          }
        }
      }
    };
    walk(appDir);
    expect(offenders).toEqual([]);
  });
});

describe('H2A — setup preview matches the final run', () => {
  const seeds = Array.from({ length: 40 }, (_, i) => `preview-${i}`);

  it('previews the same species and draft the run will use', () => {
    for (const seed of seeds) {
      const preview = previewPlayerSetup(seed, node);
      expect(preview.draftedTalents.length).toBe(10);
      expect(new Set(preview.draftedTalents).size).toBe(10);

      // The final run uses the real player policy: seeded species, fixed talents.
      // The UI refuses an incompatible pair, so the test picks the way an
      // auto-picking player would rather than blindly taking the first three.
      const chosen = chooseCompatibleTalents(node, preview.draftedTalents);
      const allocation = spreadPoints(preview.allocationPoints);

      const { setup } = createRun(seed, node, {
        species: { kind: 'seeded_random' },
        talents: { kind: 'fixed', talents: chosen },
        allocation: { kind: 'explicit', allocation },
      });

      expect(setup.species, seed).toBe(preview.species);
      expect(setup.draftedTalents, seed).toEqual(preview.draftedTalents);
      expect(preview.allocationPoints).toBe(node.species.get(preview.species)!.allocation_points);
      for (const id of setup.chosenTalents) expect(preview.draftedTalents).toContain(id);
    }
  });

  it('previews identically from the hydrated browser bundle', () => {
    for (const seed of seeds.slice(0, 10)) {
      expect(previewPlayerSetup(seed, hydrated)).toEqual(previewPlayerSetup(seed, node));
    }
  });

  it('reproduces a life exactly from contentVersion + seed + choices', () => {
    const seed = 'reproduce-me';
    const preview = previewPlayerSetup(seed, node);
    const chosen = chooseCompatibleTalents(node, preview.draftedTalents);
    const allocation = spreadPoints(preview.allocationPoints);

    const policy: SetupPolicy = {
      species: { kind: 'seeded_random' },
      talents: { kind: 'fixed', talents: chosen },
      allocation: { kind: 'explicit', allocation },
    };
    const first = computePlayback(seed, node, policy);
    const again = computePlayback(seed, hydrated, policy);
    expect(again.frames.map((f) => [f.age, f.occurrence.eventId, f.occurrence.variantIndex])).toEqual(
      first.frames.map((f) => [f.age, f.occurrence.eventId, f.occurrence.variantIndex]),
    );
    expect(again.outcome).toEqual(first.outcome);
  });
});
