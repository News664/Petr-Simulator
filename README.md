# SOLID STATE — Phase-1 Headless Simulation Engine

Deterministic, headless TypeScript simulation engine for **Solid State**, built
against the `SOLID_STATE_PROJECT_SNAPSHOT_v0.7` contracts at handoff gate **H1**.

This repository contains the engine, its tests, and a Monte Carlo CLI/report
satisfying `SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md`. There is no UI: gate
H2 is not open, and per acceptance §Q Phase 1 **stops** at the simulation report
pending design review.

## Read these first

> ### ➡ [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) — the official decision list
>
> **26 questions the coding agent could not decide alone**, each with evidence,
> options, trade-offs, the engine's current behaviour, and a recommendation.
> This is the authoritative review surface: resolve a question by editing its
> **Resolution** block in place. Anything discussed elsewhere but not written
> there is not official.
>
> Blocking: [Q-01](docs/OPEN_QUESTIONS.md#q-01) pre-25 coverage ·
> [Q-02](docs/OPEN_QUESTIONS.md#q-02) FIX economy ·
> [Q-03](docs/OPEN_QUESTIONS.md#q-03) endings after 64.

| Document | What it is |
|---|---|
| [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) | **The decision register — Q-01 … Q-26, resolve in place** |
| [`docs/PHASE1_FINDINGS.md`](docs/PHASE1_FINDINGS.md) | Executive summary of the Monte Carlo results |
| [`docs/PHASE1_CONFLICTS.md`](docs/PHASE1_CONFLICTS.md) | Schema/content conflicts, with the smallest proposed change for each |
| [`docs/PHASE1_ASSUMPTIONS.md`](docs/PHASE1_ASSUMPTIONS.md) | Every decision made where no canonical file specified one |
| [`docs/ENGINE_CHANGES.md`](docs/ENGINE_CHANGES.md) | Bugs found and fixed, behaviour decided, validation added, and what was deliberately left out |
| [`reports/monte-carlo.md`](reports/monte-carlo.md) | Full Monte Carlo report, 10 000 runs × 5 scenarios |
| [`reports/monte-carlo-strict.md`](reports/monte-carlo-strict.md) | Same, under the contract-faithful pre-25 coverage policy |

The five documents are layered: **conflicts** and **assumptions** record what was
found, **findings** records what was measured, **engine changes** records what was
done about it, and **open questions** is the single actionable list drawn from
all four. Every question links back to its evidence.

**No creative content was changed.** Everything under `content/events/` and
`content/registries/` is byte-identical to the snapshot, and the JSON → Markdown
mirror check passes against the canonical Python tool.

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
npm test              # 196 tests across acceptance sections A-P
```

## Monte Carlo simulator

```bash
npm run simulate -- --runs 10000 --scenario no-talents --seed 12345
npm run simulate -- --runs 10000 --scenario all --species-stratified
npm run simulate -- --runs 2000  --scenario all --pre25-coverage strict
npm run simulate -- --help
```

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
| `--pre25-coverage <mode>` | `strict` (default) or `reuse_baseline_repeatables` — see CONFLICT C-5 |
| `--out <dir>` / `--name <prefix>` | Output location |

Writes a machine-readable `<prefix>.json` and a human-readable `<prefix>.md`.

## Layout

```
content/                  canonical data — the only runtime content source
  events/                 SOLID_STATE_EVENT_BATCH_*.json  (canonical)
                          SOLID_STATE_EVENT_BATCH_*.md    (generated mirror, never read at runtime)
  registries/             species JSON, talent CSV, ending CSV
  balance/                provisional balance constants + provisional adapters
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
src/cli/                  validate / mirror / simulate entry points
tests/                    acceptance suites A-P, golden runs, setup tests
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

Gate H1 deliverables are complete: engine, tests, Monte Carlo CLI, JSON summary,
Markdown report, conflict list, assumption list, engine-behaviour log, decision
register, content snapshot.

Three questions block a balance freeze — [Q-01](docs/OPEN_QUESTIONS.md#q-01)
pre-25 coverage, [Q-02](docs/OPEN_QUESTIONS.md#q-02) the FIX economy behind
ending reachability, and [Q-03](docs/OPEN_QUESTIONS.md#q-03) the age-64 ending
ceiling. All three are content or balance decisions, so the engine reports them
rather than resolving them.

Per acceptance §Q, Phase 1 stops here pending design review.
