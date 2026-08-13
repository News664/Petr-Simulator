# SOLID STATE — Open Questions Register

## Version 0.3 — the official decision list (Phase 1 + Phase 1.1 + Phase 1.2)

This file is the **single authoritative list of everything the coding agent could
not decide alone**. Anything discussed in a chat log but not written here is not
official.

**Phase 1.1 update (decisions dated 2026-08-13).** The design resolutions in
[`PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md`](PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md) have
been merged into the Resolution blocks below; that file is the input record, not
a second register. Measured outcomes are in
[`PHASE1_1_FINDINGS.md`](PHASE1_1_FINDINGS.md).

**Phase 1.2 update (decisions dated 2026-08-13).** The design resolutions in
[`PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md`](PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md) have
been merged the same way, adding **Q-27** and a `_Phase 1.2 outcome_` line to
Q-02, Q-10, Q-14, Q-19, Q-22, Q-23 and Q-24. Measured outcomes are in
[`PHASE1_2_FINDINGS.md`](PHASE1_2_FINDINGS.md). Four questions remain
deliberately open: **Q-14, Q-23, Q-25, Q-27**; **Q-24** is now resolved.

Every open question has a stable ID (`Q-nn`). Resolve one by editing its
**Resolution** block in place — set `Status`, write the decision, and note which
files change. Do not delete resolved questions; they are the design record.

### How to use this file with another AI tool

Each entry is self-contained: the question, the evidence with file paths, the
options with trade-offs, what the engine does today, how to change it, and a
recommendation. An agent should be able to act on a single entry without reading
the rest of the repository.

When a resolution requires an engine change, the "Engine change required" line
names the exact file and field. When it requires content or registry authoring,
that is stated explicitly — **the coding agent will not author creative content
or rewrite registries without a decision here.**

### Status vocabulary

| Status | Meaning |
|---|---|
| `OPEN` | Needs a design decision |
| `RATIFY` | Engine already behaves a certain way; needs confirmation or correction |
| `RESOLVED` | Decided — resolution recorded below the entry |

---

## Summary

| ID | Question | Owner | Blocking | Status |
|---|---|---|---|---|
| [Q-01](#q-01) | How should ages 0–5 be given coverage slack? | Content | **yes** | `RESOLVED` |
| [Q-02](#q-02) | How should the FIX economy reach the climax gates? | Balance | **yes** | `RESOLVED` (numbers experimental) |
| [Q-03](#q-03) | Should any ending be reachable after age 64? | Content | **yes** | `RESOLVED` |
| [Q-04](#q-04) | How do species tendency labels map to family codes? | Design | no | `RESOLVED` |
| [Q-05](#q-05) | What polarity do talent channel/family hooks carry? | Design | no | `RESOLVED` |
| [Q-06](#q-06) | How should `default_awareness` prose be structured? | Design | no | `RESOLVED` |
| [Q-07](#q-07) | How do route tags map to route flag namespaces? | Design | no | `RESOLVED` |
| [Q-08](#q-08) | Is `repeatCooldownYears` "at least C" or "more than C"? | Design | no | `RESOLVED` |
| [Q-09](#q-09) | Is `validityCondition` a fire gate or a destruction test? | Design | no | `RESOLVED` |
| [Q-10](#q-10) | Should family weight follow content density? | Balance | no | `RESOLVED` (Phase 1.1) |
| [Q-11](#q-11) | How should same-class priority ties break? | Design | no | `RESOLVED` |
| [Q-12](#q-12) | Should visible stats be clamped? | Design | no | `RESOLVED` |
| [Q-13](#q-13) | What does `TMS` mean? | Design | no | `RESOLVED` |
| [Q-14](#q-14) | How much starting FIX does T1027 grant? | Balance | no | **`OPEN`** / deferred |
| [Q-15](#q-15) | What registered species do T1025 and T1030 assign? | Design | no | `RESOLVED` |
| [Q-16](#q-16) | What is the baseline starting FIX? | Balance | no | `RESOLVED` |
| [Q-17](#q-17) | Is the diagnostic allocation policy player-realistic? | Design | no | `RESOLVED` |
| [Q-18](#q-18) | Does `Uncertain` awareness require authorization? | Design | no | `RESOLVED` |
| [Q-19](#q-19) | Should `SPC` channel content exist? | Content | no | `RESOLVED` |
| [Q-20](#q-20) | Should any route use `mandatory_only`? | Content | no | `RESOLVED` |
| [Q-21](#q-21) | How are `END-ANO-001` / `END-ANO-002` reached? | Content | no | `RESOLVED` |
| [Q-22](#q-22) | Should first manifestation be 52% WOOD and pinned to 18? | Content | no | `RESOLVED` |
| [Q-23](#q-23) | Is a 35% adult fallback share acceptable? | Content | no | **`OPEN`** / monitor |
| [Q-24](#q-24) | Is T1017's activation profile intended? | Balance | no | `RESOLVED` (Phase 1.2) |
| [Q-25](#q-25) | What is the achievements registry, for `ACH[id]`? | Design | no | **`OPEN`** / deferred |
| [Q-26](#q-26) | Should FIX drift passively with age? | Balance | no | `RESOLVED` |
| [Q-27](#q-27) | How should the ending-age distribution be shaped? | Content | **yes** | **`OPEN`** (content shape resolved, 25–34 gap new) |

---

# Tier 1 — blocking the balance freeze

<a id="q-01"></a>
## Q-01 — How should ages 0–5 be given coverage slack?

**Owner** Content · **Blocking** yes · **Status** `OPEN`
**Evidence** [`PHASE1_CONFLICTS.md#C-5`](PHASE1_CONFLICTS.md) · [`PHASE1_FINDINGS.md §1`](PHASE1_FINDINGS.md) · `reports/monte-carlo-strict.md`

Ages 0–5 are six chronological years served by exactly four eligible events
supplying exactly six event-years:

| Event | Age | Repeat | Max event-years in 0–5 |
|---|---|---|---:|
| `EVT-INS-CIV-0001` | 0–3 | once_per_run | 1 |
| `EVT-ORD-FAM-0001` | 2–5 | once_per_run | 1 |
| `EVT-ORD-FAM-0006` | 0–5 | once_per_run | 1 |
| `EVT-ORD-FAM-0002` | 0–5 | repeatable, cooldown 2, max 3 | 3 |

Capacity equals demand with zero margin, and the third occurrence of
`EVT-ORD-FAM-0002` is reachable only if its first lands on age 0 or 1. Weighted
drafting has no lookahead, so **83–85% of runs across all five scenarios
terminate at age 4 or 5** with a content coverage defect.

`SOLID_STATE_CONTENT_AUDIT_v0.2.md` reports "Pre-25 repeatable baseline coverage
gaps: 0 PASS", which appears to have measured capacity rather than
schedulability.

**Options**

| # | Option | Trade-off |
|---|---|---|
| A | Author 2–3 new repeatable `baseline` ORD/FAM/GEN events covering ages 0–5 | Restores real margin; requires new prose (**recommended**) |
| B | Lower `EVT-ORD-FAM-0002` cooldown to 1 and raise `repeatMaxCount` | No new prose, but one event carries most of early childhood, and the fit stays exact |
| C | Widen an existing childhood event's age range to overlap 0–5 | Cheapest; may contradict the event's authored meaning |
| D | Permit `fallback_only` before age 25 | **Contradicts** Taxonomy v0.2 and Contract §10; listed only to be ruled out |

**Engine today** `pre25CoveragePolicy: "strict"` — reports the defect and stops
the run, as the taxonomy requires. `--pre25-coverage reuse_baseline_repeatables`
is a diagnostic-only escape hatch used to produce `reports/monte-carlo.md`; it
alters no content and never emits a fallback before 25.

**Engine change required** None for A–C. The diagnostic policy should be deleted
from `content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json` once
this is closed.

**Recommendation** Option A. It is the only option that leaves margin for future
`include` conditions on childhood events.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Solve the defect with a **broader childhood event pool**, not by increasing reuse of one repeatable. Batch 005 adds six varied ages 0–5 events (five once-per-run, one lightly repeatable). Validation replaces capacity-only reasoning with schedulability checking that models once-per-run consumption, cooldown, max count, age windows and reachable selection history.
> _Files changed_: Event Batch 005; Content Schema v0.3; `src/engine/simulation.ts` (escape hatch removed); `tests/phase1_1-acceptance.test.ts` §1.
> _Outcome_: **Verified.** 0 coverage defects in 720 strict runs across all six species; minimum eligible non-fallback events at ages 0–5 is now ≥2 at every reachable state. The `reuse_baseline_repeatables` diagnostic policy has been deleted.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-02"></a>
## Q-02 — How should the FIX economy reach the climax gates?

**Owner** Balance · **Blocking** yes · **Status** `OPEN`
**Evidence** [`PHASE1_CONFLICTS.md#C-6`](PHASE1_CONFLICTS.md) · [`PHASE1_FINDINGS.md §2`](PHASE1_FINDINGS.md)

Every canonical ending arrives through a `climax`-priority schedule. The twelve
climax events gate as follows:

```
FIX>=55  EVT-INS-COR-0003  EVT-INS-MUS-0003  EVT-INS-ARC-0002  EVT-ORD-FAM-0004
         EVT-INS-FIN-0005  EVT-INS-REL-0003  EVT-INS-CIV-0006  EVT-INS-ACA-0005
         EVT-INS-ACA-0006  EVT-INS-MUS-0005
FIX>=50  EVT-INS-MED-0003
FIX>=45  EVT-TRN-TEMP-0002
```

Total FIX available anywhere in the content slice is ~39 before commitment
(commitment itself needs `FIX>=35`) and ~56 across an entire life. Reaching a
climax therefore requires drafting nearly every FIX-granting event inside its age
window, while those events are LOW/NORMAL weight against a much larger ORD/INS
pool.

Measured (10 000 runs × 5 scenarios):

| Scenario | Completed | Committed | FIX p99 / max |
|---|---:|---:|---:|
| no-talents | 0.10% | 16.0% | 49 / 53 |
| uniform-three | 0.73% | 22.0% | 51 / 61 |
| threshold-talents | 0.09% | 15.5% | 49 / 52 |
| material-talents | 0.16% | 15.2% | 50 / 52 |
| anomalous-talents (holds T1027) | 6.42% | 81.7% | 55 / 62 |

The anomalous scenario is the control: it differs only by T1027's provisional
+15 start FIX, and completion rises **64×**. FIX headroom — not route density,
not channel weighting — is the single binding constraint.

**This one finding causes** the miss on every `targetEndingAgeShare` band, the
34–35% adult fallback share (Q-23), the 95–99% schedule expiry rate, and the
1–14 of 24 ending coverage. Most other numbers in the report will move once this
is decided, so it should be decided before anything downstream is tuned.

**Options** (not mutually exclusive)

| # | Option | Trade-off |
|---|---|---|
| A | Add a per-year FIX drift to `BALANCE_CONSTANTS` | Makes fixation a function of age; needs a new schema field — see Q-26 |
| B | Lower climax thresholds (e.g. 55 → 40) | No new content; changes 10 authored `include` strings |
| C | Add more FIX-granting events, especially ages 25–45 | Preserves thresholds; requires new prose |
| D | Raise `ageChannelWeights` TRN share and/or transformation `weightClass` | Cheapest; raises the odds of drafting the existing FIX events without changing their values |
| E | Raise the FIX values on existing manifestation events | Small edit; concentrates variance into fewer draws |

**Engine today** No FIX drift exists, because no canonical file specifies one.
All values above come from content and `BALANCE_CONSTANTS` unmodified.

**Engine change required** Option A only, and only to read a new field; the
engine hard-codes no FIX behaviour. B/C/D/E are content or balance edits.

**Recommendation** Decide the *intended shape* first — is fixation something
that accumulates with age (A), or something a life's events cause (C/D/E)? The
answer determines whether B is a fix or a patch.

> **Resolution** — _status_: **RESOLVED (design) / numbers experimental**
> _Decision_: FIX stays **event-driven**; no passive drift. Batch 005 adds visible FIX sources and multi-year chains. Commitment/climax gates should be lower than the original provisional values, but exact numbers are not frozen — run LOW/MID/HIGH plus ORIGINAL_REFERENCE from the experiment matrix.
> _Files changed_: Batch 005; `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`; `src/sim/experiments.ts`.
> _Outcome_: **Swept, not frozen.** Completion: LOW 64.0%, MID 47.7%, HIGH 35.8%, ORIGINAL_REFERENCE 9.9% (4 000 runs each). A new problem is now visible: endings arrive far too late in every profile — see [`PHASE1_1_FINDINGS.md`](PHASE1_1_FINDINGS.md) finding 2 and the follow-up question raised there. Design still picks the profile.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: Do **not** select LOW/MID/HIGH and do **not** globally change existing climax thresholds in this patch. Route-specific low gates authored in Batch 006 are intentional where an external institution causes conversion without high spontaneous FIX. No sweep was run.
> _Phase 1.2 outcome_: Under **authored current thresholds** the new content moves the distribution without any threshold change: completion 60.2%, mean FIX at commitment 28.4, mean FIX at ending 29.0, final FIX p50/p90/p99 = 29/48/55. The remaining misses are structural rather than numeric — see [`PHASE1_2_FINDINGS.md`](PHASE1_2_FINDINGS.md) §1.1. Thresholds stay unfrozen and the sweep harness stays available.

---

<a id="q-03"></a>
## Q-03 — Should any ending be reachable after age 64?

**Owner** Content · **Blocking** yes · **Status** `OPEN`
**Evidence** [`PHASE1_FINDINGS.md §2`](PHASE1_FINDINGS.md)

The latest `age.max` on any climax event is **64** (`EVT-INS-CIV-0006`,
`EVT-INS-ACA-0005`, `EVT-INS-ACA-0006`, `EVT-INS-MUS-0005`). But
`targetEndingAgeShare` and `SOLID_STATE_ROUTE_RULES_v1.0.md` both allocate
**2–5% of Permanent Forms to age 65+**, and 4–7% to 55–64.

The 65+ band is therefore unreachable **by construction**, independent of any
balance change. No amount of FIX tuning can produce an ending there.

**Options**

| # | Option | Trade-off |
|---|---|---|
| A | Extend `age.max` on one or more late climax events past 64 | Smallest change; may contradict the authored meaning of a mid-life climax |
| B | Author a late-life climax family (65+) | Correct if late-life Permanent Forms are a distinct narrative |
| C | Drop the 65+ target band from `targetEndingAgeShare` | Correct if the intent was always that lives end before 65 |

**Engine change required** None. The engine reports the band as out-of-target and
will keep doing so until content or the target changes.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Keep the 65+ target band. Late-life Permanent Forms are a distinct second-wave narrative rather than mid-life climaxes remaining eligible forever. Batch 005 adds dedicated 65+ Medical and Family route entries/climaxes.
> _Files changed_: Batch 005 (`EVT-INS-MED-0012`, `EVT-ORD-FAM-0011`).
> _Outcome_: **Reachable — and now over-reached.** Endings at 65+ occur, satisfying the addendum. But under the *authored* v0.2 gates the late climaxes gate at `FIX>=40` while mid-life ones gate at `FIX>=55`, making late-life the easiest ending path: 74–92% of endings land at 65+ against a 2–5% target. See findings finding 2.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

# Tier 2 — representational, blocking retirement of the adapter file

These four exist only because canonical registries store prose where the engine
needs codes. Resolving them lets
`content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json` be deleted
and its content folded back into the registries.

<a id="q-04"></a>
## Q-04 — How do species tendency labels map to family codes?

**Owner** Design · **Blocking** no · **Status** `OPEN`
**Evidence** [`PHASE1_CONFLICTS.md#C-1`](PHASE1_CONFLICTS.md)

`SOLID_STATE_SPECIES_REGISTRY_v1.1.json` lists tendencies as refinement labels
(`METL_INDUSTRIAL`, `STON_FINE`, `GLAS_OBSIDIAN`, `BRONZE`, `CONCRETE_HEAVY`, …)
which are not Event Taxonomy v0.2 family codes, so
`familyEvidenceScalar.speciesPrimary/Secondary/Uncommon` cannot be applied
without a mapping.

**Three sub-decisions:**

1. **The mapping itself.** The engine's provisional map is in
   `speciesTendencyFamilyMap`. Please confirm or correct it.
2. **`MAGICAL_SEAL`** (DEMONKIN secondary) has **no** plausible family code.
   `ANOM` is the obvious candidate but is stated nowhere canonical. Currently
   declared unmapped and contributing no scalar. **This needs an explicit answer.**
3. **Tier collisions.** Collapsing loses information where one species lists two
   refinements of the same family in different tiers:
   - `WINGED_KIN`: `STON_FINE` (primary) and `CONCRETE_CRUDE` (uncommon) → both `STON`
   - `DWARF`: `STON`/`CONCRETE` and `METL_INDUSTRIAL`/`BRONZE`
   The engine resolves these strongest-tier-wins. Is that the intent, or should
   fine/crude refinements be a separate axis from family tendency?

**Proposed schema change** Add a family to each tendency entry:
`"primary": [ { "label": "STON_FINE", "family": "STON" } ]`, or add a
registry-level `tendency_family_map`.

**Engine change required** `src/engine/content/load.ts::collapseSpeciesTendencies`
would read the registry directly instead of the adapter.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Do not collapse refinement labels into broad-family tiers. Use two layers: (1) broad family tendency at family selection; (2) optional refinement hook at local event selection. No extra refinement drafting stage. `MAGICAL_SEAL` is a registered special hook with no broad material family.
> _Files changed_: Species Registry v1.2; `src/engine/drafting.ts` (`familyEvidenceScalar` / `eventContextScalar`).
> _Outcome_: Implemented and tested. The drafting pipeline still has exactly three weighted stages (asserted in `tests/phase1_1-acceptance.test.ts` §3). `MAGICAL_SEAL` carries `family: null` and contributes no family scalar anywhere.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-05"></a>
## Q-05 — What polarity do talent channel/family hooks carry?

**Owner** Design · **Blocking** no · **Status** `OPEN`
**Evidence** [`PHASE1_CONFLICTS.md#C-2`](PHASE1_CONFLICTS.md) · anticipated by `BALANCE_CONSTANTS` note 4

`channel_hooks` / `family_hooks` in the Talent Registry are prose labels with no
polarity; whether a hook favours, strongly favours or suppresses is stated only
in the English `hidden_effects` sentence. Many labels have no family code at all
(`investigation`, `celebrity`, `luxury`, `outdoor`, `memorial`, `display`,
`craft`, `restoration`, `symptom`, `labor`, `identity`, `continuity`,
`bureaucracy`, `preservation`, `species_registration`, `reincarnation`,
`fracture`, `anomaly`, `rare`, `hidden`, `art`, `ownership`, `soul`, `memory`,
`insurance`, `transformation_symptom`, `political_symbol`).

**Engine today** Conservative: a scalar is encoded **only** where the registry
sentence states a family- or channel-level *Favors* / *Strongly favors* /
*Suppresses*. "Unlocks", "enables", "may redirect" and hedged scope
("suppresses **some** early warning events") grant nothing. That leaves **11 of
30 talents with a drafting scalar and 19 with none**, with every unmapped label
preserved verbatim under `unmappedHooks` beside its source sentence.

**Two sub-decisions:**

1. Confirm or correct the 11 encoded talents in `talentAdapters`.
2. Decide what the unmapped labels are: (a) narrative-only, (b) future family
   codes, or (c) a separate sub-family tag axis.

**Proposed schema change** Add typed columns beside the prose ones:
`drafting_favor`, `drafting_strongly_favor`, `drafting_suppress`.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Add typed talent machine semantics. `drafting_favor` / `drafting_strongly_favor` / `drafting_suppress` change weighted drafting; `unlock_tags` / `redirect_tags` / `narrative_tags` are structured metadata and never become multipliers automatically.
> _Files changed_: Talent Registry v1.1; `src/engine/content/load.ts`; `src/engine/drafting.ts`.
> _Outcome_: Implemented. 10 of 30 talents now carry a typed drafting operation. A test asserts that talents holding only unlock/redirect/narrative tags produce a scalar of exactly 1 on every channel and family.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-06"></a>
## Q-06 — How should `default_awareness` prose be structured?

**Owner** Design · **Blocking** no · **Status** `OPEN`
**Evidence** [`PHASE1_CONFLICTS.md#C-3`](PHASE1_CONFLICTS.md)

Three of the seven distinct `default_awareness` values are not single states:

| Value | Endings | Problem |
|---|---:|---|
| `Unconscious; Suspended if temporal` | 2 | conditional rule expressed in prose |
| `Unconscious or Uncertain` | 1 | two states, no precedence stated |
| `Continuous or Intermittent` | 1 | two states, both authorization-gated |

**Engine today** `endingAwarenessRules` maps each string to an ordered rule list
with an optional material guard and authorization flag. `"Unconscious or
Uncertain"` takes the first-listed state. `"Continuous or Intermittent"` resolves
to `Continuous` only with an authorizing talent, else falls back to the contract
default. Content loading **fails** if the registry gains an unmapped awareness
string, so this cannot drift silently.

**Proposed schema change** Split the column into
`default_awareness`, `default_awareness_if_temporal`,
`awareness_requires_authorization`.

**Also confirm** the authorizing-talent table, currently read from the endings'
designer notes: `END-ANO-001 → T1028`, `END-ANO-002 → T1029`.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Awareness must be machine-structured, not interpreted from prose. Ordinary solid → Unconscious; temporal → Suspended; `Uncertain` allowed with no special authorization; Continuous/Intermittent/Displaced require authored authorization; END-ANO-001 authorizes via T1028, END-ANO-002 via T1029.
> _Files changed_: Ending Registry v1.1; `src/engine/endings.ts` (prose parsing deleted).
> _Outcome_: Implemented. The adapter's `endingAwarenessRules` table is gone; awareness now comes from `default_awareness`, `awareness_if_temporal`, `allowed_awareness_states`, `authorization_required_states` and `authorizing_talents`.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-07"></a>
## Q-07 — How do route tags map to route flag namespaces?

**Owner** Design · **Blocking** no · **Status** `OPEN`
**Evidence** [`PHASE1_CONFLICTS.md#C-4`](PHASE1_CONFLICTS.md)

`familyEvidenceScalar.routeFavor` applies when "matching active route context" is
present, but `routeTags` are authoring metadata while route state lives in flag
namespaces (`ROUTE_COR_*`, `EDU_*`). Nothing canonical connects the vocabularies,
and 17 of 28 authoring tags have no namespace.

**Engine today** `routeTagFlagPrefixes` maps the 12 tags that have a namespace;
the rest contribute nothing. An event gets at most one route-favor multiplier
however many tags match.

**See also Q-07a below** — a real rules violation was found and fixed here.

**Proposed schema change** Declare it in the Tag Registry, one row per tag:
`| Tag | Flag namespace | Favors transformation families |`

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Route-tag mapping is canonical data and must be validator-checked. Every event `routeTag` must exist in Route Tag Registry v1.0. Under the uniform-family baseline a matching active route grants at most one event-level favor scalar and never alters family probability. `academic` stays valid metadata on Temporal research events but cannot grant a Transformation-event favor.
> _Files changed_: Route Tag Registry v1.0; `src/engine/drafting.ts`; `src/engine/content/load.ts` validation.
> _Outcome_: Implemented; the Phase-1 adapter rule is retired. E-01 is ratified as canonical data (`allowTransformationEventFavor: false` on `academic`). Tests assert the one-scalar stacking rule and that route tags leave the family layer untouched.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

### Q-07a — academic route bias (fixed, needs ratification)

`EVT-TRN-TEMP-0001` and `EVT-TRN-TEMP-0002` both carry the `academic` routeTag,
so an unrestricted route-favor scalar multiplied the **TEMP family for every
academic run** — precisely what `EVENT_DRAFTING_RULES_v0.2` §Comparative
Materials forbids ("must not favor one specific final material merely because the
route is active").

**Fixed** in `src/engine/drafting.ts` via
`routeTagsWithNoTransformationFavor: ["academic"]`: the tag grants no route-favor
on TRN-channel events, and still applies on ORD/INS/SPC. Regression test in
`tests/acceptance-l-m-n-endings.test.ts`.

**Question** Is suppressing the scalar the right fix, or should the `academic`
routeTag be removed from the two TEMP events instead? The engine fix is
behaviour-preserving for every other route; the content fix would be cleaner if
those events are not really "academic".

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Ratify the behavioural intent of E-01 and move the rule out of the provisional adapter into canonical Route Tag Registry data. `academic` remains valid metadata on Temporal research events but grants no Transformation-event favor.
> _Files changed_: Route Tag Registry v1.0 (`allowTransformationEventFavor: false`); `src/engine/drafting.ts`.
> _Outcome_: The engine no longer carries a hard-coded tag exception; the rule is a per-tag registry field that any future tag can set.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

# Tier 3 — interpretations the engine already made

The engine had to pick a reading to run at all. Each of these is reversible via
`content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json`. **Please
ratify or correct.**

<a id="q-08"></a>
## Q-08 — Is `repeatCooldownYears` "at least C" or "more than C"?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-7`](PHASE1_ASSUMPTIONS.md)

Taxonomy v0.2 says "minimum full chronological years before the same event may
recur", which admits both `AGE - L >= C` and `AGE - L > C`.

**Settled by the content, not by preference.** Under `>=`, ages 0–5 supply
exactly six event-years for six years. Under `>`, they supply five and **every**
run fails at age 5. An exact fit under one reading and universal failure under
the other is decisive — but it is still an interpretation, and it interacts with
Q-01.

**Engine today** `repeatCooldownSemantics: "at_least"`, plus an unconditional
minimum of one year (the cadence is one event per year). `"strictly_greater"`
remains selectable for comparison.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Ratify `AGE - lastOccurrenceAge >= repeatCooldownYears`.
> _Files changed_: Balance Constants v0.2 `repeatCooldownSemantics`; `src/engine/state.ts`.
> _Outcome_: Moved out of the provisional adapter into canonical balance data.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-09"></a>
## Q-09 — Is `validityCondition` a fire gate or a destruction test?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-4`](PHASE1_ASSUMPTIONS.md)

Contract §14: a schedule expires when "the window closes; **or** validity becomes
impossible / current route state invalidates it". An engine cannot compute
"impossible" in general.

**Settled by the content.** Canonical schedules are routinely created while their
validity is false — `EVT-INS-ACA-0004` schedules `EVT-INS-ACA-0005` with validity
`FLAG[ROUTE_ACA_TENURE_REVIEW] & MAT!=NONE & FIX>=55` while `MAT` is still
`NONE`. Under a destruction reading, every academic climax would be discarded the
year it was created and **no canonical ending would ever fire**.

**Engine today** `scheduleValidityIsFireGate: true` — validity is a yearly
precondition for firing; a schedule is discarded only when `AGE > latestAge`.

**Consequence for metrics** "Route abandonment/expiry" is measured as window
expiry, the only expiry the engine can observe. If design wants a distinct
notion of *abandonment* (route explicitly given up) versus *expiry* (window ran
out), that needs an authored mechanism — currently there is none.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Ratify `validityCondition` as a yearly fire gate. A false condition means "not ready this year", not "destroy the schedule". A future explicit `cancelCondition` may be introduced if authored route abandonment needs it.
> _Files changed_: Balance Constants v0.2 `scheduleSemantics.validityCondition`; Content Schema v0.3.
> _Outcome_: Ratified. Note the open consequence: "route abandonment" is still measured only as window expiry, because no cancellation mechanism exists yet.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-10"></a>
## Q-10 — Should family weight follow content density?

**Owner** Balance · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-5`](PHASE1_ASSUMPTIONS.md)

The contract specifies `channel → family → event` and supplies channel weights
and per-event `weightClass`, but **no family-level weights**.

**Engine today** `familyWeightMode: "sum_of_event_weights"` — a family's weight
is the sum of its eligible events' weights, so family probability is proportional
to authored content density. `"uniform"` is the alternative.

**Why it matters now** Content density varies sharply (EDU 12 events, SYNT 1), so
this choice materially shapes the observed family mix. Under `sum`, adding
events to a family raises that family's share; under `uniform`, it dilutes each
event's share within a fixed family share. **These are meaningfully different
authoring contracts** and the choice should be explicit before more events are
written.

> **Resolution** — _status_: **RESOLVED for Phase 1.1**
> _Decision_: Reject content-density family weighting as the design baseline. Phase 1.1 baseline is `channel -> uniform eligible family -> weighted event inside family`. Retain `sum_of_event_weights` only as one A/B comparison. If uniform performs badly, the next option is explicit family base weights, not accidental density weighting.
> _Files changed_: Balance Constants v0.2 `familyWeightMode: uniform`; `src/engine/drafting.ts`.
> _Outcome_: **A/B measured, baseline unchanged.** At MID: uniform 49.1% completion / 2.78 bits material entropy; `sum_of_event_weights` 51.2% / 2.86 bits. The two are close, so nothing forces a change. Family mix differs mildly (density weighting lifts INS/MED and TRN/STON). The baseline was not switched.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: **Closed.** Retain `channel -> uniform eligible family -> weighted event`. Do not rerun the A/B for this small patch; the tool stays available for future large content additions or drafting-rule changes.
> _Phase 1.2 outcome_: The rule now has a visible consequence worth design's attention. `EVT-SPC-TLNT-0001` is the only member of `SPC/TLNT` and is unlocked by T1023; under uniform family weighting that single event carries the same family base weight (1.0) as the six-event `SPC/SECR` family, so it absorbs ~half of all SPC draws and measurably crowds out faction seeds — faction contact falls 38.5% → 32.3% in the arm that holds T1023. This is the specified rule working as written, not a defect. No change was made. See [`PHASE1_2_FINDINGS.md`](PHASE1_2_FINDINGS.md) §4.

---

<a id="q-11"></a>
## Q-11 — How should same-class priority ties break?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-10`](PHASE1_ASSUMPTIONS.md)

Contract §8: "Within the same class: authored priority first; seeded RNG if truly
equal." Neither "authored priority" nor "truly equal" is defined.

**Engine today** Within a class, order by (1) soonest `latestAge` — the most
urgent authored window — then (2) creation sequence. The sequence is unique, so
the ordering is total and **the RNG tiebreak is never reached**. This keeps runs
reproducible and avoids spending RNG draws on ties.

**Alternative** Add an explicit `priorityOrder` integer to the Schedule schema so
authors control the tiebreak directly.

**Currently low-stakes** — collisions occur in only 1.2% of runs — but that is
partly because so few climaxes fire (Q-02). Re-check after Q-02 is resolved.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Add `priorityOrder: integer = 0` to schedules. Within the same priority class: higher `priorityOrder` first, then seeded RNG on an actual tie. Creation order is not the permanent design tiebreak.
> _Files changed_: Content Schema v0.3; `src/engine/schedules.ts::rankCandidates`.
> _Outcome_: Implemented. Creation order now only stabilises the candidate list before the RNG draw; a test asserts the tie winner varies across seeds yet is identical for the same seed.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-12"></a>
## Q-12 — Should visible stats be clamped?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-6`](PHASE1_ASSUMPTIONS.md)

No canonical file states stat bounds. Starting range is 0–10 before modifiers,
but species modifiers can push below 0 (ELF `STR -1`) and events accumulate over
120 years.

**Engine today** `statClamp: { visibleMin: null, visibleMax: null, fixMin: 0,
fixMax: null }` — visible stats unclamped; FIX floored at 0 because
`fixTransformationChannelScalar`'s lowest band starts at `minFIX: 0`.

**Not behaviour-neutral** — clamping at 0 would change the outcome of conditions
such as `MNY<=2` and `STR<=4`, and therefore change which variants fire.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Ratify visible stats unclamped and FIX minimum 0.
> _Files changed_: Balance Constants v0.2 `statClamp`.
> _Outcome_: Moved out of the provisional adapter.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-13"></a>
## Q-13 — What does `TMS` mean?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-1`](PHASE1_ASSUMPTIONS.md)

`TMS` is listed as a numeric condition reference in Contract §12 and the Content
Schema but never defined, and no canonical event uses it.

**Engine today** `TMS` = number of **completed prior runs** (reincarnation
count), consistent with `AEVT` meaning completed prior runs only. A first life
has `TMS = 0`.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Ratify `TMS` as the number of completed prior runs. First life = 0.
> _Files changed_: Content Schema v0.3 condition references.
> _Outcome_: Now stated in canonical schema rather than only in an assumption note.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-14"></a>
## Q-14 — How much starting FIX does T1027 grant?

**Owner** Balance · **Status** `OPEN` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-2`](PHASE1_ASSUMPTIONS.md)

The Talent Registry says T1027 "Raises starting FIX" with no magnitude, and
`BALANCE_CONSTANTS` has no field for one.

**Engine today** `talentAdapters.T1027.startFIX = 15`, on a baseline of 0.

**Impact is large and deliberately surfaced.** The anomalous-talent scenario is
the only one where endings occur at a measurable rate (6.42% vs 0.09–0.73%),
purely because it holds T1027. Read that contrast as evidence about the FIX
economy (Q-02), **not** as a recommendation for 15.

This should probably be decided *after* Q-02, since the right value depends on
the total FIX budget.

> **Resolution** — _status_: **OPEN / DEFERRED**
> _Decision_: Do **not** freeze T1027 at +15. Run sensitivity values 5 / 8 / 10 / 12 / 15 after the revised FIX economy is in place, and report separately.
> _Files changed_: Talent Registry v1.1 leaves `start_fix_bonus` blank; `content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json` keeps the diagnostic value; `src/sim/experiments.ts::withT1027StartFix`.
> _Outcome_: **Swept, still open.** Completion in the anomalous scenario at MID: 76.4% (5), 86.0% (8), 91.4% (10), 94.2% (12), 98.2% (15). Even +5 makes the talent close to an auto-completion; mean commitment age falls 36.0 → 32.7 across the range. Design picks a value — the engine does not.
> _Reviewed / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: **OPEN / DEFER.** No T1027 sweep in Phase 1.2 and no starting-FIX bonus frozen. When the baseline economy stabilizes, rerun T1027 in isolation rather than bundled with T1028/T1030.
> _Phase 1.2 outcome_: Not measured — `t1027_sensitivity` was deliberately skipped. `withT1027StartFix` and the matrix entry are retained unchanged and still run via `npm run experiment -- --only t1027_sensitivity`.

---

<a id="q-15"></a>
## Q-15 — What registered species do T1025 and T1030 assign?

**Owner** Design · **Status** `OPEN` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-3`](PHASE1_ASSUMPTIONS.md)

T1030 "Wrong Species Certificate" says it "assigns a different registeredSpecies"
but not which. T1025 "Unregistered Species" says institutional events "may treat
species as unavailable" but names no value.

**Engine today** T1030 → seeded uniform pick among the other five species.
T1025 → `RSPECIES` becomes the literal `UNREGISTERED`. Both leave `SPECIES`
untouched so material tendencies stay biological, as both registry rows require.

**Low stakes today** — no canonical event condition reads `RSPECIES`, so this
only affects the Ending Record's `registeredSpecies` field. It becomes
consequential as soon as institutional classification events are authored.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Ratify T1025 → `RSPECIES = UNREGISTERED`, and T1030 → one seeded uniformly-selected species different from the true `SPECIES`, assigned once and fixed for the run.
> _Files changed_: Talent Registry v1.1 `registered_species_rule`; `src/engine/setup.ts`.
> _Outcome_: Canonical. The engine reads the registry column; the adapter rule is retired. A test asserts the T1030 pick is stable across repeated runs of the same seed.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-16"></a>
## Q-16 — What is the baseline starting FIX?

**Owner** Balance · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-8`](PHASE1_ASSUMPTIONS.md)

No canonical file states one. **Engine today** `startingFIX.base = 0`; T1027 adds
on top. Tied to Q-02 and Q-26.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Baseline starting FIX = 0.
> _Files changed_: Balance Constants v0.2 `startingFIX.base`.
> _Outcome_: Moved out of the provisional adapter.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-17"></a>
## Q-17 — Is the diagnostic allocation policy player-realistic?

**Owner** Design · **Status** `OPEN` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-12`](PHASE1_ASSUMPTIONS.md)

Species roll, talent choice and stat allocation are *player* decisions;
simulation needs a stand-in policy.

**Engine today** Allocation distributes points one at a time to a uniformly
chosen stat with room in 0–10. This produces roughly-even spreads and
**under-samples the extreme builds** (`CHR 10`, rest near 0) a real player would
often make.

**Consequence** Threshold-talent rates are distorted: `INT>=5` and `MNY<=3` are
met almost immediately (activation ages 4.4 and 6.5). A build-realistic policy
would push activation later and change the measured rates.

**Options** (a) keep uniform-fill as the diagnostic baseline; (b) add a
"min-max build" policy sampling extreme allocations; (c) run both and report
each separately.

**Recommendation** (c) — the contrast is itself the useful measurement.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Diagnostic allocation must not pretend one player style is representative. Report balanced/random fill, min-max primary/secondary, and a seeded archetype set **separately**; do not mix them into one headline statistic.
> _Files changed_: `src/engine/setup.ts` (three policies); `src/cli/experiment.ts`; Balance Constants v0.2 `diagnosticSampling.allocationPolicies`.
> _Outcome_: **Implemented and reported separately.** Outcome rates barely move (47.9–49.3% completion), but threshold-talent activation does: T1007 94% → 76%, T1009 86% → 69%, T1017 mean activation age 96.2 → 67.1 across balanced → archetype. This is exactly the distortion Q-17 warned about.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-18"></a>
## Q-18 — Does `Uncertain` awareness require authorization?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_CONFLICTS.md#C-3`](PHASE1_CONFLICTS.md)

Contract §23 lists `Intermittent`, `Continuous`, `Displaced`, `Uncertain` as
"rare explicit states", then says **"Continuous/Intermittent/Displaced require
authored authorization"** — omitting `Uncertain`. `END-MUS-003` uses `Uncertain`
as its plain registry default, which only works if it is unrestricted.

**Engine today** Follows the explicit authorization sentence over the list:
`Uncertain` needs no authorization, the other three do. Please confirm the
omission is intentional.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: `Uncertain` Awareness requires no special authorization.
> _Files changed_: Ending Registry v1.1 `authorization_required_states`.
> _Outcome_: Canonical: `Uncertain` never appears in any ending's `authorization_required_states`.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

# Tier 4 — content gaps and observations

<a id="q-19"></a>
## Q-19 — Should `SPC` channel content exist?

**Owner** Content · **Status** `OPEN` · **Evidence** [`PHASE1_CONFLICTS.md#C-7`](PHASE1_CONFLICTS.md)

`ageChannelWeights` allocates Route/Special up to **13%** of the channel budget
from age 12, and T1023 "Main Character Syndrome" *strongly favours* the SPC
channel — but **zero `SPC` events exist**. Observed SPC share is 0% in every age
band; the weight is silently redistributed by empty-channel renormalization.

T1023 currently does nothing at all, and its incompatibility with T1010 has no
mechanical consequence.

**Options** (a) author `ANO`/`REIN`/`TLNT`/`SECR` events; (b) zero the SPC
column until content exists, so the budget is explicit rather than absorbed.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: SPC remains part of the v1 architecture. Batch 005 adds initial ANO/REIN/TLNT content. Do not zero the SPC channel.
> _Files changed_: Batch 005 (8 SPC events).
> _Outcome_: **Present but very thin.** SPC share of event-years: 0.00% (no-talents), 0.43% (uniform-three), 5.01% (anomalous-talents). Almost all SPC content gates on anomalous route flags, so a run without those talents effectively never sees the channel despite SPC carrying up to 13% of the neutral channel budget. Flagged in findings as a follow-up.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: SPC remains canonical. Batch 006 adds six broadly reachable `SPC/SECR` faction seeds. Run a dedicated T1023 diagnostic, but do **not** create a large standalone SPC filler batch.
> _Phase 1.2 outcome_: **Reachability fixed.** SPC now reaches 53.4% of baseline runs (1.34% of event-years) without any anomalous talent, against 0.43% of event-years in Phase 1.1's comparable scenario. In the dedicated arms: control (no T1023) 38.5% of runs see SPC; with T1023, 99.7%. SPC events per completed run 1.41 baseline / 1.20 control / 1.74 with T1023. No filler batch was authored.

---

<a id="q-20"></a>
## Q-20 — Should any route use `mandatory_only`?

**Owner** Content · **Status** `OPEN`

Priority class 2 (mandatory committed-route continuation) is fully implemented
and fixture-tested, but **no canonical event uses `mandatory_only`** and no
canonical schedule uses `mandatory` priority. Contract §15's "committed hard
routes may reserve consecutive future years, generally 2–5" is therefore
unexercised.

Is this content not yet written, or is the priority class not actually needed?

> **Resolution** — _status_: **RESOLVED**
> _Decision_: Mandatory committed routes are intentional. Batch 005 provides the controlled-hardening Medical sequence and the two anomalous sequences. Each remains one visible event per year.
> _Files changed_: Batch 005 (4 `mandatory_only` events).
> _Outcome_: **Exercised.** 40–88% of runs now use at least one `mandatory_only` event, and the one-event-per-year invariant holds through the sequences.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-21"></a>
## Q-21 — How are `END-ANO-001` / `END-ANO-002` reached?

**Owner** Content · **Status** `OPEN`

Both anomalous endings are referenced by **no event variant**, so the endings
that T1028 "Object Permanence" and T1029 "Soul Cannot Harden" exist to unlock
cannot occur. Ending coverage is capped at **22/24 by content**, not by balance.

Needs a climax event (or an authored redirect on an existing climax) gated on the
relevant talent.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: END-ANO-001 and END-ANO-002 receive dedicated hidden SPC routes, not generic redirects attached to every ordinary ending.
> _Files changed_: Batch 005 (`EVT-SPC-ANO-0002/0003/0005/0006`).
> _Outcome_: **Both endings now occur.** Previously unreachable; both appear in ordinary diagnostic runs, and ending coverage rises from 13/24 to as much as 23/24.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-22"></a>
## Q-22 — Should first manifestation be 52% WOOD and pinned to age 18?

**Owner** Content · **Status** `OPEN` · **Evidence** [`PHASE1_FINDINGS.md §7`](PHASE1_FINDINGS.md)

`EVT-TRN-WOOD-0001` (ages 12–17) is the **only** manifestation event available
before 18; the other six open at exactly 18. So WOOD is the first manifestation
in ~52% of runs while the other six families take ~8–10% each, and
`averageFirstManifestationAge` is pinned at 18.3–18.5 in every scenario — there
is no variance in manifestation timing at all.

This does not currently distort *final* materials (see Q/finding on determinism),
but early-life material identity is disproportionately wooden.

**Options** (a) add adolescent manifestation events for other families;
(b) stagger the age floors of the existing `*-0001` events; (c) accept it as
authored intent.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: The ~52% Wood first-manifestation share is an availability artifact and is not intended. Batch 005 adds reversible adolescent STON/METL/CRYS/GLAS/CERA/TEMP events. Wood may keep a small age-window advantage but must not dominate a neutral Human.
> _Files changed_: Batch 005 (6 adolescent manifestation events).
> _Outcome_: **Fixed.** Neutral HUMAN / no talents / no material evidence (4 000 runs): WOOD 24.8%, CERA 13.8%, STON 13.4%, METL 13.0%, GLAS 12.7%, CRYS 12.7%, TEMP 9.7%. Well under the 50% failure line. WOOD keeps an earlier mean age (15.5 vs 18.7–20.6), which matches the intended small age-window advantage.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: No content change. The remaining structural WOOD lead is considered fixed. Add only the inexpensive neutral-Human age-18–20 manifestation diagnostic.
> _Phase 1.2 outcome_: **Still fixed, and the 18–20 window is close to flat.** Conditional on a window-year with `MAT=NONE` and no matching prior evidence (5 941 observations), P(unprompted manifestation) is METL 2.49%, CERA 2.46%, STON 2.46%, GLAS 2.36%, WOOD 2.21%, CRYS 2.10%, TEMP 0.79% — six families within 14.2–16.8% of the unprompted total. TEMP's lower rate tracks its eligibility (`TRN/TEMP` eligible in 32.8% of window-years vs 96.8–97.7% for the others), not a weighting bias. Whole-run first-manifestation WOOD share is 26.5% neutral / 23.0% species-stratified.

---

<a id="q-23"></a>
## Q-23 — Is a 35% adult fallback share acceptable?

**Owner** Content · **Status** `OPEN` · **Evidence** [`PHASE1_FINDINGS.md §3`](PHASE1_FINDINGS.md)

| Metric | Observed | Target |
|---|---:|---:|
| Fallback share of age-25+ event-years | 34.2–35.1% | 2% (warn above 5%) |
| Pre-25 fallback events | 0 | 0 — satisfied |

After roughly age 45 the `once_per_run` pool is exhausted and `EVT-ORD-GEN-0001`
carries about a third of all adult years. Channel mix decays to 98% ORD by 65+.

**Likely downstream of Q-02** — runs that should have ended at 30–45 instead
continue to 120 through a nearly empty pool. **Re-measure after Q-02 is resolved
before authoring more late-life content.**

> **Resolution** — _status_: **OPEN / MONITOR**
> _Decision_: ~35% adult fallback is unquestionably unintended, but do **not** respond by bulk-authoring late-life filler before the revised ending economy is measured. Target remains near 2%; >5% is a warning.
> _Files changed_: No content change in this patch.
> _Outcome_: **Re-measured, still high.** Age-25+ fallback share is 24.0–29.5% across threshold profiles and 25.7–26.2% in the base scenarios (7.1% in the anomalous scenario, where runs end early). Improved from ~35% but far above the 5% warning line. Above the addendum's ">10% → return to design" threshold, so this stays with design rather than being patched here.
> _Reviewed / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: 24–30% is not acceptable, but do **not** bulk-author generic filler. Batch 006 faction follow-ups add meaningful adult density. The next report must break fallback down by age band and report it conditional on runs still active in each band.
> _Phase 1.2 outcome_: **The requested breakdown localizes the problem completely.** Conditional on the run still being active: 0.0% fallback at every band from 0–5 through **45–54**, then 21.3% at 55–64 and 51.8% at 65+. The 26.7% aggregate age-25+ figure is produced entirely by the 55+ tail. **There is no adult content-density problem between 25 and 54**, so filler would be the wrong response; the 55+ share is a symptom of Q-27 — runs that should have ended at 25–44 are still walking through a pool never authored for a 120-year life. Stays open pending Q-27.

---

<a id="q-24"></a>
## Q-24 — Is T1017's activation profile intended?

**Owner** Balance · **Status** `RESOLVED` (Phase 1.2) · **Evidence** [`PHASE1_FINDINGS.md §8`](PHASE1_FINDINGS.md)

`T1017 Late Bloomer` (`AGE>=35 & CHR<=5`) activates at an **average age of
91.2** — far past any intended life span — because `CHR<=5` is usually only
satisfied after decades of drift. In a run ending at the target 25–44 it would
rarely fire at all. Its 78.7% activation rate is an artefact of runs continuing to
120.

Also downstream of Q-02; re-measure after that resolves.

> **Resolution** — _status_: **OPEN / MONITOR**
> _Decision_: Do not change T1017 yet. Re-measure activation age/rate under the revised ending economy and multiple allocation policies.
> _Files changed_: No content change in this patch.
> _Outcome_: **Re-measured.** T1017 activation is now 37% (balanced), 37% (min-max), 51% (archetype), with mean activation ages 96.2 / 70.4 / 67.1. Still far past a plausible life span under balanced fill, but markedly better under player-like builds — which is itself evidence that the Phase-1 reading was an allocation artifact. Stays open pending the frozen ending economy.
> _Reviewed / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md
>
> _Phase 1.2 decision_: **RESOLVED FOR NEXT TEST.** Change only the age floor: `AGE>=35 & CHR<=5` → `AGE>=25 & CHR<=5`. Keep the CHR threshold and the +4 effect unchanged, to isolate whether the old age floor was the main bottleneck. Revisit the CHR threshold later only if activation is still implausibly late once the ending economy improves.
> _Files changed_: `content/registries/SOLID_STATE_TALENT_REGISTRY_v1.2.csv` (T1017 row only); v1.1 moved to `content/superseded/`.
> _Phase 1.2 outcome_: **The age floor was the bottleneck.** Activation is 42.6% at a mean activation age of **49.7**, against 67.1–96.2 in Phase 1.1. The talent now fires inside a plausible life span, so the question it was opened for is answered. The CHR threshold and effect were not touched.

---

<a id="q-25"></a>
## Q-25 — What is the achievements registry, for `ACH[id]`?

**Owner** Design · **Status** `OPEN`

`ACH[id]` is a required condition reference (Contract §12) and is implemented and
tested, but **no achievements registry exists** — `SOLID_STATE_AGENTS_v0.2.md`
lists it as a future deliverable. Unknown achievement IDs therefore evaluate to
`false` rather than failing validation, which is the only safe behaviour without
a registry but means a typo in a future event condition would fail silently.

Once a registry exists, content validation should reject unknown `ACH` IDs the
same way it already rejects unknown `TLT`, `EVT` and ending IDs.

> **Resolution** — _status_: **OPEN / DEFERRED**
> _Decision_: Achievement Registry belongs to the meta-progression phase. Until it exists, unknown `ACH` behaviour remains a documented provisional limitation.
> _Files changed_: None.
> _Outcome_: Unchanged. `ACH[id]` is implemented and tested; unknown IDs evaluate to false rather than failing validation, because no registry exists to validate against.
> _Reviewed / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-26"></a>
## Q-26 — Should FIX drift passively with age?

**Owner** Balance · **Status** `OPEN` · **Evidence** [`PHASE1_CONFLICTS.md#C-6`](PHASE1_CONFLICTS.md)

No canonical file specifies a per-year FIX drift, and `BALANCE_CONSTANTS` has no
field for one. FIX changes **only** through authored event effects.

If fixation was intended to accumulate with age — which would make the `FIX>=55`
climax gates reachable naturally, and would fit "Fixation modifies transformation
pressure" in Route Rules — then that field is simply **missing from the schema**,
and adding it is the smallest change that reconciles the gates with the content.

**Proposed schema addition**

```json
"fixAnnualDrift": [ { "minAge": 0, "maxAge": 17, "perYear": 0 },
                    { "minAge": 18, "maxAge": null, "perYear": 0.5 } ]
```

Closely coupled to Q-02; decide together.

> **Resolution** — _status_: **RESOLVED**
> _Decision_: **No passive annual FIX drift.** Age already changes transformation pressure through `ageChannelWeights`; a hidden yearly increment would duplicate that signal and be hard to explain to the player. FIX rises only through authored causes. Do not add `fixAnnualDrift`.
> _Files changed_: Balance Constants v0.2 pins `fixAnnualDrift: null`; the engine reads no such field.
> _Outcome_: Implemented. A behavioural test replays every run and asserts final FIX equals the sum of authored variant effects plus the start bonus — no year contributes FIX merely by passing.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md

---

<a id="q-27"></a>
## Q-27 — How should the ending-age distribution be shaped?

**Owner** Content · **Blocking** yes · **Status** `OPEN` (content-shape decision resolved; a new gap is now measured) · **Evidence** [`PHASE1_2_FINDINGS.md §1`](PHASE1_2_FINDINGS.md)

Phase 1.1 measured endings arriving far too late: 74.7% at 65+ against a 2–5%
target, and the 18–24 band unreachable because the earliest climax in the corpus
opened at 25. Phase 1.2 is design's answer to that.

**Options considered by design** (recorded in
[`PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md`](PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md)):
treat it as a global FIX-threshold problem, or as a content-shape problem.
Design chose content shape.

**Engine today** Nothing in the engine sets ending age. It comes from event age
windows, schedule `offsetYears` / `windowYears`, and `include` /
`validityCondition` gates in canonical content.

> **Resolution** — _status_: **RESOLVED FOR PHASE 1.2 CONTENT SHAPE; numeric balance remains open**
> _Decision_: The missing 18–34 endings are primarily a **content-shape** problem, not a global FIX-threshold problem. Introduce short/sudden young-adult paths driven by bureaucracy, insurance/finance, commercial preservation, experiments, underground finance and cult/religious activity. Faction contact may begin at 16+ where age-appropriate, but no canonical Permanent Form ending may occur before 18. Some paths may transform a protagonist at relatively low FIX because the conversion is externally imposed rather than a spontaneous biological culmination. Other paths use repeated faction follow-ups to raise FIX over several years and mature in 25–34, which remains the intended modal window. Late-life endings remain a small survivor wave requiring meaningful prior route history, never a universal cheapest catch-all. Do not use passive age-based FIX drift.
> _Files changed_: `SOLID_STATE_EVENT_BATCH_006_v0.1.json` (18 events: 6 faction seeds, 6 low-gate faction climaxes, 6 adult faction follow-ups); `SOLID_STATE_EVENT_BATCH_005_v0.2.json` (2 late-life entries made history-specific); `SOLID_STATE_FACTION_REGISTRY_v0.1.json`; `SOLID_STATE_ROUTE_TAG_REGISTRY_v1.1.json`. The two late-life climax `FIX>=40` gates were **not** changed.
> _Outcome_: **Both ends moved as intended; the middle did not.** 18–24 went 0.0% → **31.5%** (target 18–22%, now overshooting) and 65+ went 74.7% → **37.8%** (target 2–5%). But 25–34, the intended modal window, is now the largest miss at **17.7%** against 35–40%, and the ending landscape is bimodal: every faction route lands at a median age of 22–25, `INS/MED` and `ORD/FAM` land at 67–68, and almost nothing occupies 26–60.
> _Decided by / date_: 2026-08-13 · design (via ChatGPT review), merged from PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md

### Still open: why the faction ladder does not reach 25–34

The mechanism is fully determined by the authored content and is reproducible
from `reports/phase1_2-diagnostic.md`:

1. Faction seeds have age windows 16–24; mean age at first contact is **20.0**.
2. Each seed schedules its climax at `offsetYears` **1–2**.
3. The climax gates are low by design (`FIX>=8` / `FIX>=10` / `FIX>=12`, or
   `MNY<=3/5`) and are satisfied immediately in most runs.
4. The adult follow-ups that were meant to raise FIX over several years all open
   at **age 23** — one to three years *after* the median climax has already
   fired.

Faction contacts resolve into 1 169 climaxes and 292 expired schedules out of
~1 608 contacts, so the slow path is almost never taken. **Faction contact is
behaving as a 1–3 year fuse, not as a multi-year route.**

**Smallest content-shaped levers, for design to choose between** — none applied:

| Option | Change | Trade-off |
|---|---|---|
| A | Widen faction climax `offsetYears` (e.g. 1–2 → 4–8) | One field per seed; pushes the whole faction wave later, may overshoot into 35–44 |
| B | Add a follow-up flag to the climax `validityCondition` | Forces the ladder to be climbed; risks more expiries if the follow-up is not drafted in the window |
| C | Lower the follow-up age floor below the climax's earliest fire age | Smallest edit; makes the ladder reachable without changing when the climax may fire |

**Also for review:** the two `FIX>=40` late-life climaxes now supply 42.1% of all
endings at a median age of 67–68. Whether they should require more prior route
history is a separate decision, and was deliberately not made here.

**Also for review:** the faction layer, introduced as lightweight context, now
supplies **48.6%** of all endings.

---

## Change log for this file

| Date | Change |
|---|---|
| 2026-08-12 | Created at Phase-1 handoff with Q-01 … Q-26 |
| 2026-08-13 | Phase 1.1: merged `PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md`. 22 questions RESOLVED; Q-14, Q-23, Q-24, Q-25 deliberately remain open. Outcomes measured against the Phase 1.1 content and reported in `PHASE1_1_FINDINGS.md`. |
| 2026-08-13 | Phase 1.2: merged `PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md`. Added **Q-27**; added a `_Phase 1.2 outcome_` line to Q-02, Q-10, Q-14, Q-19, Q-22, Q-23, Q-24. **Q-24 is now RESOLVED.** Q-14, Q-23, Q-25 and Q-27 remain open. Outcomes measured against the Phase 1.2 content and reported in `PHASE1_2_FINDINGS.md`. |
