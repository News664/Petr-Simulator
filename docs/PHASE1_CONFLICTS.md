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

> ### Phase 1.2 status (2026-08-13)
>
> | Conflict | Status after Phase 1.2 patch |
> |---|---|
> | C-6 endings unreachable | Still closed as stated; the replacement ending-age problem is now tracked as **Q-27** with fresh measurements in [`PHASE1_2_FINDINGS.md`](PHASE1_2_FINDINGS.md) §1 |
> | C-7 SPC near-unreachable | **CLOSED** — six `SPC/SECR` faction seeds make SPC reachable in 53.4% of runs with no anomalous talent |
> | C-7 `AEVT` / `ACH` / `TMS` unused | Still open; no Phase 1.2 content references them |
>
> One **new** conflict was found while integrating the Phase 1.2 patch: **P12-C1**
> below. It is a content-integrity conflict, not a schema conflict.

> ### Phase 1.3 status (2026-08-13)
>
> | Conflict | Status after Phase 1.3 patch |
> |---|---|
> | P12-C1 duplicate event ID | **RATIFIED** by design in `PHASE1_3_DESIGN_RESOLUTIONS_v0.1.md`: the published Batch 005 `EVT-INS-ACA-0011` stays immutable, the Batch 006 research follow-up stays `EVT-INS-ACA-0012`, and patch validation now compares proposed IDs against the whole published corpus |
> | C-7 `AEVT` / `ACH` / `TMS` unused | `AEVT`/`ACH` still unused; **`EVT[...]` is now used** by the twelve progressive faction-news events |
>
> One **new** conflict was found while integrating the Phase 1.3 patch: **P13-C1**
> below. It is a missing-input conflict, not a schema conflict.
>
> _Correction (Phase 1.3.1):_ this sentence previously referred to "P13-C1 and
> P13-C2". No `## P13-C2` section was ever defined here or in any other
> authoritative document — the two missing inputs were written up as a single
> entry — so the count is corrected to one. Nothing was deleted.

---

> ### H2B status (2026-08-14)
>
> The 28 Batch 008 blueprints, the 13 existing-event patches and the Ending
> Registry patch all integrated with **zero source mismatches** — every patch
> target's current value matched its patch description exactly, and every
> blueprint ID, route tag, talent, ending, faction and scheduled target resolved
> against the live corpus. Four **observations** are recorded below as
> **H2B-C1 … H2B-C4**. None of them is a packaging error and none was fixed
> unilaterally: each is a consequence of frozen creative content meeting the
> live corpus, and each needs a design decision.

---

## H2B-C1 — 88% of adults who reach extreme low STR never see a Continuity Review

**Files.** `SOLID_STATE_BATCH_008_PRESSURE_BLUEPRINT_v0.1.json` (`EVT-INS-MED-2001`)
vs the H2B diagnostic plan's STR-insurance goal.

**Observation.** The diagnostic plan states that *"no long survivor should
routinely remain at extreme negative STR without review exposure."* Measured over
5 000 LOW + Batch 008 runs:

| Measure | Value |
|---|---|
| Adult runs that ever sat at STR ≤ −3 | 1 384 (27.7%) |
| …of which ever opened a Functional Continuity Review | 166 (**12.0%**) |
| Long survivors (still at STR ≤ −3 at 65+) with no review | **1 218** |
| Mean review age | 43.8 |

**Cause.** `EVT-INS-MED-2001` is gated `STR<=1` over ages **18–69** and is drafted
normally. STR is authored to decline in old age, so most extreme-low-STR
person-years occur *after* the event's window has closed, and a 120-year survivor
can spend fifty years below −3 with the insurer never opening a file.

**Not fixed.** Widening the age window is a content change beyond the frozen
blueprint. The design options are (a) raise `EVT-INS-MED-2001`'s `age.max`, (b)
author a separate late-life review entry, or (c) accept that the benefit is an
early/mid-life product and say so in the fiction.

---

## H2B-C2 — Six authored branches are unreachable in practice

**Files.** Batch 008 blueprints vs measured 5 000-run behaviour.

**Observation.** Every branch below is legal, validated and never fired:

| Event | Branch | Why |
|---|---|---|
| `EVT-INS-EDU-2001` | v2 `MNY>=7`, v3 `TRUE` | v1 `SPR>=7` catches essentially every low-INT run first; the event fires 27 times in 5 000 runs |
| `EVT-INS-LEG-2001` | v2 `INT<=2 & MNY<=3` | the batch's most predatory branch (+14 FIX) needs INT ≤ 2 **and** MNY ≤ 3 at ages 19–34; the event fires 8 times total |
| `EVT-INS-MED-2002` | v3 `STR<=-3` (expedited) | v2 `MNY>=8 \| INT>=11 \| TLT[T1015]` precedes it, and two years after a `STR<=1` trigger almost nobody is at −3 yet |
| `EVT-INS-MED-2003` | v2 independent alternative | same ordering: v1 `STR>=3` absorbs the recoveries |
| `EVT-INS-ARC-2003` | v1 `TLT[T1024] \| TLT[T1013]` → `END-LEG-002` | all 65 structural endings resolved to `END-ARC-001`; the self-ownership branch needs a specific talent among the 1.3% who reach the climax |

**Not fixed.** Reordering variants or loosening conditions is creative
rewriting, which this task forbids. Reported so design can decide whether these
branches are intentionally rare or mis-ordered.

---

## H2B-C3 — Age-semantic note on `EVT-ORD-GEN-0004`

**Observation.** The age-0/1 audit is otherwise clean: all seven events eligible
at age 0 or 1 are guardian-mediated or passive development, and the two supplied
prose patches (`EVT-ORD-FAM-0006`, `EVT-ORD-HOU-0003`) resolve the cases the
Pressure & Tone spec named. One residual concern is raised for review rather than
rewritten:

> `EVT-ORD-GEN-0004` (ages 1–5): *"Another year is mostly spent growing, falling
> down, asking questions, and being told not to touch things."*

At age 1 "asking questions" implies speech the preschool-semantics section
places at 2–3. The event is otherwise correct and its effects (INT +1, STR +1)
are age-plausible as development. **No replacement prose was invented.**

---

## H2B-C4 — There is no canonical `relocation` route tag

**Observation.** The H2B diagnostic plan asks for *"literal relocation-event
count separately from housing count."* The Route Tag Registry v1.2 has a
`housing` metadata tag but nothing that distinguishes a change of address from a
retrofit, an insurance claim or a roommate.

The diagnostic therefore declares an explicit list of nine relocation *variants*
across five events in `src/sim/h2bDiagnostic.ts`, reported in the generated
document as an analyst classification rather than canonical data.

**Recommendation.** Add a `relocation` metadata tag to the Route Tag Registry in
a later content patch and tag the moving variants, so the split becomes canonical
and the analyst list can be deleted. Not done here: adding a tag is content, and
this task forbids content beyond the supplied blueprints.

---

## P13-C1 — Two inputs the instructions require were not in the patch package

**Files.** `SOLID_STATE_PHASE1_3_PATCH_v0.2.zip` vs `CLAUDE_PHASE1_3_FULL_RUN.txt`.

**Conflict.** The full-run instruction's READ FIRST list names five documents and a
plan; the package contains four of them. Two required inputs are absent:

| Required by | Missing input |
|---|---|
| READ FIRST §5, and A.10 "Upgrade the JSON → Markdown renderer/validator per …" | `docs/SOLID_STATE_CONTENT_TOOL_PHASE1_3_REQUIREMENTS_v0.1.md` |
| A.6 "Merge Route Tag Registry patch v1.2" | any Route Tag Registry patch file |

`PATCH_MANIFEST.md` refers to both ("Content-tool v0.3 requirements so new
faction/FSM fields appear in generated review mirrors"), so they were intended to
ship.

**What was done, and why it is the smallest non-creative fix.** Neither gap
blocks integration, because in both cases the instruction states the requirement
itself:

- **Content tool.** A.10 gives the whole acceptance criterion — *"Generated
  review mirrors MUST visibly include the new faction metadata and
  factionTransitions rather than silently omitting them."* `tools/SOLID_STATE_CONTENT_TOOL_v0.3.py`
  implements exactly that and nothing more, and v0.2 moved to
  `content/superseded/`. The upgrade is provably backward compatible: re-rendering
  the four batches that carry no faction data reproduces their existing mirrors
  byte-for-byte.
- **Route Tag Registry v1.2.** A.6 gives four rules and the schema patch repeats
  them, so `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.2.json` was derived mechanically
  from those rules and from Faction Registry v0.2: each faction tag's
  `flagPrefixes` becomes exactly that faction's three `activeContextStates`
  flags, and a metadata-only `faction_news` tag was added because Batch 007 tags
  30 events with it and an unregistered `routeTag` fails validation. No tag was
  invented beyond those two mechanical consequences.

**For design.** If the intended v1.2 differs from this derivation — in
particular if `faction_news` was meant to carry a different `kind` or any flag
prefix — supply the file and it will be replaced. The derived registry is
recorded here rather than presented as canonical design.

> **Status: CLOSED (2026-08-13, Phase 1.3.1).** Design ratifies both derived
> implementations as canonical and records the gap as a **packaging error, not a
> design disagreement**
> ([`PHASE1_3_1_DESIGN_RESOLUTIONS_v0.1.md`](PHASE1_3_1_DESIGN_RESOLUTIONS_v0.1.md)).
> Ratified exactly as built:
>
> - Content Tool v0.3 renders and checks `factionIds`, `factionInteraction`,
>   `factionTransitions` and `lore_fallback_only`, so generated review mirrors do
>   not omit canonical Schema v0.4 fields.
> - Route Tag Registry v1.2 activates faction route context only for
>   `STATE_CONTACTED`, `STATE_ENGAGED` and `STATE_COMMITTED`.
> - Historical `FAC_*_CONTACT`, `STATE_OPTED_OUT` and `STATE_CLOSED` grant no
>   faction route Favor.
> - `faction_news` is metadata-only: no flag prefix, no active route Favor, no
>   Transformation-family Favor.
>
> No further action. The derivation stands as the canonical behaviour.

---

## P12-C1 — Batch 006 re-used an event ID already published in Batch 005

**Files.** `SOLID_STATE_EVENT_BATCH_006_v0.1.json` vs
`SOLID_STATE_EVENT_BATCH_005_v0.2.json`.

**Conflict.** Batch 006 shipped a new event with `id: "EVT-INS-ACA-0011"`. That
ID was already **published** in Batch 005, where the existing event also
self-references it in its own `exclude` string. Event IDs are the corpus's
primary key: the loader's cross-batch duplicate check refused to load the corpus
at all, so no simulation could run until this was resolved.

The patch's own `PHASE1_2_PATCH_VALIDATION_REPORT.md` states *"Duplicate Batch
006 IDs: 0"*, which is accurate — the check was performed **within** Batch 006
only, and so could not see the collision with an earlier batch.

**What the engine does.** `src/engine/content/load.ts` validates event IDs across
the whole corpus and raises `ContentValidationError: duplicate event id
EVT-INS-ACA-0011`. It does not silently take the last definition or merge them.

**Resolution applied — the smallest possible, and reported rather than assumed.**
The **published** Batch 005 event keeps `EVT-INS-ACA-0011`; published IDs are
immutable, and renumbering it would have invalidated its own `exclude`
self-reference. The **new, unpublished** Batch 006 event was renumbered to the
next free ID in its family, `EVT-INS-ACA-0012`. The diff is exactly two lines:

```diff
-      "id": "EVT-INS-ACA-0011",
+      "id": "EVT-INS-ACA-0012",
```

No prose, condition, effect, flag, schedule or designer note was touched, and no
other event in the corpus references the ID, so the change is fully isolated. The
renumbering is asserted in `tests/phase1_2-acceptance.test.ts` ("renumbered only
the colliding new event, leaving the published one intact") and recorded in
`docs/ENGINE_CHANGES.md`.

**For design.** If `EVT-INS-ACA-0012` is not the intended ID, say so and it will
be changed — but the published Batch 005 ID should not move. It would also be
worth extending the patch-side validation to check new IDs against the whole
published corpus rather than within the new batch only.


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
