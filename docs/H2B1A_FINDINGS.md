# SOLID STATE — H2B.1A Findings

**Working balance + timing correction.** LOW is now the working canonical H2B
balance; it is **not** the final freeze. Decisions stay in
[`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); generated data is in
[`reports/h2b1a-regression.md`](../reports/h2b1a-regression.md) and `.json`.

| Field | Value |
|---|---|
| Content fingerprint | `8638e2e1ebd977878d09c28c1d554d7b85e2174f24fcf7aa568df018541d214e` |
| Corpus | 215 events · 8 batches · 25 endings · 39 route tags |
| Regression | 3 000 runs, seed `h2b1a_timing`, species stratified · uniform-three · `ARCHETYPE_SET` · uniform family weighting · max age 120 |
| Reference | the committed H2B Batch 008 report (identical sampling); no second large pre-patch run was spent |
| Tests / build | 366 passing · production build clean · browser snapshot regenerated |

---

## 1. Regression headline

| Metric | H2B (LOW + Batch 008) | **H2B.1A** | Move |
|---|---|---|---|
| Completion | 55.4% | **71.6%** | +16.2 |
| Commitment | 72.3% | **83.4%** | +11.1 |
| Mean commitment age | 34.9 | **41.4** | **+6.5** |
| Median commitment age | 35 | **36** | +1 |
| 18–24 | 1.3% | 0.9% | −0.4 |
| 25–34 | 19.6% | **21.2%** | +1.6 |
| 35–44 | 48.0% | **35.2%** | **−12.8** |
| 45–54 | 20.8% | 14.0% | −6.8 |
| 55–64 | 1.6% | 1.7% | — |
| 65+ | 8.7% | **26.9%** | **+18.2** |
| Ending coverage | 25/25 | **25/25** | held |
| Material entropy | 3.054 | **3.132** | +0.08 |
| Faction endings | 10.6% | 10.1% | −0.5 |
| Guardrail failures | 0 | **0** | held |

**Correctness counters: all zero.** No pre-18 ending or commitment, no pre-25
coverage defect or generic fallback, no illegal faction transition, no lifecycle
collision, no personalized event after a safe exit, and the single-active-faction
invariant holds (max 1 simultaneously active, 0 contacts opened while another
relationship was live).

35–44 remaining the largest bucket is **not** treated as a failure, per the
timing design. It fell 12.8 points anyway.

### The one thing design needs to look at

**Unbounded Continuity Review coverage moved a large block of endings into 65+.**

A-04 required two things: a data-driven trigger, and *"coverage does not stop at
69."* Removing the age caps from `EVT-INS-MED-2001/2002/2003` did exactly what it
was asked to do — extreme-STR review exposure went from **12.0% to 100%** — and
it also created a late-life ending pathway that did not exist before.
`END-MED-003 Benefit Approved` now accounts for **470 endings (15.7% of all
runs)** at a mean review age of 83.5, and the 65+ bucket rose from 8.7% to 26.9%.

The same effect explains the commitment-age split: **mean 41.4 against median
36.** The median barely moved; the mean is dragged by a long late tail of covered
stabilizations. Reporting only the mean here would be misleading.

This is a direct consequence of a frozen design instruction, so **nothing was
tuned away.** The options — cap the benefit chain at some age, weight it down in
old age, or accept a late-life insurance ending as canonical — are design's.

---

## 2. Working canonical balance

LOW applied mechanically to the retained gate assignments: **31 FIX gates
rewritten** across event `include` conditions and the `validityCondition` of
every schedule pointing at a gate-assigned event, so a profile can never be
half-applied.

| Gate | Value |
|---|---|
| `commitment_standard` | 28 |
| `climax_temporal` | 34 |
| `climax_medical` | 36 |
| `climax_standard` | 40 |
| `climax_anomalous` | 36 |
| `climax_late` | 36 |

The historical profile machinery is untouched: `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`
and `applyThresholdProfile` still work, and the reversible LOW/MID/HIGH rewrite
still applies on top of the new baseline for any future sweep. **This is a
working balance, not a freeze.**

---

## 3. Corrections A-01 … A-11

| ID | Result |
|---|---|
| **A-01** | Buyout is now `TLT[T1013] \| MNY>=10`. Of 184 runs reaching the follow-up, **6 bought out (3.3%)** and **178 kept the obligation** — recovery no longer cancels the lien. |
| **A-02** | `EVT-INS-FIN-2004` maturation fires in **156 runs (5.2%)** at mean age **25.8**, feeding 101 finance climaxes. |
| **A-03** | Black Ledger escalation now reads the DEBTOR obligation plus FIX/material evidence. 98 contacts → 84 ENGAGED → **22 COMMITTED at mean age 28.2**, all 22 holding DEBTOR. 72 opt-outs remain, so wealth and Property Lawyer still buy a genuine exit. |
| **A-04** | Trigger facility implemented and canonical (below). Extreme-STR review exposure **12.0% → 100%**, and **0 long survivors at STR ≤ −3 without a review** (was 1 218). |
| **A-05** | `EVT-INS-MED-2002` reordered. Expedited (`STR<=-3`) went from **never firing** to **335 runs (29.6%)**; covered stabilization 69.8%; the old catch-all independent-treatment branch, now `TLT[T1015] \| (MNY>=10 & INT>=12)`, drops to 0. |
| **A-06 / A-07** | `EVT-INS-MED-2003` reordered with one branch per unambiguous manifestation family. Benefit endings now respect evidence: **SYNT 253, STON 48, CERA 42, CRYS 40, METL 30, WOOD 29, GLAS 28** — synthetic share fell from 88.9% to **53.8%**. |
| **A-08** | `ROUTE_ARC_SELF_OWNED` added. `END-LEG-002` went from **never firing** to **15 endings**, 5 of them through the structural-housing climax. |
| **A-09** | Lottery tightened to `MNY<=0`. Incidence fell **12.9% → 3.0%**. |
| **A-10** | Metadata-only `relocation` route tag added (Route Tag Registry **v1.3**). The analyst list is gone; the diagnostic reads the corpus. Relocations: 3 880 occurrences across 2 197 runs, **30.7% of housing events**. |
| **A-11** | Age-1 prose replaced. Effects unchanged, verified by the patch script. |
| **A-12** | Contributor audit generated (below). **No stat effect was edited.** |

---

## 4. A-04 — the state-trigger facility

Declared in `content/balance/SOLID_STATE_STATE_TRIGGERS_v0.1.json`, executed by
`src/engine/triggers.ts`, evaluated once per year after the year's event has
fully resolved.

What it is: a trigger re-evaluates an ordinary condition against ordinary run
state and, if it holds, enqueues an **authored future event**. What it is not: a
meter. Nothing is stored, nothing accumulates, the condition grammar is
unchanged, and the engine hard-codes no trigger.

The four guarantees the instruction asked for, and how each is enforced:

| Requirement | Enforcement |
|---|---|
| schedules future authored events only | the target must exist in the corpus (validated at load) and `offsetYears >= 1` (schema + load-time check) |
| prevents duplicate reviews | quiet while the target is already pending, while `suppressWhile` holds, or once the target's repeat policy is exhausted |
| preserves one event per year | it only enqueues; the annual loop still emits exactly one entry, asserted over 60 full runs |
| not a hidden meter | no stored state; every trigger is canonical data |

**It fired zero times in 3 000 runs — and that is the honest result, not a bug.**
Removing the age cap made `EVT-INS-MED-2001` (HIGH weight, `STR<=1`) reachable by
the ordinary draft at every adult age, so every run that would have needed the
safety net now draws the review first. The mechanism is proven by direct unit
test (schedules once at STR −5 / age 30, refuses to duplicate, stays quiet under
`suppressWhile`, does nothing at STR 4). It remains in place as the guarantee
that a state can summon institutional attention even when no event does.

---

## 5. A-12 — stat contributor audit

Ranked authored CHR / INT / SPR contributors by event variant and age band, from
the 3 000-run regression. **Report only. No stat effect was edited.** Full tables
are in section 13 of the generated report; the top contributors are:

| Stat | Band | Largest positive | Largest negative |
|---|---|---|---|
| CHR | 0–17 | `EVT-ORD-SOC-0001` +1 ×4 628 | *none* |
| CHR | 18–34 | `EVT-ORD-CIV-0002` +2 ×942 | `EVT-INS-CIV-0007` −1 ×8 |
| CHR | 35–64 | `EVT-ORD-SOC-0003` +1 ×957 | `EVT-ORD-SOC-0004` −1 ×1 407 |
| CHR | 65+ | *none* | `EVT-ORD-SOC-0004` −1 ×**11 835** |
| INT | 0–17 | `EVT-ORD-EDU-0007` +2 ×1 916 | *none* |
| INT | 18–34 | `EVT-ORD-CIV-0002` +1 ×984 | *none* |
| INT | 35–64 | `EVT-ORD-FAM-0007` +1 ×1 635 | `EVT-ORD-GEN-2001` −2 ×920 |
| INT | 65+ | `EVT-ORD-FAM-0007` +1 ×279 | `EVT-ORD-GEN-2001` −1 ×9 |
| SPR | 0–17 | `EVT-ORD-SOC-0001` +1 ×4 628 | `EVT-ORD-EDU-0007` −1 ×1 916 |
| SPR | 18–34 | `EVT-ORD-SOC-0006` +2 ×1 347 | `EVT-TRN-TEMP-0001` −2 ×1 113 |
| SPR | 35–64 | `EVT-ORD-FAM-0005` +2 ×3 143 | `EVT-TRN-TEMP-0001` −2 ×719 |
| SPR | 65+ | `EVT-INS-MED-2001` +1 ×988 | `EVT-INS-CIV-0009` −1 ×1 386 |

Three things the audit makes concrete for the later Stat Ecology correction:

1. **`EVT-ORD-SOC-0004` is single-handedly the CHR curve after 65** — −11 835
   total magnitude, an order of magnitude beyond anything else in that band. Its
   reunion is repeatable with no cap, so a long survivor attends it dozens of
   times.
2. **INT has exactly one authored negative source in the whole corpus**
   (`EVT-ORD-GEN-2001`), concentrated in 35–64. Nothing pushes INT down at 65+ or
   before 35, which is why 100% of runs still finish above their starting INT.
3. **SPR's positives are broad, not concentrated.** No single event dominates the
   way `EVT-ORD-SOC-0004` does for CHR; the accumulation is spread across
   ordinary social/family content, so a fix has to be structural rather than a
   patch to two or three events. SPR ≥ 15 still holds for 96.2% of 65+ survivors.

---

## 6. Round-2 review checklist

| Hard requirement | Result |
|---|---|
| all correctness counters zero | **pass** |
| single-active-faction invariant | **pass** (max 1, 0 violations) |
| tests / build / browser snapshot | **pass** (366 tests, clean build, snapshot regenerated) |
| no pre-18 ending or commitment | **pass** (0 / 0) |

| Soft goal | Result |
|---|---|
| completion broadly playable (~45–70 review band) | 71.6% — just above the band |
| 65+ not survivor-dominant | 26.9%; 35–44 is still the largest bucket, so not dominant, but this is the number that moved most |
| broad ending coverage | 25/25 |
| maturation observable | yes — 156 runs, mean age 25.8 |
| extreme STR review exposure rises dramatically | **12.0% → 100%** |

Explicit non-blocker: 35–44 remains the largest bucket, and was not chased.

---

## 7. Unresolved

Four items are recorded for design review in
[`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md) as **H2B1A-C1 … H2B1A-C4**: the 65+
shift created by unbounded review coverage, the now-unreachable
`EVT-INS-MED-2002` independent-treatment branch, the maturation event's 60.9%
ambiguous-evidence outcome, and the one relocation variant the event-level tag
cannot express.

Nothing here freezes LOW, and no threshold sweep, family A/B, allocation
comparison, T1027, T1023 or manifestation diagnostic was run.
