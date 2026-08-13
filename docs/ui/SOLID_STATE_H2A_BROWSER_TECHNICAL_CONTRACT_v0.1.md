# SOLID STATE — H2A Browser Technical Contract
## Version 0.1

## 1. Current repository facts

At this handoff:
- project is Node/TypeScript/Vitest headless only;
- there is no React/Vite app yet;
- canonical engine exports live in `src/engine`;
- `runSimulation()` resolves a whole life synchronously;
- `createRun()` resolves setup from a `SetupPolicy`;
- canonical `src/engine/content/load.ts` imports Node `fs/path/crypto`, so browser
  code must not import that loader.

H2A adds a browser surface without moving game rules into React.

## 2. Required stack

Add:
- React;
- React DOM;
- Vite;
- `@vitejs/plugin-react`;
- React TypeScript types.

State:
- React `useReducer` + Context;
- no Redux/Zustand.

Styling:
- plain CSS or CSS Modules;
- no Tailwind/component framework.

Testing:
- retain Vitest;
- add jsdom/React Testing Library if useful;
- Playwright remains optional/deferred for H2A foundation.

## 3. Browser-safe content snapshot

### Problem

`loadDefaultContent()` is Node-only. Do not stub Node modules into Vite and do not
reimplement game/content parsing in React.

### Required solution

Use the canonical Node loader to generate a normalized JSON snapshot for browser
use.

Suggested files:
```text
src/cli/build-browser-content.ts
src/engine/content/browserSnapshot.ts
src/app/generated/content.snapshot.json
```

`BrowserContentSnapshot` is JSON-serializable and contains:
- snapshot schema version;
- `contentVersion`;
- source file hashes;
- batches/events;
- species;
- species family tendencies using arrays rather than Sets;
- refinement tags;
- route tags;
- factions + rules;
- talents;
- endings;
- balance;
- adapters.

Browser hydrator reconstructs the same `ContentBundle` Maps/Sets. It imports no
`node:*` module.

Scripts:
```text
content:browser
content:browser:check
dev
build
preview
```

`content:browser:check` fails if the committed generated snapshot is stale.
Include the check in normal verification after H2A lands.

Tests:
1. hydrated snapshot `contentVersion` equals `loadDefaultContent().contentVersion`;
2. normalized entity IDs/counts match;
3. several identical deterministic policies produce identical setup, timeline and
   outcome using Node-loaded vs hydrated bundle.

Generated browser snapshot is never a creative source of truth.

## 4. Interactive setup preview with identical RNG semantics

The UI must show species and drafted talents before the player chooses.

Add an engine-facing function such as:

```ts
interface PlayerSetupPreview {
  seed: string;
  species: SpeciesId;
  draftedTalents: string[];
  allocationPoints: number;
}

previewPlayerSetup(seed: string, content: ContentBundle): PlayerSetupPreview
```

It derives:
1. RNG from `${content.contentVersion}:${seed}`;
2. the same seeded-random species roll used by normal setup;
3. the canonical 10-talent draft.

It does not apply selected talents or allocation.

When life starts, use existing simulation semantics:

```ts
species: { kind: "seeded_random" }
talents: { kind: "fixed", talents: chosenTalents }
allocation: { kind: "explicit", allocation }
```

Because the final run repeats the same seeded species roll and same draft before
the fixed player choices, preview and final setup must match exactly.

Add tests:
- preview species == final setup species;
- preview draft == final setup drafted talents;
- chosen talents subset of preview;
- same contentVersion + seed + chosen talents + allocation reproduces exactly.

Do not change existing headless policies.

## 5. Precomputed playback adapter

React does not mutate `RunState`.

At `BEGIN LIFE`, run the full deterministic simulation once. Use `onBeforeYear`
and `onYear` observers to capture immutable presentation frames.

Suggested shape:

```ts
interface PlaybackFrame {
  age: number;
  occurrence: EventOccurrence;
  statsBefore: Record<VisibleStat, number>;
  statsAfter: Record<VisibleStat, number>;
  statDelta: Partial<Record<VisibleStat, number>>;
  materialAfter: Material;
  triggeredTalentIdsThisAge: string[];
  endingAfter: EndingRecord | null;
  dev: {
    fix: number;
    registeredSpecies: string;
    priorMaterials: Material[];
    flags: string[];
    schedules: SerializableSchedule[];
    factionStates: Record<string, FactionLifecycleState>;
    factionRoles: Record<string, string[]>;
    routeFlags: string[];
  };
}
```

Exact naming may differ; semantics may not.

Requirements:
- copy mutable Sets/Maps/arrays at capture time;
- never retain references that later mutate into the final state;
- unrevealed future state must not leak into earlier UI frames.

## 6. App reducer state machine

Recommended phases:

```text
landing
species
talents
allocation
review
playback
ending
nonterminal
```

State includes:
- contentVersion;
- seed;
- setup preview;
- chosen talents;
- base allocation;
- playback frames/result;
- revealed frame index;
- speed 1|2;
- paused;
- dev inspector state;
- locale.

Playback timer changes only `revealedFrameIndex`.

Pause/speed changes never call RNG or rebuild the life.

## 7. Seed creation

The engine remains deterministic and never uses `Math.random`.

The UI layer may generate a fresh opaque seed with browser
`crypto.getRandomValues()`. Once created it is persisted as the run seed.

Developer mode may accept an explicit seed.

## 8. Developer/playtest inspector

Enable only in Vite dev mode or `?dev=1`.

It reads the **currently revealed frame**, not the unrevealed final outcome.

Show:
- seed + content fingerprint;
- revealed event ID + variant index;
- FIX;
- MAT/prior materials;
- registered species;
- schedules;
- all flags;
- route flags;
- faction lifecycle + roles;
- ending source only after ending reveal.

Provide:
- export reproduction JSON;
- import compatible reproduction JSON;
- optional developer-only reveal-one-frame while paused;
- known terminating seed presets if available.

No gameplay choices.

## 9. Reproduction record

Versioned JSON, minimum:

```ts
interface H2AReproductionRecord {
  formatVersion: 1;
  contentVersion: string;
  seed: string;
  species: SpeciesId;
  draftedTalents: string[];
  chosenTalents: string[];
  allocation: Record<VisibleStat, number>;
  timeline: {
    age: number;
    eventId: string;
    variantIndex: number;
    source: string;
  }[];
  outcome:
    | { kind: "ended"; endingId: string; endingAge: number }
    | { kind: "nonterminal"; reachedAge: number }
    | { kind: "coverage_error"; age: number };
}
```

Import verifies `contentVersion`; mismatch refuses exact reproduction.

## 10. LocalStorage

Persist JSON-serializable UI/session data only.

Do not persist:
- raw RunState;
- Sets/Maps;
- live RNG instance.

On reload, deterministically regenerate and restore reveal index.

## 11. Hidden-state boundary

Normal DOM must not contain:
- FIX value/band;
- event/variant IDs;
- route flags;
- schedules;
- internal channel/family;
- faction FSM state/roles;
- hidden talent hooks.

Developer mode may show them.

## 12. i18n

Create a keyed UI message layer:

```text
src/app/i18n/types.ts
src/app/i18n/en.ts
src/app/i18n/index.ts
```

Locale type includes `en | zh-TW`, but H2A exposes English only.

Access canonical event/talent localized text through helpers so later zh-TW work
does not require component rewrites.

Do not fabricate missing translations.

## 13. H2A tests

### Engine/browser bridge
- generated snapshot equivalence;
- preview/final setup equivalence;
- exact deterministic reproduction.

### Setup UI
- exactly 3 talents required;
- incompatibilities block correctly;
- exact allocation budget required;
- base stat 0–10 enforced;
- point budget comes from species registry, not UI hard-code.

### Playback
- one frame revealed at a time;
- pause freezes reveal index;
- 2x changes timer only;
- same precomputed timeline/outcome at all speeds;
- hidden internal state absent from normal DOM;
- ending waits for final frame;
- nonterminal does not fabricate ending.

### Persistence
- same-content resume exact;
- mismatched content refuses resume.

### Accessibility smoke
- keyboard talent selection;
- accessible control names;
- annual event live region.

## 14. Existing invariants remain mandatory

Do not weaken:
- exactly one visible event/year;
- seeded RNG;
- no JS eval;
- safe faction opt-out;
- under-18 ending/material safety;
- pre-25 no generic fallback;
- canonical content authority;
- separation of balance questions from UI correctness.
