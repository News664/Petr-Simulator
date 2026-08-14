# SOLID STATE — H2A UI Foundation Report

## Version 0.2 · 2026-08-14

The first human-playable browser build. Simulation rules did not move into React:
the engine is unchanged except for two additive, browser-facing entry points.

| Field | Value |
|---|---|
| Content fingerprint | `f802a2524d2a16ab418bb7fe810a002335d94584d40614fcefbd061526f3d3a9` |
| Browser snapshot fingerprint | identical — the snapshot carries the canonical value verbatim |
| Corpus | 186 events · 7 batches · 38 route tags · 6 factions · 24 endings · 30 talents |
| Tests | **340 passing**, 17 files (295 pre-existing + 10 bridge + 23 UI + 12 calibration) |
| Production build | `dist/` — 596.04 kB JS (145.63 kB gzip), 10.15 kB CSS, built in 1.4 s |

---

## 1. Running it

```bash
npm install
npm run dev                    # http://localhost:5173
npm run dev -- --host          # from another device
npm run build && npm run preview

npm run verify                 # typecheck + content + mirrors + snapshot + 340 tests
npm run content:browser        # regenerate the browser snapshot
npm run content:browser:check   # fail if the committed snapshot is stale
```

Developer inspector: automatic under `npm run dev`, or append `?dev=1` to any
build. It also unlocks the explicit-seed field on the landing screen.

---

## 2. Dependencies added

Runtime: `react@19`, `react-dom@19`.

Dev: `vite@6`, `@vitejs/plugin-react@4`, `@types/react`, `@types/react-dom`,
`jsdom`, `@testing-library/react@16`, `@testing-library/user-event`,
`@testing-library/jest-dom`.

No Redux, Zustand, Tailwind or component framework — state is `useReducer` +
Context and styling is plain CSS with token custom properties.

**One pin worth knowing:** Vite is held at 6.x. Vite 8 is out, but
`@vitejs/plugin-react@6` peer-requires it while Vitest 2.1 requires Vite ≤6, and
resolving that conflict would have meant upgrading the test runner in a UI task.

---

## 3. Files added and changed

### Content (task A — two corrections, no measurement)

| File | Change |
|---|---|
| `content/events/SOLID_STATE_EVENT_BATCH_007_v0.3.json` / `.md` | `EVT-SPC-SECR-0024` and `EVT-SPC-SECR-0017` — **two `when` strings, nothing else** (verified field-by-field against v0.2) |
| `content/superseded/…_007_v0.2.*` | previous version, per repository convention |
| `tests/__golden__/runs.json` | regenerated for the fingerprint change; reviewed — 10 endings, earliest at 27, none before 18 |

### Engine (additive only)

| File | Purpose |
|---|---|
| `src/engine/preview.ts` | `previewPlayerSetup` — seed, species roll and 10-talent draft, stopping before any player choice |
| `src/engine/playback.ts` | `computePlayback` — one full deterministic life captured as immutable annual frames |
| `src/engine/content/browserSnapshot.ts` | serialise/hydrate the bundle; imports no `node:*` |

No existing engine behaviour changed. Headless policies, CLIs and every retained
experiment harness are untouched.

### Tooling

| File | Purpose |
|---|---|
| `src/cli/build-browser-content.ts` | generates and staleness-checks the snapshot |
| `vite.config.ts`, `src/app/index.html`, `src/app/vite-env.d.ts` | app root at `src/app`, output to `dist/` |
| `tsconfig.json`, `vitest.config.ts` | DOM lib + `react-jsx`; `.tsx` tests, jsdom per file |
| `package.json` | `dev`, `build`, `preview`, `content:browser`, `content:browser:check`; snapshot check added to `verify` |

### Application

`src/app/` — `App.tsx`, `main.tsx`, `content.ts`, `presentation.ts`, `seed.ts`,
`storage.ts`, `reproduction.ts`, `state/reducer.ts`, `i18n/{types,en,index}.ts`,
`components/DeveloperInspector.tsx`, `styles/{tokens,app}.css`,
`generated/content.snapshot.json`, and seven screens: `Landing`,
`BirthRegistration`, `TalentSelection`, `InitialAssessment`, `RecordSummary`,
`Playback`, `EndingScreen`, `OpenRecord`.

### Tests

`tests/h2a-bridge.test.ts` (10) and `tests/h2a-ui.test.tsx` (15).

---

## 4. How the safety properties are enforced

**Browser never touches the Node loader.** `content/load.ts` reads the filesystem
and hashes files. The browser hydrates a generated snapshot instead, and a test
walks `src/app/` rejecting any `node:` import or non-type import of the loader.
`content:browser:check` — now part of `npm run verify` — fails if the committed
snapshot drifts from the corpus, so the snapshot cannot quietly become a second
source of truth.

**Preview equals the final setup by construction, not by copying.**
`previewPlayerSetup` repeats the first three steps of Core Contract §5 off the
same RNG stream and stops. When the player commits, `createRun` re-derives the
same seed, rolls the same species and draws the same draft *before* it looks at
the fixed choices. Tested across 40 seeds, plus from the hydrated bundle.

**Timing cannot reach the RNG.** `BEGIN LIFE` computes the whole life once;
frames are immutable copies (every Set, Map and array is copied at capture).
Pause and 1×/2× move only `revealedFrameIndex`. The UI receives
`frames.slice(0, revealed + 1)`, so it is structurally incapable of rendering the
future — the ending screen cannot appear until the last frame is revealed, and a
test asserts `finish-playback` is refused before that.

**Hidden state stays hidden.** A test drives the real component tree through
setup into playback and asserts the normal-mode DOM contains no event ID, route
flag, `FAC_*` flag, lifecycle state, `MAT_*` flag or the string `FIX`.

---

## 5. Test results

| Suite | Result |
|---|---|
| Pre-existing engine/content/acceptance (14 files) | **295 passed** |
| `h2a-bridge` — snapshot staleness, fingerprint, entity parity, Set rehydration, schema rejection, Node/browser run equivalence, no Node imports, preview equivalence ×40 seeds, exact reproduction | **10 passed** |
| `h2a-ui` — three-talent rule, incompatibility blocking, swap-after-deselect, budget from the registry, 0–10 clamp, no overspend, one-frame reveal, no future leak, ending gated on final frame, no fabricated ending, immutable frames, same-content resume, mismatched-content refusal, full flow walkthrough, pause freeze / 2× cadence, hidden-state absence, single live region | **15 passed** |
| **Total** | **320 passed, 0 failed** |
| `npm run build` | **succeeded** |

Deliberately not run, harnesses intact: LOW/MID/HIGH sweep, family-weight A/B,
allocation comparison, T1027 sweep, T1023 comparison, manifestation diagnostic,
and any general Monte Carlo.

---

## 6. Conflicts and assumptions

**No conflicts.** The patch was self-consistent and complete.

Assumptions, all reversible:

1. **Vite pinned to 6.x** — see §2.
2. **App root is `src/app`** with output to `dist/`, so the existing Node layout
   and every CLI keep working unchanged.
3. **Material trajectory wording** (`STONE TRAJECTORY`, …) was authored in
   `presentation.ts` from the spec's own example. It is UI vocabulary for
   existing codes, not new game content, and lives in one table.
4. **Rarity stars** map the registry's rarity words to 1–5 stars; the word is
   always shown too, so meaning is never carried by the star count alone.
5. **`aria-live` on the newest card only.** Marking every card live would make a
   screen reader re-announce the whole timeline.
6. **`?dev=1` implies the inspector toggle**, not an auto-opened panel.
7. **Reduced motion** removes the reveal animation but keeps reveal cadence, as
   the spec requires.

---

## 7. Known Product Spec limitations

Implemented but partial:

- **Certificate fields** render only what the Ending Record actually carries;
  empty fields are omitted rather than shown blank.
- **`ABOUT THIS RECORD`** is an inline expandable paragraph, not a separate page.
- **Auto-scroll** uses `scrollIntoView` with a `RETURN TO PRESENT` control when
  the player scrolls up; it is not a virtualised feed, so a 120-year run renders
  120 cards. Fine at this scale, worth revisiting if runs get longer.
- **Mobile inspector** is a full-width panel rather than a drawer with its own
  open/close animation.
- **Known terminating seed presets** are not shipped — the technical contract
  lists them as optional and none are recorded in the repo yet. The explicit-seed
  field covers the same need manually.

Deferred by the spec and absent, as intended: achievements, Afterform, faction
dashboard, route log, public FIX meter, art/animation, audio, backend, sharing,
4×/skip, and `zh-TW` exposure. The locale type already permits `zh-TW` and
`localizedText` will use it the moment canonical translations exist; nothing was
machine-filled.

---

## 8. Ready for first human playtest?

**Yes, with one caveat the playtest lead should decide about before recruiting.**

The build is functionally complete for the protocol's questions: setup reads as a
registration flow, playback is one readable card per year, causality is visible
only through prose and stat chips, and the ending certificate lands.

The caveat is balance, not code. **Roughly three of four lives currently reach the
diagnostic horizon with no ending** (`RECORD REMAINS OPEN`), and a 120-year run at
1× takes about two minutes of watching to get there. A playtester's first
impression is likely to be "nothing happened", which would crowd out the
questions the protocol actually asks.

Two mitigations, neither requiring code changes here:

1. brief testers that an open record is a known current outcome, not a bug; or
2. supply a short list of seeds that terminate, and have testers use the
   developer seed field for at least one run each.

Everything else in the H2A gate still passes — see
[`H2A_GATE_DECISION.md`](H2A_GATE_DECISION.md). No balance question was touched
and no threshold was chosen; the retained LOW/MID/HIGH calibration remains the
next separate task.

---

## 9. v0.2 — UX micro-patch after playtest round 1

Driven by
[`ui/SOLID_STATE_H2A_MANUAL_PLAYTEST_ROUND1_v0.1.md`](../h2a/SOLID_STATE_H2A_MANUAL_PLAYTEST_ROUND1_v0.1.md)
and specified by
[`ui/SOLID_STATE_H2A_UX_MICRO_PATCH_v0.1.md`](../../ui/SOLID_STATE_H2A_UX_MICRO_PATCH_v0.1.md).
**No simulation, RNG or content behaviour changed.**

### Playback cadence — 1000/500 ms → 1300/650 ms

The cadence is canonical data, not a constant in the component. `content/ui/SOLID_STATE_H2A_UI_TOKENS_v0.2.json`
supersedes v0.1 (moved to `content/superseded/`, following the repository's
provenance convention), and `src/app/tokens.ts` is the single place the runtime
reads it:

```ts
export const INTERVAL_MS: Record<1 | 2, number> = {
  1: PLAYBACK_TOKENS.oneXIntervalMs,   // 1300
  2: PLAYBACK_TOKENS.twoXIntervalMs,   //  650
};
```

`App.tsx` no longer holds any timing number of its own, and a test asserts both
values and the exact 2× relationship, so the two can never drift apart silently.

### `REPLAY LIFE` → `REVIEW LIFE`

The animated replay path is gone from the normal player UI. A new `life-review`
phase renders the **already-computed** `PlaybackLife` in full:

- `revealedFrames()` returns `state.life.frames` unchanged in `life-review`, and
  the strict revealed prefix in every other phase — so the review cannot leak the
  future during playback and playback cannot accidentally show it;
- no timer starts, no `computePlayback` call is made, and the RNG is never
  touched — a test asserts frame **identity** (`toBe`), not equality, to prove
  nothing was recomputed;
- no pause or 1×/2× controls exist in the review;
- the view scrolls to the final entry on open and marks it `FINAL ENTRY`;
- `BACK TO OUTCOME` returns to the certificate or the open record, and review
  works from both the ended and nonterminal result screens;
- the hidden-state boundary is unchanged and re-asserted: no FIX, event IDs,
  route flags, schedules or faction lifecycle data appear in the review DOM.

Developer tooling keeps an equivalent reproduction mechanism; only the normal
player path changed.

### Persistence

`life-review` is a stored phase. A save under the same content fingerprint
restores **directly into the static review** — not into a replay — and a save
under a different fingerprint keeps the existing refusal behaviour.

### Localization

English strings added under `lifeReview.*` (`FULL RECORD`, `FINAL ENTRY`,
`BACK TO OUTCOME`) and `ending.replay` replaced by `ending.review`. The zh-TW
structure remains declared and unfilled, as before.

### Deferred, by instruction

The certificate redesign and the Pressure & Tone content rewrite were **not**
started here. The playtest's certificate and tone observations are recorded in
the playtest document for that later pass.
