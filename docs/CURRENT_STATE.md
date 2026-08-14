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
| Tests | **366 passing** in 18 files |
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

A React browser app under `src/app`, served by Vite, playing one deterministic
life: birth registration → three irregularities → initial assessment → record
summary → annual playback → ending or open record → full record review.

The browser never loads the Node content loader: a generated snapshot carries the
fingerprint verbatim, `npm run content:browser:check` fails if it goes stale, and
tests prove a hydrated bundle produces byte-identical runs. Playback is
precomputed at `BEGIN LIFE`, so pause and 1×/2× change only *when* a frame is
revealed, never what it contains. `?dev=1` adds a seed field and the inspector.

## Public playtest / Pages

Pages source is **GitHub Actions**;
[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
deploys **only on pushes to `main`** (plus `workflow_dispatch`), and only after
`npm run verify` and `npm run build` both pass. Expected URL:
`https://news664.github.io/Petr-Simulator/`.

**Status: not verified live yet.** It becomes live when a post-merge run succeeds
and [`playtest/GITHUB_PAGES_SMOKE_CHECK.md`](playtest/GITHUB_PAGES_SMOKE_CHECK.md)
passes — which is also the **Round 2 gate**.

## Open and deferred questions

Full entries in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).

| ID | |
|---|---|
| **Q-27** | *Blocking.* Where do 18–34 endings come from? Thresholds and corpus volume are both ruled out; the late-life review pathway (H2B1A-C1) is the largest mover. |
| **Q-29** | Faction terminality is ~10% of completions, down from 48.6% and never tuned toward a target. Too low? Is 82–87% news exposure more than world texture? |
| **Q-23** | Adult generic fallback is still far above the 5% warning line — content supply, overlapping Q-27. |
| **Q-14** | T1027's starting-FIX bonus is not frozen; the diagnostic value is +15. Decide after Q-02. |
| **Q-25** | No Achievement Registry, so `ACH[id]` is false for unknown IDs. Deferred. |
| **Q-02** | Resolved in design — event-driven FIX, no passive drift — but the gate **numbers are not frozen**. |

Also awaiting decisions: **H2B1A-C1 … C4**, **H2B-C1 … C4** in
[`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md).

## Next milestones

1. **Pages deploy + smoke check** on `main`.
2. **Human Playtest Round 2** — needs neither the original ending-age
   distribution nor `zh-TW`.
3. **Localization L0** — not started; `zh-TW` is preserved empty and no
   translation has been invented.
4. **Q-27 / H2B1A-C1 decision**, then the work it calls for.

## Read next

- [`H2B1A_FINDINGS.md`](H2B1A_FINDINGS.md) — current measurements, start here
- [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) — the live decision register
- [`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md) — conflicts awaiting review
- [`ENGINE_CHANGES.md`](ENGINE_CHANGES.md) — what the engine does and why
- [`ui/`](ui) — UI spec, browser contract, playtest protocol
- [`archive/`](archive) — superseded findings, decision history
