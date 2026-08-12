# SOLID STATE — Coding Agent Handoff
## Version 0.1

This document defines **when to hand the project to coding agents, what they may implement, and what remains design-owned**.

# 1. Handoff status

## Gate H1 — Headless engine / simulation
**STATUS: READY NOW**

Send the current project snapshot to coding agents now for:

- repository/bootstrap work;
- TypeScript engine architecture;
- seeded RNG;
- content loading and validation;
- condition parser;
- annual event loop;
- hierarchical event drafting;
- schedules and priorities;
- repeatable events;
- species application;
- talent trigger engine;
- Material Commitment;
- ending resolution;
- local test fixtures;
- headless Monte Carlo simulation;
- automated content integrity checks.

Do **not** ask the coding agent to finalize gameplay balance or build the final UI yet.

Why H1 is ready:
- core creative Bibles exist;
- Species/Talent/Ending registries exist;
- event schema/taxonomy exists;
- 106 canonical events exist;
- event JSON is canonical and validation tooling exists;
- route/material/ending behavior is specified;
- provisional balance constants can now be supplied without pretending they are final.

## Gate H2 — First playable UI
**STATUS: NOT YET READY**

Open H2 only after:

1. headless engine passes Phase-1 acceptance tests;
2. Monte Carlo report exists;
3. material determinism is reviewed;
4. ending-age distribution is reviewed;
5. fallback frequency is reviewed;
6. route entry/climax rates are reviewed;
7. threshold-talent activation rates are reviewed;
8. provisional balance constants are revised/frozen as a first-playable balance version.

At H2, coding agents may implement:
- React application shell;
- species/talent/allocation setup screens;
- annual playback;
- 1×/2× speed;
- timeline;
- stat/status presentation;
- final Certificate of Permanent Status;
- Ending Gallery;
- localStorage persistence;
- basic English-first playable UX.

## Gate H3 — Content-complete bilingual first release
**STATUS: LATER**

Open H3 after:
- Afterform pools are authored;
- Traditional Chinese localization is completed;
- Localization Glossary is frozen;
- achievements/meta-progression are specified;
- first-playable balance is stable;
- Playwright coverage exists for core flow.

At H3 coding agents may finish:
- zh-TW UI/content;
- achievement/gallery polish;
- Afterform presentation;
- release persistence migrations;
- accessibility/responsive polish;
- static-site deployment.

# 2. What to send at H1

Send **one complete snapshot zip**, not an assortment of individual files.

The coding agent should begin with:

```text
machine/SOLID_STATE_AGENTS_v0.2.md
machine/SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md
machine/SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md
machine/SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json
machine/SOLID_STATE_PROJECT_MANIFEST_v0.7.md
```

Then follow `AGENTS` for task-specific files.

Canonical runtime content:
- `content/events/*.json`
- Species Registry JSON
- Talent Registry CSV
- Ending Registry CSV

Generated event Markdown is for review only and MUST NOT be used as runtime content.

# 3. Phase-1 assignment

Recommended first coding-agent assignment:

> Implement a deterministic, headless TypeScript simulation engine for Solid State using the provided contracts and canonical content. Do not invent or rewrite creative content. Treat the provisional balance constants as simulation inputs, not frozen design. Produce tests and a Monte Carlo CLI/report satisfying `SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md`. If the supplied content cannot be represented cleanly by the current schema, report the conflict and propose the smallest schema change instead of silently changing content.

# 4. Phase-1 implementation order

Recommended order:

1. Bootstrap TypeScript project and test runner.
2. Define core types and Zod schemas.
3. Load/validate Species, Talent, Ending, Event data.
4. Implement seeded RNG abstraction.
5. Implement condition lexer/parser/evaluator.
6. Implement run state and event history.
7. Implement repeat occurrence tracking.
8. Implement schedule queue and priority resolution.
9. Implement hierarchical channel/family/event drafting.
10. Implement event variants/effects/flags.
11. Implement Material Commitment continuity.
12. Implement threshold talent engine.
13. Implement ending resolution / Ending Record.
14. Implement complete headless run loop.
15. Add deterministic unit/integration tests.
16. Implement Monte Carlo CLI.
17. Generate balance report.
18. Stop and return results for design review.

Do not begin substantial React UI work before step 18 is reviewed.

# 5. Coding-agent change permissions

## May change freely

Coding agents may choose:
- internal file layout;
- TypeScript type organization;
- parser implementation technique;
- RNG library/algorithm, if deterministic and serializable;
- test organization;
- CLI implementation;
- performance optimizations that preserve exact behavior;
- data-loader implementation;
- internal naming that is not a content ID or user-facing term.

## May change only by explicit proposal

Coding agents must propose rather than silently change:
- schema fields;
- condition grammar;
- priority semantics;
- annual resolution order;
- Material Commitment behavior;
- talent trigger semantics;
- route scheduling semantics;
- ending resolution rules;
- persistence data model if it changes required behavior.

## Must not change

Coding agents must not:
- rewrite event prose;
- translate missing content;
- rename IDs;
- add new species/talents/routes/endings;
- add player choices during life;
- expose exact FIX in normal player UI;
- make hints/manifestations hard-lock material;
- make permanent awareness the default;
- implement 0.5-year cadence;
- resurrect stale Orc/Drakekin content;
- treat historical Design Spec v1/v2 as authority.

# 6. Conflict protocol

If implementation reveals a contradiction:

1. cite the conflicting file names and exact rules;
2. identify which behavior cannot coexist;
3. propose the smallest implementation-neutral resolution;
4. do not invent narrative content;
5. continue independent non-conflicting work.

Authority order:

1. latest machine-facing contract/registry;
2. canonical structured content;
3. latest current Bible;
4. generated review mirrors;
5. historical/stale files.

# 7. Provisional balance policy

`SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json` exists so Phase 1 can run.

Those numbers:
- are not player promises;
- are not creative canon;
- may be replaced after simulation;
- should be injectable/configurable;
- must not be scattered as magic numbers through engine code.

The engine should load balance configuration as data.

# 8. Required Phase-1 outputs from coding agent

Ask the coding agent to return:

- source code;
- tests;
- instructions to run validation/tests/simulator;
- Monte Carlo CLI;
- raw machine-readable simulation summary (JSON);
- human-readable simulation report (Markdown);
- list of any schema/content conflicts;
- list of assumptions;
- exact content snapshot/version used;
- git commit / PR if working in a repository.

# 9. Design-review checkpoint after H1

Do not simply accept the first simulator numbers.

Bring the report back to ChatGPT/design review and inspect:

- ending ages;
- run length;
- final materials;
- hint/manifest correlation;
- route density;
- route collisions;
- stat drift;
- talent activation;
- fallback years;
- species distinctiveness;
- nonterminal simulations at diagnostic maximum age.

Only after that review should provisional balance constants be changed into a first-playable frozen balance set.

# 10. What "informative enough for coding" means

A handoff is ready only when a coding agent can answer all of these from files rather than guessing:

- What is the authoritative source for each content type?
- What is the annual simulation order?
- What can the player choose?
- What is random and how must it be seeded?
- How are conditions parsed?
- How are events selected?
- How do repeatable events work?
- How are schedules displaced/expired?
- How do talents trigger?
- What does Material Commitment do?
- How do routes coexist?
- How are endings constructed?
- What does Awareness mean?
- What is provisional rather than frozen?
- What tests prove correctness?
- What should the agent do when documents disagree?

The v0.7 handoff bundle is intended to answer all of these.
