# SOLID STATE — Phase 1.1 Simulation Findings

## Version 0.1 — for design review after the Phase 1.1 patch

> **Note (Part B, 2026-08-14):** the generated report this document was
> written from is no longer tracked in git — it measured an earlier corpus.
> The conclusions below are unchanged. See
> [`reports/REPORT_INDEX.md`](../../../reports/REPORT_INDEX.md) for what it measured and the command
> that regenerates it.

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](../../OPEN_QUESTIONS.md).** Resolve them there, not here.

Source data:
- `reports/monte-carlo.md` / `.json` — 10 000 runs × 5 talent scenarios,
  species-stratified, **authored v0.2 gates** (no threshold override).
- `reports/phase1_1-experiments.md` / `.json` — the experiment matrix,
  4 000 runs per arm.

Content: `SOLID_STATE_PROJECT_SNAPSHOT_v0.7` + Phase 1.1 patch v0.1 — **138
events**, unmodified. Balance: Provisional v0.2, unmodified. No creative prose
was tuned and no threshold profile was selected.

---

## Headline

The two Phase-1 blockers are closed. One new balance problem is now visible, and
it is a consequence of the fix rather than a regression.

| # | Finding | Change since Phase 1 | Severity |
|---|---|---|---|
| 1 | Pre-25 coverage defect **eliminated** | 83–85% → **0%** | resolved |
| 2 | Endings now reachable, but **arrive far too late** | 0.7% → 43–96% completion; 65+ share 0% → **74–92%** | **blocking** |
| 3 | Adult fallback share still high | ~35% → **24–30%** | high |
| 4 | SPC channel exists but is near-unreachable without anomalous talents | 0% → 0.00–5.01% | medium |
| 5 | First-manifestation WOOD dominance **fixed** | 52% → **24.8%** | resolved |
| 6 | Both anomalous endings **now reachable** | 0 → both observed | resolved |
| 7 | Mandatory routes and `priorityOrder` exercised | unused → 40–88% of runs | resolved |
| 8 | Allocation policy materially changes talent activation | not measured → measured | informational |

---

## 1. Pre-25 coverage is fixed (Q-01)

| Metric | Phase 1 | Phase 1.1 |
|---|---:|---:|
| Runs terminating on a pre-25 coverage defect | 83–85% | **0%** |
| Minimum eligible non-fallback events, ages 0–5 | 0 (exhausted) | **≥2 at every reachable state** |
| `reuse_baseline_repeatables` escape hatch | required | **deleted** |

Verified across 720 strict runs (6 species × 120). The schedulability test no
longer checks per-age capacity: it replays each run and recomputes eligibility at
the actual reachable state, so once-per-run consumption, cooldowns, max counts,
age windows and include/exclude conditions are all modelled
(`tests/phase1_1-acceptance.test.ts` §1).

---

## 2. Endings arrive far too late (blocking, new)

Endings are now plentiful — the Phase-1 blocker is gone — but the age
distribution has inverted.

### Under the authored v0.2 gates (`reports/monte-carlo.md`)

| Scenario | Completed | Endings at 65+ | Distinct endings |
|---|---:|---:|---:|
| no-talents | 42.9% | **92.5%** | 10/24 |
| uniform-three | 46.9% | **74.7%** | 20/24 |
| threshold-talents | 44.8% | **92.7%** | 11/24 |
| material-talents | 42.5% | **92.0%** | 10/24 |
| anomalous-talents | 95.5% | 3.1% | 16/24 |

Target for the 65+ band is **2–5%**.

**Cause.** The new late-life climaxes gate at `FIX>=40`
(`EVT-INS-MED-0012`, `EVT-ORD-FAM-0011`) while the ten mid-life climaxes still
gate at `FIX>=55`. Late-life is therefore the *cheapest* ending path: a run
accumulates FIX past 40, sails through the mid-life window because 55 is out of
reach, and terminates at 67+. The Q-03 fix (add late-life content) and the
unresolved Q-02 gate values interact to invert the intended distribution.

### Under the experiment-matrix profiles (`reports/phase1_1-experiments.md`)

Applying a profile lowers `climax_standard` **and** raises `climax_late`, which
rebalances the two paths:

| Profile | Completed | 18–24 | 25–34 | 35–44 | 45–54 | 55–64 | 65+ |
|---|---:|---:|---:|---:|---:|---:|---:|
| LOW | 64.0% | 0.0% | 7.9% | 49.4% | 17.1% | 1.8% | 23.7% |
| MID | 47.7% | 0.0% | 7.0% | 52.5% | 20.8% | 1.9% | 17.8% |
| HIGH | 35.8% | 0.0% | 6.9% | 53.6% | 18.5% | 1.7% | 19.2% |
| ORIGINAL_REFERENCE | 9.9% | 0.0% | 4.8% | 41.3% | 16.4% | 3.0% | 34.5% |
| **target** | | **18–22%** | **35–40%** | **20–25%** | **8–12%** | **4–7%** | **2–5%** |

**No profile hits any target band.** Every arm is short in 18–34 and long in
35–54 and 65+. Lowering thresholds raises the completion rate without moving the
*shape* of the distribution — the earliest climax event in the corpus opens at
age 25, so the 18–24 band is unreachable by construction, exactly as the age-64
ceiling was in Phase 1.

**This is a content-shape question, not a threshold question**, and it is the
main thing Phase 1.1 surfaces for design:

1. the 18–24 band needs climax content that opens before 25;
2. the mid-life (55) versus late-life (40) gate asymmetry needs a deliberate
   decision — currently late-life is easier than mid-life;
3. only then does picking LOW/MID/HIGH become meaningful.

Per the instructions, no profile was selected and no prose was touched.

---

## 3. Adult fallback share (Q-23, stays open)

| Metric | Phase 1 | Phase 1.1 |
|---|---:|---:|
| Age-25+ fallback share, base scenarios | 34.2–35.1% | **25.7–26.2%** |
| Age-25+ fallback share, threshold profiles | — | 24.0–29.5% |
| Anomalous scenario (runs end early) | 34.2% | 7.1% |
| Pre-25 fallback events | 0 | **0** |

Improved but still five times the 5% warning line. The anomalous figure shows the
mechanism clearly: fallback share is largely a function of how long runs continue
past their content. Design's instruction to re-measure rather than bulk-author
filler is upheld — this needs the ending economy settled first.

---

## 4. SPC exists but is nearly unreachable (Q-19)

| Scenario | SPC share of event-years |
|---|---:|
| no-talents | 0.00% |
| uniform-three | 0.43% |
| threshold-talents | 0.00% |
| material-talents | 0.00% |
| anomalous-talents | 5.01% |

Batch 005 adds 8 SPC events, satisfying the addendum's "non-zero SPC channel
use". But six of them gate on anomalous route flags (`ROUTE_ANO_*`), so a run
without T1028/T1029 essentially never enters the channel — even though
`ageChannelWeights` allocates SPC up to **13%** of the channel budget from age 12,
and T1023 "strongly favors" it.

The consequence is that T1023 currently has almost nothing to act on outside the
anomalous scenarios. Not blocking; flagged for content planning.

---

## 5. First manifestation is no longer WOOD-dominated (Q-22)

Neutral diagnostic — HUMAN, no talents, no material evidence, 4 000 runs:

| Family | Share | Mean first-manifestation age |
|---|---:|---:|
| WOOD | **24.8%** | 15.5 |
| CERA | 13.8% | 18.7 |
| STON | 13.4% | 19.2 |
| METL | 13.0% | 19.2 |
| GLAS | 12.7% | 18.9 |
| CRYS | 12.7% | 18.9 |
| TEMP | 9.7% | 20.6 |

Down from 52% and well under the 50% failure line. WOOD retains a modest lead
with a distinctly earlier mean age, which matches the intended small age-window
advantage rather than structural dominance. Runs with no manifestation at all:
0.1%. Multiple manifestations before commitment: 98.5%.

---

## 6. Ending coverage and the anomalous endings (Q-21)

| Metric | Phase 1 | Phase 1.1 |
|---|---:|---:|
| Distinct endings observed (best scenario) | 13/24 | **23/24** |
| END-ANO-001 | unreachable | observed |
| END-ANO-002 | unreachable | observed |

Both anomalous endings now arrive through their dedicated hidden SPC routes and
resolve to authorized awareness states (`Continuous` via T1028, `Displaced` via
T1029), with the engine correctly falling back to `Unconscious` when the
authorizing talent is absent.

---

## 7. Mandatory routes, priorityOrder, refinements

| Mechanic | Phase 1 | Phase 1.1 |
|---|---|---|
| `mandatory_only` events | none authored | 40–88% of runs use one |
| Schedule `priorityOrder` | field did not exist | authored on 11 schedules; ties now RNG-broken |
| `refinementTags` | did not exist | 3 events tagged; hooks act only at the event layer |
| Species tendency model | adapter-collapsed labels | canonical two-layer v1.2 model |

The one-visible-event-per-year invariant holds through the multi-year mandatory
sequences (asserted across 200 runs).

---

## 8. Family weighting A/B (Q-10) — baseline unchanged

At MID thresholds, 4 000 runs per arm:

| Metric | uniform (baseline) | sum_of_event_weights (diagnostic) |
|---|---:|---:|
| Completed | 49.1% | 51.2% |
| Material committed | 58.4% | 61.1% |
| Final-material entropy | 2.78 bits | 2.86 bits |
| Median ending age | 43 | 42 |
| Endings at 65+ | 20.2% | 15.1% |
| Distinct endings | 23/24 | 22/24 |

The two modes are close enough that nothing forces a change, so **the baseline
was not switched**. Density weighting mildly lifts the families with the most
authored events (INS/MED, TRN/STON) at the expense of thinner ones — which is
precisely the effect the design decision was meant to avoid, and it is visible
but small at current content volumes. It will grow as content grows.

---

## 9. Allocation policies (Q-17) — reported separately

| Policy | Completed | T1002 | T1007 | T1009 | T1017 |
|---|---:|---:|---:|---:|---:|
| BALANCED_RANDOM_FILL | 49.3% | 100% @ 3.3 | 94% @ 11.5 | 86% @ 7.6 | 37% @ 96.2 |
| MINMAX_PRIMARY_SECONDARY | 48.6% | 100% @ 6.0 | 87% @ 11.7 | 70% @ 6.4 | 37% @ 70.4 |
| ARCHETYPE_SET | 47.9% | 100% @ 6.1 | 76% @ 18.9 | 69% @ 6.2 | 51% @ 67.1 |

Outcome rates barely move, but **threshold-talent activation moves a lot** —
exactly the distortion Q-17 anticipated. Reporting a single blended activation
rate would have been misleading. T1017 in particular looks very different under
player-like builds (51% @ 67.1) than under balanced fill (37% @ 96.2), which is
evidence that the Phase-1 reading of Q-24 was partly an allocation artifact.

---

## 10. T1027 sensitivity (Q-14) — swept, not frozen

Anomalous-talent scenario at MID thresholds, 4 000 runs per arm:

| start FIX | Completed | Committed | Mean commitment age | Median ending age |
|---:|---:|---:|---:|---:|
| 5 | 76.4% | 76.6% | 36.0 | 41 |
| 8 | 86.0% | 86.1% | 35.0 | 39 |
| 10 | 91.4% | 91.6% | 34.3 | 39 |
| 12 | 94.2% | 94.2% | 33.8 | 38 |
| 15 | 98.2% | 98.2% | 32.7 | 37 |

Even the lowest swept value makes T1027 close to an auto-completion talent in its
scenario. The Phase-1 provisional +15 sits at 98.2%. **No value is selected here**
— design picks one, and the choice interacts with whatever threshold profile is
chosen (finding 2).

---

## Recommended order of decisions

1. **Ending-age shape (finding 2).** Decide the mid-life/late-life gate
   relationship and whether 18–24 needs climax content that opens before 25.
   Nothing downstream is meaningful until the distribution shape is right.
2. **Then pick a threshold profile** (Q-02) — the sweep is ready and reruns cheaply.
3. **Then T1027** (Q-14), since its effect depends on the chosen profile.
4. **Then re-measure fallback** (Q-23) and **T1017** (Q-24) against the settled
   economy, as design already instructed.
5. **SPC reachability** (finding 4) whenever route/special content is next planned.

H2 remains **CLOSED**. Phase 1.1 stops here pending design review.
