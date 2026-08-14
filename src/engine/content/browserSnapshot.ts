import type {
  BalanceAdapters,
  BalanceConstants,
} from './balance.js';
import type { ContentBundle, SpeciesTendencies } from './load.js';
import type {
  EndingDef,
  EventBatch,
  FactionDef,
  FactionRules,
  GameEvent,
  RefinementTagDef,
  RouteTagDef,
  SpeciesDef,
  SpeciesId,
  TalentDef,
  StateTrigger,
} from '../types.js';

/**
 * Browser-safe content snapshot.
 *
 * The canonical loader (`content/load.ts`) reads the filesystem, hashes files and
 * cross-validates the corpus, so it can never run in a browser. Rather than stub
 * `node:*` into the bundler or reimplement content parsing in React, a Node build
 * step serialises the already-validated bundle to JSON and the browser hydrates
 * it back into the identical `ContentBundle`.
 *
 * The snapshot is a *derived artifact*, never a second creative source of truth:
 * it carries the canonical `contentVersion` verbatim, and `content:browser:check`
 * fails the build if the committed file no longer matches the corpus.
 *
 * This module imports nothing from `node:*` so the hydrator is bundleable.
 */

/** Bump when the snapshot's own shape changes, independently of content. */
export const SNAPSHOT_SCHEMA_VERSION = 1;

export interface BrowserContentSnapshot {
  snapshotSchemaVersion: number;
  contentVersion: string;
  sourceFiles: { path: string; sha256: string }[];
  batches: EventBatch[];
  /** Species family tendencies as arrays; the hydrator rebuilds the Sets. */
  speciesFamilyTendencies: { species: SpeciesId; primary: string[]; secondary: string[]; uncommon: string[] }[];
  species: SpeciesDef[];
  refinementTags: RefinementTagDef[];
  routeTags: RouteTagDef[];
  factions: FactionDef[];
  factionRules: FactionRules;
  talents: TalentDef[];
  endings: EndingDef[];
  balance: BalanceConstants;
  adapters: BalanceAdapters;
  stateTriggers: StateTrigger[];
}

/** Serialises a loaded bundle. Node-side only; the output is plain JSON. */
export function toBrowserSnapshot(content: ContentBundle): BrowserContentSnapshot {
  return {
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    contentVersion: content.contentVersion,
    sourceFiles: content.sourceFiles,
    batches: content.batches,
    speciesFamilyTendencies: [...content.speciesFamilyTendencies.entries()].map(([species, tendencies]) => ({
      species,
      primary: [...tendencies.primary],
      secondary: [...tendencies.secondary],
      uncommon: [...tendencies.uncommon],
    })),
    species: [...content.species.values()],
    refinementTags: [...content.refinementTags.values()],
    routeTags: [...content.routeTags.values()],
    factions: [...content.factions.values()],
    factionRules: content.factionRules,
    talents: [...content.talents.values()],
    endings: [...content.endings.values()],
    balance: content.balance,
    adapters: content.adapters,
    stateTriggers: content.stateTriggers,
  };
}

export class SnapshotSchemaError extends Error {
  constructor(found: number) {
    super(
      `browser content snapshot has schema version ${found}, expected ${SNAPSHOT_SCHEMA_VERSION}; ` +
        'run `npm run content:browser` to regenerate it',
    );
    this.name = 'SnapshotSchemaError';
  }
}

/**
 * Rebuilds the `ContentBundle` a browser can use.
 *
 * Every Map and Set the engine relies on is reconstructed here, so simulation
 * code cannot tell a hydrated bundle from a Node-loaded one — which is exactly
 * what the equivalence tests assert.
 */
export function hydrateBrowserSnapshot(snapshot: BrowserContentSnapshot): ContentBundle {
  if (snapshot.snapshotSchemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new SnapshotSchemaError(snapshot.snapshotSchemaVersion);
  }

  const events: GameEvent[] = snapshot.batches.flatMap((batch) => batch.events);
  const speciesFamilyTendencies = new Map<SpeciesId, SpeciesTendencies>(
    snapshot.speciesFamilyTendencies.map((entry) => [
      entry.species,
      {
        primary: new Set(entry.primary),
        secondary: new Set(entry.secondary),
        uncommon: new Set(entry.uncommon),
      },
    ]),
  );

  return {
    batches: snapshot.batches,
    events,
    eventsById: new Map(events.map((event) => [event.id, event])),
    species: new Map(snapshot.species.map((def) => [def.id, def])),
    speciesFamilyTendencies,
    refinementTags: new Map(snapshot.refinementTags.map((def) => [def.tag, def])),
    routeTags: new Map(snapshot.routeTags.map((def) => [def.tag, def])),
    factions: new Map(snapshot.factions.map((def) => [def.id, def])),
    factionRules: snapshot.factionRules,
    talents: new Map(snapshot.talents.map((def) => [def.id, def])),
    endings: new Map(snapshot.endings.map((def) => [def.id, def])),
    balance: snapshot.balance,
    adapters: snapshot.adapters,
    stateTriggers: snapshot.stateTriggers,
    contentVersion: snapshot.contentVersion,
    sourceFiles: snapshot.sourceFiles,
  };
}

/** Stable JSON for the committed artifact, so regeneration produces no diff noise. */
export function serializeSnapshot(snapshot: BrowserContentSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}
