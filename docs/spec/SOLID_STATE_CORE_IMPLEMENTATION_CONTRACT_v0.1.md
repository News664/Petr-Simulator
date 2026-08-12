# SOLID STATE — Core Implementation Contract
## Version 0.1 — Coding-Agent Authority

This document supersedes `SOLID_STATE_DESIGN_SPEC.md` and `SOLID_STATE_DESIGN_SPEC_v2.md` for implementation behavior.

Human-facing Bibles remain authoritative for creative intent. Machine-facing registries and canonical event JSON remain authoritative for exact content.

# 1. Product

Solid State is a browser-based automatic life simulator inspired structurally by Life Restart Simulator.

The protagonist is female in version 1.

The active player makes setup decisions, then observes the life simulation.

# 2. Tech stack

Required v1 stack:

- TypeScript
- React
- Vite
- React `useReducer` + Context for application state
- Zod for content/build validation
- Vitest for engine and simulation tests
- Playwright later for UI/e2e coverage
- plain CSS or CSS Modules
- localStorage persistence
- no backend/database/cloud dependency for v1

Do not introduce Zustand, Redux, a backend, or external persistence without a later design decision.

# 3. Architecture boundary

The simulation engine MUST be independent of React.

Required separation:

```text
src/
  engine/
    state
    rng
    conditions
    drafting
    events
    talents
    routes
    endings
    simulation
  content/
  ui/
```

The engine must be runnable under Node for deterministic tests and Monte Carlo simulation.

React is a presentation/controller layer, not the source of simulation truth.

# 4. Deterministic RNG

All random simulation behavior must use one explicit seeded RNG abstraction.

Requirements:

- identical content version + seed + starting selections => identical simulation result;
- playback speed cannot affect RNG;
- UI render count cannot affect RNG;
- Node simulation and browser simulation must agree;
- never use `Math.random()` inside engine logic.

Seed format may be implementation-defined but must serialize.

# 5. Setup flow

Authoritative order:

1. create/reincarnate run seed;
2. roll one species;
3. draft 10 distinct talents;
4. player chooses exactly 3 talents;
5. player allocates starting visible attributes;
6. apply species modifiers;
7. apply unconditional/start talent effects;
8. evaluate dormant threshold talents until stable;
9. begin life at age 0.

Starting allocation:

- Human: 21 free points
- all other species: 20 free points
- pre-modifier visible attributes must respect allocation constraints
- ordinary intended starting range is 0–10 before modifiers

Visible stats:

- `CHR`
- `INT`
- `STR`
- `MNY`
- `SPR`

Hidden:
- `FIX`

# 6. Player agency after setup

No mid-life interactive decisions.

The player may:
- observe;
- pause/resume where UI supports it;
- switch 1× / 2× playback;
- inspect timeline/status;
- inspect final report/gallery.

The player does NOT choose:
- dialogue responses;
- medical treatment;
- contracts;
- route branches;
- legal responses;
- material;
- ending.

Narrative "choices" are automatic branches resolved from state and seeded RNG.

# 7. Time model

Version 1 is exactly one visible event per chronological year.

Life begins at age 0.

A visible timeline entry corresponds to one selected annual event.

One annual event may internally:
- choose an automatic variant;
- modify stats/FIX;
- add/remove flags;
- set Material Commitment;
- create future schedules;
- trigger an ending.

These internal operations do not create extra same-year visible events.

A future 0.5-year cadence is explicitly deferred and MUST NOT be implemented now.

# 8. Annual resolution order

Each year:

1. advance to target age;
2. resolve highest-priority valid committed/scheduled event if one exists;
3. otherwise build current channel weights;
4. choose eligible channel;
5. choose eligible family;
6. choose eligible event;
7. choose first matching automatic variant;
8. append exactly one visible event text;
9. apply effects;
10. apply flags/material/schedules;
11. resolve ending if event is terminal;
12. otherwise evaluate threshold talents until stable;
13. persist state;
14. continue.

Priority:

1. ending / committed hidden-route climax
2. mandatory committed-route continuation
3. scheduled priority event
4. normal hierarchical draft

Within the same class:
- authored priority first;
- seeded RNG if truly equal.

# 9. Drafting hierarchy

Normal drafting is:

`age/state profile -> channel -> family -> event`

Channels:

- `ORD`
- `INS`
- `TRN`
- `SPC`

Exact taxonomy is defined by `SOLID_STATE_EVENT_TAXONOMY_v0.2.md`.

Exact balance constants are not frozen yet.

The implementation must allow channel/family/event tendencies to be supplied as data rather than hard-coded prose assumptions.

# 10. Empty-pool behavior

When a selected family is empty:
- remove it;
- renormalize remaining family weights.

When a selected channel is empty:
- remove it;
- renormalize remaining channel weights.

If no normal event remains:

- age < 25: this is a content coverage error;
- age >= 25: use an eligible `fallback_only` event.

Fallback-only events never participate in normal weighted selection.

# 11. Repeatable events

Events define:

- `repeatPolicy`
- `repeatCooldownYears`
- `repeatMaxCount`

The engine must track occurrence count and most-recent occurrence age per Event ID.

`once_per_run` cannot occur more than once.

Repeatability is per run, not across reincarnations.

# 12. Conditions

The condition parser must support:

- numeric refs: `AGE CHR INT STR MNY SPR FIX TMS`
- `SPECIES`
- `RSPECIES`
- `MAT`
- `TLT[id]`
- `EVT[id]`
- `AEVT[id]`
- `FLAG[id]`
- `ACH[id]`
- comparisons
- `&`
- `|`
- unary `!`
- parentheses
- literal `TRUE` / `FALSE`

No JavaScript `eval`, Function constructor, or equivalent dynamic code execution.

`EVT` means current run event history.

`AEVT` means completed prior runs only; the active run is not inserted until run completion.

# 13. Event variants

Variants are ordered.

Resolution:
- evaluate against pre-event state;
- first matching variant wins;
- final `TRUE` fallback is recommended and currently validated.

An event is selected first; variant conditions do not create competing visible events.

# 14. Scheduling

Schedules contain at least:

- target `eventId`
- offset/earliest age
- window
- priority
- validity condition

A displaced scheduled event may remain pending inside its authored window.

It expires when:
- the window closes; or
- validity becomes impossible/current route state invalidates it.

Do not create an unbounded event backlog.

# 15. Routes

Routes are discrete narrative state represented through:
- flags;
- event history;
- schedules;
- discrete stages.

No generic numeric route-progress meter.

Soft routes influence eligibility/tendencies.

Committed hard routes may reserve consecutive future years, generally 2–5 years.

Routes may coexist.

Route failure/abandonment should normally redirect into normal life by invalidating future route schedules rather than displaying a special failure state.

# 16. Academic route

Academia is an intersection amplifier, not merely a tenure ladder.

Current specializations:
- Comparative Materials
- Continuity / Awareness / Temporal Research
- Post-Mobile Governance / Policy

Research specialization is automatic.

Tenure is one possible career consequence.

Academic state may intersect Museum, Medical, Temporal, Legal, Finance, Civic, Religious, mixed-material, and future Anomalous content.

# 17. Material model

`MAT` / Material Commitment is a discrete nullable state.

Initial values:
- `NONE`
- `STON`
- `METL`
- `CRYS`
- `WOOD`
- `GLAS`
- `CERA`
- `SYNT`
- `TEMP`
- `MIXD`
- `ANOM`

Before commitment:
- species tendencies are soft;
- talent tendencies are soft;
- hints are soft;
- manifestations are soft;
- multiple manifestation families may coexist.

Only an authored event setting Material Commitment creates the ordinary hard lock.

After commitment:
- unrelated normal Transformation families become ineligible;
- committed-family, explicit transition, mixed-material, and anomaly events remain allowed.

# 18. Mixed materials

Mixed materials require explicit authored transition.

They must never emerge automatically by accumulating unrelated route flags.

When changing `MAT` to `MIXD`, preserve prior primary material(s) as ending/event metadata.

Finish/coating/detail are not competing primary material families.

# 19. Fixation

`FIX` is hidden from the player.

High FIX:
- changes eligibility/tendencies;
- supports authored commitment/climax events.

High FIX does not automatically end the run.

UI should communicate pressure through event prose/symptoms/status language rather than exposing the exact number.

# 20. Talent model

Talent definitions are sourced from the Talent Registry.

Conditional one-shot talents use:

`Dormant -> Triggered -> Spent`

Checkpoints:
1. after starting allocation/species
2. after unconditional start talent effects
3. after each annual event completes
4. after exceptional direct system stat operations

Triggered effects are permanent and never revoked.

After one talent triggers, reevaluate dormant talents until stable.

A talent triggered by the current annual event cannot retroactively change that event's variant.

# 21. Species

Source:
`SOLID_STATE_SPECIES_REGISTRY_v1.1.json`

True biological species:
- HUMAN
- ELF
- DWARF
- WINGED_KIN
- DEMONKIN
- DRAGONKIN

`SPECIES` is true species.

`RSPECIES` is institutional registered species.

Biological tendencies use `SPECIES`.

Institutional classification events may use `RSPECIES`.

# 22. Endings

Every shipped canonical v1 ending creates an irreversible/effectively irreversible Permanent Form.

Ending IDs:
`END-{PRIMARY_FAMILY}-{NNN}`

Ending ID identifies social/legal narrative fate, not every material variant.

The final material normally equals current Material Commitment unless the climax explicitly performs an allowed transition.

# 23. Awareness

Ending Awareness State is independent from consent/autonomy/legal status.

Ordinary solid-material Permanent Forms default to:
- `Unconscious`

Ordinary temporal fixation defaults to:
- `Suspended`

Rare explicit states:
- `Intermittent`
- `Continuous`
- `Displaced`
- `Uncertain`

Continuous/Intermittent/Displaced require authored authorization.

Never infer eternal awareness merely because a body is permanently immobile.

# 24. Consent / autonomy / ownership

Keep distinct fields:

- Conversion Consent
- Awareness
- Autonomy
- Ownership
- Legal Status

Do not derive one automatically from another unless an authored Ending definition specifies a default.

# 25. Ending Record

Final report should support:

- species
- registered species
- ending age
- primary material
- form
- Awareness State
- integrity
- legal classification
- ownership
- autonomy
- conversion consent
- location
- social meaning
- Ending ID/title

Unknown/Disputed values are valid.

# 26. Afterform

Afterform is 2–6 authored epilogue entries after ending.

It is not a second simulation.

No post-form stats, movement system, management loop, or object combat.

Selection may condition on ending/material/awareness/integrity/ownership/location/talents/history.

# 27. Persistence

v1 uses localStorage.

Persist:
- current run state;
- deterministic seed/RNG state as necessary;
- reincarnation count;
- achievements;
- Ending Gallery;
- prior-run completed event history needed by AEVT;
- unlocked progression.

Storage format must be versioned.

Provide migration/reset handling rather than silently accepting incompatible state.

# 28. i18n

Supported from day 1:
- `en`
- `zh-TW`

Content IDs are language-independent.

Canonical initial event authoring is English.

Coding agents must not invent missing zh-TW text.

Localization lookup should fail visibly in development when required keys are missing.

# 29. Playback speed

Supported:
- 1×
- 2×

Speed changes presentation delays only.

It must not change:
- event selection;
- RNG calls;
- results;
- saved state.

# 30. Content source rules

Canonical events:
`SOLID_STATE_EVENT_BATCH_*.json`

Generated event Markdown:
review only, never hand-edited.

Build/CI must validate JSON and check deterministic JSON→Markdown mirrors.

Coding agents must not invent event prose or route meaning.

# 31. Required engine tests

Minimum deterministic tests:

- same seed => same full run
- browser/headless parity where feasible
- speed-independent results
- no pre-25 fallback-only event
- exactly one visible event per age
- schedule displacement/expiry
- once-per-run and repeat cooldown
- conditional talent one-shot behavior
- talent cascade until stable
- AEVT excludes current active run
- Material Commitment blocks unrelated transformation families
- explicit MIXD transition preserves prior material metadata
- ending material continuity
- awareness default rules
- no invalid ending before age 18
- registered/true species separation

# 32. Required simulation metrics before balance freeze

Headless Monte Carlo must report:

- ending age distribution
- average run length
- fallback frequency
- channel/family frequencies by age
- route entry/climax/abandonment
- priority collision rate
- material distribution
- P(final X | hint X)
- P(final X | first manifestation X)
- multi-manifestation rate
- material entropy by species/talents
- threshold talent activation rates and ages
- ending distribution
- rare/hidden ending rate

Exact balance multipliers must not be frozen before this report exists.

# 33. Version-1 non-goals

Do not implement:
- backend accounts
- multiplayer
- real-time combat
- map exploration
- dialogue-choice gameplay
- 0.5-year cadence
- full post-form simulator
- faction expansion packs
- DnD-alignment faction system
- hundreds of extra events before first balance simulation

# 34. Implementation principle

The engine should be boring, deterministic, testable, and data-driven.

The content should be strange.

Do not solve content complexity by embedding creative logic into React components or one-off hard-coded branches.
