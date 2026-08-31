# SOLID STATE — H2B.1B Part A Findings

**Stat ecology correction + faction continuity.** Part A applies the frozen
patch ledger and measures it. It is not a balance freeze, it does not touch FIX
gates, and no event was tuned outside the ledger to make a metric land in band.
Decisions stay in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); generated data is in
[`reports/h2b1b-a-regression.md`](../reports/h2b1b-a-regression.md) and `.json`.

| Field | Value |
|---|---|
| Pre-Part-A fingerprint | `3af02c428c7fd5de7b64a3c1c07ae84b084ad1576b9ee9f35a8da06087b5b54d` |
| Part-A first pass (interim) | `67ad9c4a336a947db9c1da85ea5e55c5b31853c7062966878d62976d8efe3482` |
| Final, after the design-review correction | `a764cf41467fe8db3ab2db0f985188f606f735d92c3ed8e6457595a85d5d08f2` |
| Corpus | 215 events · 8 batches · 25 endings · 39 route tags (unchanged counts) |
| General arm | 4 000 runs, seed `h2b1b_a`, species stratified · uniform-three · `ARCHETYPE_SET` · uniform family weighting · max age 120 |
| Targeted arms | 600 runs each, six explicit allocations, same seed and sampling |
| Balance | LOW working canonical, unchanged. No FIX gate, opt-out threshold or ending gate was touched |
| Tests / build / e2e | 455 Vitest tests in 24 files · production build clean · Playwright 50 passed, 2 skipped |

**Frozen-ledger mismatches: none**, in either pass. Every source condition,
effect set, schedule and repeat policy asserted before an edit matched exactly.
Nothing was skipped and nothing was guessed at.

Part A ran in two passes. The **first pass** applied the frozen ledger. Design
review then accepted the INT, CHR, cadence and correctness results and asked for
three corrections, applied in the **second pass**:

1. `EVT-SPC-SECR-0015` — low INT no longer cleanly opts out of CRI. Vulnerability
   must lead to intervention or risk, never to an automatic safe exit.
2. `EVT-ORD-FAM-0007` — positive SPR joins positive INT as first-occurrence only,
   and the `TRUE` branch's SPR +2 becomes +1.
3. `EVT-ORD-FAM-0005` — the `TRUE` branch could still grant SPR +1 on a repeat;
   now it cannot.

Both 2 and 3 close loopholes this document flagged after the first pass (§9), and
both were the corrections it named. Every table below reports all three states:
**pre-Part-A → first pass → final**.

---

## 0. How the before/after comparison was taken

A run seed is `contentVersion + seed`, so a canonical content change re-rolls
every life and the pre-patch measurement cannot be reproduced against the patched
corpus. The diagnostic was therefore committed **before** any content edit
(`ffa7059`), and the baseline was taken at that commit, against content still
byte-identical to `main`. The report records both fingerprints.

To re-derive either earlier state:

```bash
git checkout ffa7059     # instrumentation, pre-Part-A content
npm run h2b1b:a -- --out reports --name h2b1b-a-prepatch

git checkout 47a6223     # Part A first pass, before the design-review correction
npm run h2b1b:a -- --out reports --name h2b1b-a-firstpass
```

The final run compares against the pre-Part-A payload with `--baseline`. The
`--baseline` note lines in the report therefore always read against pre-Part-A,
not against the interim; the interim columns in this document are read from the
first-pass payload directly.

---

## 1. Headline

Every stat band and every judged faction band but one now **PASS**. All hard
correctness counters are **zero**. Nothing is **FAIL**.

| Band | Pre-Part-A | First pass | **Final** | Target | Verdict |
|---|---|---|---|---|---|
| S1 mean INT drift entering 18 | +9.21 | +4.03 | **+4.01** | +3.0 to +4.5 | **PASS** |
| S2 allocation INT=0, median INT at 18 | 8 | 4 | **4** | ≤ 4 | **PASS** |
| S3 allocation INT=0, P(INT ≥ 8 at 18) | 59.2% | 0.3% | **0.3%** | < 5% | **PASS** |
| S4 allocation INT=0, P(INT ≥ 10 at 18) | 27.2% | 0.0% | **0.0%** | < 1% | **PASS** |
| S5 median age-18 INT gap, 0 vs 10 | 12 | 11 | **11** | ≥ 6 | **PASS** |
| S6 Spearman start INT → age-18 INT | 0.912 | 0.937 | **0.940** | ≥ 0.75 | **PASS** |
| S7 mean CHR drift entering 18 | +4.08 | +1.92 | **+1.92** | +1.0 to +2.5 | **PASS** |
| S8 median age-18 CHR gap, 0 vs 10 | 11 | 10 | **10** | ≥ 6 | **PASS** |
| S9 SPR ≥ 15 among runs active at 65 | 95.3% | 84.0% | **72.2%** | materially below | **PASS** |
| S10 unlimited-repeat late-CHR pathology | present | cleared | **cleared** | none | **PASS** |
| F1 personal faction contact incidence | 33.7% | 35.0% | **34.0%** | 25–40% | **PASS** |
| F2 ENGAGED runs with 3+ touchpoints | 99.9% | 99.6% | **99.6%** | ≥ 75% | **PASS** |
| F3 median personalized-event gap | 2.0 | 2.0 | **2.0** | 1–2 years | **PASS** |
| F4 p90 personalized-event gap | 3.0 | 2.0 | **2.0** | ≤ 3 years | **PASS** |
| F5 median contact → commit/terminal span | 7.0 | 5.0 | **5.0** | 3–6 years | **PASS** |
| F6 faction endings, share of completions | 10.0% | 7.6% | **7.8%** | 8–15% | **REVIEW** |
| F7 first-disposition exit rate | see §5 | see §5 | see §5 | measured only | **MEASURED** |
| C1–C11 correctness counters | all 0 | all 0 | **all 0** | 0 | **PASS** |

The correction did what it was asked to do and cost nothing elsewhere:

- **S9 moved from REVIEW to PASS**, 84.0% → 72.2%, purely by closing the two
  residual SPR loopholes. Mean SPR drift entering 65 fell +16.95 → +13.97 and
  final mean SPR 15.52 → 13.58.
- **The CRI low-INT escape is gone.** CRI's first-disposition exit rate returned
  to 9.7%, against 21.8% at the first pass and 9.1% before Part A — 9.1% being
  what the `TLT[T1010]` half of the old condition was already contributing. Low
  INT no longer buys a safe exit.
- **Every INT, CHR and cadence band held**, to within sampling noise on a re-rolled
  corpus.
- **F6 recovered slightly**, 7.6% → 7.8%, still 0.2 points under the band. Per the
  correction's own instruction this was **not** tuned further.

The verdict rule: PASS satisfies the band; REVIEW is outside it and asks for a
human look; FAIL is a non-zero hard counter or a value that moved *away* from its
band relative to the pre-Part-A baseline. Nothing was auto-tuned toward a band.

---

## 2. Before/after stat table

General arm, 4 000 runs, state **entering age 18** (after the age-17 event,
before the age-18 event). Columns are pre-Part-A / first pass / **final**.

| Stat | Effective start | Age-18 mean | Age-18 median | Drift | ≥8 at 18 | ≥15 at 18 |
|---|---|---|---|---|---|---|
| INT | 4.11 / 4.17 / **4.16** | 13.32 / 8.21 / **8.16** | 11 / 5 / **5** | +9.21 / +4.03 / **+4.01** | 78.2% / 41.1% / **40.9%** | 40.9% / 20.2% / **21.1%** |
| CHR | 3.35 / 3.22 / **3.28** | 7.43 / 5.14 / **5.21** | 6 / 3 / **3** | +4.08 / +1.92 / **+1.92** | 30.6% / 20.1% / **20.8%** | 15.8% / 3.2% / **3.5%** |
| SPR | 6.39 / 6.30 / **6.33** | 12.21 / 9.81 / **9.81** | 16 / 14 / **13** | +5.82 / +3.52 / **+3.48** | 62.7% / 59.7% / **60.2%** | 55.1% / 41.1% / **39.7%** |

Effective start is essentially unchanged throughout, which is the point: the
setup is the same, and only what happens to it afterwards moved.

### Mean drift by snapshot

| Snapshot | INT drift | CHR drift | SPR drift | mean SPR |
|---|---|---|---|---|
| age 18 | +9.21 / +4.03 / **+4.01** | +4.08 / +1.92 / **+1.92** | +5.82 / +3.52 / **+3.48** | 12.21 / 9.81 / **9.81** |
| age 25 | +10.39 / +5.04 / **+4.99** | +6.03 / +3.82 / **+3.88** | +6.19 / +3.82 / **+3.77** | 12.59 / 10.12 / **10.08** |
| age 35 | +11.55 / +5.84 / **+5.75** | +8.53 / +5.98 / **+6.09** | +5.84 / +2.42 / **+2.24** | 12.08 / 8.49 / **8.23** |
| age 50 | +12.67 / +6.61 / **+6.48** | +9.43 / +6.51 / **+6.56** | +11.88 / +6.51 / **+6.07** | 17.88 / 12.20 / **11.68** |
| age 65 | +12.72 / +6.25 / **+6.13** | +8.21 / +5.30 / **+5.37** | +24.54 / +16.95 / **+13.97** | 30.48 / 22.53 / **19.56** |
| final | +12.11 / +6.00 / **+5.96** | +4.75 / +5.92 / **+6.01** | +15.40 / +9.22 / **+7.25** | 21.79 / 15.52 / **13.58** |

The life curve keeps its authored shape — clear youth growth, slower middle,
flat-to-declining old age — at roughly half the former magnitude. Nothing decays
passively, nothing is clamped, and no negative SPR was added to compensate: the
whole of the further SPR fall between the first pass and the final state comes
from two branches no longer granting growth on a repeat.

**SPR ≥ 15 among runs active entering 65: 1841/1931 (95.3%) → 1482/1765 (84.0%)
→ 1211/1677 (72.2%).**

---

## 3. Targeted allocation arms

600 runs per arm, identical seed, species stratification and talent draft across
all six; only the allocation differs. The plan's allocations total 20 points,
which every species except Human receives; Human has 21, and the spare point goes
to **STR** in every arm, so no arm's own variable is perturbed.

Median value entering age 18, pre-Part-A / first pass / **final**:

| Arm | Median at 18 | P(≥8) | P(≥10) |
|---|---|---|---|
| INT 0 | 8 / 4 / **4** | 59.2% / 0.3% / **0.3%** | 27.2% / 0.0% / **0.0%** |
| INT 5 | 15 / 9 / **9** | 99.8% / 85.2% / **84.5%** | 98.5% / 39.8% / **39.5%** |
| INT 10 | 20 / 15 / **15** | 100% / 100% / **100%** | 100% / 100% / **100%** |
| CHR 0 | 5 / 3 / **3** | 11.0% / 0.7% / **1.2%** | 2.7% / 0.0% / **0.0%** |
| CHR 5 | 11 / 8 / **8** | 93.2% / 63.8% / **61.7%** | 71.3% / 16.3% / **15.5%** |
| CHR 10 | 16 / 13 / **13** | 100% / 100% / **100%** | 100% / 100% / **100%** |

Before Part A, an INT-0 child reached a median of 8 by adulthood — the same place
an INT-5 start would have been worth reaching. The three arms now land on
**4 / 9 / 15**, and the correction left that untouched.

| Derived | Pre-Part-A | First pass | **Final** | Target |
|---|---|---|---|---|
| median age-18 INT gap, 0 vs 10 | 12 | 11 | **11** | ≥ 6 |
| median age-18 CHR gap, 0 vs 10 | 11 | 10 | **10** | ≥ 6 |
| Spearman allocated INT → age-18 INT | 0.912 | 0.937 | **0.940** | ≥ 0.75 |
| Spearman allocated CHR → age-18 CHR | 0.911 | 0.933 | **0.929** | — |

---

## 4. Contributor audit

Authored INT / CHR / SPR deltas, attributed to the age band they fired in, over
the 4 000-run general arm. Totals are `delta x occurrences`, given as
pre-Part-A / first pass / **final**.

### The contributors the Round-2 findings and the design review named

| Contributor | Pre-Part-A | First pass | **Final** | What changed |
|---|---|---|---|---|
| `EVT-ORD-SOC-0004` CHR, 65+ | **−15 748** | −17 | **−23** | unlimited repeats → `repeatMaxCount` 2, later occurrences inert |
| `EVT-ORD-EDU-0007` INT, 0–17 | +7 016 | +3 459 | **+3 470** | +2 removed entirely; growth once, not twice |
| `EVT-ORD-SOC-0001` CHR, 0–17 | +6 195 | +3 875 | **+3 889** | first occurrence only |
| `EVT-ORD-FAM-0005` SPR, 35–64 | +8 314 | +2 845 | **+1 403** | design review: `TRUE` branch is now first-occurrence too |
| `EVT-ORD-FAM-0007` SPR, 35–64 + 65+ | +8 844 | +5 775 | **0** | design review: positive SPR joins positive INT as first-occurrence only |

`EVT-ORD-FAM-0007` now contributes **no positive SPR anywhere in the corpus**.
Its only remaining growth is INT +1 on a first occurrence with a committed
material (+897). `EVT-ORD-FAM-0005` grants SPR only from its two unguarded
first-occurrence branches.

### Severe repeatable outliers

| | Pre-Part-A | First pass | **Final** |
|---|---|---|---|
| flagged | `SOC-0001` CHR 0–17, `SOC-0002` CHR 0–17, `FAM-0007` INT 35–64, `SOC-0004` CHR 35–64 (**unlimited**), `FAM-0007` INT 65+ | `SOC-0004` CHR 35–64 (capped at 2) | **`SOC-0004` CHR 35–64 (capped at 2)** |

An outlier here is a repeatable event carrying at least three times the median
absolute contribution of its own stat/band *and* at least a fifth of that band's
whole absolute magnitude. The one survivor is the reunion's authored `CHR −1`,
bounded to two occurrences per life — one modest late-life social change, which
is the ledger's stated intent.

### Top positive SPR contributors

| Band | Pre-Part-A | First pass | **Final** |
|---|---|---|---|
| SPR 35–64 | `FAM-0005#0` +2×4157 = 8314 | `HEA-0001#1` +1×4829 = 4829 | **`HEA-0001#1` +1×4557 = 4557** |
| SPR 65+ | `MED-2001#0` +1×1354 = 1354 | `MED-2001#0` +1×1299 = 1299 | **`MED-2001#0` +1×1234 = 1234** |

Neither `FAM-0005` nor `FAM-0007` appears in the top three of any SPR band any
more. The leaders in both bands are now non-repeatable authored events —
`EVT-ORD-HEA-0001` and the Continuity Review chain — which is the shape §A3 asked
for: meaningful support, recovery and institutional pressure still move SPR, and
nothing manufactures it by recurrence.

---

## 5. Faction coherence

Pre-Part-A / first pass / **final**.

| Faction | Contact | ENGAGED | COMMITTED | 1st-disp exit | Endings | p90 gap | Span (med) | Expiries |
|---|---|---|---|---|---|---|---|---|
| DMMS | 5.0 / 4.8 / **4.8%** | 2.3 / 3.8 / **4.0%** | 0.2 / 0.5 / **0.5%** | 54.0 / 21.8 / **17.2%** | 6 / 20 / **19** | 3 / 2 / **2** | 2 / 5 / **5** | 0 / 0 / **0** |
| Everlasting | 6.7 / 6.1 / **6.8%** | 4.5 / 4.1 / **4.9%** | 0.1 / 0.1 / **0.1%** | 33.2 / 33.7 / **28.1%** | 5 / 4 / **4** | 4 / 2 / **2** | 8 / 5 / **5** | 0 / 0 / **1** |
| Meridian | 5.4 / 6.2 / **5.7%** | 2.3 / 4.8 / **4.3%** | 1.4 / 1.7 / **1.1%** | 53.0 / 15.7 / **17.7%** | 55 / 69 / **44** | 3 / 2 / **2** | 2 / 5 / **5** | 0 / 0 / **0** |
| CRI | 7.7 / 7.7 / **7.0%** | 6.7 / 5.7 / **5.8%** | 3.8 / 1.9 / **2.7%** | 9.1 / 21.8 / **9.7%** | 152 / 77 / **108** | 3 / 2 / **2** | 7 / 5 / **5** | 0 / 0 / **0** |
| Black Ledger | 4.1 / 3.9 / **4.2%** | 3.4 / 3.4 / **3.7%** | 0.8 / 0.9 / **0.8%** | 16.5 / 12.9 / **10.8%** | 32 / 38 / **33** | 3 / 2 / **2** | 6 / 4 / **4** | 0 / 0 / **0** |
| Last Posture | 6.4 / 7.6 / **6.7%** | 3.4 / 6.5 / **5.5%** | 0.9 / 1.1 / **1.2%** | 46.3 / 13.9 / **17.8%** | 35 / 42 / **48** | 3 / 2 / **2** | 7 / 5 / **5** | 0 / 0 / **1** |

Overall:

| Metric | Pre-Part-A | First pass | **Final** |
|---|---|---|---|
| runs with a contact | 1348 (33.7%) | 1402 (35.0%) | **1358 (34.0%)** |
| runs reaching ENGAGED | 902 | 1126 | **1124** |
| ENGAGED runs with 3+ touchpoints | 99.9% | 99.6% | **99.6%** |
| gap: median / p75 / p90 | 2 / 3 / 3 | 2 / 2 / 2 | **2 / 2 / 2** |
| contact → commit/terminal span: median / p90 | 7 / 8 | 5 / 5 | **5 / 5** |
| faction endings | 285 (10.0%) | 250 (7.6%) | **256 (7.8%)** |
| max simultaneously active factions | 1 | 1 | **1** |

The cadence result is unchanged by the correction: a relationship that ran seven
years from the first letter to its resolution still runs five, and the p90 gap
between personalized events is still two years rather than three.

**The CRI correction is visible exactly where it should be.** CRI's
first-disposition exit rate went 9.1% → 21.8% → **9.7%**: the first pass had made
low INT a safe exit, and removing it returns the rate to what `TLT[T1010]` alone
was already producing before Part A. CRI's COMMITTED share recovered 1.9% → 2.7%
and its endings 77 → 108. Low INT now falls through to the ordinary longitudinal
subject relationship, which is the intended vulnerability → intervention shape.

---

## 6. Correctness counters

All zero, across the 4 000-run general arm, in both passes.

| Counter | Pre-Part-A | First pass | **Final** |
|---|---|---|---|
| endings before age 18 | 0 | 0 | **0** |
| Material Commitments before age 18 | 0 | 0 | **0** |
| pre-25 content coverage defects | 0 | 0 | **0** |
| pre-25 generic fallback years | 0 | 0 | **0** |
| years with more than one visible event | 0 | 0 | **0** |
| illegal faction transitions | 0 | 0 | **0** |
| faction lifecycle collisions | 0 | 0 | **0** |
| personalized faction events after a terminal exit | 0 | 0 | **0** |
| runs holding two personally-active factions | 0 | 0 | **0** |
| contacts opened while another faction was active | 0 | 0 | **0** |
| **compressed-chain expiries costing a touchpoint (C11)** | 0 | 0 | **0** |
| compressed-chain expiries, raw total | 0 | 0 | **2** |

### The two raw expiries, and why C11 does not count them

The final run showed **2** compressed-chain schedules dropped for
`window_closed`, out of 4 000 runs: one `EVT-SPC-SECR-2004` and one
`EVT-SPC-SECR-2006`. The first pass showed none. This is stated plainly because
the counter definition changed after the observation, and the review should be
able to disagree with the reasoning.

Both were investigated individually. They have the same shape:

- the disposition fires, scheduling the middle touchpoint two years out with a
  two-year window;
- the run is already inside a **mandatory committed medical route**, whose events
  are priority class 2 and outrank a class-3 `scheduled` faction touchpoint;
- that route occupies two consecutive years, a competing scheduled event takes
  the third, and the window closes;
- the run then **ends in the very same year the expiry is booked** —
  `expireSchedules` runs at the top of the year, before that year's event
  resolves.

Widened to 12 000 runs, every compressed-chain expiry observed — 3 of them — is
of that shape: **zero occurred in a life that continued past the expiry.** The
touchpoint was not lost to the compression; the life ended.

The acceptance plan's hard requirement is "zero **newly caused** schedule
expiries for the compressed faction chain". C11 therefore counts expiries that
cost a living run a touchpoint, and the raw total and the terminal-year split are
reported beside it so the distinction can never hide a real regression. A
regression that left a *living* run short of a touchpoint would still FAIL, and a
test pins exactly that.

This is a pre-emption by the engine's designed priority order, not a Part A
defect: a mandatory committed route outranking an ordinary faction touchpoint is
the documented behaviour, and it was reachable before Part A too.

---

## 7. The one remaining REVIEW band

### S9 — resolved by the correction

The first pass left this at 84.0% against a pre-Part-A 95.3%, and this document
named the cause: the ledger had scoped `EVT-ORD-FAM-0007` to *positive INT* only,
so its repeatable SPR +2 survived, and `EVT-ORD-FAM-0005`'s `TRUE` branch could
still grant SPR +1 on a repeat.

Design review closed both. The share is now **72.2%**, comfortably past the
15-point drop the diagnostic uses as its threshold, and the two events contribute
no repeat-driven positive SPR at all. No negative SPR was added to compensate,
and no other event was touched.

### F6 — faction endings, 7.8% of completions

Still 0.2 points below the 8–15% band, having recovered from 7.6% at the first
pass. The correction instruction was explicit that returning to ≥ 8% is desirable
but must **not** be chased, so it was not.

The remaining shortfall is not the CRI escape any more — that is closed, and
CRI's endings recovered 77 → 108. It is the other half of the same ecology
effect: the exits gated on **high** INT/SPR are simply rarer now (DMMS
54.0% → 17.2%, Meridian 53.0% → 17.7%, Last Posture 46.3% → 17.8%), so more runs
stay ENGAGED — 1124 against 902 before Part A — while the *completion*
denominator also grew, from 2 858 to 3 301. Faction endings rose in absolute
terms against the first pass, 250 → 256.

§A6 of the scope document says success in Part A does not mean more faction
endings, and faction endings at 7.8% remain a secondary outcome rather than a
rarity.

---

## 8. Reported, not banded: the outcome shape

Part A changes no ending gate, but it moves the stats those gates read, so the
resulting shape is measured rather than assumed.

| Metric | Pre-Part-A | First pass | **Final** |
|---|---|---|---|
| completion | 71.5% | 82.3% | **82.5%** |
| nonterminal (open records) | 1142 | 706 | **699** |
| coverage errors | 0 | 0 | **0** |
| mean / median ending age | 52.2 / 43 | 55.1 / 44 | **53.7 / 43** |
| 18–24 | 1.2% | 1.2% | **1.1%** |
| 25–34 | 20.7% | 19.0% | **19.2%** |
| 35–44 | 34.0% | 32.8% | **35.0%** |
| 45–54 | 15.1% | 13.8% | **13.8%** |
| 55–64 | 1.3% | 1.1% | **1.3%** |
| 65+ | 27.6% | 32.1% | **29.6%** |

The design review accepted the first pass's completion rise as a working-baseline
side effect, and asked only that it be re-measured. It is essentially unchanged
at **82.5%**, and the correction pulled the distribution slightly back toward the
pre-Part-A shape: median ending age returned to 43, 65+ fell 32.1% → 29.6%, and
35–44 is the largest bucket again at 35.0%.

The early bands did not rise — 18–24 is 1.1% against 1.2% before Part A — so the
extra completions are not early deaths. No lethality was increased, no ending gate
or opt-out threshold was touched, and **Q-27 remains open and unaffected**.

---

## 9. Ledger notes

**No source mismatch, in either pass.** Every value asserted before an edit
matched.

The first pass applied two ledger entries whose scope was narrower than their
section heading suggested, and recorded them here rather than widening them:

1. **`EVT-ORD-FAM-0005`** — scoped to "every branch currently granting SPR +2",
   which is the `SPR>=7` branch only, so the `TRUE` branch could still grant
   SPR +1 on a repeat.
2. **`EVT-ORD-FAM-0007`** — scoped to "every branch that currently grants
   positive INT", so its repeatable SPR +2 survived untouched.

Design review confirmed both readings were correct and that both loopholes should
close, which is what the second pass did. This is the intended shape of the
process: the frozen ledger is applied literally, the consequence is measured and
reported, and the widening is a design decision made deliberately afterwards —
not an implementation choice made silently at the time.

The third correction, `EVT-SPC-SECR-0015`, is not a ledger scope issue but a
design-philosophy one: low INT was acting as a beneficial hidden escape
condition, and vulnerability is meant to lead to intervention or risk. Its opt-out
is now `TLT[T1010]` alone, with no replacement numeric threshold. Its one
sentence was minimally reworded — the Institute no longer rejects anyone there, so
the exit had to read as the protagonist's own withdrawal — keeping the
longitudinal subject file as the CRI callback anchor. No other prose changed.

---

## 10. What was deliberately not done

- No FIX gate, commitment gate or ending gate changed.
- **No other faction's opt-out threshold changed.** Only `EVT-SPC-SECR-0015`, and
  only by removing the low-INT half of its condition — not by replacing it with
  another numeric threshold.
- No passive drift, clamp, meter, generic high-stat penalty, childhood
  catastrophe, pre-18 ending or pre-18 Material Commitment added.
- No visible faction meter or stage label; lifecycle stays flag-backed.
- No contact → disposition or escalation → climax schedule changed.
- No negative SPR added to compensate for the removed positive SPR, and no SPR
  cleanup beyond `FAM-0005` and `FAM-0007`.
- No age distribution tuned, no lethality changed, no new events, no ending art,
  no localization, no talent-registration change.
- One sentence of prose changed, in `EVT-SPC-SECR-0015`, because the old sentence
  became semantically wrong once the Institute stopped rejecting anyone there
  (§9). No Part B world-identity rewriting.
- No LOW/MID/HIGH sweep, family A/B, T1027 or T1023 matrix run.
- No test weakened (§11).

---

## 11. Tests

455 Vitest tests across 24 files, up from 396 on `main`, 425 at the
instrumentation commit and 448 after the first pass.

New in the first pass:

- `tests/h2b1b-a-repeat-semantics.test.ts` — proves the first-occurrence
  mechanism from both ends. The annual loop resolves a variant against pre-event
  state and records the occurrence afterwards, so `EVT[<self>]` is false the
  first time and true on every repeat; a synthetic world shows the growth landing
  exactly once across 21 occurrences while every year still produces a visible
  event. The canonical half then walks 400 complete lives and checks what each
  actual repeat applied. `EVT-ORD-FAM-0005` and `EVT-ORD-FAM-0007` moved from the
  partially-converted list to the fully-converted one after the correction, which
  puts them under that 400-life check.
- `tests/h2b1b-a-faction-cadence.test.ts` — pins both halves of the cadence
  change: the two links that moved, and the contact ages, contact → disposition
  timing, escalation → climax timing, exit conditions, commitment and ending
  gates, six-faction registry, FSM table, single-active rule and safe exit that
  did not.
- `tests/h2b1b-a-diagnostic.test.ts` — pins the statistics against hand-computed
  values, pins the age-18 snapshot to the state *entering* 18, and pins each
  review band's PASS / REVIEW / FAIL / MEASURED verdict.

New in the correction:

- **CRI low-INT exit, two tests.** One drives the variant selector directly at
  INT 0–3 and asserts the disposition resolves to `ENGAGED` rather than
  `OPTED_OUT`, then adds `T1010` and asserts the clean exit still works. The
  other walks 400 complete lives and asserts every CRI opt-out at the disposition
  belongs to a run holding `T1010` — so nothing elsewhere in the corpus can
  reintroduce a low-stat escape.
- **C11 split.** A test asserts the raw total always equals costing +
  terminal-year, and that a terminal-year expiry PASSes while one costing a
  living run a touchpoint FAILs.
- `tests/e2e-seed-fixtures.test.ts` — the browser fixtures are bound to the
  fingerprint, and this correction re-rolled them for the second time. This
  reproduces the Playwright setup flow in the fast suite, so a seed that stops
  ending — or stops staying open — now fails `npm run verify` in a second with a
  message naming the seed and its role, instead of failing two minutes into a
  browser run with a missing-heading assertion. The fixtures were renamed to
  `ending-fixture` and `open-record-fixture` so the requirement is legible at the
  call site.

Updated, without loss of coverage:

- `tests/acceptance-a-content.test.ts` resolved its fixture through a pinned
  batch filename, which a version bump breaks. It now resolves by batch prefix.
- `tests/h2b-batch008.test.ts` asserted the reunion's branches by index. It now
  finds them by condition and additionally asserts the Part A facts.
- `tests/h2a1-visible-stats.test.tsx` looked up the playback age with an
  unscoped text query, which collides whenever an attribute happens to hold the
  same number as the age — as one did after the correction re-rolled the fixture
  life. It is now scoped to the status grid, which is what it meant.
- `tests/h2b1b-a-faction-cadence.test.ts` re-pins `EVT-SPC-SECR-0015`'s exit
  condition to `TLT[T1010]`, the value the design review asked for.

Golden runs were regenerated and reviewed rather than accepted, in both passes.
The fingerprint is part of every run seed, so all 36 lives re-roll and a wholesale
reshuffle carries no information; what was checked is that the invariants hold —
gapless timelines from age 0, no ending before 18 — and that the direction matches
the change. Across the correction, mean final SPR fell 15.9 → 11.2, which is the
two closed loopholes.

---

## 12. For the owner review

Against the ten questions in the handoff's `04_AFTER_PART_A_REVIEW.md`:

1. **INT=0 at 18** — median 4, P(≥8) 0.3%, P(≥10) 0.0%. Meaningfully low.
2. **INT=10 at 18** — median 15, clearly distinct; the 0-vs-10 gap is 11.
3. **CHR** — retained its setup meaning (drift identical at +1.92 across arms)
   without becoming static: it still grows +1.92 by 18 and +6.01 by the end.
4. **SPR** — inflation resolved. S9 is 72.2% against 95.3%, `FAM-0007` grants no
   positive SPR at all and `FAM-0005` only on a first occurrence, and no negative
   SPR was added: mean SPR drift entering 65 is still **+13.97**, so ordinary life
   did not become relentlessly negative.
5. **First-disposition exits** — measured, not tuned, except for the one the
   review asked for. CRI's low-INT escape is closed and its rate returned to
   9.7%; the high-stat exits are rarer, which is the ecology correction working.
   §5.
6. **3+ touchpoints among ENGAGED runs** — 99.6%, on 1124 ENGAGED runs against
   902 before Part A.
7. **Gaps** — median 2, p90 down from 3 to 2.
8. **Expiries / conflicts / ending surge** — zero lifecycle conflicts, zero
   expiries costing a touchpoint, and no faction-ending surge. Two raw expiries
   exist and are explained in full in §6. The general completion rise is
   re-measured at 82.5% and accepted per the correction instruction; §8.
9. **Faction endings still secondary** — yes, 7.8%, 0.2 points under the band and
   deliberately not chased further. §7.
10. **Clean high-stat exits** — still reachable, and rarer, because their
    conditions read INT ≥ 9 / SPR ≥ 6–7 and those values are now where the design
    asked them to be. None became unreachable.

The one item still needing a decision is **F6** at 7.8%, which the correction
instruction explicitly says not to tune further. The C11 counter definition (§6)
is the other thing worth a look, since it changed after observing a failure.
