# SOLID STATE — Open Questions Register

## Version 0.1 — the official Phase-1 decision list

This file is the **single authoritative list of everything the coding agent could
not decide alone**. Anything discussed in a chat log but not written here is not
official.

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
| [Q-01](#q-01) | How should ages 0–5 be given coverage slack? | Content | **yes** | `OPEN` |
| [Q-02](#q-02) | How should the FIX economy reach the climax gates? | Balance | **yes** | `OPEN` |
| [Q-03](#q-03) | Should any ending be reachable after age 64? | Content | **yes** | `OPEN` |
| [Q-04](#q-04) | How do species tendency labels map to family codes? | Design | no | `OPEN` |
| [Q-05](#q-05) | What polarity do talent channel/family hooks carry? | Design | no | `OPEN` |
| [Q-06](#q-06) | How should `default_awareness` prose be structured? | Design | no | `OPEN` |
| [Q-07](#q-07) | How do route tags map to route flag namespaces? | Design | no | `OPEN` |
| [Q-08](#q-08) | Is `repeatCooldownYears` "at least C" or "more than C"? | Design | no | `RATIFY` |
| [Q-09](#q-09) | Is `validityCondition` a fire gate or a destruction test? | Design | no | `RATIFY` |
| [Q-10](#q-10) | Should family weight follow content density? | Balance | no | `RATIFY` |
| [Q-11](#q-11) | How should same-class priority ties break? | Design | no | `RATIFY` |
| [Q-12](#q-12) | Should visible stats be clamped? | Design | no | `RATIFY` |
| [Q-13](#q-13) | What does `TMS` mean? | Design | no | `RATIFY` |
| [Q-14](#q-14) | How much starting FIX does T1027 grant? | Balance | no | `OPEN` |
| [Q-15](#q-15) | What registered species do T1025 and T1030 assign? | Design | no | `OPEN` |
| [Q-16](#q-16) | What is the baseline starting FIX? | Balance | no | `RATIFY` |
| [Q-17](#q-17) | Is the diagnostic allocation policy player-realistic? | Design | no | `OPEN` |
| [Q-18](#q-18) | Does `Uncertain` awareness require authorization? | Design | no | `RATIFY` |
| [Q-19](#q-19) | Should `SPC` channel content exist? | Content | no | `OPEN` |
| [Q-20](#q-20) | Should any route use `mandatory_only`? | Content | no | `OPEN` |
| [Q-21](#q-21) | How are `END-ANO-001` / `END-ANO-002` reached? | Content | no | `OPEN` |
| [Q-22](#q-22) | Should first manifestation be 52% WOOD and pinned to 18? | Content | no | `OPEN` |
| [Q-23](#q-23) | Is a 35% adult fallback share acceptable? | Content | no | `OPEN` |
| [Q-24](#q-24) | Is T1017's activation profile intended? | Balance | no | `OPEN` |
| [Q-25](#q-25) | What is the achievements registry, for `ACH[id]`? | Design | no | `OPEN` |
| [Q-26](#q-26) | Should FIX drift passively with age? | Balance | no | `OPEN` |

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Files changed_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

---

<a id="q-13"></a>
## Q-13 — What does `TMS` mean?

**Owner** Design · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-1`](PHASE1_ASSUMPTIONS.md)

`TMS` is listed as a numeric condition reference in Contract §12 and the Content
Schema but never defined, and no canonical event uses it.

**Engine today** `TMS` = number of **completed prior runs** (reincarnation
count), consistent with `AEVT` meaning completed prior runs only. A first life
has `TMS = 0`.

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

---

<a id="q-16"></a>
## Q-16 — What is the baseline starting FIX?

**Owner** Balance · **Status** `RATIFY` · **Evidence** [`PHASE1_ASSUMPTIONS.md#A-8`](PHASE1_ASSUMPTIONS.md)

No canonical file states one. **Engine today** `startingFIX.base = 0`; T1027 adds
on top. Tied to Q-02 and Q-26.

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: RATIFY
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

---

<a id="q-21"></a>
## Q-21 — How are `END-ANO-001` / `END-ANO-002` reached?

**Owner** Content · **Status** `OPEN`

Both anomalous endings are referenced by **no event variant**, so the endings
that T1028 "Object Permanence" and T1029 "Soul Cannot Harden" exist to unlock
cannot occur. Ending coverage is capped at **22/24 by content**, not by balance.

Needs a climax event (or an authored redirect on an existing climax) gated on the
relevant talent.

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

---

<a id="q-24"></a>
## Q-24 — Is T1017's activation profile intended?

**Owner** Balance · **Status** `OPEN` · **Evidence** [`PHASE1_FINDINGS.md §8`](PHASE1_FINDINGS.md)

`T1017 Late Bloomer` (`AGE>=35 & CHR<=5`) activates at an **average age of
91.2** — far past any intended life span — because `CHR<=5` is usually only
satisfied after decades of drift. In a run ending at the target 25–44 it would
rarely fire at all. Its 78.7% activation rate is an artefact of runs continuing to
120.

Also downstream of Q-02; re-measure after that resolves.

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

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

> **Resolution** — _status_: OPEN
> _Decision_:
> _Decided by / date_:

---

## Change log for this file

| Date | Change |
|---|---|
| 2026-08-12 | Created at Phase-1 handoff with Q-01 … Q-26 |
