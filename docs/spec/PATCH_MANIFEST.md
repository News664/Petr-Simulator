# SOLID STATE — Phase 1.1 Input Patch Manifest
## Patch version 0.1

Target repository: `News664/Petr-Simulator`

Target starting branch/content: Phase-1 implementation based on
`SOLID_STATE_PROJECT_SNAPSHOT_v0.7`.

This patch is **design-owned input**. Claude Code should integrate it into the
repository; it should not invent replacement prose.

## Add / supersede

### Canonical content

- `content/events/SOLID_STATE_EVENT_BATCH_005_v0.1.json`
- generated mirror `content/events/SOLID_STATE_EVENT_BATCH_005_v0.1.md`

Batch 005 adds 32 targeted events:
- 6 varied ages 0–5 events;
- 6 non-Wood adolescent manifestation events;
- 2 visible multi-year FIX-producing chains (occupational + Medical);
- 2 additional route-specific FIX events;
- 8 SPC events including both anomalous endings;
- 3 committed `mandatory_only` sequences total (Medical, T1028, T1029);
- 4 dedicated 65+ route/ending events.

### Canonical registries

- `content/registries/SOLID_STATE_SPECIES_REGISTRY_v1.2.json`
  supersedes Species Registry v1.1.
- `content/registries/SOLID_STATE_TALENT_REGISTRY_v1.1.csv`
  supersedes Talent Registry v1.0 for runtime loading.
- `content/registries/SOLID_STATE_ENDING_REGISTRY_v1.1.csv`
  supersedes Ending Registry v1.0 for runtime loading.
- `content/registries/SOLID_STATE_ROUTE_TAG_REGISTRY_v1.0.json`
  is new canonical data.

The adjacent `.md` files are human review mirrors only.

### Content consistency tool

- `tools/SOLID_STATE_CONTENT_TOOL_v0.2.py` supersedes v0.1.
- It remains backward-compatible with the existing Batch 001–004 Markdown
  mirrors and additionally renders/checks v0.3 `refinementTags` and explicit
  schedule `priorityOrder`.

### Balance / experiment data

- `content/balance/SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.2.json`
  supersedes provisional v0.1 for Phase 1.1.
- `content/balance/SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`
  defines threshold, family-weighting, allocation-policy, and T1027 diagnostic
  comparisons.

No passive FIX drift is authorized.

### Machine-facing specs

- `docs/spec/SOLID_STATE_CONTENT_SCHEMA_v0.3.md`
- `docs/spec/SOLID_STATE_EVENT_DRAFTING_RULES_v0.3.md`
- `docs/spec/SOLID_STATE_TAG_REGISTRY_v0.7.md`
- `docs/spec/SOLID_STATE_PHASE1_1_ACCEPTANCE_ADDENDUM_v0.1.md`
- `docs/spec/SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.2.md`
- `docs/spec/SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.md`

These supersede/extend the corresponding Phase-1 rules for this iteration.

### Design decisions

- `docs/PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md`

Claude must merge each Q-nn decision into the existing
`docs/OPEN_QUESTIONS.md` Resolution block and update its summary statuses.
Do not leave two competing authoritative question registers.

## Provisional adapter retirement

`content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json` existed
because Phase 1 lacked structured canonical data.

After this patch, migrate/remove adapter behavior now represented canonically:

- species tendency family mapping -> Species Registry v1.2
- species refinement mapping -> Species Registry v1.2
- talent drafting polarity -> Talent Registry v1.1
- registered-species rule -> Talent Registry v1.1
- ending Awareness parsing -> Ending Registry v1.1
- route-tag/flag mapping -> Route Tag Registry v1.0
- academic TRN exception -> Route Tag Registry v1.0
- family weighting baseline -> Balance Constants v0.2
- starting FIX base -> Balance Constants v0.2
- visible/FIX clamp -> Balance Constants v0.2
- cooldown semantics -> Balance Constants v0.2 + Schema v0.3
- schedule validity/window semantics -> Balance Constants v0.2 + Schema v0.3

Do **not** force-retire fields still needed for unresolved diagnostics:
- T1027 start FIX magnitude (Q-14);
- temporary threshold override mechanism for Phase 1.1 experiment profiles;
- any temporary compatibility shim required during migration.

The old diagnostic pre-25 `reuse_baseline_repeatables` mode should be removed or
disabled from normal use after strict schedulability passes with Batch 005.

## Required validator additions

1. unknown routeTags -> error;
2. unknown refinementTags -> error;
3. new registry IDs/targets malformed -> error;
4. route-tag prefixes invalid -> error;
5. cross-batch schedule/ending references continue to validate;
6. pre-25 schedulability test must model cooldown/consumption rather than only
   per-age capacity;
7. generated Event Batch 005 Markdown must exactly match JSON.

## H2 status

H2 remains **CLOSED**.

Integrating this patch and producing the Phase 1.1 Monte Carlo report does not
authorize substantial React/UI development.

Return to design review after the report.
