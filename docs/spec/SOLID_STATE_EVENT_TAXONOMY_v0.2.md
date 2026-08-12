# SOLID STATE — Event Taxonomy
## Version 0.2 — Machine-Facing Draft

## Canonical-data rule

**Event batch JSON is the sole canonical source for event content.**

Human-readable batch Markdown is generated from JSON and MUST NOT be hand-edited. CI/build validation must fail when regenerated Markdown is not byte-for-byte identical to the checked-in Markdown.

## Event ID

`EVT-{CHANNEL}-{FAMILY}-{NNNN}`

IDs encode only stable taxonomy. Never encode age, species, route stage, material commitment, rarity, or weights. Published IDs are immutable.

## Channels

- `ORD` — Ordinary
- `INS` — Institutional / World
- `TRN` — Transformation
- `SPC` — Route / Special

## Core family codes

Ordinary/social:
- `GEN` — General / Quiet Life
- `FAM` — Family
- `EDU` — Education
- `CAR` — Career
- `SOC` — Social / Friendship / Romance
- `HOU` — Housing
- `HEA` — Ordinary Health
- `FIN` — Finance
- `CIV` — Civic / Government

Institutional:
- `COR` — Corporate
- `MUS` — Museum / Art
- `MED` — Medical / Preservation
- `LEG` — Legal
- `FIN` — Finance / Insurance
- `REL` — Religious / Ceremonial
- `ARC` — Architectural / Industrial
- `ACA` — Academic / Research
- `CIV` — Civic / Political
- `EDU` — Education System

Transformation:
- `STON`, `METL`, `CRYS`, `WOOD`, `GLAS`, `CERA`, `SYNT`, `TEMP`, `MIXD`, `ANOM`

Special:
- `ANO`, `REIN`, `TLNT`, `SECR`

Future expansions may register new codes after design approval.

## One-event-per-year rule

Exactly one visible event is produced for each chronological age.

Variants resolve the current event. Schedules reserve later years. There are no ordinary same-year visible chains.

## Selection modes

- `random` — normal hierarchical drafting
- `scheduled_only` — only by a schedule
- `mandatory_only` — only as committed route continuation
- `climax` — ending-capable priority event
- `fallback_only` — excluded from normal drafting; used only if no normal event is available

## Repeat policy

Each event declares:

- `repeatPolicy`: `once_per_run` or `repeatable`
- `repeatCooldownYears`: minimum full chronological years before the same event may recur
- `repeatMaxCount`: maximum occurrences per run; `null` means unlimited

Repeatable events are intentionally generic enough to remain coherent on later occurrences.

## Baseline coverage rule

Before age 25, a life must not fall through to a generic "nothing happens" result.

Each pre-25 life phase must contain multiple repeatable baseline events so normal drafting can still produce school, family, social, housing, or early-career development after one-time events have been exhausted.

If no eligible non-fallback event exists before age 25, validation/simulation should treat that as a **content coverage defect**.

At age 25+, a `fallback_only` quiet-year event may be used as the final safety net.

## Fallback rule

1. Try priority route/scheduled event.
2. Otherwise normal hierarchical drafting, including eligible repeatable baseline events.
3. Renormalize when selected families/channels are empty.
4. If the entire normal pool is empty:
   - `AGE < 25`: content coverage error; do not silently emit "nothing happens".
   - `AGE >= 25`: choose an eligible `fallback_only` event.

Fallback-only events never influence normal probability distribution.

## Variants

Variants are evaluated in authored order against pre-event state; first match wins. A final `TRUE` variant should normally exist.

## Material continuity

If `MAT != NONE`, unrelated ordinary transformation families are ineligible unless explicitly tagged transition/mixed/anomaly.

## Childhood

Ages 0–17 may include minor symptoms, FIX changes, screenings, and material hints, but no canonical v1 ending or irreversible Material Commitment.

## Prose

Normally one sentence, occasionally two short sentences, readable at both 1× and 2×.
