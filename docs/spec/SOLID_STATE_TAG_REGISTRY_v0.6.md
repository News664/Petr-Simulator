# SOLID STATE — Tag & Flag Registry
## Version 0.1 — Initial Core

Flags are discrete state. They are not hidden numeric meters.

Condition syntax uses `FLAG[FLAG_ID]`.

## Route flags

| Flag | Meaning |
|---|---|
| `ROUTE_COR_EMPLOYEE` | Currently in a corporate employment trajectory |
| `ROUTE_COR_PRESERVATION_PLAN` | Employer preservation benefit established |
| `ROUTE_COR_CONTRACT` | Corporate preservation/legacy contract active |
| `ROUTE_COR_LEGAL_REVIEW` | Corporate contract received meaningful legal review |
| `ROUTE_MUS_INTEREST` | Museum/curator has established interest |
| `ROUTE_MED_SCREENED` | Adult Fixation screening has occurred |
| `ROUTE_FIN_VALUED` | Future Permanent Form received financial valuation |

## Development / education flags

| Flag | Meaning |
|---|---|
| `EDU_MATERIAL_SCREENED` | Childhood material-resonance screening occurred |
| `EDU_STUDENT_INSURED` | Student transformation insurance/coverage established |
| `EDU_GRADUATED` | Secondary education completed |

## Material hint flags

Hints do not establish Material Commitment.

| Flag | Meaning |
|---|---|
| `MAT_HINT_WOOD` | Childhood/early-life wood resonance hint |
| `MAT_HINT_STON` | Stone resonance hint |
| `MAT_HINT_CRYS` | Crystal resonance hint |
| `MAT_HINT_GLAS` | Glass/obsidian resonance hint |
| `MAT_HINT_METL` | Metal/gem-adjacent resonance hint |

## Material manifestation flags

Manifestation is stronger than a hint but still reversible until `MAT` is set.

| Flag | Meaning |
|---|---|
| `MAT_MANIFEST_WOOD` | Recurrent visible wood manifestation |
| `MAT_MANIFEST_CRYS` | Recurrent visible crystal manifestation |

## Authoring tags

These are metadata rather than condition flags.

### Route tags
- `corporate`
- `museum`
- `medical`
- `finance`
- `education`
- `family`
- `legal`
- `midlife`
- `hidden`

### Material tags
- `hint`
- `manifestation`
- `commitment`
- `transition`
- `mixed`
- `ending`

## Namespace rule

Flags use stable uppercase identifiers because the condition DSL already treats bracket contents as IDs.

Do not encode:
- age;
- numeric balance;
- probability;
- localization;
- temporary event prose wording

into flag names.


## v0.2 baseline authoring tags

- `baseline` — repeatable ordinary-development event intended to preserve age-band coverage
- `fallback` — last-resort age-25+ quiet-year event; must use `selectionMode=fallback_only`
- `social`
- `career`
- `housing`

`baseline` is metadata, not a route flag.


# v0.3 additions for Event Batch 002

## Additional route flags

| Flag | Meaning |
|---|---|
| `ROUTE_MUS_APPRAISED` | Museum has formally appraised the protagonist's committed material |
| `ROUTE_ACA_RESEARCH` | Academic / Continuity Research route active |
| `ROUTE_MED_PRESERVATION_CONSULT` | Deliberate preservation consultation has occurred |
| `ROUTE_TEMP_STUDY` | Temporal research trajectory active |
| `ROUTE_ARC_STRUCTURAL` | Architectural / structural-use trajectory active |

## Additional manifestation flags

| Flag | Meaning |
|---|---|
| `MAT_MANIFEST_STON` | Reversible/recurrent stone manifestation |
| `MAT_MANIFEST_METL` | Reversible/recurrent metal manifestation |
| `MAT_MANIFEST_GLAS` | Reversible/recurrent glass/obsidian manifestation |
| `MAT_MANIFEST_TEMP` | Temporal manifestation observed |

These are discrete flags. Material Commitment remains the `MAT` state rather than a flag.


# v0.4 additions for Event Batch 003

## Family / legal / finance / religious / civic route flags

| Flag | Meaning |
|---|---|
| `ROUTE_FAM_PLACEMENT` | Family has discussed post-mobility placement |
| `ROUTE_FAM_DIRECTIVE` | Family/self placement directive exists |
| `ROUTE_LEG_STATUS_CASE` | Material Status/personhood case opened |
| `ROUTE_LEG_STATUS_RESOLVED` | Legal status hearing produced a ruling |
| `ROUTE_FIN_SECURED_DEBT` | Debt is secured against future Permanent Form value/rights |
| `ROUTE_FIN_LEGAL_REVIEW` | Secured future-form agreement received meaningful legal review |
| `ROUTE_REL_INTEREST` | Religious institution/community has established interest |
| `ROUTE_REL_CLAIM` | Religious significance/property claim is active |
| `ROUTE_CIV_SERVICE` | Civic/public-service trajectory active |
| `ROUTE_CIV_MEMORIAL` | Civic Legacy/memorial trajectory active |
| `ROUTE_CIV_REBRANDED` | Political context was stripped/rebranded before memorial climax |

## Authoring tags added

- `species`
- `debt`
- `political`

These are metadata, not numeric route progress.


# v0.5 additions for Event Batch 004

## Additional route flags

| Flag | Meaning |
|---|---|
| `ROUTE_MED_SYNTH_OPTION` | Synthetic stabilization option established |
| `ROUTE_ACA_TENURE_TRACK` | Long-term academic/tenure-track trajectory active |
| `ROUTE_ACA_TENURE_REVIEW` | Academic tenure review completed |
| `ROUTE_MUS_MIXED_OPTION` | Explicit museum/restoration mixed-material treatment proposed |
| `ROUTE_MED_DIRECTIVE` | Post-commitment medical/maintenance directives filed |

## Additional manifestation / material-history flags

| Flag | Meaning |
|---|---|
| `MAT_MANIFEST_CERA` | Reversible/recurrent ceramic/porcelain manifestation |
| `MAT_PREVIOUS_RECORDED` | A transition to MIXD recorded prior primary material(s) for ending metadata |

`MAT_PREVIOUS_RECORDED` is a bookkeeping flag only. The implementation should store the actual prior material list separately when a transition event sets `MAT=MIXD`.


# v0.6 additions — Academic specialization

| Flag | Meaning |
|---|---|
| `ROUTE_ACA_SPECIALIZATION` | Academic research direction has been established |
| `ROUTE_ACA_MATERIALS` | Comparative-materials research direction active |
| `ROUTE_ACA_MATERIALS_EXPOSED` | Comparative-material laboratory rotation completed |
| `ROUTE_ACA_CONTINUITY` | Awareness/identity/temporal-continuity research direction active |
| `ROUTE_ACA_CONTINUITY_EXPOSED` | Continuity research experience completed |
| `ROUTE_ACA_POLICY` | Post-mobile governance/personhood/property research direction active |
| `ROUTE_ACA_POLICY_EXPOSED` | Governance research experience completed |

Academic specialization flags are discrete route context. They are not a hidden research score and do not themselves select Material Commitment.
