# AGENTS.md — SOLID STATE
## Version 0.2

Use this file as the coding-agent document router.

# Authority order

When documents conflict:

1. latest machine-facing implementation contract/registry for exact behavior
2. canonical structured content data
3. latest frozen Bible for creative intent
4. generated Markdown mirrors
5. historical/stale specs — never authoritative

Do not invent creative text to resolve ambiguity. Report the conflict.

# Task -> required documents

## Project/bootstrap/architecture

Read:
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`
- `SOLID_STATE_PROJECT_MANIFEST_v0.6.md`

Do not implement from historical Design Spec v1/v2.

## Species

Read:
- `SOLID_STATE_SPECIES_REGISTRY_v1.1.json`
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Creative context if needed:
- `design/bibles/current/SOLID_STATE_SPECIES_BIBLE_v1.1.pdf`

## Talents

Read:
- `SOLID_STATE_TALENT_REGISTRY_v1.0.csv`
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Creative context:
- Talent Bible

## Event schema / loaders / validators

Read:
- `SOLID_STATE_CONTENT_SCHEMA_v0.2.md`
- `SOLID_STATE_EVENT_TAXONOMY_v0.2.md`
- `SOLID_STATE_TAG_REGISTRY_v0.6.md`
- `SOLID_STATE_CONTENT_TOOL_v0.1.py`

Canonical content:
- `content/events/*.json`

Never parse generated event Markdown as runtime content.

## Event drafting / RNG / simulation

Read:
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`
- `SOLID_STATE_EVENT_DRAFTING_RULES_v0.2.md`
- `SOLID_STATE_ROUTE_RULES_v1.0.md`
- current event JSON batches

Do not choose numeric balance multipliers permanently until simulation output exists.

## Routes / scheduling / priority

Read:
- `SOLID_STATE_ROUTE_RULES_v1.0.md`
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`
- `SOLID_STATE_TAG_REGISTRY_v0.6.md`

Creative context:
- Route Bible

## Endings / final report

Read:
- `SOLID_STATE_ENDING_REGISTRY_v1.0.csv`
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Creative context:
- Ending Bible

## Conditions parser

Read:
- `SOLID_STATE_CONTENT_SCHEMA_v0.2.md`
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

No `eval`.

## i18n

Read:
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Until Localization Glossary is frozen:
- preserve empty `zh-TW` fields
- do not machine-invent translations

## UI / playback

Read:
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Important:
- 1×/2× presentation only
- player has no life-event choice UI
- exactly one visible annual event

## Persistence/meta progression

Read:
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Achievement/meta registry is still a future deliverable. Do not invent progression rules beyond current contract.

## Monte Carlo/balance tooling

Read:
- `SOLID_STATE_CONTENT_AUDIT_v0.2.md`
- `SOLID_STATE_EVENT_DRAFTING_RULES_v0.2.md`
- `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md`

Produce metrics, do not silently tune creative content.

# Coding-agent prohibitions

Do not:
- invent prose
- invent route meaning
- invent endings
- rename content IDs
- edit generated event Markdown
- add mid-life player choices
- expose FIX exact value in normal UI
- use Math.random in engine
- hard-code material destiny from species/hints
- make conscious statues the default
- resurrect Orc or Drakekin terminology
- use stale Design Spec v2 as authority


# Handoff phase gates

## Current gate: H1

Allowed current work:
- headless engine
- validation
- deterministic tests
- Monte Carlo tooling

Read before coding:
- `SOLID_STATE_CODING_AGENT_HANDOFF_v0.1.md`
- `SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md`
- `SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json`

Do not treat provisional balance values as frozen.

Do not start substantial final UI work until the Monte Carlo report is reviewed and H2 is explicitly opened.

# Provisional-data discipline

Where a required numeric decision is not frozen:
- use the provided provisional balance config if covered;
- otherwise expose a configuration parameter;
- document the assumption;
- do not bury the assumption in code.

# Return-to-design triggers

Stop and report when:
- schema cannot represent canonical content;
- condition grammar is ambiguous;
- two current authoritative files conflict;
- a route requires an undefined priority rule;
- ending data cannot be constructed without inventing semantics;
- simulation cannot meet an invariant without altering creative data.
