# SOLID STATE — Phase-1 Schema & Content Conflicts

## Version 0.1 — reported by the coding agent, not resolved unilaterally

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).** Resolve them there, not here.

> ### Phase 1.1 status (2026-08-13)
>
> | Conflict | Status after patch v0.1 |
> |---|---|
> | C-1 species tendency labels | **CLOSED** — Species Registry v1.2 separates `family_tendencies` from `refinement_tags`; `MAGICAL_SEAL` is a registered hook with `family: null` |
> | C-2 talent hook polarity | **CLOSED** — Talent Registry v1.1 typed drafting columns |
> | C-3 awareness prose | **CLOSED** — Ending Registry v1.1 structured columns |
> | C-4 / C-4a route tag namespaces | **CLOSED** — Route Tag Registry v1.0, including the `academic` TRN rule as a per-tag field |
> | C-5 ages 0–5 coverage | **CLOSED** — Batch 005; 0% defect rate under strict policy |
> | C-6 endings unreachable | **CLOSED as stated**, but replaced by a new ending-age-shape problem — see [`PHASE1_1_FINDINGS.md`](PHASE1_1_FINDINGS.md) finding 2 |
> | C-7 unreachable content | **PARTIALLY CLOSED** — SPC, `mandatory_only`, END-ANO-001/002 and 65+ endings all now exist and occur; SPC remains near-unreachable without anomalous talents, and `AEVT`/`ACH`/`TMS` are still unused by content |
>
> This document is retained as the Phase-1 record. New conflicts are recorded in
> `PHASE1_1_FINDINGS.md`.


Filed under the conflict protocol in `SOLID_STATE_CODING_AGENT_HANDOFF_v0.1.md` §6
and the return-to-design triggers in `SOLID_STATE_AGENTS_v0.2.md`.

**No creative content was changed.** Every canonical file in `content/` is
byte-identical to `SOLID_STATE_PROJECT_SNAPSHOT_v0.7`. Where the schema could
not represent the supplied content cleanly, the engine reads a separate,
clearly-labelled provisional adapter file
(`content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json`) and the
conflict is reported here with the smallest proposed schema change.

Each entry gives: the conflicting files and rules, what cannot coexist, what the
engine does today, and the smallest implementation-neutral resolution.

---

## C-1 — Species tendencies are finer-grained than the family taxonomy

**Files.** `SOLID_STATE_SPECIES_REGISTRY_v1.1.json` vs
`SOLID_STATE_EVENT_TAXONOMY_v0.2.md` and
`SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json`.

**Conflict.** `familyEvidenceScalar.speciesPrimary/Secondary/Uncommon` are
applied per *family*, and the taxonomy's transformation families are exactly
`STON METL CRYS WOOD GLAS CERA SYNT TEMP MIXD ANOM`. The Species Registry's
`primary`/`secondary`/`uncommon` arrays instead hold refinement labels that are
not family codes:

`STON_FINE`, `STON_VOLCANIC`, `CONCRETE`, `CONCRETE_HEAVY`, `CONCRETE_CRUDE`,
`METL_INDUSTRIAL`, `METL_INDUSTRIAL_CRUDE`, `METL_PRECIOUS`, `BRONZE`,
`CRYS_DELICATE`, `CRYS_GEMSTONE`, `GLAS_OBSIDIAN`, `WOOD_NATURAL`,
`ARC_COMPOSITE`, `SYNT_INDUSTRIAL`, `MAGICAL_SEAL`.

There is no canonical mapping from those labels to family codes, so the species
evidence scalar cannot be applied without one.

Collapsing also creates *tier collisions* the registry never anticipated:
WINGED_KIN lists `STON_FINE` as primary and `CONCRETE_CRUDE` as uncommon, and
both collapse to `STON`. DWARF has the same collision between `STON`/`CONCRETE`
and between `METL_INDUSTRIAL`/`BRONZE`.

`MAGICAL_SEAL` (DEMONKIN secondary) has no plausible family code at all. `ANOM`
is the obvious candidate but is stated nowhere canonical.

**Current engine behaviour.** `speciesTendencyFamilyMap` in the adapters file
maps each label to a family; `MAGICAL_SEAL` is listed under
`speciesTendencyUnmapped` and contributes no scalar. On a tier collision the
strongest tier wins (primary > secondary > uncommon). Loading fails if a species
tendency label is neither mapped nor explicitly declared unmapped, so a future
registry label cannot be silently ignored.

**Smallest proposed schema change.** Add an explicit family to each tendency
entry in the Species Registry, so the refinement label keeps its creative
meaning and the engine gets a code:

```json
"primary": [ { "label": "STON_FINE", "family": "STON" } ]
```

or, if the array shape must stay flat, add one registry-level table:

```json
"tendency_family_map": { "STON_FINE": "STON", "MAGICAL_SEAL": "ANOM" }
```

Either way `MAGICAL_SEAL` needs a design decision, and the WINGED_KIN /
DWARF tier collisions need confirming or re-authoring.

---

## C-2 — Talent hooks are prose without polarity

**Files.** `SOLID_STATE_TALENT_REGISTRY_v1.0.csv` vs
`SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json`
(`familyEvidenceScalar.talentFavor / talentStronglyFavor / talentSuppress`).

This conflict is **anticipated** by balance-constants note 4: *"Exact talent
channel/family hooks may require a small adapter table because the current
Talent Registry stores qualitative hook labels."* Recorded here for completeness.

**Conflict.** `channel_hooks` and `family_hooks` are semicolon-separated prose
labels (`medical; investigation`, `celebrity; political_symbol; display`,
`stone; craft; restoration`). They carry no polarity — whether a hook favours,
strongly favours, or suppresses is stated only in the English `hidden_effects`
sentence. Many labels have no taxonomy family at all: `investigation`,
`celebrity`, `luxury`, `outdoor`, `memorial`, `display`, `craft`, `restoration`,
`symptom`, `labor`, `identity`, `continuity`, `bureaucracy`, `preservation`,
`species_registration`, `reincarnation`, `fracture`, `anomaly`, `rare`,
`hidden`, `art`, `ownership`, `soul`, `memory`, `insurance`,
`transformation_symptom`, `political_symbol`.

**Current engine behaviour.** `talentAdapters` encodes a scalar **only** where
the registry sentence states a family- or channel-level *Favors* / *Strongly
favors* / *Suppresses*. Sentences using "unlocks", "enables", "may redirect", or
hedged scope ("suppresses **some** early warning events") grant no scalar; their
labels are preserved verbatim under `unmappedHooks` alongside the source
sentence. That leaves 11 of 30 talents with a drafting scalar and 19 with none —
a deliberately conservative reading, since inventing polarity would be inventing
design.

**Smallest proposed schema change.** Add two typed columns to the Talent
Registry, leaving the prose columns untouched:

```
drafting_favor:          "COR; FIN"        (family or channel codes)
drafting_strongly_favor: "MUS"
drafting_suppress:       "CIV; MUS"
```

Design also needs to decide whether the currently-unmapped labels are (a)
narrative-only, (b) future family codes, or (c) a separate sub-family tag axis.

---

## C-3 — Ending Registry `default_awareness` holds prose alternatives

**Files.** `SOLID_STATE_ENDING_REGISTRY_v1.0.csv` vs
`SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md` §23.

**Conflict.** The contract gives a two-branch default (temporal → `Suspended`,
otherwise `Unconscious`) plus a list of rare states requiring authored
authorization. The registry's `default_awareness` column instead holds seven
distinct free-text values, three of which are not single states:

| Value | Endings | Problem |
|---|---|---|
| `Unconscious; Suspended if temporal` | 2 | conditional rule in prose |
| `Unconscious or Uncertain` | 1 | two states, no precedence stated |
| `Continuous or Intermittent` | 1 | two states, both authorization-gated |

Note also that §23 lists `Continuous`, `Intermittent` and `Displaced` as
requiring authored authorization but **not** `Uncertain`, even though `Uncertain`
appears in the same "rare explicit states" list. The engine treats `Uncertain` as
not requiring authorization, following the explicit authorization sentence over
the list.

**Current engine behaviour.** `endingAwarenessRules` maps each of the seven
registry strings to an ordered rule list with an optional material guard and an
optional authorization requirement. `"Unconscious or Uncertain"` resolves to the
first-listed state. `"Continuous or Intermittent"` resolves to `Continuous` only
when an authorizing talent is held, otherwise falling through to the contract
default. Authorizing talents come from `endingAwarenessAuthorizingTalents`
(END-ANO-001 → T1028, END-ANO-002 → T1029), which is read from the endings'
own designer notes. Content loading fails if the registry gains an awareness
string with no rule, so this cannot drift silently.

**Smallest proposed schema change.** Split the column:

```
default_awareness:            Unconscious
default_awareness_if_temporal: Suspended
awareness_requires_authorization: true|false
```

---

## C-4 — Route tags have no declared link to route flag namespaces

**Files.** `SOLID_STATE_TAG_REGISTRY_v0.6.md` and the events' `routeTags` vs
`familyEvidenceScalar.routeFavor`.

**Conflict.** `routeFavor` is meant to apply when "matching active route context"
is present, but `routeTags` are authoring metadata (`corporate`, `museum`,
`midlife`, `baseline`, `survivor`, …) while route state is carried by flags in
namespaces (`ROUTE_COR_*`, `ROUTE_MUS_*`, `EDU_*`). Nothing canonical connects
the two vocabularies, and 17 of the 28 authoring tags have no flag namespace at
all.

**Current engine behaviour.** `routeTagFlagPrefixes` maps the 12 tags that do
have a namespace; the rest are listed under `routeTagsWithoutFlagNamespace` and
contribute nothing. An event receives at most one route-favor multiplier
regardless of how many of its tags match.

**Sub-conflict C-4a — the academic route biases a material.**
`SOLID_STATE_EVENT_DRAFTING_RULES_v0.2.md` §"Comparative Materials" states the
route *"must not favor one specific final material merely because the route is
active"*. But `EVT-TRN-TEMP-0001` and `EVT-TRN-TEMP-0002` both carry the
`academic` routeTag, so a naive route-favor scalar would multiply the TEMP
family for every academic run — exactly the forbidden behaviour. The engine
therefore reads `routeTagsWithNoTransformationFavor: ["academic"]` and grants no
route-favor to `academic` on TRN-channel events (it still applies on
ORD/INS/SPC). Regression-tested in `tests/acceptance-l-m-n-endings.test.ts`.

**Smallest proposed schema change.** Declare the mapping in the Tag Registry,
one line per route tag:

```
| Tag | Flag namespace | Favors transformation families |
| corporate | ROUTE_COR_ | yes |
| academic  | ROUTE_ACA_ | no  |
```

---

## C-5 — Ages 0–5 are provisioned with zero coverage slack (**blocking**)

**Files.** `content/events/SOLID_STATE_EVENT_BATCH_*.json` vs
`SOLID_STATE_EVENT_TAXONOMY_v0.2.md` §"Baseline coverage rule" and
`SOLID_STATE_CONTENT_AUDIT_v0.2.md` ("Pre-25 repeatable baseline coverage gaps:
**0** PASS").

**Conflict.** Ages 0–5 are six chronological years. Exactly four events are
eligible in that band:

| Event | Age | Repeat | Max event-years in 0–5 |
|---|---|---|---:|
| `EVT-INS-CIV-0001` | 0–3 | once_per_run | 1 |
| `EVT-ORD-FAM-0001` | 2–5 | once_per_run | 1 |
| `EVT-ORD-FAM-0006` | 0–5 | once_per_run | 1 |
| `EVT-ORD-FAM-0002` | 0–5 | repeatable, cooldown 2, max 3 | 3 |
| | | **total** | **6** |

Capacity equals demand exactly, with no margin — and the third occurrence of
`EVT-ORD-FAM-0002` is only reachable if its *first* occurrence lands at age 0 or
1 (giving 0/2/4 or 1/3/5). Ordinary weighted drafting has no lookahead, so
whenever the repeatable lands on the wrong parity the band runs dry.

**Measured impact.** Under the strict, contract-faithful policy,
**83–85% of runs across all five talent scenarios terminate at age 4 or 5** with
a content coverage defect (`reports/monte-carlo-strict.md`, 2 000 runs ×
5 scenarios). This is not a probabilistic edge case; it is the modal outcome.

The audit's "0 PASS" appears to have counted capacity rather than
schedulability, which is why static validation did not catch it.

**Current engine behaviour.** Default `pre25CoveragePolicy: "strict"` — the
engine reports the defect and stops the run, exactly as the taxonomy requires
("do not silently emit *nothing happens*"). Because that makes every other
Phase-1 metric unmeasurable, the CLI also offers
`--pre25-coverage reuse_baseline_repeatables`, which on an otherwise-empty
pre-25 year re-drafts from `baseline`-tagged repeatable events while ignoring
`repeatCooldownYears` and `repeatMaxCount`. It never emits a `fallback_only`
event before age 25 and never alters content. The main report
(`reports/monte-carlo.md`) uses that diagnostic policy and labels it in every
scenario header.

**Smallest resolution — content, not schema.** Any one of:

1. add 2–3 repeatable `baseline` ORD/FAM/GEN events covering ages 0–5;
2. raise `EVT-ORD-FAM-0002`'s `repeatMaxCount` and lower its cooldown to 1;
3. widen an existing childhood event's age range to overlap the band.

Option 1 is the most robust: it restores margin rather than relying on exact
parity. This is a content-authoring decision, so the engine takes none of them.

---

## C-6 — Endings are effectively unreachable at the provisional FIX gates

**Files.** `content/events/SOLID_STATE_EVENT_BATCH_*.json` (FIX effects and
climax `include` conditions) vs `SOLID_STATE_ROUTE_RULES_v1.0.md`
"Permanent Form age targets" and `targetEndingAgeShare`.

**Conflict.** Every canonical ending arrives through a `climax`-priority
schedule, and nine of the twelve climax events gate on `FIX>=55`
(`EVT-INS-MED-0003` needs `FIX>=50`, `EVT-TRN-TEMP-0002` needs `FIX>=45`). But
the total FIX available in the whole content slice is bounded:

| Source | FIX | Notes |
|---|---:|---|
| `EVT-INS-EDU-0002` | +1 | ages 8–11 |
| `EVT-TRN-WOOD-0001` | +2 | ages 12–17 |
| six manifestation events (`*-0001`, WOOD/STON/METL/GLAS/CRYS/CERA) | +5 each = +30 | all ages 18–34 |
| `EVT-TRN-TEMP-0001` | +6 | ages 20–44 |
| **pre-commitment ceiling** | **39** | commitment needs `FIX>=35` |
| commitment event | +7 or +8 | |
| `EVT-TRN-MIXD-0001` | +5 | requires the museum mixed-material route |
| `EVT-INS-ACA-0008` | +2 | requires the academic route |
| `EVT-INS-MED-0004` | +2 | ages 45–69 |
| **lifetime ceiling** | **≈56** | vs `FIX>=55` for most climaxes |

Reaching a climax therefore requires drafting very nearly every FIX-granting
event in the game, in order, inside its age window — while those events are
LOW/NORMAL weight and compete against a much larger ORD/INS pool.

**Measured impact** (10 000 runs × 5 scenarios, `reports/monte-carlo.md`):

| Scenario | Completed | Material committed | Final FIX p99 / max |
|---|---:|---:|---:|
| no-talents | **0.10%** | 16.0% | 49 / 53 |
| uniform-three | **0.73%** | 22.0% | 51 / 61 |
| threshold-talents | **0.09%** | 15.5% | 49 / 52 |
| material-talents | **0.16%** | 15.2% | 50 / 52 |
| anomalous-talents (holds T1027) | **6.42%** | 81.7% | 55 / 62 |

The anomalous scenario is the control: T1027's provisional +15 start FIX raises
completion **64×** and commitment **5×**, confirming FIX headroom — not route
density, not weighting — is the single binding constraint.

Consequently `targetEndingAgeShare` is missed in every band in every scenario,
95–99% of route schedules expire unfired, and only 1–14 of 24 endings are ever
observed.

**Why this is reported, not fixed.** The handoff forbids finalizing gameplay
balance and requires provisional constants to stay data-driven; the acceptance
tests require this report to exist *before* multipliers are frozen. Any of the
plausible fixes — more FIX sources, lower climax thresholds, a per-year FIX
drift, higher TRN weighting — is a design decision.

**Note.** No canonical file specifies a per-year FIX drift, and
`BALANCE_CONSTANTS` has no field for one. If FIX was intended to accumulate
passively with age, that field is simply missing from the schema, and adding it
would be the smallest change that reconciles the gates with the content.

---

## C-7 — Unreachable and unexercised content

Reported for completeness; none blocks Phase 1.

- **No `SPC`-channel events exist.** `ageChannelWeights` gives Route/Special up
  to 13% of the channel budget from age 12, and T1023 *"strongly favors
  Route/Special"*, but the slice contains zero `SPC` events. The engine's
  empty-channel renormalization absorbs this correctly; the weight is simply
  redistributed. Observed SPC share is 0% in every age band.
- **No `mandatory_only` events exist.** Priority class 2 (mandatory committed
  route continuation) is implemented and tested against fixtures, but no
  canonical content exercises it. Canonical schedules use only `scheduled` and
  `climax` priorities.
- **`END-ANO-001` and `END-ANO-002` are unreachable.** Both are referenced by no
  event variant, so the anomalous endings that T1028/T1029 are written for
  cannot occur. Ending coverage is capped at 22/24 by content.
- **`AEVT`, `ACH` and `TMS` are unused by canonical content.** All three are
  implemented and tested against fixtures, but no event condition references
  them, so reincarnation-aware content is not yet exercised. `ACH[...]` has no
  registry to validate against — the achievements registry is listed as a future
  deliverable — so unknown achievement IDs evaluate to false rather than
  failing validation.
- **`zh-TW` is empty for all 106 events.** Expected and correct; the engine
  preserves the empty strings and invents no translations.
- **First-manifestation is skewed to WOOD.** `EVT-TRN-WOOD-0001` is the only
  manifestation event available before age 18 (ages 12–17), so WOOD is the first
  manifestation in ~53% of runs while the other six families each take ~8–10%.
  Every other manifestation event opens at exactly age 18, so
  `averageFirstManifestationAge` is pinned at 18.3–18.5 in every scenario.
