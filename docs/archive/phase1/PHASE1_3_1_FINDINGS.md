# SOLID STATE — Phase 1.3.1 Micro-Calibration Findings

## Version 0.1 — for design review

> **Note (Part B, 2026-08-14):** the generated report this document was
> written from is no longer tracked in git — it measured an earlier corpus.
> The conclusions below are unchanged. See
> [`reports/REPORT_INDEX.md`](../../../reports/REPORT_INDEX.md) for what it measured and the command
> that regenerates it.

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](../../OPEN_QUESTIONS.md).** Resolve them there, not here.

Source data: `reports/phase1_3_1-targeted-sanity.md` / `.json`, produced by
`npm run sanity -- --plan SOLID_STATE_PHASE1_3_1_TARGETED_SANITY_v0.1.json` —
2 500 runs, species-stratified, uniform-three talents, `ARCHETYPE_SET`
allocation, uniform family weighting, **authored current thresholds**, strict
pre-25 coverage.

Content: Batch 007 v0.2 — **six `when` strings changed, nothing else.** Content
fingerprint `a10919ca3f6d54950cb7aee85c1282555a0f0c2102d855526d9754c762ede4c2`.

The Phase-1.3 comparison column is `reports/phase1_3-sanity.json` (5 000 runs).
Because the run counts differ, **endings per 1 000 runs is the like-for-like
figure**; shares of completions are given too.

Per the instructions the LOW/MID/HIGH sweep, family-weight A/B, allocation
comparison, T1027 sensitivity, T1023 comparison and manifestation diagnostic were
**not** run. All six harnesses are retained and untouched.

---

## Headline

The four condition edits did what they were scoped to do and no more. **Two of
the four moved the needle, one moved it barely, and one did nothing** — and the
reason the last one did nothing is worth more than the edit itself.

| # | Finding | Verdict against the plan's desired direction |
|---|---|---|
| 1 | Last Posture reaches COMMITTED and produces an ending for the first time | **met, technically** — 1 of 180 contacts |
| 2 | 18–24 endings roughly 2.4× per 1 000 runs, but still 1.8% of completions | **partially met** — observable, far below the 5–15% review band |
| 3 | Sudden faction endings remain a clear minority at 13.9% | **met** |
| 4 | Faction terminality 16.7%, nowhere near the Phase-1.2 48.6% | **met** |
| 5 | Every FSM, safe-exit and pre-25 correctness counter is zero | **met** |
| 6 | The Black Ledger edit produced zero observable change | **no effect** — the binding gate is `MAT!=NONE`, not the money threshold |
| 7 | Completion essentially unchanged: 23.9% → 24.2% | as expected for a condition-only patch |

---

## 1. Correctness counters — all still zero

| Counter | Value | Required |
|---|---:|---:|
| Illegal faction lifecycle transitions | **0** | 0 |
| Runs holding two lifecycle states for one faction | **0** | 0 |
| Personalized faction events after OPTED_OUT/CLOSED | **0** | 0 |
| Pre-25 content coverage defects | **0** | 0 |
| Pre-25 generic fallback events | **0** | 0 |
| Pre-25 lore fallback events | **0** | 0 |

H2A stays OPEN; nothing in this patch touches a gate blocker.

---

## 2. Ending-age distribution

| Age band | P1.3 count | P1.3 share | P1.3 /1 000 | P1.3.1 count | P1.3.1 share | P1.3.1 /1 000 | Target |
|---|---:|---:|---:|---:|---:|---:|---:|
| 18–24 | 9 | 0.8% | 1.8 | **11** | **1.8%** | **4.4** | 18–22% |
| 25–34 | 189 | 15.8% | 37.8 | 98 | 16.2% | 39.2 | 35–40% |
| 35–44 | 242 | 20.2% | 48.4 | 126 | 20.9% | 50.4 | 20–25% |
| 45–54 | 123 | 10.3% | 24.6 | 77 | 12.7% | 30.8 | 8–12% |
| 55–64 | 22 | 1.8% | 4.4 | 8 | 1.3% | 3.2 | 4–7% |
| 65+ | 612 | 51.1% | 122.4 | 284 | 47.0% | 113.6 | 2–5% |
| **completed** | 1 197 | 23.9% | 239.4 | **604** | **24.2%** | **241.6** | — |

**18–24 is now observable rather than effectively zero.** 11 endings in 2 500
runs against 9 in 5 000 is a real increase — under the Phase-1.3 rate you would
expect ~4.5, and observing 11 has Poisson p ≈ 0.007 — but the absolute level is
1.8% of completions against the plan's own 5–15% review band and the 18–22%
design target. This was explicitly scoped as an observability edit, not a balance
fix, and it behaved that way.

Everything else moved within sampling noise. 65+ eased slightly (51.1% → 47.0% of
completions, 122.4 → 113.6 per 1 000) and 45–54 rose a little; median ending age
fell from 67 to 51.5, which mostly reflects the thinner 65+ tail rather than
younger endings arriving.

---

## 3. Faction lifecycle

Contact reached 36.0% of runs (34.9% in Phase 1.3). Per faction, counts over
2 500 runs:

| Faction | Contact | ENGAGED | COMMITTED | OPTED_OUT | CLOSED | Endings | Sudden | Ladder |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Black Ledger | 126 | 115 | 10 | 39 | 77 | 10 | **0** | 10 |
| CRI | 215 | 183 | 36 | 24 | 154 | 36 | **8** | 28 |
| DMMS | 128 | 4 | 0 | 0 | 128 | 0 | 0 | 0 |
| Everlasting Mutual | 213 | 143 | 20 | 119 | 72 | 20 | 0 | 20 |
| Last Posture | 180 | **76** | **1** | 179 | 0 | **1** | 1 | 0 |
| Meridian | 174 | 53 | 34 | 117 | 23 | 34 | **5** | 29 |

Totals: 1 036 contacts → 574 ENGAGED, 101 COMMITTED, 478 OPTED_OUT, 454 CLOSED.

| | Phase 1.3 | Phase 1.3.1 |
|---|---:|---:|
| Faction-caused endings | 184 (15.4% of completions) | **101 (16.7%)** |
| Committed ladder | 173 (94.0%) | 87 (**86.1%**) |
| Sudden | 11 (6.0%) | 14 (**13.9%**) |

Both guardrails hold: sudden endings are still a clear minority, and faction
terminality is still nowhere near the Phase-1.2 48.6%.

### 3.1 Last Posture — unblocked, but still nearly filtered

This was the edit's primary target, and the result is genuinely mixed:

| | Phase 1.3 | Phase 1.3.1 |
|---|---:|---:|
| Contacts | 380 | 180 |
| Reached ENGAGED | 68 (17.9%) | **76 (42.2%)** |
| Reached COMMITTED | **0** | **1** |
| Endings | **0** | **1** (sudden) |
| `END-REL-001` observed | 5 | 5 |

The disposition edit worked exactly as intended — requiring `SPR>=6` alongside
`INT>=8` more than doubled the share of contacts that get past the first gate.
The faction is no longer *structurally* filtered to zero.

But it is still filtered to almost zero, because there is a **second** gate the
patch deliberately did not touch: escalation event `EVT-SPC-SECR-0024` variant 1
opts out on `INT>=8 | SPR>=8 | TLT[T1010]`. Under `ARCHETYPE_SET` allocation the
`INT>=8` clause catches most of the survivors, so 179 of 180 contacts still end in
OPTED_OUT. If design wants Last Posture to be a route a player can actually walk,
the escalation condition is the remaining lever — and it is out of scope here.

### 3.2 The Black Ledger edit had no effect

`MNY<=0 & MAT!=NONE` → `MNY<=1 & MAT!=NONE` produced **0** sudden endings, the
same as before. The money threshold was never the binding constraint: the variant
also requires `MAT!=NONE` on an event whose age window is 19–29, and the mean
Material Commitment age is **35.7**. Almost nobody has committed a material yet
when that branch is evaluated.

Relaxing the money clause further will not change this. The branch is gated by
commitment timing, which is a Q-27 question, not a condition-tuning one.

### 3.3 Where the sudden endings came from

| Faction | Sudden endings | Edit applied |
|---|---:|---|
| CRI | 8 | `FIX>=18 & STR<=3` → `FIX>=16 & STR<=3` |
| Meridian | 5 | `CHR>=9 & FIX>=14` → `CHR>=8 & FIX>=12` |
| Last Posture | 1 | (disposition edit, indirectly) |
| Black Ledger | 0 | `MNY<=0` → `MNY<=1` — no effect |

CRI and Meridian carry the whole 18–24 improvement between them.

---

## 4. Unchanged by design

Material Commitment rate 36.8% (was 36.9%), mean commitment age 35.7 (35.6), mean
FIX at commitment 42.7 (42.9). Lore fallback 13.2% of event-years, generic age-25+
fallback 13.3% — both effectively identical to Phase 1.3, as expected from a patch
that touched no schedule, age window or threshold.

Ending coverage is 14/24 in this run against 17/24 in Phase 1.3; that difference
is a sample-size artifact (2 500 vs 5 000 runs, with several endings occurring
once or twice), not a regression.

---

## 5. Recommended next decisions

1. **Q-27 remains the blocking question.** This micro-calibration confirms that
   condition tuning inside the faction layer cannot supply the missing 18–34
   endings: the two edits that could fire produced 13 extra faction endings
   between them. The supply question — non-faction mid-life ladders, a higher
   COMMITTED rate, or a less strongly conditioned sudden branch — is unchanged.
2. **Last Posture's escalation condition** (`EVT-SPC-SECR-0024` variant 1) is the
   remaining structural filter, if design wants that route walkable.
3. **The Black Ledger sudden branch is gated by commitment timing**, not by its
   money clause. It cannot become observable while mean commitment lands at 35.7
   and the branch closes at 29.
4. **The retained LOW/MID/HIGH threshold sweep** is the stated next larger task
   and is now the appropriate instrument: the 18–34 gap is a threshold-and-supply
   question, and four condition edits have shown they cannot close it.
