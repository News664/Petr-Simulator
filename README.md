# SOLID STATE — Headless Simulation Engine (Phase 1.1)

Deterministic, headless TypeScript simulation engine for **Solid State**, built
against the `SOLID_STATE_PROJECT_SNAPSHOT_v0.7` contracts plus
**Phase 1.1 patch v0.1** (Event Batch 005, Species Registry v1.2, Talent Registry
v1.1, Ending Registry v1.1, Route Tag Registry v1.0, Content Schema v0.3,
Event Drafting Rules v0.3, Balance Constants v0.2).

This repository contains the engine, its tests, and Monte Carlo CLI/reports
satisfying `SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md` **and**
`SOLID_STATE_PHASE1_1_ACCEPTANCE_ADDENDUM_v0.1.md`. There is no UI: gate H2 is
not open, and Phase 1.1 **stops** at the simulation reports pending design
review.

## Read these first

> ### ➡ [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) — the official decision list
>
> **26 questions**, each with evidence, options, trade-offs, the engine's current
> behaviour, the design decision, and the measured outcome. This is the
> authoritative review surface: resolve a question by editing its **Resolution**
> block in place. Anything discussed elsewhere but not written there is not
> official.
>
> **Phase 1.1:** 22 of 26 questions are now RESOLVED. Still open by design:
> [Q-14](docs/OPEN_QUESTIONS.md#q-14) T1027 magnitude ·
> [Q-23](docs/OPEN_QUESTIONS.md#q-23) adult fallback ·
> [Q-24](docs/OPEN_QUESTIONS.md#q-24) Late Bloomer ·
> [Q-25](docs/OPEN_QUESTIONS.md#q-25) achievements registry.

| Document | What it is |
|---|---|
| [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) | **The decision register — Q-01 … Q-26, resolve in place** |
| [`docs/PHASE1_FINDINGS.md`](docs/PHASE1_FINDINGS.md) | Executive summary of the Monte Carlo results |
| [`docs/PHASE1_CONFLICTS.md`](docs/PHASE1_CONFLICTS.md) | Schema/content conflicts, with the smallest proposed change for each |
| [`docs/PHASE1_ASSUMPTIONS.md`](docs/PHASE1_ASSUMPTIONS.md) | Every decision made where no canonical file specified one |
| [`docs/ENGINE_CHANGES.md`](docs/ENGINE_CHANGES.md) | Bugs found and fixed, behaviour decided, validation added, and what was deliberately left out |
| [`docs/PHASE1_1_FINDINGS.md`](docs/PHASE1_1_FINDINGS.md) | **Phase 1.1 results — read this before the Phase-1 findings** |
| [`reports/monte-carlo.md`](reports/monte-carlo.md) | Monte Carlo report, 10 000 runs × 5 scenarios, authored gates |
| [`reports/phase1_1-experiments.md`](reports/phase1_1-experiments.md) | Experiment matrix: threshold sweep, family A/B, allocation, T1027, first-manifestation |

The documents are layered: **conflicts** and **assumptions** record what was
found, **findings** records what was measured, **engine changes** records what was
done about it, and **open questions** is the single actionable list drawn from
them all. Every question links back to its evidence.

**No creative content was changed.** Everything under `content/events/`,
`content/registries/` and `content/balance/` is byte-identical to its source
artifact (snapshot v0.7 or Phase 1.1 patch v0.1), and the JSON → Markdown mirror
check passes against `tools/SOLID_STATE_CONTENT_TOOL_v0.2.py` for all five
batches.

## Quick start

```bash
npm install
npm run verify        # typecheck + content validation + mirror check + tests
```

Individual steps:

```bash
npm run typecheck     # tsc --noEmit
npm run validate      # load and cross-validate all canonical content
npm run mirror:check  # assert batch Markdown is the exact render of batch JSON
npm test              # 243 tests: acceptance A-P, Phase-1.1 addendum, golden runs
```

## Monte Carlo simulator

```bash
npm run simulate -- --runs 10000 --scenario no-talents --seed 12345
npm run simulate -- --runs 10000 --scenario all --species-stratified
npm run simulate -- --help
```

## Phase 1.1 experiment matrix

```bash
npm run experiment -- --runs 4000
npm run experiment -- --runs 500 --only threshold_sweep
```

Runs `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`: the LOW/MID/HIGH/
ORIGINAL_REFERENCE threshold sweep, the family-weighting A/B, the three
allocation policies, the T1027 sensitivity sweep, and the neutral
first-manifestation diagnostic. Threshold profiles are applied as a **reversible
in-memory rewrite** of `FIX>=N` gates — no content file is ever edited, and no
profile is selected automatically.

| Flag | Meaning |
|---|---|
| `--runs <n>` | Runs per scenario (default: `defaultRunsPerScenario` from balance) |
| `--seed <string>` | Base seed; identical seeds reproduce identical runs |
| `--scenario <name\|all>` | `no-talents`, `uniform-three`, `threshold-talents`, `material-talents`, `anomalous-talents` |
| `--species <ID>` | Pin every run to one species |
| `--species-stratified` | Equal stratification across species (default) |
| `--balance <path>` | Alternative balance constants JSON |
| `--adapters <path>` | Alternative balance adapters JSON |
| `--max-age <n>` | Diagnostic maximum age (default 120) |
| `--out <dir>` / `--name <prefix>` | Output location |

Writes a machine-readable `<prefix>.json` and a human-readable `<prefix>.md`.

## Layout

```
content/                  canonical data — the only runtime content source
  events/                 SOLID_STATE_EVENT_BATCH_*.json  (canonical, 5 batches / 138 events)
                          SOLID_STATE_EVENT_BATCH_*.md    (generated mirror, never read at runtime)
  registries/             species v1.2, talent v1.1, ending v1.1, route tag v1.0
  balance/                balance constants v0.2, experiment matrix, diagnostic adapters
  superseded/             replaced registries, kept for provenance, never loaded
docs/spec/                the v0.7 machine-facing contracts, verbatim
docs/design/              the Bibles, verbatim (creative context)
tools/                    the canonical Python content tool, verbatim
src/engine/               React-free simulation engine (runs under plain Node)
  rng.ts                  seeded, serializable RNG — the only source of randomness
  conditions/             lexer, parser, evaluator for the condition DSL (no eval)
  content/                loaders, Zod schemas, JSON->Markdown mirror renderer
  eligibility.ts          age / repeat / material-lock / include-exclude gating
  drafting.ts             channel -> family -> event hierarchical draft
  schedules.ts            schedule queue, priority classes, displacement, expiry
  talents.ts              Dormant -> Triggered -> Spent, cascading to stable
  endings.ts              Ending Record construction and awareness resolution
  simulation.ts           the annual loop
src/sim/                  Monte Carlo scenarios, metrics, report renderer
src/sim/experiments.ts    reversible threshold / family-mode / T1027 overrides
src/cli/                  validate / mirror / simulate / experiment entry points
tests/                    acceptance A-P, Phase-1.1 addendum, golden runs, setup
reports/                  generated simulation output
```

## Design constraints honoured

- **Engine is React-free.** `src/engine/` imports nothing but Node built-ins and
  Zod; the whole engine runs under plain Node.
- **One RNG.** Seeded sfc32 with a serializable four-word state. `Math.random()`
  appears nowhere in `src/engine/` or `src/sim/` — asserted by a test.
- **No `eval`.** The condition DSL is a hand-written lexer/parser/evaluator, and
  a test asserts no `eval`, `new Function` or `vm.run` anywhere in `src/`.
- **Playback cannot affect results.** The engine has no timing concept at all; a
  test runs a simulation with a per-year observer doing arbitrary extra work and
  asserts the timeline is byte-identical.
- **Balance is data.** No balance number is hard-coded. Everything comes from
  `content/balance/*.json` and can be replaced via `--balance` / `--adapters`.
- **Registries are the source of truth.** The Phase-1 provisional adapter is
  down to two diagnostic entries; species tendencies, talent drafting polarity,
  awareness and route-tag rules all come from canonical registries.
- **No passive FIX drift.** Q-26: `fixAnnualDrift` is pinned null and a
  behavioural test proves FIX changes only through authored effects.
- **Canonical Markdown is never runtime content.** A test walks `src/engine/`
  and fails on any attempt to read a `.md` file.
- **One visible event per year.** Asserted across hundreds of complete runs.
- **`zh-TW` is preserved empty.** No translations were invented.

## Determinism

A run is fully determined by `contentVersion + seed + setup policy`. The content
fingerprint is a SHA-256 over every canonical source file, so a content change
invalidates golden runs rather than silently shifting them.
`tests/golden-runs.test.ts` pins 36 full runs (6 seeds × 6 species) including
timeline, setup, final stats, flags and ending record. Regenerate deliberately:

```bash
UPDATE_GOLDEN=1 npm test -- tests/golden-runs.test.ts
```

## Status

Phase 1.1 integration is complete: patch data loaded, Content Schema v0.3 and
Event Drafting Rules v0.3 implemented, the provisional adapter shrunk to two
diagnostic entries, 243 tests passing (Phase-1 suite plus the Phase-1.1
acceptance addendum), and both the Monte Carlo report and the full experiment
matrix regenerated.

The Phase-1 blockers are closed: pre-25 coverage defects are at 0%, endings are
reachable, and both anomalous endings now occur. One new blocking finding
replaces them — **endings arrive far too late** (74–92% at age 65+ against a 2–5%
target, and no threshold profile reaches any target band). See
[`docs/PHASE1_1_FINDINGS.md`](docs/PHASE1_1_FINDINGS.md) finding 2. That is a
content-shape decision, so the engine reports it rather than resolving it.

**H2 remains CLOSED.** Phase 1.1 stops here pending design review.
