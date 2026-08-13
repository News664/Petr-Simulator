# SOLID STATE — Species Registry
## Version 1.2 — Phase 1.1 structured tendencies

**Canonical source:** `SOLID_STATE_SPECIES_REGISTRY_v1.2.json`

Family tendencies affect family selection. Refinement hooks affect only events/variants that explicitly carry the matching refinement tag. There is no extra subfamily drafting stage.

| Species | Primary families | Secondary families | Uncommon families | Refinement hooks |
|---|---|---|---|---|
| Human | none | none | none | none |
| Elf | CRYS, WOOD | GLAS, STON, TEMP | none | favor:WOOD_REFINED, favor:STON_FINE, suppress:METL_INDUSTRIAL, suppress:CONCRETE_HEAVY |
| Dwarf | STON, METL | SYNT | none | favor:METL_INDUSTRIAL, favor:BRONZE, favor:CONCRETE, favor:ARC_COMPOSITE, suppress:CRYS_DELICATE, suppress:GLAS_DELICATE |
| Winged Kin | STON | CRYS, GLAS, TEMP | none | strongly_favor:STON_FINE, favor:CRYS_DELICATE, suppress:METL_INDUSTRIAL_CRUDE, suppress:CONCRETE_CRUDE |
| Demonkin | GLAS | TEMP | none | strongly_favor:GLAS_OBSIDIAN, favor:METL_PRECIOUS, unlock:MAGICAL_SEAL, suppress:WOOD_NATURAL |
| Dragonkin | CRYS | METL, STON | WOOD | strongly_favor:METL_PRECIOUS, strongly_favor:CRYS_GEMSTONE, favor:BRONZE, favor:STON_VOLCANIC, suppress:WOOD_NATURAL |

## Refinement registry

| Tag | Family | Meaning |
|---|---|---|
| `STON_FINE` | `STON` | Fine stone, marble, pale stone, sculptural finish |
| `STON_VOLCANIC` | `STON` | Volcanic stone / heat-associated stone |
| `CONCRETE` | `STON` | Concrete / structural stone-like material |
| `CONCRETE_HEAVY` | `STON` | Heavy industrial concrete |
| `CONCRETE_CRUDE` | `STON` | Crude concrete finish |
| `METL_INDUSTRIAL` | `METL` | Industrial metal |
| `METL_INDUSTRIAL_CRUDE` | `METL` | Crude industrial metal |
| `METL_PRECIOUS` | `METL` | Precious metal |
| `BRONZE` | `METL` | Bronze / civic or crafted metal |
| `CRYS_DELICATE` | `CRYS` | Delicate/fine crystal |
| `CRYS_GEMSTONE` | `CRYS` | Gemstone-like crystal |
| `GLAS_OBSIDIAN` | `GLAS` | Obsidian / dark glass |
| `GLAS_DELICATE` | `GLAS` | Delicate glass |
| `WOOD_REFINED` | `WOOD` | Polished/lacquered/carved refined wood |
| `WOOD_NATURAL` | `WOOD` | Natural/rustic wood presentation |
| `ARC_COMPOSITE` | `MIXD` | Architectural composite; only applies to explicitly mixed/composite events |
| `SYNT_INDUSTRIAL` | `SYNT` | Industrial synthetic material |
| `MAGICAL_SEAL` | `none` | Special seal/ritual transformation hook; not a broad material family |
