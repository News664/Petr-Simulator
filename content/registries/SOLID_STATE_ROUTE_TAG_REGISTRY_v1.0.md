# SOLID STATE — Route Tag Registry
## Version 1.0

**Canonical source:** `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.0.json`

Every event `routeTag` must be registered. Route-context matching is an event-level favor under the Phase 1.1 uniform-family baseline. Multiple matching tags do not stack. `academic` explicitly cannot favor Transformation events.

| Tag | Kind | Flag prefix(es) | Active event favor | TRN event favor |
|---|---|---|---|---|
| `academic` | route_context | ROUTE_ACA_ | yes | no |
| `architectural` | route_context | ROUTE_ARC_ | yes | yes |
| `career` | route_context | ROUTE_CAR_ | yes | no |
| `civic` | route_context | ROUTE_CIV_ | yes | no |
| `corporate` | route_context | ROUTE_COR_ | yes | no |
| `debt` | route_context | ROUTE_FIN_ | yes | no |
| `education` | route_context | EDU_ | yes | no |
| `family` | route_context | ROUTE_FAM_ | yes | no |
| `finance` | route_context | ROUTE_FIN_ | yes | no |
| `industrial` | route_context | ROUTE_ARC_, ROUTE_CAR_ | yes | yes |
| `legal` | route_context | ROUTE_LEG_ | yes | no |
| `materials` | route_context | ROUTE_ACA_MATERIALS | yes | no |
| `medical` | route_context | ROUTE_MED_ | yes | no |
| `museum` | route_context | ROUTE_MUS_ | yes | no |
| `political` | route_context | ROUTE_CIV_ | yes | no |
| `religious` | route_context | ROUTE_REL_ | yes | no |
| `research` | route_context | ROUTE_ACA_ | yes | no |
| `restoration` | route_context | ROUTE_MUS_ | yes | no |
| `temporal` | route_context | ROUTE_TEMP_, MAT_MANIFEST_TEMP | yes | yes |
| `continuity` | route_context | ROUTE_ACA_CONTINUITY | yes | no |
| `anomalous` | route_context | ROUTE_ANO_ | yes | no |
| `baseline` | metadata | — | no | no |
| `fallback` | metadata | — | no | no |
| `health` | metadata | — | no | no |
| `housing` | metadata | — | no | no |
| `midlife` | metadata | — | no | no |
| `social` | metadata | — | no | no |
| `species` | metadata | — | no | no |
| `survivor` | metadata | — | no | no |
| `reincarnation` | metadata | SPC_REIN_ | no | no |
| `talent` | metadata | — | no | no |
