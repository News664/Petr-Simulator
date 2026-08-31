# Superseded canonical data

Retained for provenance only. **Nothing here is loaded at runtime.**

| File | Superseded by | Since |
|---|---|---|
| `SOLID_STATE_SPECIES_REGISTRY_v1.1.json` | `registries/SOLID_STATE_SPECIES_REGISTRY_v1.2.json` | Phase 1.1 patch v0.1 |
| `SOLID_STATE_TALENT_REGISTRY_v1.0.csv` | `registries/SOLID_STATE_TALENT_REGISTRY_v1.1.csv` | Phase 1.1 patch v0.1 |
| `SOLID_STATE_ENDING_REGISTRY_v1.0.csv` | `registries/SOLID_STATE_ENDING_REGISTRY_v1.1.csv` | Phase 1.1 patch v0.1 |
| `SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json` | `balance/SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.2.json` | Phase 1.1 patch v0.1 |
| `SOLID_STATE_EVENT_BATCH_005_v0.1.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_005_v0.2.json` / `.md` | Phase 1.2 patch v0.1 |
| `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.0.json` / `.md` | `registries/SOLID_STATE_ROUTE_TAG_REGISTRY_v1.1.json` / `.md` | Phase 1.2 patch v0.1 |
| `SOLID_STATE_TALENT_REGISTRY_v1.1.csv` / `.md` | `registries/SOLID_STATE_TALENT_REGISTRY_v1.2.csv` / `.md` | Phase 1.2 patch v0.1 |
| `SOLID_STATE_EVENT_BATCH_005_v0.2.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_005_v0.3.json` / `.md` | Phase 1.3 patch v0.2 |
| `SOLID_STATE_EVENT_BATCH_006_v0.1.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_006_v0.2.json` / `.md` | Phase 1.3 patch v0.2 |
| `SOLID_STATE_FACTION_REGISTRY_v0.1.json` | `registries/SOLID_STATE_FACTION_REGISTRY_v0.2.json` | Phase 1.3 patch v0.2 |
| `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.1.json` / `.md` | `registries/SOLID_STATE_ROUTE_TAG_REGISTRY_v1.2.json` / `.md` | Phase 1.3 (derived — see `PHASE1_CONFLICTS.md` P13-C1) |
| `SOLID_STATE_EVENT_BATCH_007_v0.1.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_007_v0.2.json` / `.md` | Phase 1.3.1 micro-patch v0.1 |
| `SOLID_STATE_EVENT_BATCH_007_v0.2.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_007_v0.3.json` / `.md` | H2A UI foundation v0.1 |
| `SOLID_STATE_CONTENT_TOOL_v0.2.py` | `tools/SOLID_STATE_CONTENT_TOOL_v0.3.py` | Phase 1.3 (derived — see `PHASE1_CONFLICTS.md` P13-C1) |
| `SOLID_STATE_EVENT_BATCH_001_v0.4.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_001_v0.5.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_002_v0.4.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_002_v0.5.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_003_v0.2.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_003_v0.3.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_004_v0.4.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_004_v0.5.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_005_v0.5.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_005_v0.6.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_006_v0.3.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_006_v0.4.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_007_v0.5.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_007_v0.6.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_008_v0.2.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_008_v0.3.json` / `.md` | H2B.1B Part A |
| `SOLID_STATE_EVENT_BATCH_003_v0.3.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_003_v0.4.json` / `.md` | H2B.1B Part A design-review correction |
| `SOLID_STATE_EVENT_BATCH_004_v0.5.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_004_v0.6.json` / `.md` | H2B.1B Part A design-review correction |
| `SOLID_STATE_EVENT_BATCH_007_v0.6.json` / `.md` | `events/SOLID_STATE_EVENT_BATCH_007_v0.7.json` / `.md` | H2B.1B Part A design-review correction |

The eight H2B.1B Part A revisions are the corpus `main` carried at fingerprint
`3af02c428c7fd5de7b64a3c1c07ae84b084ad1576b9ee9f35a8da06087b5b54d`. Checking them
back into `content/events/` reconstructs that fingerprint exactly, which is how
the Part A pre-patch baseline stays re-derivable. The three revisions above them
are the Part A first pass, at `67ad9c4a…3482`, which the design-review correction
then replaced. See [`docs/H2B1B_A_FINDINGS.md`](../../docs/H2B1B_A_FINDINGS.md) §0.

`tools/SOLID_STATE_CONTENT_TOOL_v0.1.py` was likewise superseded by v0.2 and removed.
Each tool version stays backward compatible with the mirrors of the batches that
predate it: re-rendering Batches 001–004 with v0.3 reproduces their existing
Markdown byte-for-byte.
