# SOLID STATE — Project Deliverables Manifest
## Version 0.7

This file exists to prevent contradictory handoffs.

## 1. Source-of-truth hierarchy

When two files appear to disagree, use this order:

1. **Latest frozen human-facing Bible** for creative/world intent.
2. **Latest machine-facing contract/registry** for exact implementation behavior.
3. **Canonical structured content file** for actual talents/endings/events.
4. Generated review mirrors are never authoritative.

If a machine-facing rule intentionally differs from an older Bible, the older Bible must be refreshed or explicitly marked stale before final implementation handoff.

## 2. Human-facing design artifacts

These are primarily for the designer + ChatGPT. Coding agents should read them only when a task requires creative context.

| Artifact | Current file | Status | Purpose |
|---|---|---|---|
| World Bible | `SOLID_STATE_WORLD_BIBLE_v1.0.pdf` | CURRENT | Setting, institutions, economy, terminology, temporal/synthetic concepts |
| World editable source | `SOLID_STATE_WORLD_BIBLE_v1.0.docx` | CURRENT SUPPORTING | Editable source / archival copy |
| Species Bible | `SOLID_STATE_SPECIES_BIBLE_v1.1.pdf` | CURRENT | Refreshed six-species design, current naming/tendencies |
| Talent Bible | `SOLID_STATE_TALENT_BIBLE_v1.0.pdf` | CURRENT | Talent philosophy, trigger rules, initial 30 |
| Talent Bible source | `SOLID_STATE_TALENT_BIBLE_v1.0.md` | CURRENT | Human-editable source |
| Route Bible | `SOLID_STATE_ROUTE_BIBLE_v1.0.pdf` | CURRENT | Birth start, one event/year, age curve, routes, Material Commitment |
| Ending Bible | `SOLID_STATE_ENDING_BIBLE_v1.0.pdf` | CURRENT | Ending philosophy, Awareness, ending family IDs, 24 endings |
| Ending Bible source | `SOLID_STATE_ENDING_BIBLE_v1.0.md` | CURRENT | Human-editable source |

### Species Bible known stale items

Do not hand the current Species PDF to coding agents as implementation authority until refreshed. Later decisions include:
- Orc removed;
- six starting species only;
- Drakekin renamed **Dragonkin**;
- Traditional Chinese formal Dragonkin name `龍人族`, colloquial `龍人`;
- Elf Wood is a Primary material family;
- exact material multipliers removed from the Bible;
- hierarchical drafting / age-state context supersedes older flat-weight assumptions.

## 3. Machine-facing implementation artifacts

These are the normal input set for coding agents.

| Artifact | Current file | Status |
|---|---|---|
| Core Implementation Contract | `SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md` | CURRENT / IMPLEMENTATION AUTHORITY |
| Coding Agent Handoff | `SOLID_STATE_CODING_AGENT_HANDOFF_v0.1.md` | CURRENT / H1 PHASE AUTHORITY |
| Phase-1 Acceptance Tests | `SOLID_STATE_PHASE1_ACCEPTANCE_TESTS_v0.1.md` | CURRENT |
| Provisional Balance JSON | `SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json` | CURRENT / SIMULATION ONLY |
| Provisional Balance Review | `SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.md` | SUPPORTING |
| AGENTS task map | `SOLID_STATE_AGENTS_v0.2.md` | CURRENT |
| Route Rules | `SOLID_STATE_ROUTE_RULES_v1.0.md` | CURRENT |
| Species Registry structured | `SOLID_STATE_SPECIES_REGISTRY_v1.1.json` | CURRENT |
| Species Registry review | `SOLID_STATE_SPECIES_REGISTRY_v1.1.md` | SUPPORTING |
| Talent Registry structured | `SOLID_STATE_TALENT_REGISTRY_v1.0.csv` | CURRENT |
| Talent Registry review | `SOLID_STATE_TALENT_REGISTRY_v1.0.md` | SUPPORTING |
| Ending Registry structured | `SOLID_STATE_ENDING_REGISTRY_v1.0.csv` | CURRENT |
| Ending Registry review | `SOLID_STATE_ENDING_REGISTRY_v1.0.md` | SUPPORTING |
| Event Taxonomy | `SOLID_STATE_EVENT_TAXONOMY_v0.2.md` | CURRENT DRAFT |
| Content Schema | `SOLID_STATE_CONTENT_SCHEMA_v0.2.md` | CURRENT DRAFT |
| Tag / Flag Registry | `SOLID_STATE_TAG_REGISTRY_v0.6.md` | CURRENT DRAFT |
| Event Batch 001 canonical | `SOLID_STATE_EVENT_BATCH_001_v0.3.json` | CURRENT DRAFT / CANONICAL EVENT SOURCE |
| Event Batch 001 review | `SOLID_STATE_EVENT_BATCH_001_v0.3.md` | GENERATED — NEVER EDIT |
| Event Batch 002 canonical | `SOLID_STATE_EVENT_BATCH_002_v0.2.json` | CURRENT DRAFT / CANONICAL EVENT SOURCE |
| Event Batch 002 review | `SOLID_STATE_EVENT_BATCH_002_v0.2.md` | GENERATED — NEVER EDIT |
| Event Batch 003 canonical | `SOLID_STATE_EVENT_BATCH_003_v0.1.json` | CURRENT DRAFT / CANONICAL EVENT SOURCE |
| Event Batch 003 review | `SOLID_STATE_EVENT_BATCH_003_v0.1.md` | GENERATED — NEVER EDIT |
| Event Batch 004 canonical | `SOLID_STATE_EVENT_BATCH_004_v0.2.json` | CURRENT DRAFT / CANONICAL EVENT SOURCE |
| Event Batch 004 review | `SOLID_STATE_EVENT_BATCH_004_v0.2.md` | GENERATED — NEVER EDIT |
| First-Slice Content Audit | `SOLID_STATE_CONTENT_AUDIT_v0.2.md` | CURRENT MILESTONE AUDIT |
| Event Drafting Rules | `SOLID_STATE_EVENT_DRAFTING_RULES_v0.2.md` | CURRENT BALANCE DRAFT |
| Event consistency tool | `SOLID_STATE_CONTENT_TOOL_v0.1.py` | CURRENT |
| Original Design Spec | `SOLID_STATE_DESIGN_SPEC.md` | HISTORICAL |
| Design Spec v2 | `SOLID_STATE_DESIGN_SPEC_v2.md` | **STALE — DO NOT IMPLEMENT FROM ALONE** |

## 4. Event-content consistency rule

For every event batch:

- JSON is canonical.
- Markdown is generated deterministically from JSON.
- Human edits happen in JSON through ChatGPT/content tooling, not directly in the Markdown mirror.
- CI must run:

```text
python SOLID_STATE_CONTENT_TOOL_v0.1.py validate SOLID_STATE_EVENT_BATCH_XXX_vY.Y.json
python SOLID_STATE_CONTENT_TOOL_v0.1.py check SOLID_STATE_EVENT_BATCH_XXX_vY.Y.json SOLID_STATE_EVENT_BATCH_XXX_vY.Y.md
```

A mismatch is a build/content failure.

## 5. Registry consistency policy

Before final coding-agent handoff, Talent and Ending registries should follow the same pattern:
- one canonical structured source;
- any Markdown/table view generated from it;
- deterministic consistency check.

The current CSV + Markdown files were generated together, but this relationship is not yet enforced by the event content tool.

## 6. Expected remaining design deliverables before full implementation handoff

### Required refresh / consolidation

1. **EVENT_DRAFTING_RULES / BALANCE_CONSTANTS freeze** — exact numeric mappings after Monte Carlo simulation.
5. **BALANCE_CONSTANTS.json/md** — tested channel/family/talent/FIX constants.
6. **LOCALIZATION_GLOSSARY.md** — canonical EN ↔ zh-TW terminology and institution/species names.
7. **AGENTS.md** — task-to-document map for coding agents.
8. **ACHIEVEMENT_META_RULES.md / registry** — reincarnation, achievement unlocks, talent rarity progression, Ending Gallery behavior.

### Content production

9. Event batches until first playable reaches roughly **100 events**.
10. Generated **Event Registry / index** across all batches.
11. Traditional Chinese localization pass for:
   - talents;
   - endings;
   - events;
   - UI terminology.
12. Afterform epilogue pools for the shipped endings.

### Validation / simulation

13. Content validator expanded across all batches/registries.
14. Monte Carlo simulation report:
   - ending-age distribution;
   - route entry/climax rates;
   - material distribution;
   - species perceptibility;
   - threshold-talent activation;
   - fallback-event frequency;
   - empty-pool failures.
15. Balance revision based on simulation.

## 7. Intended coding-agent handoff bundle

Coding agents should normally receive:

```text
AGENTS.md
CORE_IMPLEMENTATION_CONTRACT.md
machine/
  SPECIES_REGISTRY.*
  TALENT_REGISTRY.*
  ENDING_REGISTRY.*
  EVENT_TAXONOMY.md
  CONTENT_SCHEMA.md
  EVENT_DRAFTING_RULES.md
  TAG_REGISTRY.md
  BALANCE_CONSTANTS.*
  LOCALIZATION_GLOSSARY.md
content/
  events/*.json
  afterform/*.json
tools/
  content validation / generation scripts
tests/
  content invariants / deterministic simulation requirements
```

Long-form Bibles remain available under `design/bibles/` but are not required reading for every coding task.

## 8. Future expansion architecture

Future factions, including alignment-inspired faction packs, should add:
- new stable family/route codes;
- new event batches;
- optional new endings;
- optional new tags/flags.

They must not renumber or repurpose published core IDs.

## 9. Current next step

Batch 001 v0.2 now establishes:
- deterministic JSON→Markdown generation;
- repeatable pre-25 baseline events;
- age-25+ fallback-only quiet year;
- the first end-to-end route climax.

Batch 003 is now drafted and validated. Material hints/manifestations are explicitly soft evidence; Material Commitment is the only ordinary hard lock. Next work should expand toward ~100 events, add Afterform pools, refresh the Species Bible/registry, and begin Monte Carlo balance validation.


## v0.5 milestone

Academic route specialization was expanded before implementation handoff. Species Bible v1.1 and Species Registry v1.1 now supersede the stale species artifact.


## v0.6 implementation-readiness milestone

Core Implementation Contract v0.1 now supersedes historical design specs for coding behavior. AGENTS v0.1 maps coding tasks to authoritative files. Broad creative content remains paused pending the headless simulation/balance phase.


## v0.7 handoff gate

**H1 is OPEN.** The snapshot may now be sent to coding agents for headless deterministic engine, validation, and Monte Carlo simulation only.

**H2 remains CLOSED** until Phase-1 acceptance tests pass and the Monte Carlo report receives design review.

**H3 remains CLOSED** until Afterform, localization, achievements/meta progression, and first-playable balance are ready.
