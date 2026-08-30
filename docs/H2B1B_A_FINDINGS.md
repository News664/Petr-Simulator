# SOLID STATE — H2B.1B Part A Findings

**Stat ecology correction + faction continuity.** Part A applies the frozen
patch ledger and measures it. It is not a balance freeze, it does not touch FIX
gates, and no event was tuned outside the ledger to make a metric land in band.
Decisions stay in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); generated data is in
[`reports/h2b1b-a-regression.md`](../reports/h2b1b-a-regression.md) and `.json`.

| Field | Value |
|---|---|
| Pre-patch fingerprint | `3af02c428c7fd5de7b64a3c1c07ae84b084ad1576b9ee9f35a8da06087b5b54d` |
| Post-patch fingerprint | `67ad9c4a336a947db9c1da85ea5e55c5b31853c7062966878d62976d8efe3482` |
| Corpus | 215 events · 8 batches · 25 endings · 39 route tags (unchanged counts) |
| General arm | 4 000 runs, seed `h2b1b_a`, species stratified · uniform-three · `ARCHETYPE_SET` · uniform family weighting · max age 120 |
| Targeted arms | 600 runs each, six explicit allocations, same seed and sampling |
| Balance | LOW working canonical, unchanged. No FIX gate, opt-out threshold or ending gate was touched |
| Tests / build / e2e | 448 Vitest tests in 23 files · production build clean · Playwright 50 passed, 2 skipped |

**Frozen-ledger mismatches: none.** Every source condition, effect set, schedule
and repeat policy the ledger asserted matched live `main` exactly. Nothing was
skipped and nothing was guessed at.

---

## 0. How the before/after comparison was taken

A run seed is `contentVersion + seed`, so a canonical content change re-rolls
every life and the pre-patch measurement cannot be reproduced against the patched
corpus. The diagnostic was therefore committed **before** any content edit
(`ffa7059`), and the baseline was taken at that commit, against content still
byte-identical to `main`. The report records both fingerprints.

To re-derive the baseline:

```bash
git checkout ffa7059            # instrumentation, pre-patch content
npm run h2b1b:a -- --out reports --name h2b1b-a-prepatch
```

The post-patch run then compares against that payload with `--baseline`.

---

## 1. Headline

Six of the eight stat bands and five of the six judged faction bands **PASS**.
Two bands are **REVIEW**. Every hard correctness counter is **zero**. Nothing is
**FAIL**.

| Band | Pre-patch | Post-patch | Target | Verdict |
|---|---|---|---|---|
| S1 mean INT drift entering 18 | +9.21 | **+4.03** | +3.0 to +4.5 | **PASS** |
| S2 allocation INT=0, median INT at 18 | 8 | **4** | ≤ 4 | **PASS** |
| S3 allocation INT=0, P(INT ≥ 8 at 18) | 59.2% | **0.3%** | < 5% | **PASS** |
| S4 allocation INT=0, P(INT ≥ 10 at 18) | 27.2% | **0.0%** | < 1% | **PASS** |
| S5 median age-18 INT gap, 0 vs 10 | 12 | **11** | ≥ 6 | **PASS** |
| S6 Spearman start INT → age-18 INT | 0.912 | **0.937** | ≥ 0.75 | **PASS** |
| S7 mean CHR drift entering 18 | +4.08 | **+1.92** | +1.0 to +2.5 | **PASS** |
| S8 median age-18 CHR gap, 0 vs 10 | 11 | **10** | ≥ 6 | **PASS** |
| S9 SPR ≥ 15 among runs active at 65 | 95.3% | **84.0%** | materially below | **REVIEW** |
| S10 unlimited-repeat late-CHR pathology | present | **cleared** | none | **PASS** |
| F1 personal faction contact incidence | 33.7% | **35.0%** | 25–40% | **PASS** |
| F2 ENGAGED runs with 3+ touchpoints | 99.9% | **99.6%** | ≥ 75% | **PASS** |
| F3 median personalized-event gap | 2.0 | **2.0** | 1–2 years | **PASS** |
| F4 p90 personalized-event gap | 3.0 | **2.0** | ≤ 3 years | **PASS** |
| F5 median contact → commit/terminal span | 7.0 | **5.0** | 3–6 years | **PASS** |
| F6 faction endings, share of completions | 10.0% | **7.6%** | 8–15% | **REVIEW** |
| F7 first-disposition exit rate | see §5 | see §5 | measured only | **MEASURED** |
| C1–C11 correctness counters | all 0 | **all 0** | 0 | **PASS** |

The verdict rule: PASS satisfies the band; REVIEW is outside it and asks for a
human look; FAIL is a non-zero hard counter or a value that moved *away* from its
band relative to the baseline. Nothing was auto-tuned toward a band.

---

## 2. Before/after stat table

General arm, 4 000 runs, state **entering age 18** (after the age-17 event,
before the age-18 event).

| Stat | Effective start | Age-18 mean | Age-18 median | Drift | ≥8 at 18 | ≥15 at 18 |
|---|---|---|---|---|---|---|
| INT before | 4.11 | 13.32 | 11 | +9.21 | 78.2% | 40.9% |
| **INT after** | 4.17 | **8.21** | **5** | **+4.03** | **41.1%** | **20.3%** |
| CHR before | 3.35 | 7.43 | 6 | +4.08 | 30.6% | 15.8% |
| **CHR after** | 3.22 | **5.14** | **3** | **+1.92** | **20.1%** | **3.3%** |
| SPR before | 6.39 | 12.21 | 16 | +5.82 | 62.7% | 55.1% |
| **SPR after** | 6.30 | **9.81** | **14** | **+3.52** | **59.7%** | **41.1%** |

Effective start is essentially unchanged, which is the point: the setup is the
same, and only what happens to it afterwards moved.

### Mean drift by snapshot

| Snapshot | Active runs (before → after) | INT drift | CHR drift | SPR drift |
|---|---|---|---|---|
| age 18 | 4000 → 4000 | +9.21 → **+4.03** | +4.08 → **+1.92** | +5.82 → **+3.52** |
| age 25 | 3966 → 3961 | +10.39 → **+5.04** | +6.03 → **+3.82** | +6.19 → **+3.82** |
| age 35 | 3373 → 3336 | +11.55 → **+5.84** | +8.53 → **+5.98** | +5.84 → **+2.42** |
| age 50 | 2076 → 1917 | +12.67 → **+6.61** | +9.43 → **+6.51** | +11.88 → **+6.51** |
| age 65 | 1931 → 1765 | +12.72 → **+6.25** | +8.21 → **+5.30** | +24.54 → **+16.95** |
| final | 4000 → 4000 | +12.11 → **+6.00** | +4.75 → **+5.92** | +15.40 → **+9.22** |

The life curve keeps its authored shape — clear youth growth, slower middle,
flat-to-declining old age — at roughly half the former magnitude. Nothing decays
passively, nothing is clamped, and the final-CHR line rising slightly is the
late-life reunion no longer subtracting CHR without limit (see §4).

---

## 3. Targeted allocation arms

600 runs per arm, identical seed, species stratification and talent draft across
all six; only the allocation differs. The plan's allocations total 20 points,
which every species except Human receives; Human has 21, and the spare point goes
to **STR** in every arm, so no arm's own variable is perturbed.

### INT arms — value entering age 18

| Arm | Effective start | Median | Mean | Drift | P(≥8) | P(≥10) |
|---|---|---|---|---|---|---|
| INT 0 before | 0.04 | 8 | 8.29 | +8.25 | 59.2% | 27.2% |
| **INT 0 after** | 0.03 | **4** | **3.83** | **+3.80** | **0.3%** | **0.0%** |
| INT 5 before | 5.04 | 15 | 14.97 | +9.93 | 99.8% | 98.5% |
| **INT 5 after** | 5.03 | **9** | **9.17** | **+4.14** | 85.2% | 39.8% |
| INT 10 before | 10.04 | 20 | 20.03 | +9.99 | 100% | 100% |
| **INT 10 after** | 10.03 | **15** | **14.56** | **+4.52** | 100% | 100% |

Before the patch, an INT-0 child reached a median of 8 by adulthood — the same
place an INT-5 start would have been worth reaching. After it, the three arms
land on 4 / 9 / 15 and drift is near-uniform at about +4, so the allocation
survives childhood instead of being washed out by it.

### CHR arms — value entering age 18

| Arm | Effective start | Median | Mean | Drift | P(≥8) | P(≥10) |
|---|---|---|---|---|---|---|
| CHR 0 before | 1.24 | 5 | 5.13 | +3.89 | 11.0% | 2.7% |
| **CHR 0 after** | 1.22 | **3** | **3.15** | **+1.94** | 0.7% | 0.0% |
| CHR 5 before | 6.24 | 11 | 10.70 | +4.46 | 93.2% | 71.3% |
| **CHR 5 after** | 6.22 | **8** | **8.15** | **+1.94** | 63.8% | 16.3% |
| CHR 10 before | 11.24 | 16 | 15.88 | +4.64 | 100% | 100% |
| **CHR 10 after** | 11.22 | **13** | **13.15** | **+1.94** | 100% | 100% |

CHR drift is now identical across arms (+1.94), so the starting choice is
preserved exactly rather than compressed.

| Derived | Before | After | Target |
|---|---|---|---|
| median age-18 INT gap, 0 vs 10 | 12 | 11 | ≥ 6 |
| median age-18 CHR gap, 0 vs 10 | 11 | 10 | ≥ 6 |
| Spearman allocated INT → age-18 INT | 0.912 | **0.937** | ≥ 0.75 |
| Spearman allocated CHR → age-18 CHR | 0.911 | **0.933** | — |

---

## 4. Contributor audit

Authored INT / CHR / SPR deltas, attributed to the age band they fired in, over
the 4 000-run general arm. Totals are `delta × occurrences`.

### The four contributors the Round-2 findings named

| Contributor | Before | After | What changed |
|---|---|---|---|
| `EVT-ORD-SOC-0004` CHR, 65+ | **−15 748** | **−17** | unlimited repeats → `repeatMaxCount` 2, later occurrences inert |
| `EVT-ORD-EDU-0007` INT, 0–17 | +7 016 | **+3 459** | +2 removed entirely; growth once, not twice |
| `EVT-ORD-SOC-0001` CHR, 0–17 | +6 195 | **+3 875** | first occurrence only |
| `EVT-ORD-FAM-0005` SPR, 35–64 | +8 314 | **+2 845** | +2 → +1 on first occurrence, inert after |

The unlimited late reunion is the clearest result: it was manufacturing 15 748
points of CHR magnitude in the 65+ band on its own, and now contributes 17.

### Severe repeatable outliers

| | Before | After |
|---|---|---|
| flagged | `SOC-0001` CHR 0–17, `SOC-0002` CHR 0–17, `FAM-0007` INT 35–64, `SOC-0004` CHR 35–64 (**unlimited**), `FAM-0007` INT 65+ | `SOC-0004` CHR 35–64 (capped at 2) |

An outlier here is a repeatable event carrying at least three times the median
absolute contribution of its own stat/band *and* at least a fifth of that band's
whole absolute magnitude. The one survivor is the reunion's authored `CHR −1`, now
bounded to two occurrences per life — one modest late-life social change, which
is the ledger's stated intent.

### Top positive contributors, before → after

| Stat · band | Before | After |
|---|---|---|
| INT 0–17 | `EDU-0007#0` +2×2467 = 4934 | `EDU-0005#1` +1×4078 = 4078 |
| CHR 0–17 | `SOC-0001#0` +1×6195 = 6195 | `SOC-0001#1` +1×3875 = 3875 |
| SPR 18–34 | `SOC-0006#1` +2×1746 = 3492 | `FAM-0003#1` +1×2168 = 2168 |
| INT 35–64 | `FAM-0007#0` +1×2087 = 2087 | `FAM-0007#1` +1×942 = 942 |
| SPR 35–64 | `FAM-0005#0` +2×4157 = 8314 | `HEA-0001#1` +1×4829 = 4829 |
| INT 65+ | `FAM-0007#0` +1×397 = 397 | *(none)* |

No ordinary repeatable now heads its band by recurrence alone. The largest INT
source in childhood is `EVT-ORD-EDU-0005`, a non-repeatable authored event.

---

## 5. Faction coherence

| Faction | Contact | ENGAGED | COMMITTED | Touchpoints / ENGAGED (med) | 3+ | Gap med/p90 | Span (med) | 1st-disp exit | Endings | Expiries |
|---|---|---|---|---|---|---|---|---|---|---|
| DMMS | 5.0% → 4.8% | 2.3% → **3.8%** | 0.2% → 0.5% | 4 → 4 | 100% → 100% | 2/3 → **2/2** | 2 → 5 | 54.0% → **21.8%** | 6 → 20 | 0 → **0** |
| Everlasting | 6.7% → 6.1% | 4.5% → 4.1% | 0.1% → 0.1% | 4 → 4 | 100% → 99.4% | 2/4 → **2/2** | 8 → **5** | 33.2% → 33.7% | 5 → 4 | 0 → **0** |
| Meridian | 5.4% → 6.2% | 2.3% → **4.8%** | 1.4% → 1.7% | 4 → 4 | 98.9% → 100% | 2/3 → **2/2** | 2 → 5 | 53.0% → **15.7%** | 55 → 69 | 0 → **0** |
| CRI | 7.7% → 7.7% | 6.7% → 5.7% | 3.8% → **1.9%** | 5 → 4 | 100% → 99.1% | 2/3 → **2/2** | 7 → **5** | 9.1% → **21.8%** | 152 → **77** | 0 → **0** |
| Black Ledger | 4.1% → 3.9% | 3.4% → 3.4% | 0.8% → 0.9% | 4 → 4 | 100% → 100% | 2/3 → **1/2** | 6 → **4** | 16.5% → 12.9% | 32 → 38 | 0 → **0** |
| Last Posture | 6.4% → 7.6% | 3.4% → **6.5%** | 0.9% → 1.1% | 4 → 4 | 100% → 99.6% | 2/3 → **2/2** | 7 → **5** | 46.3% → **13.9%** | 35 → 42 | 0 → **0** |

Overall, before → after:

| Metric | Before | After |
|---|---|---|
| runs with a contact | 1348 (33.7%) | 1402 (**35.0%**) |
| runs reaching ENGAGED | 902 | **1126** |
| ENGAGED runs with 3+ touchpoints | 901 (99.9%) | 1122 (99.6%) |
| personalized-event gap: median / p75 / p90 / max | 2 / 3 / 3 / 5 | **2 / 2 / 2 / 5** |
| mean gap | 2.17 | **1.65** |
| contact → commit/terminal span: median / p75 / p90 | 7 / 7 / 8 | **5 / 5 / 5** |
| max simultaneously active factions | 1 | **1** |
| compressed-chain schedule expiries | 0 | **0** |

The compression did what it was asked to do. A relationship that used to run
seven years from the first letter to its resolution now runs five, the p90 gap
between personalized events fell from three years to two, and 224 more runs reach
ENGAGED — with **no** schedule expiring and **no** touchpoint lost. The chain
still reaches its escalation inside the shorter window at the earliest legal
ages: disposition at 18 → middle at 20 → escalation at 21, all within the events'
own age gates.

---

## 6. Correctness counters

All zero, across the 4 000-run general arm.

| Counter | Value |
|---|---|
| endings before age 18 | 0 |
| Material Commitments before age 18 | 0 |
| pre-25 content coverage defects | 0 |
| pre-25 generic fallback years | 0 |
| years with more than one visible event | 0 |
| illegal faction transitions | 0 |
| faction lifecycle collisions | 0 |
| personalized faction events after a terminal exit | 0 |
| runs holding two personally-active factions | 0 |
| contacts opened while another faction was active | 0 |
| compressed-chain schedule expiries | 0 |

---

## 7. The two REVIEW bands

### S9 — SPR ≥ 15 among runs active at 65: 95.3% → 84.0%

The ledger's stated aim is that this share "should fall materially from the old
~96%". It fell 11.3 points. The diagnostic operationalises "materially" as at
least 15 points, which is a threshold **this session chose** because the plan
gives none — so the REVIEW is as much about the threshold as about the number.

The direction is unambiguous and the mechanism is the intended one: repeat-driven
SPR is gone (`FAM-0005` 8 314 → 2 845, `SOC-0006` 5 302 → 1 505,
`HEA-0002` and `SOC-0008` inert on repeats), and mean SPR drift entering 65 fell
from +24.54 to +16.95.

What remains is **not** repeat inflation. The largest surviving positive SPR
sources are `EVT-ORD-HEA-0001` (+4 829, not repeatable) and the **untouched TRUE
branch of `EVT-ORD-FAM-0007`** (+2×2260 = 4 520). That branch is repeatable and
grants SPR +2, and the ledger deliberately scoped `FAM-0007` to *positive INT*
only — so it was left exactly as authored. It is now the largest repeatable
positive-SPR source in the corpus. **This is the obvious candidate if design
wants S9 lower, and it is a design decision, not a Part A one.** Nothing was
changed to chase the band.

### F6 — faction endings, share of completions: 10.0% → 7.6%

Below the 8–15% band by 0.4 points, and the cause is legible.

CRI supplied 152 of the 285 pre-patch faction endings. Its first-disposition exit
is `INT<=3 | TLT[T1010]` — a **low**-INT exit — so the INT correction made it
easier to reach: CRI's first-disposition exit rate rose 9.1% → 21.8%, its
COMMITTED share halved (3.8% → 1.9%), and its endings fell 152 → 77. Every other
faction's endings held or rose (DMMS 6 → 20, Meridian 55 → 69, Black Ledger
32 → 38, Last Posture 35 → 42), so the total fell only 285 → 250 while the
*denominator* grew, completions having risen from 2 858 to 3 294.

The mirror image is also visible: the exits gated on **high** INT/SPR became
rarer (DMMS 54.0% → 21.8%, Meridian 53.0% → 15.7%, Last Posture 46.3% → 13.9%),
which is why 224 more runs reach ENGAGED. This is precisely what
`01_PART_A_SCOPE_AND_DESIGN.md` predicted — "INT/CHR ecology changes will already
change their reachability. Re-measure before deciding whether exits need
redesign" — so the exit thresholds were **not** touched. Section A6 also states
that success in Part A does not mean more faction endings.

Faction endings remain a secondary outcome at 7.6%, not a rarity.

---

## 8. Reported, not banded: the outcome shape

Part A changes no ending gate, but it moves the stats those gates read, so the
resulting shape is measured rather than assumed.

| Metric | Before | After |
|---|---|---|
| completion | 71.5% | **82.3%** |
| nonterminal (open records) | 1142 | **706** |
| coverage errors | 0 | 0 |
| mean / median ending age | 52.2 / 43 | **55.1 / 44** |
| 18–24 | 1.2% | 1.2% |
| 25–34 | 20.7% | 19.0% |
| 35–44 | 34.0% | **32.8%** |
| 45–54 | 15.1% | 13.8% |
| 55–64 | 1.3% | 1.1% |
| 65+ | 27.6% | **32.1%** |

Completion rose 10.8 points. Lower INT and SPR make several authored ending
paths — including the Continuity Review chain that H2B.1A already identified as
the 65+ driver — reachable for lives that previously ran to the horizon with a
high-stat open record. The band shape is otherwise stable: 35–44 is still the
largest bucket, and **Q-27 is not resolved or affected by this patch**. No
lethality was increased and no ending-age distribution was targeted.

This is the largest side effect of Part A and belongs in the owner review.

---

## 9. Frozen-ledger notes

No mismatch. Two places where the ledger's scope is narrower than its section
heading might suggest were applied **as written**, and are recorded here so the
review is not surprised:

1. **`EVT-ORD-FAM-0005`** — the ledger scopes the change to "every branch
   currently granting SPR +2". Only the `SPR>=7` branch does; the `TRUE` branch
   grants SPR +1 and was left alone. A later occurrence that falls through to
   `TRUE` therefore still gains SPR +1.
2. **`EVT-ORD-FAM-0007`** — scoped to "every branch that currently grants
   positive INT". Only the `MAT!=NONE` branch does; the `TRUE` branch's SPR +2 is
   untouched and is now the corpus's largest repeatable positive-SPR source
   (see §7).

Both are faithful readings of the frozen text. Neither was extended, and neither
was quietly widened to improve S9.

---

## 10. What was deliberately not done

- No FIX gate, opt-out threshold, commitment gate or ending gate changed.
- No passive drift, clamp, meter, generic high-stat penalty, childhood
  catastrophe, pre-18 ending or pre-18 Material Commitment added.
- No visible faction meter or stage label; lifecycle stays flag-backed.
- No contact → disposition or escalation → climax schedule changed.
- No prose rewritten. No effect edit required a text change: no surviving
  sentence claims a stat gain that no longer occurs.
- No LOW/MID/HIGH sweep, family A/B, T1027 or T1023 matrix run.
- No test weakened. Two existing tests were made version- and order-independent
  and kept all their original claims (§11).

---

## 11. Tests

448 Vitest tests across 23 files, up from 425 at the instrumentation commit and
396 on `main`.

New:

- `tests/h2b1b-a-repeat-semantics.test.ts` — proves the first-occurrence
  mechanism from both ends. The annual loop resolves a variant against pre-event
  state and records the occurrence afterwards, so `EVT[<self>]` is false the
  first time and true on every repeat; a synthetic world shows the growth landing
  exactly once across 21 occurrences while every year still produces a visible
  event. The canonical half then walks 400 complete lives and checks what each
  actual repeat applied.
- `tests/h2b1b-a-faction-cadence.test.ts` — pins both halves of the cadence
  change: the two links that moved, and the contact ages, contact → disposition
  timing, escalation → climax timing, exit conditions, commitment and ending
  gates, six-faction registry, FSM table, single-active rule and safe exit that
  did not.
- `tests/h2b1b-a-diagnostic.test.ts` — pins the statistics against hand-computed
  values, pins the age-18 snapshot to the state *entering* 18, and pins each
  review band's PASS / REVIEW / FAIL / MEASURED verdict.

Updated, without loss of coverage:

- `tests/acceptance-a-content.test.ts` resolved its fixture through a pinned
  batch filename, which a version bump breaks. It now resolves by batch prefix.
- `tests/h2b-batch008.test.ts` asserted the reunion's branches by index. It now
  finds them by condition and additionally asserts the Part A facts.

Golden runs were regenerated and reviewed rather than accepted. The fingerprint
is part of every run seed, so all 36 lives are re-rolled and a wholesale
reshuffle carries no information; what was checked is that the invariants hold in
both — gapless timelines from age 0, no ending before 18 — and that the direction
matches the ledger, with mean final INT falling 16.8 → 9.6 and SPR 22.1 → 15.9.

One fingerprint-bound E2E fixture needed repair: `open-a` was chosen because it
reached the horizon without an ending, and it now ends at 39. It is replaced by
`open-06`, which is nonterminal under the browser's own setup flow. `smoke-002`
still ends and `visibility-fixture` is still open, so both were left alone.

---

## 12. For the owner review

Against the ten questions in the handoff's `04_AFTER_PART_A_REVIEW.md`:

1. **INT=0 at 18** — median 4, P(≥8) 0.3%, P(≥10) 0.0%. Meaningfully low.
2. **INT=10 at 18** — median 15, clearly distinct; the 0-vs-10 gap is 11.
3. **CHR** — retained its setup meaning (drift now identical at +1.94 across
   arms) without becoming static: it still grows +1.92 by 18 and +5.92 by the end.
4. **SPR** — repeat inflation materially improved; ordinary life did not become
   relentlessly negative (mean SPR drift entering 65 is still +16.95). See §7 for
   the one untouched repeatable that dominates what is left.
5. **First-disposition exits** — changed sharply and asymmetrically, exactly as
   predicted. High-stat exits became rarer, CRI's low-INT exit became commoner.
   Measured, not tuned. §5 and §7.
6. **3+ touchpoints among ENGAGED runs** — 99.6%, on 224 more ENGAGED runs.
7. **Gaps** — median 2, p90 down from 3 to 2, mean 2.17 → 1.65.
8. **Expiries / conflicts / ending surge** — zero expiries, zero lifecycle
   conflicts, and no faction-ending surge (they fell). There *is* a general
   completion surge, 71.5% → 82.3%; see §8.
9. **Faction endings still secondary** — yes, 7.6%, below the 8% band by 0.4
   points. §7.
10. **Clean high-stat exits** — still reachable, and rarer. DMMS, Meridian and
    Last Posture first-disposition exits roughly a third of their former rate,
    because their conditions read INT ≥ 9 / SPR ≥ 6–7 and those values are now
    where the design asked them to be. None became unreachable.

The two items needing a decision are S9's remaining SPR source (§7) and the
completion shift (§8). Both are recorded here rather than acted on.
