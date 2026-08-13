# SOLID STATE — Simulation Engine + H2A Browser Playable

Deterministic, headless TypeScript simulation engine for **Solid State**, built
against the `SOLID_STATE_PROJECT_SNAPSHOT_v0.7` contracts plus
**Phase 1.1 patch v0.1** (Event Batch 005, Species Registry v1.2, Ending
Registry v1.1, Content Schema v0.3, Event Drafting Rules v0.3, Balance Constants
v0.2), **Phase 1.2 patch v0.1** (Event Batch 006, Faction Registry v0.1, Talent
Registry v1.2, the faction addendum and the compact diagnostic plan) and
**Phase 1.3 patch v0.2** (Content Schema v0.4, Faction Registry v0.2 with a
lifecycle FSM, Event Batch 007, the `lore_fallback_only` tier, Route Tag Registry
v1.2, the H2A gate and the sanity plan).

This repository contains the engine, its tests, and the Monte Carlo /
experiment / diagnostic CLIs satisfying
`SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md` **and**
`SOLID_STATE_PHASE1_1_ACCEPTANCE_ADDENDUM_v0.1.md`. There is no UI: gate H2 is
H2A is **open**, and the first browser-playable build now lives in `src/app`
alongside the headless CLIs — see
[`docs/H2A_UI_FOUNDATION_REPORT.md`](docs/H2A_UI_FOUNDATION_REPORT.md).

## Read these first

> ### ➡ [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) — the official decision list
>
> **27 questions**, each with evidence, options, trade-offs, the engine's current
> behaviour, the design decision, and the measured outcome. This is the
> authoritative review surface: resolve a question by editing its **Resolution**
> block in place. Anything discussed elsewhere but not written there is not
> official.
>
> **Phase 1.3:** 25 of 30 questions are RESOLVED. Still open by design:
> [Q-14](docs/OPEN_QUESTIONS.md#q-14) T1027 magnitude ·
> [Q-23](docs/OPEN_QUESTIONS.md#q-23) adult fallback ·
> [Q-25](docs/OPEN_QUESTIONS.md#q-25) achievements registry ·
> [Q-29](docs/OPEN_QUESTIONS.md#q-29) faction prominence ·
> [**Q-27**](docs/OPEN_QUESTIONS.md#q-27) **ending-age shape — still the one
> blocking question, and the main thing Phase 1.3 asks design to decide.**

| Document | What it is |
|---|---|
| [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) | **The decision register — Q-01 … Q-30, resolve in place** |
| [`docs/PHASE1_FINDINGS.md`](docs/PHASE1_FINDINGS.md) | Executive summary of the Monte Carlo results |
| [`docs/PHASE1_CONFLICTS.md`](docs/PHASE1_CONFLICTS.md) | Schema/content conflicts, with the smallest proposed change for each |
| [`docs/PHASE1_ASSUMPTIONS.md`](docs/PHASE1_ASSUMPTIONS.md) | Every decision made where no canonical file specified one |
| [`docs/ENGINE_CHANGES.md`](docs/ENGINE_CHANGES.md) | Bugs found and fixed, behaviour decided, validation added, and what was deliberately left out |
| [`docs/PHASE1_1_FINDINGS.md`](docs/PHASE1_1_FINDINGS.md) | Phase 1.1 results |
| [`docs/PHASE1_2_FINDINGS.md`](docs/PHASE1_2_FINDINGS.md) | Phase 1.2 results |
| [`docs/PHASE1_3_FINDINGS.md`](docs/PHASE1_3_FINDINGS.md) | Phase 1.3 results |
| [`docs/PHASE1_3_1_FINDINGS.md`](docs/PHASE1_3_1_FINDINGS.md) | **Phase 1.3.1 micro-calibration results — read this first** |
| [`docs/H2A_GATE_DECISION.md`](docs/H2A_GATE_DECISION.md) | The H2A blocker checklist and gate status |
| [`docs/H2A_UI_FOUNDATION_REPORT.md`](docs/H2A_UI_FOUNDATION_REPORT.md) | **The browser build — how to run it, what it enforces, what is missing** |
| [`docs/ui/`](docs/ui) | H2A product spec, browser technical contract, playtest protocol, agents addendum |
| [`docs/spec/SOLID_STATE_FACTION_SYSTEM_SPEC_v0.2.md`](docs/spec/SOLID_STATE_FACTION_SYSTEM_SPEC_v0.2.md) | The faction rules: lifecycle FSM, orthogonal roles, safe exits, no meter |
| [`reports/phase1_3_1-targeted-sanity.md`](reports/phase1_3_1-targeted-sanity.md) | **Phase 1.3.1 targeted sanity — the current measurements** |
| [`reports/phase1_3-sanity.md`](reports/phase1_3-sanity.md) | Phase 1.3 sanity diagnostic — pre-1.3.1 corpus |
| [`reports/phase1_2-diagnostic.md`](reports/phase1_2-diagnostic.md) | Phase-1.2 compact diagnostic — **pre-1.3 corpus, not regenerated** |
| [`reports/monte-carlo.md`](reports/monte-carlo.md) | Phase-1.1 Monte Carlo report — **pre-1.2 corpus, not regenerated** |
| [`reports/phase1_1-experiments.md`](reports/phase1_1-experiments.md) | Phase-1.1 experiment matrix — **pre-1.2 corpus, not regenerated** |

The documents are layered: **conflicts** and **assumptions** record what was
found, **findings** records what was measured, **engine changes** records what was
done about it, and **open questions** is the single actionable list drawn from
them all. Every question links back to its evidence.

**No creative content was changed.** Everything under `content/events/`,
`content/registries/` and `content/balance/` is byte-identical to its source
artifact (snapshot v0.7, or Phase 1.1 / 1.2 / 1.3 patch), and the JSON → Markdown
mirror check passes against `tools/SOLID_STATE_CONTENT_TOOL_v0.3.py` for all
seven batches. There are three exceptions, all reported rather than assumed: a
two-line event-ID renumbering forced by a cross-batch ID collision
([P12-C1](docs/PHASE1_CONFLICTS.md)), and the two Phase-1.3 inputs the patch did
not ship — the content-tool requirements and the Route Tag Registry v1.2 patch —
which were derived mechanically from the instruction text
([P13-C1](docs/PHASE1_CONFLICTS.md)).

## Quick start

```bash
npm install
npm run verify        # typecheck + content + mirrors + browser snapshot + tests

npm run dev           # H2A browser app at http://localhost:5173
npm run build         # production bundle into dist/
npm run preview       # serve the production bundle
```

Append `?dev=1` (or use `npm run dev`) for the developer inspector and the
explicit-seed field.

Individual steps:

```bash
npm run typecheck             # tsc --noEmit
npm run validate              # load and cross-validate all canonical content
npm run mirror:check          # assert batch Markdown is the exact render of batch JSON
npm run content:browser:check # assert the generated browser snapshot is not stale
npm test                      # 320 tests: acceptance A-P, Phase-1.1/1.2/1.3, H2A, golden runs
```

## Monte Carlo simulator

```bash
npm run simulate -- --runs 10000 --scenario no-talents --seed 12345
npm run simulate -- --runs 10000 --scenario all --species-stratified
npm run simulate -- --help
```

## Phase 1.3 sanity diagnostic

```bash
npm run sanity
npm run sanity -- --plan SOLID_STATE_PHASE1_3_1_TARGETED_SANITY_v0.1.json
npm run sanity -- --runs 500 --seed smoke
```

`--plan` selects a sanity plan under `content/balance`; the report file name is
derived from the plan's own status.

Runs exactly `SOLID_STATE_PHASE1_3_SANITY_PLAN_v0.1.json` — one 5 000-run pass,
no targeted arms — and writes `reports/phase1_3-sanity.{json,md}`. It exits
non-zero if any hard H2A correctness counter is non-zero: pre-25 coverage
defects, pre-25 fallback, illegal faction transitions, lifecycle collisions, or a
personalized faction event after a safe exit.

Everything the plan lists under `explicitlyNotRun` — the LOW/MID/HIGH sweep, the
family-weight A/B, the allocation comparison, the T1027 sweep, the T1023 SPC
comparison and the neutral-Human manifestation diagnostic — is **not** run here
and **not** retired; a test asserts each harness is still constructible.

## Phase 1.2 compact diagnostic

```bash
npm run diagnostic
npm run diagnostic -- --runs 400 --seed smoke
```

Runs exactly `SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json` — one 4 000-run
baseline plus the two targeted arms it names (T1023 SPC comparison, neutral-Human
18–20 manifestation window) — and writes
`reports/phase1_2-diagnostic.{json,md}`. It exits non-zero if the plan's strict
pre-25 coverage policy is violated.

The plan's `explicitlySkippedThisPatch` experiments — the LOW/MID/HIGH threshold
sweep, the family-weight A/B, the three-way allocation comparison and the T1027
sensitivity sweep — are **not** run by this command. They are **not retired**:
their harness is unchanged, still runs via `npm run experiment`, and a test
asserts each one is still constructible.

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
  events/                 SOLID_STATE_EVENT_BATCH_*.json  (canonical, 7 batches / 186 events)
                          SOLID_STATE_EVENT_BATCH_*.md    (generated mirror, never read at runtime)
  registries/             species v1.2, talent v1.2, ending v1.1, route tag v1.2, faction v0.2
  balance/                balance constants v0.2, experiment matrix, diagnostic + sanity plans, adapters
  superseded/             replaced registries, kept for provenance, never loaded
docs/spec/                the v0.7 machine-facing contracts, verbatim
docs/design/              the Bibles, verbatim (creative context)
tools/                    the canonical Python content tool, verbatim
src/engine/               React-free simulation engine (runs under plain Node)
  rng.ts                  seeded, serializable RNG — the only source of randomness
  conditions/             lexer, parser, evaluator for the condition DSL (no eval)
  content/                loaders, Zod schemas, JSON->Markdown mirror renderers
  eligibility.ts          age / repeat / material-lock / include-exclude gating
  factions.ts             lifecycle FSM, orthogonal roles, safe-exit reachability analysis
  drafting.ts             channel -> family -> event hierarchical draft
  schedules.ts            schedule queue, priority classes, displacement, expiry
  talents.ts              Dormant -> Triggered -> Spent, cascading to stable
  endings.ts              Ending Record construction and awareness resolution
  simulation.ts           the annual loop
src/sim/                  Monte Carlo scenarios, metrics, report renderer
src/sim/experiments.ts    reversible threshold / family-mode / T1027 overrides (retained)
src/sim/phase1_2.ts       compact diagnostic plan, SPC split, faction seeds, manifestation probe
src/sim/phase1_3.ts       sanity plan, streaming faction-lifecycle accumulator
src/engine/preview.ts     setup preview: same seed, species roll and draft the run will use
src/engine/playback.ts    one deterministic life captured as immutable annual frames
src/app/                  H2A React app — screens, reducer, i18n, inspector, generated snapshot
src/cli/                  validate / mirror / simulate / experiment / diagnostic / sanity entry points
tests/                    acceptance A-P, Phase-1.1/1.2/1.3, H2A bridge + UI, golden runs
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

## Design constraints specific to the faction layer

- **A flag-backed FSM, never a meter.** `NONE → CONTACTED → ENGAGED → COMMITTED`
  with authored exits to `OPTED_OUT` / `CLOSED`. No reputation, loyalty,
  hostility or alignment value exists anywhere, and the condition grammar gained
  no faction syntax — lifecycle is read through ordinary `FLAG[...]`.
- **Roles are orthogonal flags**, not states, and may coexist. Only roles the
  registry lists for that faction may be added.
- **Transitions are atomic.** An illegal edge or an unregistered role leaves the
  run exactly as it was, so two lifecycle flags for one faction is impossible by
  construction.
- **A safe exit really is safe.** After `OPTED_OUT` / `CLOSED` no ordinary
  personalized faction event can occur — proven statically at load by a
  three-valued reachability analysis, and counted at runtime. News and lore stay
  available, because they are about the world, not the protagonist.
- **History is not context.** A `FAC_*_CONTACT` marker records that contact
  happened; it grants no route favor, and neither do the terminal states.
- **No material bias, no new drafting stage.** A faction reaches the engine only
  through its registered route tag, so "at most one route-favor scalar per event"
  still holds, and a test asserts faction flags leave every family scalar
  unchanged.

## Status

Phase 1.3 integration is complete and the **H2A browser foundation is in**: 186
events across 7 batches, 38 route tags, 6 factions with a lifecycle FSM, all
Markdown mirrors byte-for-byte, **320 tests passing**, a production Vite build,
and the 5 000-run sanity diagnostic run and reported.

The browser never loads the Node content loader: a generated snapshot carries the
canonical fingerprint verbatim, `npm run content:browser:check` fails if it goes
stale, and tests prove a hydrated bundle produces byte-identical runs. Playback is
precomputed once at `BEGIN LIFE`, so pause and 1×/2× can only change when a frame
is revealed — never what it contains.

**H2A is OPEN.** All eleven hard correctness blockers pass — see
[`docs/H2A_GATE_DECISION.md`](docs/H2A_GATE_DECISION.md). Across 5 000 runs there
were zero illegal faction transitions, zero lifecycle collisions, zero
personalized faction events after a safe exit, and zero pre-25 coverage defects.

**The faction system now behaves exactly as specified, and the ending economy got
worse.** The ladder works — faction endings moved from a 1–3 year fuse at 22–25
onto the committed path at 25.5–28.4, 94% of them via the intended route, with
sudden endings surviving as a 6% minority. But 90% of faction contacts now end in
a safe exit, so the layer that supplied 1 169 of 2 406 endings in Phase 1.2
supplied 184. Nothing replaced them: completion fell 60.2% → 23.9%, 18–24 endings
fell from 189.5 to 1.8 per 1 000 runs, and 25–34 — the window this patch was meant
to fill — fell from 106.2 to 37.8.

That is a content-supply question, not a threshold question, and it is set out
with three candidate directions in
[Q-27](docs/OPEN_QUESTIONS.md#q-27) and
[`docs/PHASE1_3_FINDINGS.md`](docs/PHASE1_3_FINDINGS.md) §3.

Nothing was auto-tuned: no threshold profile selected, the two late-life
`FIX>=40` gates untouched, no filler authored, no T1027 change, uniform family
weighting preserved, FIX still event-driven only, and no faction meter of any
kind.

**Phase 1.3 stops here** pending design review. H2A implementation is a separate
task.
