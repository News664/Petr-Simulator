# SOLID STATE — Current State

Where the project is right now; everything here is checkable against the repo.

**Milestone: H2B.1A accepted.** Working balance and timing corrections are in,
the browser build is playable, and the next gate is **Human Playtest Round 2**.

## Corpus

| | |
|---|---|
| Content fingerprint | `8638e2e1ebd977878d09c28c1d554d7b85e2174f24fcf7aa568df018541d214e` |
| Events | **215** across 8 batches |
| Endings | **25** — registry fully covered in the current regression |
| Route tags / species / talents | **39** / 6 / 30 |
| Tests | **392 passing** in 20 files, plus a Chromium browser smoke suite |
| Build | production Vite build clean; snapshot regenerated |

Check with `npm run validate` and `npm test`.

## Balance

**LOW is the working canonical H2B balance. It is not a freeze.** It was applied
mechanically to 31 FIX gates — event `include` conditions and the
`validityCondition` of every schedule pointing at a gate-assigned event — so a
profile can never be half-applied. Values in
[`OPEN_QUESTIONS.md` Q-02](OPEN_QUESTIONS.md#q-02). The profile machinery is
untouched: the reversible LOW/MID/HIGH rewrite still applies on this baseline.

### Caveats

- **Balance is provisional.** LOW becomes canonical only by an explicit decision
  recorded in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md), after Round 2.
- **Report mean *and* median commitment age** — 41.4 and 36. The mean is dragged
  by a long tail of covered stabilizations, so it misleads on its own.
- **65+ is 26.9% of endings** because Continuity Review coverage was
  deliberately unbounded (A-04, a frozen instruction); `END-MED-003` alone
  supplies 15.7% of runs at a mean review age of 83.5. Open as **H2B1A-C1**.
- **35–44 is still the largest bucket (35.2%)**, deliberately not chased.
  **Completion is 71.6%**, just above the review band.
- All correctness counters are **zero** and the single-active-faction invariant
  holds. Earlier milestones used **different corpora** — see
  [`reports/REPORT_INDEX.md`](../reports/REPORT_INDEX.md).

## UI

A React app under `src/app`, playing one deterministic life: birth registration →
three irregularities → initial assessment → record summary → annual playback →
ending or open record → full record review.

The browser never loads the Node content loader: a generated snapshot carries the
fingerprint verbatim, `npm run content:browser:check` fails if it goes stale, and
tests prove a hydrated bundle produces byte-identical runs. Playback is
precomputed at `BEGIN LIFE`, so pause and 1×/2× change only *when* a frame is
revealed, never what it contains. `?dev=1` adds a seed field and the inspector.

**Mobile playback follow** was rewritten in B.1: reveals correct the viewport
instantly, in the same commit as the entry, measured against the timeline's end
anchor rather than the document bottom. Reveal cadence is unchanged, and the
behaviour is confirmed on a real phone.

**Visible attributes follow the player (H2A.1).** CHR / INT / STR / MNY / SPR
render through one shared component. On narrow layouts the status rail is a
compact sticky HUD above the timeline — age, material, all five attributes and
the playback controls — instead of stacking below the whole life; on desktop the
rail is unchanged. Every outcome screen now carries the attributes too: a
`FINAL ASSESSMENT` beside (never inside) the ending certificate, reached age +
material + `CURRENT ASSESSMENT` on an open record, and a summary at the top of
the full record. FIX, flags, route and faction state stay hidden in normal mode.

## Public playtest / Pages

**Live:** `https://news664.github.io/Petr-Simulator/`

Pages source is **GitHub Actions**.
[`deploy-pages.yml`](../.github/workflows/deploy-pages.yml) publishes on pushes
to `main`, only after `npm run verify` and `npm run build` pass, and only when
the ref is `main` — so a manual dispatch cannot publish another branch. Pull
requests into `main` first run `verify-build-e2e`
([`pr-check.yml`](../.github/workflows/pr-check.yml)), which deploys nothing.

## Round 2

**Human Playtest Round 2 is under way** — it is not complete, and no Round-2
finding has been recorded yet. It is about UX, content, tone and pacing; routine
function checks belong to CI. The manual section of
[`playtest/GITHUB_PAGES_SMOKE_CHECK.md`](playtest/GITHUB_PAGES_SMOKE_CHECK.md)
stays the short real-device list: clipboard, other browsers, and judgement.

## Open and deferred questions

Full entries in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

| ID | |
|---|---|
| **Q-27** | Where do 18–34 endings come from? Thresholds and corpus volume are both ruled out; the late-life review pathway (H2B1A-C1) is the largest mover. **Blocks the balance freeze — explicitly *not* a Round-2 blocker:** the H2B.1A timing design calls the current age shape acceptable for Round 2, which is an input to this question rather than something waiting on it. |
| **Q-29** | Faction terminality is ~10% of completions, down from 48.6% and never tuned toward a target. Too low? Is 82–87% news exposure more than world texture? |
| **Q-23** | Adult generic fallback is still far above the 5% warning line — content supply, overlapping Q-27. |
| **Q-14** | T1027's starting-FIX bonus is not frozen; the diagnostic value is +15. Decide after Q-02. |
| **Q-25** | No Achievement Registry, so `ACH[id]` is false for unknown IDs. Deferred. |
| **Q-02** | Resolved in design — event-driven FIX, no passive drift — but the gate **numbers are not frozen**. |

Also awaiting decisions: **H2B1A-C1 … C4**, **H2B-C1 … C4** in
[`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md).

## Next milestones

1. **Finish Human Playtest Round 2** — UX, content, tone and pacing. Needs
   neither the original ending-age distribution nor `zh-TW`.
2. **Localization L0** — not started; `zh-TW` is preserved empty and no
   translation has been invented.
3. **Q-27 / H2B1A-C1 decision**, informed by Round 2, then the work it calls for.
4. **Stat Ecology / content work**, using Round-2 feedback and the A-12
   contributor audit.

## Read next

- [`H2B1A_FINDINGS.md`](H2B1A_FINDINGS.md) — current measurements, start here
- [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) — the live decision register
- [`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md) — conflicts awaiting review
- [`ENGINE_CHANGES.md`](ENGINE_CHANGES.md) — what the engine does and why
- [`ui/`](ui) — UI spec, browser contract, playtest protocol
- [`archive/`](archive) — superseded findings, decision history
