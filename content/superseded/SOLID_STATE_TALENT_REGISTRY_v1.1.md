# SOLID STATE — Talent Registry
## Version 1.1 — structured machine operations

**Canonical source:** `SOLID_STATE_TALENT_REGISTRY_v1.1.csv`

Typed drafting fields use stable targets such as `channel:SPC` or `family:MUS`. Unlock/redirect/narrative tags do not automatically become probability multipliers; authored events still check talent IDs directly where appropriate.

`registered_species_rule` canonically resolves Q-15. `start_fix_bonus` remains blank for T1027 because Q-14 is intentionally deferred to sensitivity testing.

| ID | Talent | Favor | Strong Favor | Suppress | Registered species | Unlock / Redirect |
|---|---|---|---|---|---|---|
| `T1001` | Sharp Eyes | — | — | — | — | early_detection |
| `T1002` | Knows Excel | family:CAR;family:COR | — | — | — | — |
| `T1003` | Heavy Sleeper | — | — | — | — | delayed_symptom_variant |
| `T1004` | Likes Pigeons | family:CIV | — | — | — | monument_epilogue |
| `T1005` | Built Different | — | — | — | — | — |
| `T1006` | Bad Knees | — | — | — | — | seated_form;supported_form |
| `T1007` | Pretty Privilege | family:SOC | — | — | — | — |
| `T1008` | No Thoughts, Head Empty | — | — | — | — | — |
| `T1009` | Frugal | — | — | — | — | low_cost_branch |
| `T1010` | Keeps a Low Profile | — | — | — | — | — |
| `T1011` | Stoneworker's Daughter | family:STON | — | — | — | craft;restoration |
| `T1012` | Perfect Posture | — | — | — | — | standing_display_variant |
| `T1013` | Property Lawyer | — | — | — | — | self_ownership;liens;bankruptcy;inheritance;attached_property |
| `T1014` | Corporate Favorite | family:COR | — | — | — | — |
| `T1015` | Second Opinion | — | — | — | — | alternate_medical_branch |
| `T1016` | No Pain, No Gain | — | — | — | — | delayed_severe_variant |
| `T1017` | Late Bloomer | — | — | — | — | — |
| `T1018` | Museum Quality | — | family:MUS | — | — | — |
| `T1019` | Hard to Kill | — | — | — | — | fatal_to_emergency_preservation;fatal_to_temporal;fatal_to_synthetic |
| `T1020` | Old Soul | — | — | — | — | aevt_memory;reincarnation_memory |
| `T1021` | Magnetic Personality | family:METL | — | — | — | — |
| `T1022` | Union Member | — | — | — | — | labor_legal_branch; unilateral_employer_to_negotiated |
| `T1023` | Main Character Syndrome | — | channel:SPC | family:GEN | — | — |
| `T1024` | My Body, My Property | — | — | — | — | self_ownership;personhood |
| `T1025` | Unregistered Species | — | — | — | UNREGISTERED | species_unavailable_institutionally |
| `T1026` | Cheap Immortality | — | — | — | — | danger_to_low_cost_preservation |
| `T1027` | Hairline Fracture | — | — | — | — | fracture;restoration;anomalous_material;earlier_transformation |
| `T1028` | Object Permanence | — | — | — | — | continuous_identity;intermittent_identity |
| `T1029` | Soul Cannot Harden | — | — | — | — | displaced_awareness |
| `T1030` | Wrong Species Certificate | — | — | — | SEEDED_OTHER_SPECIES | registered_species_mismatch |
