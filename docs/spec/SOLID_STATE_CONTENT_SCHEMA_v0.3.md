# SOLID STATE — Content Schema
## Version 0.3 — Event Authoring Contract

## Source-of-truth rule

`SOLID_STATE_EVENT_BATCH_*.json` is canonical.

`SOLID_STATE_EVENT_BATCH_*.md` is generated review output only.

A deterministic renderer/checker must make this invariant machine-verifiable.

## Event object

```text
id: string
channel: ORD | INS | TRN | SPC
family: registered family code

age:
  min: integer
  max: integer | null

selectionMode:
  random | scheduled_only | mandatory_only | climax | fallback_only

weightClass:
  VERY_LOW | LOW | NORMAL | HIGH | VERY_HIGH

repeatPolicy:
  once_per_run | repeatable

repeatCooldownYears: integer >= 0
repeatMaxCount: integer >= 1 | null

routeTags: string[]
materialTags: string[]
refinementTags?: string[]

include: condition string
exclude: condition string

variants:
  - when: condition string
    text:
      en: string
      zh-TW: string
    effects:
      CHR?: integer
      INT?: integer
      STR?: integer
      MNY?: integer
      SPR?: integer
      FIX?: integer
    addFlags: string[]
    removeFlags: string[]
    setMaterialCommitment?: material enum
    schedules?: Schedule[]
    endingId?: string
    endingOverrides?: object

designerNotes: string
```

## Repeatability invariants

For `once_per_run`:
- `repeatMaxCount` must be `1`.
- cooldown should normally be `0`.

For `repeatable`:
- text must remain coherent across multiple occurrences;
- `repeatCooldownYears` must be explicit;
- `repeatMaxCount` may be finite or `null`.

`fallback_only` must be `repeatable`.

## Variant resolution

1. Select the one event for the age.
2. Evaluate variants in authored order against pre-event state.
3. First match wins.
4. Record event ID.
5. Append selected localized text.
6. Apply effects.
7. Add/remove flags.
8. Apply Material Commitment if present.
9. Add schedules.
10. Resolve ending if present.
11. Evaluate threshold talents until stable.
12. Save and advance year when nonterminal.

## Schedule

```text
eventId: string
offsetYears: integer >= 1
windowYears: integer >= 0
priority: scheduled | mandatory | climax
priorityOrder?: integer  # default 0; larger wins within the same priority class
validityCondition: condition string
```

## Condition references

`AGE CHR INT STR MNY SPR FIX SPECIES RSPECIES MAT TLT[id] EVT[id] AEVT[id] FLAG[id] ACH[id] TMS`

`TMS` = number of completed prior runs. First life = 0.

No JavaScript `eval`.

## Pre-25 coverage invariant

Automated simulation/content checks must verify that every reachable age 0–24 has at least one eligible non-fallback event under representative states after once-per-run events have been consumed.

A generic quiet-year fallback is not legal before age 25.

## Event stat-drift target

First slice:
- >=45% of random events change at least one visible stat.
- >=15% change at least two visible stats.

## Localization

English is canonical during initial authoring. `zh-TW` remains reserved until localization. Coding agents must not invent translations.


## v0.3 registered-tag rules

`routeTags` MUST exist in `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.0.json`.

`refinementTags`, when present, MUST exist in the `refinement_tags` registry inside
`SOLID_STATE_SPECIES_REGISTRY_v1.2.json`.

Refinement tags are not a new family-selection layer. They are optional local
event/variant metadata used after family selection.

## v0.3 schedule tie rule

Within the same priority class:

1. larger `priorityOrder` wins;
2. if `priorityOrder` is equal, select by seeded RNG.

Existing schedules without the field behave as `priorityOrder = 0`.

`validityCondition` remains a fire-time gate. A currently-false condition does
not destroy the schedule. Explicit route cancellation, if later needed, should
use a separate authored cancellation mechanism rather than overloading
`validityCondition`.

## v0.3 coverage validation

The pre-25 content invariant is stronger than static per-age eligibility.

Validation/simulation must detect whether repeat cooldowns, occurrence limits,
age windows, and once-per-run consumption can lead to a reachable pre-25 state
with no eligible non-fallback event.

A simple count of theoretical event capacity is insufficient.
