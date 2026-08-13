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
| `SOLID_STATE_CONTENT_TOOL_v0.2.py` | `tools/SOLID_STATE_CONTENT_TOOL_v0.3.py` | Phase 1.3 (derived — see `PHASE1_CONFLICTS.md` P13-C1) |

`tools/SOLID_STATE_CONTENT_TOOL_v0.1.py` was likewise superseded by v0.2 and removed.
Each tool version stays backward compatible with the mirrors of the batches that
predate it: re-rendering Batches 001–004 with v0.3 reproduces their existing
Markdown byte-for-byte.
