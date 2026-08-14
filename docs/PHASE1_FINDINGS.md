# SOLID STATE — Phase-1 Simulation Findings

## Version 0.1 — for the post-H1 design review

> **Note (Part B, 2026-08-14):** the generated report this document was
> written from is no longer tracked in git — it measured an earlier corpus.
> The conclusions below are unchanged. See
> [`reports/REPORT_INDEX.md`](../reports/REPORT_INDEX.md) for what it measured and the command
> that regenerates it.

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).** Resolve them there, not here.


Source data: `reports/monte-carlo.md` / `.json` (10 000 runs × 5 talent
scenarios, species-stratified, base seed `phase1`) and
`reports/monte-carlo-strict.md` (2 000 runs × 5 scenarios under the
contract-faithful pre-25 coverage policy).

Content snapshot: `SOLID_STATE_PROJECT_SNAPSHOT_v0.7`, 106 events, unmodified.
Balance: `SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json`, unmodified.

**These are measurements.** Per the handoff, no creative content and no balance
multiplier was tuned. The two blocking findings are content/balance decisions.

---

## Headline

Two findings block the balance freeze. Everything else is measurable and healthy.

| # | Finding | Severity |
|---|---|---|
| 1 | 83–85% of runs die at age 4–5 from an empty pre-25 event pool | **blocking** |
| 2 | Endings are effectively unreachable: 0.09–0.73% completion (6.4% with T1027) | **blocking** |
| 3 | Fallback share at age 25+ is 34–35% against a 2% target | high |
| 4 | 95–99% of route schedules expire unfired | high |
| 5 | Ending coverage is 1–14 of 24; two endings are unreachable by construction | medium |
| 6 | Material determinism is far *below* its guardrails, not above | informational |
| 7 | First manifestation is 52% WOOD and pinned to age 18 | medium |

---

## 1. Pre-25 coverage collapses at ages 4–5 (blocking)

Under the default strict policy, across all five scenarios:

| Scenario | Coverage-defect runs | Defect ages |
|---|---:|---|
| no-talents | 1 692 / 2 000 (84.6%) | 4, 5 |
| uniform-three | 1 670 / 2 000 (83.5%) | 4, 5 |
| threshold-talents | 1 678 / 2 000 (83.9%) | 4, 5 |
| material-talents | 1 690 / 2 000 (84.5%) | 4, 5 |
| anomalous-talents | 1 661 / 2 000 (83.0%) | 4, 5 |

Ages 0–5 are six years served by exactly six available event-years, and the
third occurrence of the one repeatable baseline event is only reachable if its
first occurrence lands on age 0 or 1. Weighted drafting has no lookahead, so the
band runs dry roughly five times in six. Full arithmetic in **CONFLICT C-5**.

The `SOLID_STATE_CONTENT_AUDIT_v0.2.md` line *"Pre-25 repeatable baseline
coverage gaps: 0 PASS"* appears to have measured capacity rather than
schedulability.

**Decision needed.** Add 2–3 repeatable `baseline` events covering ages 0–5, or
loosen `EVT-ORD-FAM-0002`'s cooldown/max count. Adding events restores margin;
loosening the cooldown restores only the exact fit.

All remaining numbers come from the diagnostic policy
(`--pre25-coverage reuse_baseline_repeatables`), which rescues only the affected
pre-25 years and touches no content.

---

## 2. Endings are effectively unreachable (blocking)

| Scenario | Completed | Nonterminal at 120 | Material committed | Final FIX p50 / p99 / max |
|---|---:|---:|---:|---:|
| no-talents | **0.10%** | 99.9% | 16.0% | 26 / 49 / 53 |
| uniform-three | **0.73%** | 99.3% | 22.0% | 27 / 51 / 61 |
| threshold-talents | **0.09%** | 99.9% | 15.5% | 26 / 49 / 52 |
| material-talents | **0.16%** | 99.8% | 15.2% | 26 / 50 / 52 |
| anomalous-talents | **6.42%** | 93.6% | 81.7% | 44 / 55 / 62 |

Every ending arrives via a `climax`-priority schedule, and nine of the twelve
climax events gate on `FIX>=55`. The content slice contains at most ~39 FIX
before commitment and ~56 across a whole life, so reaching a climax requires
drafting nearly every FIX-granting event in its age window.

The anomalous scenario isolates the cause: it differs from the others only by
holding T1027, whose provisional +15 start FIX raises completion **64×** and
commitment **5×**. FIX headroom — not route density, not channel weighting — is
the single binding constraint. Full FIX budget table in **CONFLICT C-6**.

Downstream consequences, all traceable to this one cause:

- `targetEndingAgeShare` is missed in **every band in every scenario**. Observed
  endings cluster at 35–54 (54–87% of completions) against a target that puts
  53–62% of endings before 35. Nothing ends in the 18–24 band, which targets
  18–22%.
- Median ending age is 41–47 against a target distribution centred on 25–34.
- No ending occurs past age 64, because the latest climax event
  (`EVT-INS-CIV-0006` / `EVT-INS-ACA-0005/0006`) has `age.max = 64`. The 65+
  target band of 2–5% is unreachable by construction, independent of balance.

**Decision needed.** Any of: more FIX sources; lower climax thresholds; a
per-year FIX drift (no such field exists in `BALANCE_CONSTANTS` — if FIX was
meant to accumulate with age, the field is simply missing); or higher TRN
channel weight. All are design calls.

---

## 3. Fallback use is ~17× its target

| Metric | Observed | Target |
|---|---:|---:|
| Fallback share of age-25+ event-years | 34.2–35.1% | 2% (warn above 5%) |
| Fallback share of all event-years | 26.8–27.9% | — |
| Pre-25 fallback events | **0** | 0 (hard rule, satisfied) |

The pre-25 rule is correctly never violated. But after roughly age 45 the
`once_per_run` pool is exhausted and `EVT-ORD-GEN-0001` carries about a third of
all adult years. This is partly an artefact of finding 2 — runs that should have
ended at 30–45 instead continue to 120 through a nearly empty pool — so
fallback share should be re-measured after the ending economy is fixed.

Channel mix decays accordingly:

| Age band | ORD | INS | TRN | SPC |
|---|---:|---:|---:|---:|
| 0–5 | 92% | 8% | 0% | 0% |
| 12–17 | 73% | 20% | 8% | 0% |
| 25–34 | 42% | 30% | 28% | 0% |
| 45–54 | 79% | 21% | 0% | 0% |
| 65+ | 98% | 2% | 0% | 0% |

Against the neutral weights (65+: ORD 35 / INS 18 / TRN 34 / SPC 13), the late
bands are dominated by ORD purely because nothing else remains eligible. SPC is
0% everywhere because **no SPC events exist** (CONFLICT C-7).

---

## 4. Route schedules almost always expire unfired

| Metric | uniform-three |
|---|---:|
| Route entry rate (run enters ≥1 route) | 100% |
| Route climax rate (run fires a climax schedule) | 0.73% |
| Route abandonment/expiry rate (run has ≥1 expired schedule) | 98.5% |
| Expired schedules, total | 30 100 across 10 000 runs |
| Priority collision rate | 1.2% |
| Schedule displacements per run | 0.01 |

Routes are entered readily and climax almost never. Since climax schedules gate
on `FIX>=55`, this is finding 2 seen from the scheduling side rather than an
independent problem.

Priority collisions are rare (1.2% of runs), so the priority-class design is not
currently under stress — but it is also barely exercised, and no canonical
content uses `mandatory` priority at all.

---

## 5. Ending coverage

| Scenario | Distinct endings observed |
|---|---:|
| no-talents | 1 / 24 (`END-MED-001` only) |
| uniform-three | 13 / 24 |
| threshold-talents | 1 / 24 |
| material-talents | 1 / 24 |
| anomalous-talents | 14 / 24 |

`END-MED-001` "Last Version of You" dominates every scenario (79% of completions
in anomalous, 70% in uniform-three) because `EVT-INS-MED-0003` gates at
`FIX>=50` rather than 55 — the lowest climax threshold in the game.

`END-ANO-001` and `END-ANO-002` are referenced by **no event variant**, so the
anomalous endings that T1028/T1029 exist to unlock cannot occur. Ending coverage
is capped at 22/24 by content, not by balance.

---

## 6. Material determinism is far below its guardrails

| Check | Observed range | Guardrail |
|---|---|---|
| P(final X \| hint X) | 3.5–5.0% (17.2% max in anomalous) | ≤ 70% |
| P(final X \| first manifestation X) | 0.0–4.0% (16.7% max in anomalous) | ≤ 80% |
| Multiple manifestations before commitment | 99.0–99.2% | should be common |
| Final-material entropy by species | 1.35–1.46 bits | — |

The material model is behaving as designed — evidence is directional, not
deterministic, and contesting manifestations are near-universal. If anything the
signal is *too weak*: a childhood hint currently predicts the final material
barely better than chance. Worth revisiting only after finding 2, since most
runs never commit at all.

Species differentiation is present but mild (entropy 1.35 for DWARF vs 1.46
for WINGED_KIN), which is consistent with soft tendencies that never hard-lock.

Average ages: first hint 9.5, first manifestation 18.3–18.5, commitment
33.4–35.9.

---

## 7. First manifestation is skewed and age-pinned

`EVT-TRN-WOOD-0001` (ages 12–17) is the only manifestation event available
before 18; the other six all open at exactly 18. Consequently WOOD is the first
manifestation in ~52% of runs (5 249 of 10 000) while the other six families
take ~8–10% each, and `averageFirstManifestationAge` is pinned at 18.3–18.5 in
every scenario.

Given the "no single-evidence certainty" rule this does not currently distort
final materials — but it does mean early-life material identity is
disproportionately wooden, and manifestation timing carries no variance.

---

## 8. Talent engine

Activation behaves correctly. `start` / `start_hidden` talents activate at 100%.
Threshold talents:

| Talent | Condition | Activation rate | Avg activation age |
|---|---|---:|---:|
| T1002 Knows Excel | `INT>=5` | 100.0% | 4.4 |
| T1009 Frugal | `MNY<=3` | 90.2% | 6.5 |
| T1007 Pretty Privilege | `CHR>=8` | 89.1% | 15.0 |
| T1017 Late Bloomer | `AGE>=35 & CHR<=5` | 78.7% | 91.2 |

Three of the four resolve in childhood. The allocation policy produces
roughly-even spreads that already sit close to the thresholds (ASSUMPTION A-12),
so `INT>=5` and `MNY<=3` are met almost immediately. A player-realistic
allocation with more extreme builds would push activation later, and these rates
should be re-measured against one before they are trusted.

`T1017 Late Bloomer` is the outlier worth attention: it activates at an average
age of **91.2**, far past any intended life span, because `CHR<=5` is usually
only satisfied after decades of CHR drift. In a run that ended at a target age
of 25–44 it would rarely fire at all — its 78.7% activation rate is an artefact of
runs continuing to 120 (finding 2). Re-measure after the ending economy is
fixed.

---

## Recommended order of decisions

1. **Fix pre-25 coverage (C-5).** Nothing else can be measured honestly under
   the strict policy until this is closed.
2. **Decide the FIX economy (C-6).** It gates endings, route climaxes, ending-age
   distribution, ending coverage and fallback share simultaneously. Most other
   numbers in this report will move once it changes.
3. **Re-run this report**, then revisit fallback share, channel mix and material
   determinism against the new baseline.
4. **Resolve the representational conflicts** (C-1 species tendency labels,
   C-2 talent hook polarity, C-3 awareness prose, C-4 route tag namespaces) so
   the provisional adapter file can be retired into the registries.
5. **Then** consider freezing a first-playable balance set and opening H2.

Per acceptance §Q, Phase 1 stops here.
