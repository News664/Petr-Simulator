# SOLID STATE — Route Tag Registry
## Version 1.2

**Canonical source:** `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.2.json`

Every event `routeTag` must be registered. Route-context matching is an event-level favor under the Phase 1.1 uniform-family baseline. Multiple matching tags do not stack. `academic` explicitly cannot favor Transformation events. Phase 1.2 added six faction route-context tags, cross-validated against the Faction Registry. Phase 1.3 narrows those six to the active lifecycle flags only — a historical `FAC_*_CONTACT` marker, `OPTED_OUT` and `CLOSED` grant no favor — and adds the metadata-only `faction_news` tag.

| Tag | Kind | Flag prefix(es) | Active event favor | TRN event favor |
|---|---|---|---|---|
| `academic` | route_context | ROUTE_ACA_ | yes | no |
| `anomalous` | route_context | ROUTE_ANO_ | yes | no |
| `architectural` | route_context | ROUTE_ARC_ | yes | yes |
| `black_ledger` | route_context | FAC_BLACK_LEDGER_STATE_CONTACTED, FAC_BLACK_LEDGER_STATE_ENGAGED, FAC_BLACK_LEDGER_STATE_COMMITTED | yes | no |
| `career` | route_context | ROUTE_CAR_ | yes | no |
| `civic` | route_context | ROUTE_CIV_ | yes | no |
| `continuity` | route_context | ROUTE_ACA_CONTINUITY | yes | no |
| `continuity_institute` | route_context | FAC_CRI_STATE_CONTACTED, FAC_CRI_STATE_ENGAGED, FAC_CRI_STATE_COMMITTED | yes | no |
| `corporate` | route_context | ROUTE_COR_ | yes | no |
| `debt` | route_context | ROUTE_FIN_ | yes | no |
| `dmms` | route_context | FAC_DMMS_STATE_CONTACTED, FAC_DMMS_STATE_ENGAGED, FAC_DMMS_STATE_COMMITTED | yes | no |
| `education` | route_context | EDU_ | yes | no |
| `everlasting` | route_context | FAC_EVERLASTING_STATE_CONTACTED, FAC_EVERLASTING_STATE_ENGAGED, FAC_EVERLASTING_STATE_COMMITTED | yes | no |
| `family` | route_context | ROUTE_FAM_ | yes | no |
| `finance` | route_context | ROUTE_FIN_ | yes | no |
| `industrial` | route_context | ROUTE_ARC_, ROUTE_CAR_ | yes | yes |
| `last_posture` | route_context | FAC_LAST_POSTURE_STATE_CONTACTED, FAC_LAST_POSTURE_STATE_ENGAGED, FAC_LAST_POSTURE_STATE_COMMITTED | yes | no |
| `legal` | route_context | ROUTE_LEG_ | yes | no |
| `materials` | route_context | ROUTE_ACA_MATERIALS | yes | no |
| `medical` | route_context | ROUTE_MED_ | yes | no |
| `meridian` | route_context | FAC_MERIDIAN_STATE_CONTACTED, FAC_MERIDIAN_STATE_ENGAGED, FAC_MERIDIAN_STATE_COMMITTED | yes | no |
| `museum` | route_context | ROUTE_MUS_ | yes | no |
| `political` | route_context | ROUTE_CIV_ | yes | no |
| `religious` | route_context | ROUTE_REL_ | yes | no |
| `research` | route_context | ROUTE_ACA_ | yes | no |
| `restoration` | route_context | ROUTE_MUS_ | yes | no |
| `temporal` | route_context | ROUTE_TEMP_, MAT_MANIFEST_TEMP | yes | yes |
| `baseline` | metadata | — | no | no |
| `faction_news` | metadata | — | no | no |
| `fallback` | metadata | — | no | no |
| `health` | metadata | — | no | no |
| `housing` | metadata | — | no | no |
| `midlife` | metadata | — | no | no |
| `reincarnation` | metadata | SPC_REIN_ | no | no |
| `social` | metadata | — | no | no |
| `species` | metadata | — | no | no |
| `survivor` | metadata | — | no | no |
| `talent` | metadata | — | no | no |
