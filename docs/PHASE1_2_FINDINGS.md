# SOLID STATE — Phase 1.2 Simulation Findings

## Version 0.1 — for design review after the Phase 1.2 patch

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).** Resolve them there, not here.

Source data: `reports/phase1_2-diagnostic.md` / `.json`, produced by
`npm run diagnostic` from
[`content/balance/SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json`](../content/balance/SOLID_STATE_PHASE1_2_DIAGNOSTIC_PLAN_v0.1.json)
— 4 000 baseline runs (species-stratified, uniform-three talents, `ARCHETYPE_SET`
allocation, uniform family weighting, **authored current thresholds**, strict
pre-25 coverage), 1 500 runs per T1023 arm, 2 000 neutral-Human runs.

Content: Phase 1.2 patch — **156 events across 6 batches**, 37 route tags, 6
factions, Talent Registry v1.2. No creative prose was tuned, no threshold profile
was selected, and the two late-life `FIX>=40` gates were left untouched as
instructed.

Per the Phase 1.2 instructions, the LOW/MID/HIGH threshold sweep, the
uniform vs `sum_of_event_weights` A/B, the three-way allocation comparison and
the T1027 sensitivity sweep were **not run**. Their harness
(`src/sim/experiments.ts`, `src/cli/experiment.ts`, `npm run experiment`) is
retained unchanged. `reports/monte-carlo.*` and `reports/phase1_1-experiments.*`
are Phase-1/1.1 artifacts against the **pre-1.2 corpus** and were deliberately
not regenerated in this patch.

---

## Headline

Batch 006 did what it was designed to do: the 18–24 window is now reachable and
the 65+ pile-up is roughly halved. But the intended modal window — 25–34 — is now
the **largest** shortfall in the distribution, and the reason is structural
rather than numeric.

| # | Finding | Change since Phase 1.1 | Severity |
|---|---|---|---|
| 1 | 18–24 endings reachable — and now overshoot | 0% → **31.5%** (target 18–22%) | medium |
| 2 | **25–34, the intended modal window, is the biggest miss** | 1.3% → **17.7%** (target 35–40%) | **blocking** |
| 3 | 65+ pile-up halved but still dominant | 74–92% → **37.8%** (target 2–5%) | **blocking** |
| 4 | The ending landscape is **bimodal**, with an empty 26–60 middle | new | **blocking** |
| 5 | 39.9% of runs still never end | 53.1–57.5% → **39.9%** nonterminal | high |
| 6 | Adult fallback is **entirely** a 55+ phenomenon (Q-23 answered) | 24–30% aggregate → **0% through age 54**, 21.3% at 55–64, 51.8% at 65+ | high |
| 7 | Faction layer works: all six reachable, 48.6% of all endings | new | informational / needs review |
| 8 | T1023 raises SPC but **reduces** faction contact | new | informational |
| 9 | T1017 age-floor delta worked | mean activation 67–96 → **49.7** | resolved |
| 10 | Ending coverage 17/24; the 7 missing are all institutional routes | 20/24 → 17/24 | medium |
| 11 | WOOD first-manifestation dominance stays fixed | 24.8% → **23.0%** | resolved |
| 12 | Pre-25 coverage defect stays at zero with 18 new events | 0% → **0%** | resolved |

---

## 1. Ending-age distribution (Q-27)

| Age band | Phase 1.1 (uniform-three, authored gates) | Phase 1.2 | Target |
|---|---:|---:|---:|
| 18–24 | 0.0% | **31.5%** | 18–22% |
| 25–34 | 1.3% | **17.7%** | 35–40% |
| 35–44 | 14.5% | 7.8% | 20–25% |
| 45–54 | 8.3% | 4.4% | 8–12% |
| 55–64 | 1.2% | 0.7% | 4–7% |
| 65+ | 74.7% | **37.8%** | 2–5% |

Completion is 60.2%; median ending age 36.0 (mean 43.0, p10 21, p90 68).

The distribution moved in the intended direction at both ends and **skipped the
middle**. That is not a threshold-tuning artifact — it is visible directly in
where each route's endings land.

### 1.1 The landscape is bimodal

| Route family | Endings | Share | Median ending age |
|---|---:|---:|---:|
| `INS/MED` | 598 | 24.9% | **68** |
| `ORD/FAM` | 415 | 17.2% | **67** |
| `faction:Last Posture` | 265 | 11.0% | **24** |
| `faction:CRI` | 248 | 10.3% | **24** |
| `faction:Meridian` | 222 | 9.2% | **22** |
| `SPC/ANO` | 195 | 8.1% | 44 |
| `faction:Everlasting Mutual` | 174 | 7.2% | **22** |
| `faction:DMMS` | 141 | 5.9% | **23** |
| `faction:Black Ledger` | 119 | 4.9% | **25** |
| `TRN/TEMP` · `INS/CIV` · `INS/MUS` · `INS/ARC` · `INS/REL` · `INS/FIN` | 29 total | 1.2% | 35–48 |

Every faction route lands at a median of 22–25. The two large non-faction routes
land at 67–68. Between 26 and 60 there is almost nothing but `SPC/ANO` (median
44) and a 29-ending tail. **The 25–34 shortfall is a gap in the map, not a
mis-set number.**

### 1.2 Why the faction routes cannot reach 25–34

The mechanism is fully determined by the authored content and is reproducible
from the report:

1. Faction seeds (`EVT-SPC-SECR-0001…0006`) have age windows 16–24; mean age at
   first contact is **20.0**.
2. Each seed schedules its climax at `offsetYears` **1–2**.
3. The climax gates are low by design — `FIX>=8`, `FIX>=10`, `FIX>=12`, or
   `MNY<=3/5` — and are satisfied at once in most runs.
4. So the climax fires at roughly age 21–25, inside the 18–24 band.

The adult follow-ups intended to "raise FIX visibly over several years and mature
in 25–34" (`EVT-INS-CIV-0010`, `EVT-INS-MED-0013`, `EVT-INS-ACA-0012`,
`EVT-INS-FIN-0006`, `EVT-INS-FIN-0007`, `EVT-INS-REL-0004`) all open at **age
23** — one to three years *after* the median faction climax has already fired.

The numbers confirm the ladder is rarely climbed: across the baseline, faction
contacts resolve into 1 169 faction climaxes and 292 expired faction schedules
(≈ 1 461 of ~1 608 total contacts). **Faction contact is behaving as a 1–3 year
fuse to an ending, not as a multi-year route.**

This is a design question, not an engine defect, so nothing was changed. The
smallest content-shaped levers, for design to choose between, are: widen the
climax `offsetYears`; require a follow-up flag in the climax `validityCondition`;
or lower the follow-up age floor below the climax's earliest fire age. **No change
was made — see Q-27.**

### 1.3 Why 65+ still holds 37.8%

Unchanged from Phase 1.1 in kind, halved in size. The two late-life entries
(`EVT-INS-MED-0011`, `EVT-ORD-FAM-0010`) are now history-specific rather than
universal, which is what cut the share — but their climaxes (`EVT-INS-MED-0012`,
`EVT-ORD-FAM-0011`) still gate at `FIX>=40`, and those two families still supply
42.1% of all endings at a median age of 67–68. **The two `FIX>=40` gates were left
unchanged as instructed.**

---

## 2. Nonterminal runs and the 55+ fallback cliff (Q-23)

39.9% of runs reach the diagnostic maximum age without an ending. The requested
age-band breakdown, conditional on the run still being active, gives a much
sharper answer than the Phase-1.1 aggregate:

| Age band | Active event-years | Fallback years | Fallback share of active years |
|---|---:|---:|---:|
| 0–5 | 24 000 | 0 | **0.0%** |
| 6–11 | 24 000 | 0 | **0.0%** |
| 12–17 | 24 000 | 0 | **0.0%** |
| 18–24 | 26 376 | 0 | **0.0%** |
| 25–34 | 29 482 | 0 | **0.0%** |
| 35–44 | 27 502 | 0 | **0.0%** |
| 45–54 | 25 586 | 0 | **0.0%** |
| 55–64 | 25 092 | 5 345 | **21.3%** |
| 65+ | 92 772 | 48 074 | **51.8%** |

The headline "26.7% of age-25+ event-years are fallback" is entirely produced by
the 55+ tail. **There is no adult content-density problem between 25 and 54.**
Bulk-authoring adult filler would be the wrong response; the 55+ share is a
symptom of finding 1 — runs that should have ended at 25–44 are still walking
through a pool that was never authored for a 120-year life.

---

## 3. The faction layer (Q-27, faction addendum)

All six factions are reachable through ordinary drafting, with no player
faction-choice UI, no reputation meter, and `CONTACT` never meaning membership.

| Faction | Entry age min | Contact rate | Mean first-contact age | Climax rate | Endings |
|---|---:|---:|---:|---:|---:|
| Order of the Last Posture | 16 | 8.3% | 19.1 | 6.6% | 265 |
| Continuity Research Institute | 18 | 8.2% | 20.9 | 6.2% | 248 |
| Everlasting Mutual | 18 | 7.8% | 20.9 | 4.3% | 174 |
| Meridian Preservation Group | 17 | 6.6% | 19.7 | 5.5% | 222 |
| Department of Mobility and Material Status | 16 | 5.1% | 17.9 | 3.5% | 141 |
| Black Ledger Cooperative | 18 | 4.2% | 22.5 | 3.0% | 119 |

35.9% of runs make at least one faction contact, at a mean age of 20.0. No
ending occurs before 18 despite age-16 contact.

**For review:** faction routes now supply **48.6%** of all endings (1 169 of
2 406) from a layer that was introduced as lightweight context. Whether that is
the intended weight is a design question. The engine applies no faction bias
beyond the ordinary route-tag mechanism — verified in
`tests/phase1_2-acceptance.test.ts`: faction flags move no material family, and
at most one route-favor scalar applies per event however many faction tags match.

---

## 4. T1023 SPC comparison

| Arm | Talents | SPC share of event-years | Runs with any SPC | SPC per completed run | SPC per non-completed run |
|---|---|---:|---:|---:|---:|
| control | T1013, T1015, T1004 | 0.97% | 38.5% | 1.20 | 0.15 |
| main_character | T1023, T1013, T1015 | 1.74% | **99.7%** | 1.74 | 1.12 |

T1023 makes SPC effectively universal. But faction contact **falls**, from 38.5%
to 32.3%, and every faction except Last Posture is contacted less often.

The cause is visible in the family counts. T1023 unlocks `EVT-SPC-TLNT-0001`
(`include: TLT[T1023]`), which is the only member of the `SPC/TLNT` family. Under
the uniform-family baseline that one event carries the same family-layer base
weight (1.0) as the six-event `SPC/SECR` family, so it absorbs roughly half of
all SPC draws:

| Arm | 18–24 band | 25–34 band |
|---|---|---|
| control | `SPC/SECR` 890 | `SPC/SECR` 182 |
| main_character | `SPC/SECR` 706, `SPC/TLNT` 421 | `SPC/SECR` 143, `SPC/TLNT` 622 |

So the talent that "strongly favors the Special channel" measurably **crowds out**
the faction seeds that share that channel. This is the uniform-family rule
working exactly as specified — "event count must not silently become family
probability" (Drafting Rules v0.3) — applied to a one-event family. It is
reported, not changed: Q-10 closed the family-weighting decision in favour of
uniform, and the A/B harness stays available.

Ending-age buckets by arm:

| Arm | Completed | Median end age | 18–24 | 25–34 | 35–44 | 45–54 | 55–64 | 65+ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| control | 57.0% | 28.0 | 32.7% | 21.5% | 2.8% | 1.1% | 0.0% | 41.9% |
| main_character | 51.4% | 38.0 | 31.0% | 18.5% | 1.9% | 0.0% | 0.0% | 48.5% |

---

## 5. Neutral-Human manifestation window, ages 18–20 (Q-22 follow-up)

2 000 runs, HUMAN, no talents, `BALANCED_RANDOM_FILL`. HUMAN has no family
tendency and no refinement hook, so any skew is a property of content
availability. 5 941 window-years were observed with `MAT=NONE` at draft time.

P(manifestation family | age 18–20, MAT=NONE, no matching prior evidence):

| Family | Unprompted manifestations | P per window-year | Share of unprompted |
|---|---:|---:|---:|
| METL | 148 | 2.49% | 16.8% |
| CERA | 146 | 2.46% | 16.5% |
| STON | 146 | 2.46% | 16.5% |
| GLAS | 140 | 2.36% | 15.9% |
| WOOD | 131 | 2.21% | 14.8% |
| CRYS | 125 | 2.10% | 14.2% |
| TEMP | 47 | 0.79% | 5.3% |

Any unprompted manifestation in a window year: 14.9%.

**The window is close to flat.** Six of the seven families sit between 14.2% and
16.8%; only TEMP is materially lower, which is expected — `TRN/TEMP` is eligible
in only 32.8% of window-years, against 96.8–97.7% for the six ordinary families.

Eligible pool at each window age:

| Age | Mean eligible events | Mean distinct families | ORD | INS | TRN | SPC |
|---|---:|---:|---:|---:|---:|---:|
| 18 | 19.6 | 13.73 | 5.73 | 1.00 | 6.00 | 1.00 |
| 19 | 18.6 | 12.89 | 5.30 | 0.76 | 5.83 | 1.00 |
| 20 | 22.1 | 14.77 | 4.43 | 2.69 | 6.64 | 1.00 |

Across the whole neutral run, WOOD is still the most common **first**
manifestation at 26.5% (23.0% in the species-stratified baseline) with a median
age of 13 against 18–20 for every other family — WOOD manifests earlier, not more
often per opportunity. That is consistent with the Q-22 resolution that the
remaining skew is structural and accepted; it is far below the 50% failure line.

---

## 6. Ending coverage

17 of 24 endings observed (70.8%), down from 20/24 in Phase 1.1 — because the
faction climaxes now win the years in which the slower institutional routes used
to mature. The seven unobserved endings are all institutional:

| Ending | Title | Class | Core routes |
|---|---|---|---|
| `END-ACA-001` | Tenure | uncommon | Academic |
| `END-ACA-002` | Peer-Reviewed Permanence | rare | Academic; Medical; Research |
| `END-COR-001` | Employee of the Century | common | Corporate |
| `END-COR-002` | Benefits Package | common | Corporate; Medical |
| `END-FIN-003` | No Longer Depreciating | rare | Finance; Museum; Corporate |
| `END-LEG-002` | Fixture Attached to Land | uncommon | Legal; Architectural |
| `END-MUS-003` | Crystal Archivist | rare | Museum; Academic |

Two of these (`END-COR-001`, `END-COR-002`) are marked `common`. The academic,
corporate, museum, legal and finance routes are exactly the mid-life ladders that
finding 1.2 shows being pre-empted, so this is the same problem measured a
second way rather than an independent one.

---

## 7. Talents

`T1017 Late Bloomer` after the age-floor delta (`AGE>=35` → `AGE>=25`, CHR
threshold and +4 effect unchanged): activation rate **42.6%** at a mean
activation age of **49.7**, against 37–51% at mean ages 67.1–96.2 in Phase 1.1.
The talent now fires inside a plausible life span. Q-24's stated purpose —
isolating whether the age floor was the bottleneck — is answered: it was.

---

## 8. What was deliberately not done

Per the Phase 1.2 instructions:

- No threshold profile selected or frozen; the two late-life `FIX>=40` gates are
  untouched.
- No passive FIX drift; FIX remains event-driven only.
- Uniform eligible-family weighting preserved; no A/B rerun.
- No T1027 change and no T1027 sweep.
- No content prose rewritten, no events/factions/endings invented, no mid-life
  player choices added.
- No faction reputation meter, no player faction choice, no material bias from
  faction context; the alignment-style expansion stays deferred.
- No React UI work. **H2 remains closed.**

One conflict was found and reported rather than worked around: see
[`PHASE1_CONFLICTS.md` P12-C1](PHASE1_CONFLICTS.md) — Batch 006 shipped an event
ID already published in Batch 005.

---

## 9. Recommended next decisions

For design, in priority order. All are recorded in
[`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); none were acted on here.

1. **Q-27 / finding 1.2** — decide how faction routes should occupy 25–34. The
   content already contains the intended ladder; it is the timing relationship
   between climax `offsetYears`, the climax `validityCondition` and the age-23
   follow-up floor that prevents it being used.
2. **Q-27 / finding 1.3** — decide whether the two `FIX>=40` late-life climaxes
   should require more prior route history, now that 42.1% of endings come from
   those two families at median age 67–68.
3. **Q-23** — confirm that the 55+ fallback tail is accepted as a symptom of 1
   and 2 rather than a content-density problem to be filled.
4. **Faction weight** — confirm that ~49% of endings from the faction layer is
   the intended prominence for a "lightweight context" system.
