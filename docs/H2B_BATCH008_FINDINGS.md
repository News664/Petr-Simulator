# SOLID STATE — H2B Batch 008 Findings

**Measurements and analysis.** Nothing here selects or freezes a threshold
profile, and Batch 008 was not auto-tuned from this run. Decisions stay in
[`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); the generated data is in
[`reports/h2b-batch008-diagnostic.md`](../reports/h2b-batch008-diagnostic.md)
and `.json`, and the content lints in
[`reports/h2b-content-lint.md`](../reports/h2b-content-lint.md).

| Field | Value |
|---|---|
| Content fingerprint | `30bc4280bffd848ece939fb8ceb2ddd3715bd3d7e026ab5d81f657ed70fd1bf5` |
| Corpus | 214 events · 8 batches · 25 endings · 38 route tags · 6 factions · 30 talents |
| Primary arm | LOW + Batch 008, 5 000 runs |
| Comparator | CURRENT_AUTHORED + Batch 008, 2 500 runs |
| Sampling | species stratified · uniform-three talents · `ARCHETYPE_SET` · uniform family weighting · max age 120 · base seed `h2b_batch008` |
| Correctness | every counter zero in both arms, including faction exclusivity |

LOW is applied through the retained reversible rewrite. **No canonical FIX gate
was written.**

---

## 1. Headline

| Arm | Completion | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ | Commitment | Mean commit age | Coverage | Faction endings | Entropy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **LOW + Batch 008** | **55.4%** | 1.3% | 19.6% | 48.0% | 20.8% | 1.6% | 8.7% | **72.3%** | 34.9 | **100% (25/25)** | 10.6% | 3.054 |
| CURRENT + Batch 008 | 32.4% | 1.1% | 21.1% | 25.3% | 12.3% | 2.6% | 37.6% | 49.5% | 35.4 | 88% (22/25) | 15.9% | 2.511 |

For reference, the same LOW profile **without** Batch 008 (H2A calibration,
3 000 runs) gave completion 42.5%, commitment 61.4%, coverage 22/24, entropy
2.836, 65+ 11.4%.

### Against the plan's review goals

| Goal (primary arm) | Observed | Met |
|---|---|---|
| completion roughly 50–70% under LOW | **55.4%** | **yes** |
| mean commitment materially earlier than 35, preferably 28–31 | 34.9 | technically — but see below |
| 25–34 the largest or a clearly major bucket | 19.6%, largest is 35–44 | **no** |
| 18–24 visibly nontrivial | 1.3% | **no** |
| 35–44 falls substantially from ~48% | 48.0% | **no** |
| 65+ low rather than survivor-dominant | 8.7% | **yes** |
| faction endings remain secondary | 10.6% | **yes** |
| material guardrails healthy | entropy 3.054, **0 guardrail failures** | **yes** |

**Batch 008 fixed the ending economy and finished the coverage problem. It did
not move commitment timing.** Mean Material Commitment age is 34.9 under LOW +
Batch 008 against 35.3 under LOW alone and 35.7 under the untouched corpus — a
0.8-year movement across a corpus expansion of 28 events and an 18-point
completion swing. This is the third independent confirmation of the H2A result:
**neither threshold height nor content volume moves *when* a life commits.**

Two genuine wins are worth stating plainly:

- **Ending coverage reached 25/25 for the first time**, including the new
  `END-MED-003`. Every authored ending in the registry is now reachable and
  observed in a single pass.
- **The LOW arm produced zero guardrail failures.** Nonterminal runs fell to
  44.6%, below the 50% threshold that made `nonterminal-rate` a failure in every
  previous run since Phase 1.1.

---

## 2. Pressure chains

Rescue split among the ten gated pressure/recovery events (LOW, 5 000 runs):

| Band | FIX gained | Occurrences |
|---|---|---|
| clean luck | 0–2 | 4 365 |
| costly but legitimate | 3–6 | 38 |
| unclassified | 7–9 | 5 |
| predatory institutional | 10+ | 536 |

**Low-stat lives recover cleanly far more often than they are exploited**, which
is what the plan asked for. The corpus-wide "clean" total in the generated report
(14 568) is inflated by non-rescue Batch 008 events that carry no FIX; the table
above is the meaningful split.

The predatory branches do what they were designed to do — they are the only
mechanism in the batch that materially advances commitment:

| Branch | n | FIX | Mean age | P(commit ≤5y) | P(ending ≤5y) |
|---|---|---|---|---|---|
| `EVT-INS-ARC-2001` structural-housing subsidy | 231 | +12 | 30.8 | **65.4%** | **43.7%** |
| `EVT-ORD-HEA-2001` v3 Continuity Leave | 35 | +12 | 27.2 | 37.1% | **48.6%** |
| `EVT-INS-FIN-2001` v3 Mobility-Backed Restructuring | 255 | +14 | 19.8 | 9.0% | 3.5% |
| `EVT-INS-CIV-2001` v3 Presentation Access Program | 15 | +12 | 19.7 | 6.7% | 0.0% |

The pattern is clear and useful: **a +12/+14 FIX bargain converts to commitment
when it lands near 30, and barely registers when it lands at 19.** The financial
rescue is the batch's highest-incidence predatory branch (255 runs) and its least
consequential, because at age 20 a run is still ~14 FIX short of the LOW
commitment gate and spends the intervening decade drifting.

**This is the concrete lever on commitment timing that this run identifies.** It
is stated as evidence, not applied: no age window was changed.

Six authored branches never fired — see
[`PHASE1_CONFLICTS.md#h2b-c2`](PHASE1_CONFLICTS.md).

---

## 3. Basic Continuity Insurance (STR)

| Measure | LOW + Batch 008 |
|---|---|
| Functional Continuity Review opened | 278 runs (5.6%), mean age 43.8 |
| Two-year decision reached | 276 |
| — recovered (STR ≥ 3) | 11 (4.0%) |
| — independent treatment | 205 (**74.3%**) |
| — expedited (STR ≤ −3) | 0 (0.0%) |
| — covered stabilization | 60 (21.7%) |
| Final outcome reached | 58 |
| `END-MED-003 Benefit Approved` | 18 runs (0.36% of runs, 0.65% of completions) |
| Mean / median benefit age | 45.9 / 53 |
| Synthetic share of benefit endings | **88.9%** (16 SYNT, 1 CERA, 1 CRYS) |

The chain works end to end and the ending is reachable. Three observations:

1. **The independent-treatment branch dominates at 74.3%.** `MNY>=8 | INT>=11 |
   TLT[T1015]` is a wide gate for a population whose INT drift is +11 by age 35,
   so the mobility-preserving escape is the common outcome rather than the
   exception. Covered stabilization — the branch that carries +12 FIX and feeds
   the permanent ending — reaches only a fifth of reviews.
2. **`END-MED-003` respects existing material as designed**: 2 of 18 endings kept
   a prior commitment (CERA, CRYS) and the remaining 16 took public-schedule
   SYNT.
3. **The coverage gap is real and is the headline STR finding.** 1 384 runs sat
   at STR ≤ −3 as adults; only 166 (12.0%) ever opened a review, and **1 218 long
   survivors reached 65+ below −3 with the insurer never opening a file.** The
   plan explicitly named this as a thing that should not happen. Cause and
   options are in [`PHASE1_CONFLICTS.md#h2b-c1`](PHASE1_CONFLICTS.md); nothing
   was changed here.

---

## 4. Housing

| Measure | LOW + Batch 008 | H2A (LOW, pre-Batch-008) |
|---|---|---|
| Runs with any housing event | 99.4% | 99.3% |
| Distinct housing event IDs per run (mean / max) | **4.38 / 10** | ~2 / 4 available |
| Housing occurrences | 21 774 | — |
| Literal relocations | 7 363 (**33.8%** of housing events) | not separable |
| Runs that relocate at all | 77.6% | — |
| Mean relocations per relocating run | 1.90 (max 5) | — |
| Runs with 2+ relocations | 2 459 (49.2%) | — |
| Mean MNY per housing event | **−0.33** | −1.03 |
| Mean FIX per housing event | +0.34 | 0 |

**The playtest complaint is addressed in kind, not in volume.** Housing is still
near-universal, but a life now sees a mean of 4.4 *different* housing situations
instead of the same move repeated, and only a third of housing events are moves.
The move itself is now once per run (`EVT-ORD-HOU-0002` `repeatMaxCount` 2 → 1),
and the remaining multi-move runs come from the new employer/roommate/compliant-
unit events, which are distinct situations rather than the same event again.

Housing also stopped being a pure money sink: −0.33 MNY per event against −1.03
before, because the new subsidised options pay.

**Structural-housing route:** offer taken by 9.8% of runs, 353 reached a
structural commitment, 126 lapsed, and **65 runs (1.3%) ended as architecture at
mean age 34.3** — all `END-ARC-001`. This is the batch's clearest new early
ending pathway and the single strongest commitment driver measured (65.4% commit
within five years of the offer). The self-ownership variant `END-LEG-002` never
fired.

Relocation is not a canonical route tag; the split relies on an analyst list —
see [`PHASE1_CONFLICTS.md#h2b-c4`](PHASE1_CONFLICTS.md).

---

## 5. Faction exclusivity and chains

**The single-active-faction rule holds absolutely.**

| Measure | LOW + Batch 008 |
|---|---|
| Maximum simultaneously personally-active factions | **1** |
| Runs holding two at once | **0** |
| Second contact opened while a relationship was still active | **0** |
| Runs with any faction contact | 1 675 (33.5%) |
| Runs that contacted more than one faction | 68 (1.4%) |
| Second contacts opened after a terminal exit | 69 |
| Escalation schedules expired because of the new middle event | **0** |

Contact incidence fell only slightly (35.0% → 33.5%), so the rule removed
simultaneity without removing factions from the world. Sequential relationships
do occur: 69 second contacts opened after the first reached OPTED_OUT or CLOSED,
exactly the behaviour the spec describes.

Inserting a middle event between disposition and escalation was the one change
with an obvious failure mode — pushing the existing `EVT-SPC-SECR-0019…0024`
escalations past their authored age windows. **It did not happen: zero escalation
schedules expired.** The new touchpoints reach 1.9–6.3% of runs each.

Faction-caused endings fell to 10.6% of completions (from 15.9% in the
comparator, 48.6% back in Phase 1.2), so terminality stays comfortably
secondary.

---

## 6. Age-stratified low-stat risk

This is the measurement H2A could not make, and it changes the reading.

Probability of any ending within 5 years, LOW + Batch 008, by adult life stage:

| Ages | Stat | critical (≤2) | vulnerable (3–4) | ordinary+ (≥5) | Direction |
|---|---|---|---|---|---|
| 18–24 | STR | **4.53%** | 2.63% | 1.50% | **correct, 3.0×** |
| 18–24 | SPR | **4.58%** | 2.73% | 1.63% | **correct, 2.8×** |
| 18–24 | MNY | 2.14% | 1.10% | 2.56% | still inverted |
| 18–24 | CHR | 2.49% | 1.28% | 2.35% | flat |
| 25–34 | SPR | **14.83%** | 8.56% | 8.21% | **correct, 1.8×** |
| 25–34 | MNY | **10.89%** | 8.42% | 9.04% | **correct, 1.2×** |
| 25–34 | STR | 8.54% | 7.77% | 9.32% | mildly inverted |
| 35–49 | SPR | **26.20%** | 21.08% | 16.56% | **correct, 1.6×** |
| 35–49 | STR | 12.75% | 12.20% | 18.19% | inverted |
| 65+ | all | ≈0–1% | ≈0.5–1% | ≈1–1.7% | inverted throughout |

**In early adulthood, being weak or exhausted is now genuinely more dangerous
than being ordinary** — three times more so for STR at 18–24. That is a direct
reversal of the H2A result, where low CHR/STR carried roughly a seventh of the
ordinary band's ending probability.

Three qualifications, stated because they matter:

- **CHR is unchanged.** Low CHR is still not more dangerous at any age. The
  batch's only low-CHR pressure event fires in 3.1% of runs.
- **MNY is fixed at 25–34 but not at 18–24**, where the clean lottery escape
  (`EVT-ORD-FIN-2003`, 12.9% of runs) and the +2 FIX hiring offer both land.
- **The 65+ inversion is structural and expected.** A survivor at 65+ with low
  CHR/STR has already outlived the windows in which endings fire, so the
  correlation there measures survivorship, not safety. This is exactly why the
  plan asked for age stratification, and it is why the aggregate H2A table read
  the way it did.

Nothing here is causal, and no danger weighting, generic death or visible-stat
pressure mechanic was implemented.

---

## 7. Stat ecology

Mean drift from the post-setup start, LOW + Batch 008 (denominators are runs
still active entering that age):

| Snapshot | n | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start | 5 000 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| age 18 | 5 000 | +4.09 | +9.25 | +2.74 | +0.24 | +5.72 |
| age 25 | 4 964 | +6.02 | +10.42 | +4.07 | +2.02 | +6.32 |
| age 35 | 4 422 | +8.49 | +11.52 | +6.03 | +3.77 | +5.97 |
| age 50 | 2 663 | +9.44 | +12.61 | +5.75 | +0.83 | +12.29 |
| age 65 | 2 471 | +8.23 | +12.66 | +3.71 | +0.29 | +24.90 |
| final | 5 000 | +3.89 | +12.19 | −0.29 | +1.63 | +15.28 |

Against the plan's directional checks:

| Check | Result |
|---|---|
| STR grows young, declines old | **yes** — +2.74 at 18, +6.03 at 35, +3.71 at 65, −0.29 final |
| CHR mostly stable after early adulthood | **yes** — +6.0 at 25 through +8.2 at 65 |
| INT no longer strictly monotonic | **partly** — the corpus lint now passes (6.3 negative deltas per 1 000 run-years, and drift genuinely plateaus at +12.61 → +12.66 between 50 and 65), but **100% of runs still end with INT above their start** |
| SPR no longer ≥15 in almost every 65+ survivor | **no** — 96.0%, down from 98.4% |
| MNY variable rather than one-way collapse | **yes** — final drift +1.63, up from −2.01 |

The two SPR patches worked directionally without solving the problem: positive
authored SPR deltas fell from 331.5 per 1 000 run-years (were 493.7 in H2A) and
drift at 65 from +30.5 to +24.9, but SPR still rises in roughly one year in three
and 91.4% of runs end above their starting SPR. **The remaining SPR accumulation
is spread across ordinary social/family content, not concentrated in the two
events that were patched.**

INT is the mirror image: the lint requirement is satisfied literally — there are
now authored negative INT deltas, and `EVT-ORD-GEN-2001` fires in 49% of runs —
but at −1/−2 against +147 positive deltas per 1 000 run-years, no run ever
finishes below where it started.

---

## 8. Content lints

| Lint | Result |
|---|---|
| All-female player-facing prose | **PASS** — 644 strings scanned across events, endings, talents, species and factions; **0 findings** |
| Age 0–1 audit | 7 events listed; all guardian-mediated or passive development; one residual note ([H2B-C3](PHASE1_CONFLICTS.md)) |
| Stat curve | **no strictly monotonic visible stat remains** — the INT requirement is met at corpus level |

The gender lint is wired into `npm run verify` as a hard failure. Its allowlist
is empty by design: the spec forbids silent suppression, so a string only lands
there after a recorded human review.

---

## 9. What this run says about the next move

Stated as analysis. **Nothing was tuned, selected or frozen.**

1. **LOW + Batch 008 is a usable playtest configuration** on every axis except
   ending-age shape: completion 55.4%, zero guardrail failures, full ending
   coverage, healthy material entropy, secondary factions. It is the best
   configuration measured so far.
2. **The 25–34 target is not reachable by adding pressure content or by lowering
   gates.** Three separate instruments now agree. The binding constraint is that
   FIX accumulates too slowly for a commitment gate at 28 to be crossed before
   the mid-30s, and the only measured exception is a +12 FIX bargain landing
   *near 30* — which converts at 65%.
3. **The most promising untried lever is the age at which large-FIX bargains are
   offered**, not their size. `EVT-INS-FIN-2001`'s +14 FIX at age 19.8 converts
   at 9%; `EVT-INS-ARC-2001`'s +12 FIX at 30.8 converts at 65%.
4. **Three named problems remain open**: the STR review coverage gap (H2B-C1),
   SPR's late accumulation, and low CHR carrying no risk at any age.

Q-27 and Q-02 stay open. LOW is **not** frozen: the H2B spec is explicit that
this is a provisional design baseline, and freezing it on the same run that
introduced Batch 008 would confound the two changes.
