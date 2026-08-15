# SOLID STATE

A browser game about a society where bodily permanence is paperwork. You register
a birth, declare three personal irregularities, complete an initial assessment —
and then the record proceeds without you, one year at a time, until the citizen
reaches a Permanent Form or the record stays open.

Underneath it is a **deterministic simulation engine**: a run is fully determined
by `contentVersion + seed + setup policy`, with a single seeded RNG, no `eval`,
and no timing concept anywhere in the engine. Playback is precomputed, so pause
and 1×/2× change *when* a year is revealed, never what it contains.

### ▶ [Play it](https://news664.github.io/Petr-Simulator/) — **live playtest build**

This is an in-development playtest, not a release. Balance is provisional, the
UI is English-only, and lives you play now will not reproduce identically after
the next content change — the content fingerprint is part of the seed contract.
The site is published from `main` by GitHub Actions on every push.

## Status

**Milestone H2B.1A is accepted.** 215 events across 8 batches, 25 endings, 39
route tags, 376 tests passing, a browser smoke suite, clean production build,
all correctness counters zero.

**LOW is the working canonical balance — not a freeze.** The one blocking design
question is Q-27, the ending-age distribution: 35–44 is still the largest bucket
and 65+ moved sharply after Continuity Review coverage was deliberately
unbounded. Nothing has been auto-tuned toward a target.

Current numbers, caveats and open questions:
**[`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md)**.

## Run it

**Node 22.22.2 or newer** — that is the floor in `package.json` engines, and it
is a real one: the test suite's jsdom environment needs a `node:worker_threads`
API that does not exist on Node 20.

```bash
npm ci
npm run verify        # typecheck + content + mirrors + browser snapshot + tests
npm run dev           # http://localhost:5173
```

Append `?dev=1` for the developer inspector and an explicit-seed field.

```bash
npm run build         # production bundle into dist/
npm run preview       # serve that bundle locally
```

Individual checks, if `verify` fails and you want to isolate it:

```bash
npm run typecheck             # tsc --noEmit
npm run validate              # load and cross-validate all canonical content
npm run mirror:check          # batch Markdown is the exact render of batch JSON
npm run content:browser:check # the generated browser snapshot is not stale
npm run lint:content          # content lints
npm test                      # 376 tests
```

### Browser tests

Functional checks a human should never repeat by hand — setup flow, seed
determinism, playback controls, stored-record resume, stale-revision refusal, no
horizontal overflow, mobile playback follow — run in real Chromium against the
**production bundle**, on a desktop and an emulated mobile viewport.

```bash
npx playwright install chromium   # once
npm run e2e                       # build, then run the smoke suite
npm run e2e:ci                    # same, assuming dist/ is already built
```

`npm run e2e` starts `vite preview` itself. Taste, tone and pacing stay with the
human playtest — see
[`docs/playtest/GITHUB_PAGES_SMOKE_CHECK.md`](docs/playtest/GITHUB_PAGES_SMOKE_CHECK.md)
for what is still checked by hand, and why.

Simulation CLIs — `simulate`, `experiment`, `diagnostic`, `sanity`,
`h2a:threshold`, `h2b:diagnostic`, `h2b1a` — write into `reports/`. See
[`reports/REPORT_INDEX.md`](reports/REPORT_INDEX.md) for what each one measures
and which reports are tracked.

## Design rules the code enforces

These are asserted by tests, not just documented:

- **The engine is React-free.** `src/engine/` imports nothing but Node built-ins
  and Zod, and runs under plain Node.
- **One RNG.** Seeded sfc32 with a serializable four-word state; `Math.random()`
  appears nowhere in `src/engine/` or `src/sim/`.
- **No `eval`.** The condition DSL is a hand-written lexer/parser/evaluator; no
  `eval`, `new Function` or `vm.run` anywhere in `src/`.
- **Playback cannot affect results.** A per-year observer doing arbitrary extra
  work produces a byte-identical timeline, and viewport following moves the
  screen only — never the reveal clock.
- **Balance is data.** No balance number is hard-coded; everything comes from
  `content/balance/*.json` and can be replaced via `--balance` / `--adapters`.
- **No passive FIX drift.** FIX changes only through authored effects.
- **Canonical Markdown is never runtime content.** The engine cannot read a
  `.md` file.
- **One visible event per year**, across hundreds of complete runs.
- **The browser never loads the Node content loader.** It reads a generated
  snapshot carrying the canonical fingerprint verbatim.
- **A faction safe exit really is safe.** After `OPTED_OUT` / `CLOSED` no
  ordinary personalized faction event can occur — proven statically at load and
  counted at runtime. Factions are a flag-backed FSM, never a reputation meter.
- **`zh-TW` is preserved empty.** No translation has been invented.

## Layout

```
content/            canonical data — the only runtime content source
  events/           8 event batches: JSON is canonical, .md is a generated mirror
  registries/       species, talent, ending, route tag, faction
  balance/          constants, adapters, experiment/diagnostic/sanity plans, triggers
  superseded/       replaced registries, kept for provenance, never loaded
src/engine/         React-free simulation engine (rng, condition DSL, drafting,
                    schedules, talents, factions, endings, triggers, playback)
src/sim/            Monte Carlo scenarios, metrics, experiment harnesses
src/app/            the React browser game — screens, reducer, i18n, inspector
src/cli/            validate / mirror / simulate / experiment / diagnostic /
                    sanity / lint / snapshot entry points
tests/              acceptance, phase and H2A/H2B suites, golden runs
e2e/                Playwright browser smoke tests against the built bundle
docs/               specs, design bibles, findings, decision register, archive
reports/            generated simulation output
tools/              the canonical Python content tool
.github/workflows/  pr-check (verify + build + browser smoke), deploy-pages
```

## Reading order for contributors and agents

1. [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) — where the project is.
2. [`docs/H2B1A_FINDINGS.md`](docs/H2B1A_FINDINGS.md) — the current measurements.
3. [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) — the live decision
   register. **Anything decided but not written there is not official.**
4. [`docs/PHASE1_CONFLICTS.md`](docs/PHASE1_CONFLICTS.md) — conflicts and
   observations awaiting a design decision.
5. [`docs/ENGINE_CHANGES.md`](docs/ENGINE_CHANGES.md) — what the engine does and
   why.
6. [`docs/spec/`](docs/spec) and [`docs/ui/`](docs/ui) — the machine-facing
   contracts and the UI product spec / browser technical contract.
7. [`docs/archive/`](docs/archive) — superseded milestone findings, resolution
   inputs, and the full historical decision register.

The coding agent does not author creative content, rewrite registries or freeze
balance numbers without a decision recorded in `docs/OPEN_QUESTIONS.md`.

## Branches and CI

`main` is the **stable, public playtest branch** and the only branch GitHub Pages
publishes — enforced by the workflow's push filter and by an explicit
`github.ref` guard, so a manual dispatch cannot publish anything else. Ongoing
development happens on `claude/solid-state-simulation-engine-3plxyi` and reaches
`main` by pull request.

Every pull request into `main` runs `verify-build-e2e`: `npm ci`, `npm run
verify`, `npm run build` and the Chromium smoke suite. It deploys nothing — it
only decides whether a change is fit to publish.

## License and status

No license has been chosen, so default copyright applies: all rights reserved by
the repository owner. The design bibles under `docs/design/` are creative source
material, not licensed for reuse. This is an unreleased work in progress.
