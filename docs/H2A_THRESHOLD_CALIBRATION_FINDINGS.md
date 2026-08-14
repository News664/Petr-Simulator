# SOLID STATE — H2A Threshold Calibration Findings

**Analysis only.** Nothing here selects, freezes, interpolates or writes a
threshold profile. Canonical FIX gates were not edited. Decisions stay in
[`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); the generated data is in
[`reports/h2a-threshold-calibration.md`](../reports/h2a-threshold-calibration.md)
and `reports/h2a-threshold-calibration.json`.

| Field | Value |
|---|---|
| Plan | `content/balance/SOLID_STATE_H2A_THRESHOLD_CALIBRATION_PLAN_v0.1.json` v0.1 |
| Telemetry spec | `docs/balance/SOLID_STATE_H2A_THRESHOLD_TELEMETRY_SPEC_v0.1.md` v0.1 |
| Content fingerprint | `f802a2524d2a16ab418bb7fe810a002335d94584d40614fcefbd061526f3d3a9` |
| Arms | CURRENT_AUTHORED (control), LOW, MID, HIGH |
| Runs | 3 000 per arm, 12 000 total, base seed `h2a_threshold_v01` |
| Sampling | species stratified, uniform-three talents, `ARCHETYPE_SET`, uniform family weighting, max age 120 |
| Correctness | all counters zero in all four arms |

The control is the **current authored corpus with no threshold rewrite**. The
Phase 1.1 `ORIGINAL_REFERENCE` profile was deliberately not used: canonical gates
changed after Phase 1.1, so that arm is historical, not today's baseline. The
retained `reports/phase1_1-experiments.*` are untouched.

---

## 1. Headline

| Arm | Completion | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ | Commitment | Mean commit age | Ending coverage | Faction endings |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **CURRENT_AUTHORED** | 25.7% | 1.2% | 16.9% | 20.1% | 9.3% | 1.7% | **50.8%** | 37.6% | 35.7 | 75.0% (18/24) | 16.5% |
| **LOW** | **42.5%** | 1.1% | 16.6% | 48.4% | 20.6% | 1.8% | 11.4% | **61.4%** | 35.3 | 91.7% (22/24) | 11.1% |
| **MID** | 33.1% | 0.7% | 17.1% | 52.5% | 18.5% | 1.0% | 10.1% | 51.2% | 35.4 | **100% (24/24)** | 11.3% |
| **HIGH** | 24.3% | 2.2% | 18.1% | 51.2% | 18.7% | 2.5% | 7.4% | 39.8% | 35.4 | 83.3% (20/24) | 16.6% |

Bucket shares are shares of completed runs. Every arm passes every correctness
counter: no ending or Material Commitment before 18, no pre-25 coverage defect or
generic fallback, no illegal faction transition, no lifecycle collision, no
personalized faction event after a safe exit.

### The decisive result is a negative one

**FIX threshold height controls how many lives end. It does not control when
they end.**

Mean Material Commitment age is **35.7 / 35.3 / 35.4 / 35.4** across
CURRENT_AUTHORED / LOW / MID / HIGH — a spread of 0.4 years across a threshold
range that moves completion by 18 percentage points. Median is 36 in all four
arms; p10/p90 are 28–29 / 41–42 in all four.

Because a canonical ending follows commitment, relocating the FIX gates simply
moves the ending mass from the 65+ survivor pile into **35–44**, which becomes
the largest bucket in all three rewrite arms (48–53%). The intended modal window,
**25–34, does not move at all**: 16.9% → 16.6% / 17.1% / 18.1%. The 18–24 band
stays ~1–2% everywhere.

This is the same conclusion Phase 1.3 and 1.3.1 reached from the other direction,
now confirmed from the threshold side: the 18–34 shortfall is a **content-supply
and commitment-timing** problem, and the threshold lever cannot reach it.

---

## 2. Recommended provisional arm

**LOW is the most plausible of the four for a provisional H2A playtest profile —
and no arm is satisfactory against the plan's own review bands.** Both halves of
that sentence matter.

### Why LOW, taken against the review guide's priority order

1. **Completion is closest to usable.** 42.5% against the 45–70% review zone, up
   from the control's 25.7%. It is the only arm within reach of the band. MID
   (33.1%) and HIGH (24.3%) are not, and HIGH is statistically indistinguishable
   from doing nothing.
2. **25–34 is not restored by any arm.** LOW is not preferred here; nothing is.
3. **Commitment timing is unchanged by every arm.** No arm earns this point.
4. **The 65+ survivor pileup collapses** in all three rewrite arms — 50.8% →
   11.4% (LOW), 10.1% (MID), 7.4% (HIGH). HIGH is nominally best, but on a much
   smaller completion base.
5. **The old core routes reappear, and LOW is decisively the strongest.** Endings
   per 3 000 runs:

   | Route | CURRENT | LOW | MID | HIGH |
   |---|---|---|---|---|
   | `INS/CIV` (legal/bureaucratic) | 4 | **86** | 53 | 24 |
   | `INS/MUS` (museum) | 5 | **79** | 52 | 21 |
   | `INS/REL` (religious) | 3 | **48** | 21 | 16 |
   | `INS/ARC` (archive) | 2 | **26** | 16 | 8 |
   | `INS/FIN` (finance) | 1 | **11** | 6 | 5 |
   | `INS/COR` (corporate) | 1 | 8 | **9** | 2 |
   | `INS/ACA` (academic) | 1 | **6** | 4 | 3 |

   Under the current corpus these seven routes together produce **17 endings in
   3 000 runs**. LOW produces 264. This is the single largest qualitative
   difference between the arms, and it is exactly the finding Phase 1.3 flagged
   as "the five routes whose endings are still never observed".
6. **Faction terminality stays secondary in every arm,** and LOW is the lowest:
   11.1% of completions, versus 16.5% in the control and 48.6% back in Phase 1.2.
   No arm re-creates the Phase 1.2 faction dominance.
7. **Material guardrails hold, and LOW is the least deterministic.** Overall
   material entropy: 2.111 (control) → **2.836** (LOW), 2.560 (MID), 2.186
   (HIGH). No `hint-determinism-*` or `manifestation-determinism-*` guardrail
   fired in any arm. Completion is not being bought with material determinism.
8. **Stat behaviour is essentially arm-independent** (section 3), so the stat
   telemetry does not argue for or against any profile.

MID's one clear advantage is **ending coverage: 24/24, the first time the whole
registry has been observed in a single pass**, against LOW's 22/24. If design
values full registry coverage over route breadth and completion, MID is the
defensible alternative. HIGH should not be selected: it costs the control's
survivor-heavy shape without buying meaningfully more completion.

### Tradeoffs to accept if LOW is chosen provisionally

- **35–44 becomes the dominant bucket at 48.4%** against a 20–25% target. The
  distribution is no longer bimodal, but it is now unimodal in the wrong decade.
- **45–54 doubles** to 20.6% against an 8–12% target.
- **57.5% of runs are still nonterminal**, which the engine reports as a
  guardrail *failure* in every arm, including LOW.
- **Commitment rises to 61.4%** while commitment *age* does not move, so more
  lives commit at ~35 and then end at ~42. The mid-life route restoration in
  point 5 is real, but it lands a decade later than design wants.

### If no arm is chosen

That is a legitimate reading of this data, and the review guide anticipates it.
The bands the plan cares about most — 25–34 as the major bucket, commitment in
the late 20s — are untouched by all four arms. Choosing LOW buys route breadth
and a plausible completion rate for human playtesting; it does not buy the
ending-age shape. **No profile was interpolated, auto-tuned or written into
content.**

---

## 3. Visible-stat telemetry

Denominators are printed on every row of the generated report. Fixed-age
snapshots include only runs still active entering that age; `final` includes all
3 000 runs and therefore mixes a 25-year-old's final state with a 120-year-old's.
Stats are unclamped in canonical balance and nothing here clamped them.

CURRENT_AUTHORED, mean drift from the post-setup start:

| Snapshot | Active | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start | 3000 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| age 18 | 3000 | +4.06 | +9.23 | +2.77 | +0.27 | +5.78 |
| age 25 | 2991 | +5.98 | +10.44 | +4.14 | +1.43 | +6.07 |
| age 35 | 2861 | +8.47 | +11.54 | +6.10 | +2.38 | +5.49 |
| age 50 | 2656 | +9.42 | +12.94 | +5.90 | −1.63 | +14.28 |
| age 65 | 2621 | +8.29 | +13.53 | +3.82 | −2.41 | +30.46 |
| final | 3000 | +0.28 | +13.39 | −5.18 | −2.01 | +44.65 |

The playtest observations check out, with two corrections.

**Confirmed — CHR and INT do exceed 15.** Share at ≥15: CHR peaks at 34.8% at age
50; INT reaches 39.8% by 18 and 57.3% by 65. This is not an artefact of a few
outliers — INT's median at 65 is well inside the tail.

**Confirmed — MNY is flat then downward.** Mean drift +2.38 at 35, −2.41 at 65,
−2.01 final. **51.1% of runs end with MNY ≤ 2**, and 54.6% of runs still alive at
65 are at MNY ≤ 2. Authored MNY deltas per 1 000 run-years: 77.5 positive events
(+101.9) against 110.5 negative (−124.3).

**Corrected — SPR is not flat, it is the runaway stat.** 493.7 positive authored
SPR deltas per 1 000 run-years against 136.7 negative — SPR rises in roughly one
year in two. **98.4% of runs alive at 65 are at SPR ≥ 15**, and 95.4% of all runs
end with SPR higher than they started. The playtest read SPR as flat because it
is flat *until about 40*: drift is +5.8 at 18, +5.5 at 35, then +14.3 at 50 and
+30.5 at 65. It is a late-life accumulator, driven by the highest-frequency
ordinary events (`EVT-ORD-GEN-0003`, `EVT-ORD-SOC-0004`, `EVT-ORD-FAM-0007` all
carry +1/+2 SPR and together fire ~200 times per 1 000 run-years).

**New — INT is strictly monotonic.** There is **not one negative authored INT
delta anywhere in the corpus** (0.0 per 1 000 run-years), so 100% of runs end
with INT higher than they started. Every other visible stat can fall.

**New — CHR and STR collapse in old age.** Both peak around 35–50 and then fall:
48.6% of runs end at CHR ≤ 2 and 66.4% at STR ≤ 2, against 0.2% and 1.6% at age
35. This is the late-life aging content acting on the survivor population.

Arm-to-arm differences are small (final MNY drift −2.01 / −1.03 / −1.32 / −1.74;
final CHR ≥15 share 10.0% / 14.4% / 12.5% / 9.8%), and are explained by the
rewrite arms ending lives earlier rather than by any change to stat effects.

---

## 4. Event frequency and housing

Top of the corpus by occurrence, per 1 000 run-years (CURRENT_AUTHORED):

| Event | /1k run-yr | Run incidence | Repeat rate | Mean when seen | Max |
|---|---|---|---|---|---|
| `EVT-ORD-GEN-0001` (generic quiet year) | 100.3 | 74.3% | 100.0% | 14.01 | 19 |
| `EVT-ORD-GEN-0003` | 90.0 | 74.4% | 99.9% | 12.56 | 13 |
| `EVT-ORD-SOC-0004` | 87.5 | 87.4% | 95.5% | 10.40 | 13 |
| `EVT-ORD-FAM-0007` | 24.7 | 88.0% | 99.1% | 2.91 | 3 |
| `EVT-ORD-HEA-0001` | 23.2 | 88.2% | 97.7% | 2.73 | 3 |

The six `*-1003`/`*-1013` lore-fallback bulletins each appear at ~21.8/1 000 with
77% run incidence — the lore tier is doing its job and is confirmed inert.

### Housing — the playtest observation is a corpus-frequency issue, not one event

Attribution is by the canonical `housing` route tag: `EVT-ORD-FAM-0003`,
`EVT-ORD-HOU-0001`, `EVT-ORD-HOU-0002`, `EVT-ORD-HOU-0003`.

| Arm | Runs with any | /1k run-yr | Runs with 2+ | Mean when seen | Max in one run |
|---|---|---|---|---|---|
| CURRENT_AUTHORED | 2 988 (99.6%) | 34.4 | 2 851 (**95.0%**) | 3.58 | 6 |
| LOW | 2 980 (99.3%) | 39.4 | 2 812 (93.7%) | 3.50 | 6 |
| MID | 2 979 (99.3%) | 36.5 | 2 824 (94.1%) | 3.51 | 6 |
| HIGH | 2 985 (99.5%) | 35.2 | 2 825 (94.2%) | 3.61 | 6 |

**Effectively every life sees housing, and 95% see it at least twice.** No single
event dominates — the four split roughly 83/54/39/32 occurrences per 3 000 runs
in the control — so this is the housing *family* being large relative to its
authored variety, not one runaway repeatable. Each event is already capped
(`repeatMaxCount` 2 for the two repeatables, once-per-run for the other two), so
the ceiling of 6 per life is authored, not accidental.

Housing carries the corpus's clearest MNY sink: **−0.89 MNY per housing event,
−3.10 MNY per run that sees housing**, against +0.88 SPR per event. That is a
meaningful share of the MNY decline in section 3.

**No housing content was rewritten in this task,** per instruction.

---

## 5. Low-stat conditional risk

Person-years from age 18, classified by the stat entering that year, followed 3
and 5 years. Person-years censored by the diagnostic maximum age are dropped, not
counted as "no event". Correlation only.

CURRENT_AUTHORED, 5-year horizon, P(any ending):

| Stat | critical (≤2) | vulnerable (3–4) | ordinary+ (≥5) |
|---|---|---|---|
| CHR | 0.17% | 1.32% | **2.27%** |
| STR | 0.36% | 1.76% | **2.50%** |
| MNY | 1.57% | 1.89% | **2.19%** |
| INT | — (n=0) | 1.83% | 1.87% |
| SPR | **4.05%** | 3.42% | 1.71% |

**Low visible stats currently make a life safer, not more dangerous.** For CHR
and STR the critical band carries roughly a *seventh* of the ordinary band's
ending probability; the same inversion holds for Material Commitment (CHR
critical 0.09% vs ordinary 4.24% at 5 years). Two mechanisms explain it: the
institutional routes gate on attributes, so a low-stat life is filtered out of
the pathways that end lives; and CHR/STR reach the critical band mostly in old
age, after the ending windows have passed.

SPR is the one stat that runs the intended direction — critical SPR carries 4.05%
against 1.71% ordinary — but SPR ≤2 is only 5% of person-years and is
concentrated early.

The pattern is stable across arms; LOW simply scales every probability up with
its higher completion (CHR ordinary+ 4.73%, critical 0.22%), leaving the
inversion intact.

**This is measurement only.** No low-stat danger weighting, generic death or
visible-stat pressure mechanic was implemented, and no low-stat content was
added. The data does support the proposed Pressure & Tone direction: today,
being poor and weak is a survival advantage, which is the opposite of the
intended dystopia.

---

## 6. Faction-chain legibility

A **personalized touchpoint** is an event addressed to the player by that faction
(`contact`, `personal`, `climax`). News and lore bulletins are excluded.
CURRENT_AUTHORED:

| Faction | Contact | ENGAGED | COMMITTED | Endings | Touchpoints (mean) | Mean gap | Exit at first disposition |
|---|---|---|---|---|---|---|---|
| DMMS | 4.40% | 0.33% | 0.03% | 0.03% | 2.08 | 2.1 yr | **92.4%** |
| Everlasting Mutual | 8.43% | 5.40% | 0.83% | 0.83% | 2.77 | 2.7 yr | 36.0% |
| Meridian | 6.27% | 2.37% | 1.17% | 1.17% | 2.54 | 2.2 yr | 59.6% |
| CRI | 8.23% | 7.43% | 1.53% | 1.53% | 3.07 | 2.4 yr | 6.5% |
| Black Ledger | 5.60% | 4.67% | 0.20% | 0.20% | 2.89 | 1.9 yr | 16.7% |
| Last Posture | 7.17% | 3.23% | 0.47% | 0.47% | 2.51 | 2.3 yr | 54.4% |

Any-faction contact: 35.0% of runs. Faction-caused endings: 16.5% of completions.

**The human observation is confirmed, and localizes precisely.** A contacted
faction gives a life **2.1–3.1 personalized events, about two years apart** —
that is the whole chain. Three of six factions dispose of the player at the very
first disposition in more than half of contacts (DMMS 92.4%, Meridian 59.6%, Last
Posture 54.4%). Combined with a per-faction contact rate of 4–9%, a typical life
sees one faction, twice, and then never again. There is very little for the
player to perceive as a chain.

**What is *not* broken is the ladder itself.** Once a run reaches ENGAGED, a
later personalized touchpoint follows in 99–100% of cases, and once it reaches
COMMITTED a climax follows in 83–100%. The legibility problem is short chains and
early safe exits, not a stalled escalation path.

Arm choice barely moves this: LOW's contact rates and touchpoint counts are
within noise of the control, and first-disposition exit rates move by at most
7 points. **Faction FSM, conditions and prose were not changed.**

---

## 7. Relationship to the retained Phase 1.1 sweep

The historical Phase 1.1 threshold sweep reported completion LOW 64.0% / MID
47.7% / HIGH 35.8% / ORIGINAL_REFERENCE 9.9%. This calibration reports LOW 42.5%
/ MID 33.1% / HIGH 24.3% / current-authored 25.7%.

These are **not** comparable and neither supersedes the other. The Phase 1.1 run
used the pre-1.2 corpus and `BALANCED_RANDOM_FILL` allocation; this one uses the
current corpus after Batches 006/007, the faction FSM, the safe-exit
architecture and `ARCHETYPE_SET` allocation. `reports/phase1_1-experiments.*` is
untouched and remains the record of that experiment.

---

## 8. Method notes and limits

- Every arm uses the same base seed. A rewritten arm carries a derived content
  fingerprint and the run seed is `contentVersion:seed`, so the arms are
  independent samples of one sampling design rather than a paired comparison.
  This matches the retained Phase 1.1 behaviour. At 3 000 runs the standard error
  on a rate near 50% is about 0.9 percentage points, so the completion gaps
  reported here (18 points control→LOW) are far outside noise, while
  arm-to-arm stat differences of a point or two are not.
- Fixed-age snapshots and the `final` snapshot describe different populations by
  construction. Do not read a fall between "age 65" and "final" as a stat
  decline; it is mostly the shorter lives entering the denominator.
- Low-stat risk is a conditional association measured on person-years. It is not
  a causal claim and it does not control for age, which is its most obvious
  confounder.
- The first human playtest (5 lives) is recorded in
  [`docs/ui/SOLID_STATE_H2A_MANUAL_PLAYTEST_ROUND1_v0.1.md`](ui/SOLID_STATE_H2A_MANUAL_PLAYTEST_ROUND1_v0.1.md).
  It is qualitative evidence that motivated this measurement. Its 1-in-5
  completion rate is **not** an estimate of the population rate.

## 9. What was deliberately not run

Family-weight A/B, allocation-policy comparison, the T1027 sensitivity sweep, the
T1023 targeted comparison and the neutral-Human manifestation diagnostic. Their
harnesses in `src/sim/experiments.ts` and `src/sim/phase1_2.ts` are intact and
retained for H2B.
