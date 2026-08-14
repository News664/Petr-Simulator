# SOLID STATE — H2B Batch 008 Diagnostic

**Measurements only.** Generated from
`docs/validation/SOLID_STATE_H2B_DIAGNOSTIC_PLAN_v0.1.md`.

LOW is the **provisional diagnostic baseline**, applied through the retained reversible rewrite in `src/sim/experiments.ts`. No canonical FIX gate is written, no profile is frozen, and Batch 008 is not auto-tuned from this run. Written analysis is in [`docs/H2B_BATCH008_FINDINGS.md`](../docs/H2B_BATCH008_FINDINGS.md); decisions stay in [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md). This file is regenerated on every run.

| Field | Value |
|---|---|
| Generated at | 2026-08-14T10:26:31.316Z |
| Content fingerprint | `30bc4280bffd848ece939fb8ceb2ddd3715bd3d7e026ab5d81f657ed70fd1bf5` |
| Balance constants | v0.2 |
| Experiment matrix (LOW values) | v0.1 |
| Base seed | `h2b_batch008` |
| Events in corpus | 214 |
| Endings in registry | 25 |
| primaryRuns | `5000` |
| comparatorRuns | `2500` |
| speciesMode | `STRATIFY_EQUALLY_BY_SPECIES` |
| talentScenario | `UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC` |
| allocationPolicy | `ARCHETYPE_SET` |
| familyWeightMode | `uniform` |
| maxAge | `120` |

## 1. Headline balance

Bucket shares are shares of **completed** runs.

| Arm | Runs | Completion | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ | Largest | Median ending age |
|---|---|---|---|---|---|---|---|---|---|---|
| **LOW + Batch 008** | 5000 | 55.4% | 1.3% | 19.6% | 48.0% | 20.8% | 1.6% | 8.7% | 35-44 | 41 |
| **CURRENT_AUTHORED + Batch 008** | 2500 | 32.4% | 1.1% | 21.1% | 25.3% | 12.3% | 2.6% | 37.6% | 65+ | 45 |

| Arm | Commitment | Mean commit age | Median commit age | Ending coverage | Faction endings | Material entropy | Guardrail failures |
|---|---|---|---|---|---|---|---|
| **LOW + Batch 008** | 72.3% | 34.9 | 35 | 100.0% (25/25) | 10.6% | 3.054 | 0 |
| **CURRENT_AUTHORED + Batch 008** | 49.5% | 35.4 | 35 | 88.0% (22/25) | 15.9% | 2.511 | 1 |

### Review goals from the plan

These are **review goals, not hard final targets**. Nothing is selected from them.

| Review goal (primary arm) | Observed | Met |
|---|---|---|
| completion 50–70% under LOW | 55.4% | yes |
| mean commitment materially earlier than 35, preferably 28–31 | 34.9 | yes |
| 25–34 the largest or a clearly major bucket | 19.6% (largest: 35-44) | no |
| 18–24 visibly nontrivial | 1.3% | no |
| 35–44 falls substantially from ~48% | 48.0% | no |
| 65+ low rather than survivor-dominant | 8.7% | yes |
| faction endings stay secondary | 10.6% | yes |

## 2. Correctness counters

All must be zero in every arm.

| Arm | Pre-25 coverage | Pre-25 fallback | Illegal transitions | Lifecycle collisions | Personal after exit | Ending <18 | Commit <18 | Two active factions | Contact while active |
|---|---|---|---|---|---|---|---|---|---|
| **LOW + Batch 008** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **CURRENT_AUTHORED + Batch 008** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## 3. Pressure chains — Batch 008 event behaviour

One row per new event, then one row per authored variant. `Rescue band` follows the Pressure & Tone spec: clean luck 0–2 FIX, costly-but-legitimate 3–6, predatory institutional 10+. The 7–9 gap is unnamed in the spec and is reported separately rather than folded into a neighbour. `P(ending ≤5y)` and `P(commit ≤5y)` are conditional on complete follow-up; censored occurrences are dropped, not counted as "no event".

### LOW + Batch 008

| Rescue band | Occurrences |
|---|---|
| clean | 14568 |
| costly | 2043 |
| unclassified | 140 |
| predatory | 748 |

**`EVT-INS-ARC-2001`** INS/ARC — run incidence 4.6% (231 runs, 231 occurrences), mean age 30.8, gated on `MNY<=3`

Gating-stat band entering the year it fired — critical 147, vulnerable 84, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | A municipal housing program offers you a large rent subsidy in exchan… | 231 | 30.8 | +12 | predatory | 4.00 | 43.7% | 65.4% | 231 |

**`EVT-INS-ARC-2002`** INS/ARC — run incidence 4.2% (210 runs, 210 occurrences), mean age 32.4

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1024] | TLT[T1013] | MNY>=7` | You exit the structural-continuity pilot before the installation clau… | 101 | 32.3 | — | clean | n/a | 14.9% | 43.6% | 101 |
| 2 | `MAT=STON | MAT=METL` | The housing authority approves your committed material for structural… | 9 | 33.8 | +4 | costly | n/a | 100.0% | 0.0% | 9 |
| 3 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL]` | The pilot permanently stabilizes the stone manifestation it was desig… | 37 | 31.2 | +8 | unclassified | n/a | 75.7% | 100.0% | 37 |
| 4 | `MAT=NONE & FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_STON]` | The pilot permanently stabilizes your metallic manifestation into a s… | 26 | 30.5 | +8 | unclassified | n/a | 80.8% | 100.0% | 26 |
| 5 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & FLAG[MAT_MANIFEST_METL] & SPECIES=DWARF` | The pilot resolves your mixed manifestation history in favor of stone… | 6 | 34.7 | +8 | unclassified | n/a | 100.0% | 100.0% | 6 |
| 6 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & FLAG[MAT_MANIFEST_METL] & SPECIES=DRAGONKIN` | The pilot resolves your mixed manifestation history in favor of metal… | 6 | 35.3 | +8 | unclassified | n/a | 100.0% | 100.0% | 6 |
| 7 | `TRUE` | The pilot cannot settle on a legally usable structural material. The … | 25 | 34.9 | +5 | costly | n/a | 32.0% | 36.0% | 25 |

**`EVT-INS-ARC-2003`** INS/ARC — run incidence 1.3% (65 runs, 65 occurrences), mean age 34.3

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1024] | TLT[T1013]` | The housing project incorporates your Permanent Form into the buildin… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `TRUE` | Your subsidized tenancy converts into permanent structural occupancy.… | 65 | 34.3 | — | clean | n/a | 100.0% | 0.0% | 65 |

**`EVT-INS-CIV-2001`** INS/CIV — run incidence 3.1% (155 runs, 155 occurrences), mean age 20.5, gated on `CHR<=3`

Gating-stat band entering the year it fired — critical 41, vulnerable 114, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=7` | You pay for a professional presentation course after being described … | 79 | 20.6 | — | clean | 4.00 | 2.5% | 2.5% | 79 |
| 2 | `INT>=8` | A public-facing assignment forces you to become much better at readin… | 61 | 20.5 | — | clean | 3.00 | 1.6% | 3.3% | 61 |
| 3 | `TRUE` | A subsidized Presentation Access Program offers wardrobe, coaching, a… | 15 | 19.7 | +12 | predatory | 4.00 | 0.0% | 6.7% | 15 |

**`EVT-INS-COR-2001`** INS/COR — run incidence 3.9% (194 runs, 194 occurrences), mean age 31.7

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | Your employer gives you an unusually generous retention award and ask… | 194 | 31.7 | +5 | costly | n/a | 8.2% | 25.3% | 194 |

**`EVT-INS-COR-2002`** INS/COR — run incidence 3.6% (179 runs, 179 occurrences), mean age 35.4

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024] | MNY>=10` | The old retention contract finally reaches its durable-likeness claus… | 175 | 35.4 | — | clean | n/a | 13.7% | 27.4% | 175 |
| 2 | `FIX>=32 & MAT!=NONE` | The company exercises the preservation clause attached to your old re… | 1 | 33.0 | — | clean | n/a | 100.0% | 0.0% | 1 |
| 3 | `FIX>=32 & MAT=NONE` | The company exercises the preservation clause attached to your old re… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 4 | `TRUE` | The durable-likeness clause expires without becoming useful. Payroll … | 3 | 35.7 | — | clean | n/a | 0.0% | 33.3% | 3 |

**`EVT-INS-EDU-2001`** INS/EDU — run incidence 0.5% (27 runs, 27 occurrences), mean age 21.9, gated on `INT<=4`

Gating-stat band entering the year it fired — critical 2, vulnerable 25, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPR>=7` | You complete an intensive adult-certification course by giving up mos… | 27 | 21.9 | — | clean | 4.00 | 7.4% | 3.7% | 27 |
| 2 | `MNY>=7` | You pay for a private retraining program whose advertising is annoyin… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | A workforce agency places you in a fully subsidized “guided competenc… | 0 | n/a | +10 | — | n/a | n/a | n/a | 0 |

**`EVT-INS-FIN-2001`** INS/FIN — run incidence 9.9% (494 runs, 494 occurrences), mean age 20.1, gated on `MNY<=2`

Gating-stat band entering the year it fired — critical 494, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `INT>=10` | A hiring test you nearly ignored turns into a well-paid offer. For on… | 201 | 20.5 | +2 | clean | 4.00 | 0.0% | 1.0% | 201 |
| 2 | `TLT[T1009] | TLT[T1013]` | You negotiate a debt-restructuring plan that is merely unpleasant ins… | 38 | 19.7 | +4 | costly | 3.00 | 0.0% | 0.0% | 38 |
| 3 | `TRUE` | A lender offers Mobility-Backed Restructuring: your monthly position … | 255 | 19.8 | +14 | predatory | 5.00 | 3.5% | 9.0% | 255 |

**`EVT-INS-FIN-2002`** INS/FIN — run incidence 5.0% (250 runs, 250 occurrences), mean age 22.7

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=6` | Your restructuring account reaches the boring part where ordinary mon… | 189 | 22.8 | +2 | clean | n/a | 3.2% | 20.6% | 189 |
| 2 | `MAT!=NONE` | Your lender updates the collateral schedule to your committed materia… | 1 | 36.0 | +5 | costly | n/a | 100.0% | 0.0% | 1 |
| 3 | `TRUE` | Your lender extends the restructuring period because your future form… | 60 | 22.4 | +8 | unclassified | n/a | 13.3% | 31.7% | 60 |

**`EVT-INS-LEG-2001`** INS/LEG — run incidence 0.2% (8 runs, 8 occurrences), mean age 23.0, gated on `INT<=4`

Gating-stat band entering the year it fired — critical 0, vulnerable 8, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024]` | A provider offers you a “plain-language” continuity agreement. You no… | 3 | 24.0 | — | clean | 1.00 | 0.0% | 0.0% | 3 |
| 2 | `INT<=2 & MNY<=3` | A provider offers a one-page continuity agreement designed for “low-c… | 0 | n/a | +14 | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | A provider simplifies your continuity paperwork by deciding which sec… | 5 | 22.4 | +8 | unclassified | n/a | 0.0% | 0.0% | 5 |

**`EVT-INS-MED-2001`** INS/MED — run incidence 5.6% (278 runs, 278 occurrences), mean age 43.8, gated on `STR<=1`

Gating-stat band entering the year it fired — critical 278, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | Your basic insurer opens a Functional Continuity Review after your he… | 278 | 43.8 | — | clean | n/a | 9.0% | 8.3% | 278 |

**`EVT-INS-MED-2002`** INS/MED — run incidence 5.5% (276 runs, 276 occurrences), mean age 45.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `STR>=3` | Your Functional Continuity Review closes after your mobility measurem… | 11 | 21.8 | — | clean | n/a | 0.0% | 0.0% | 11 |
| 2 | `MNY>=8 | INT>=11 | TLT[T1015]` | You obtain a mobility-preserving treatment outside the basic benefit … | 205 | 49.5 | +6 | costly | n/a | 3.4% | 2.9% | 205 |
| 3 | `STR<=-3` | The insurer expedites your review. Continued mobility is now classifi… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 4 | `TRUE` | The insurer approves a covered stabilization course. Your strength im… | 60 | 38.0 | +12 | predatory | n/a | 33.3% | 33.3% | 60 |

**`EVT-INS-MED-2003`** INS/MED — run incidence 1.2% (58 runs, 58 occurrences), mean age 39.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `STR>=3` | The covered stabilization course improves your mobility enough that p… | 40 | 37.0 | +2 | clean | n/a | 0.0% | 12.5% | 40 |
| 2 | `TLT[T1015] | MNY>=9` | A last independent review finds a mobility-preserving alternative. It… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 3 | `MAT!=NONE` | Your Basic Continuity benefit is approved in full. The insurer perman… | 2 | 58.5 | — | clean | n/a | 100.0% | 0.0% | 2 |
| 4 | `TRUE` | Your Basic Continuity benefit is approved in full. The approval does … | 16 | 44.3 | +6 | costly | n/a | 100.0% | 100.0% | 16 |

**`EVT-INS-MED-2004`** INS/MED — run incidence 0.7% (33 runs, 33 occurrences), mean age 30.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPR>=5 & FIX<28` | Your Continuity Leave file closes after the insurer concludes that or… | 8 | 30.1 | — | clean | n/a | 0.0% | 25.0% | 8 |
| 2 | `TLT[T1010]` | You refuse the insurer’s long-term stabilization addendum and keep th… | 2 | 22.5 | +2 | clean | n/a | 0.0% | 0.0% | 2 |
| 3 | `TRUE` | The insurer converts your temporary leave into a preservation-plannin… | 23 | 30.6 | +6 | costly | n/a | 87.0% | 65.2% | 23 |

**`EVT-ORD-FIN-2003`** ORD/FIN — run incidence 12.9% (644 runs, 644 occurrences), mean age 23.2, gated on `MNY<=2`

Gating-stat band entering the year it fired — critical 644, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | You buy one municipal lottery ticket because a clerk gives you the wr… | 644 | 23.2 | — | clean | 4.00 | 2.0% | 4.5% | 644 |

**`EVT-ORD-GEN-2001`** ORD/GEN — run incidence 49.0% (2449 runs, 2449 occurrences), mean age 51.4, gated on `INT>=8`

Gating-stat band entering the year it fired — critical 0, vulnerable 0, ordinary+ 2449.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `INT>=15` | A professional system you know inside out is replaced by one designed… | 1523 | 51.2 | — | clean | -2.00 | 3.0% | 0.1% | 1523 |
| 2 | `TRUE` | Several procedures you once knew by memory are replaced by new ones. … | 926 | 51.9 | — | clean | -1.00 | 4.0% | 0.3% | 926 |

**`EVT-ORD-HEA-2001`** ORD/HEA — run incidence 13.2% (658 runs, 658 occurrences), mean age 27.8, gated on `SPR<=2`

Gating-stat band entering the year it fired — critical 658, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `CHR>=8` | Friends organize your schedule for a while with the terrifying effici… | 292 | 30.9 | — | clean | 4.00 | 8.9% | 19.2% | 292 |
| 2 | `MNY>=7` | You take a real break before exhaustion becomes your permanent person… | 331 | 25.0 | +1 | clean | 4.00 | 5.1% | 7.9% | 331 |
| 3 | `TRUE` | Your basic insurer approves Continuity Leave: income support, mandato… | 35 | 27.2 | +12 | predatory | 4.00 | 48.6% | 37.1% | 35 |

**`EVT-ORD-HOU-2001`** ORD/HOU — run incidence 14.2% (709 runs, 709 occurrences), mean age 32.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | Your employer offers subsidized accommodation near the office. The re… | 51 | 33.0 | — | clean | n/a | 2.0% | 7.8% | 51 |
| 2 | `TRUE` | Your employer offers staff accommodation near the office. The lease i… | 658 | 32.9 | — | clean | n/a | 7.4% | 9.3% | 658 |

**`EVT-ORD-HOU-2002`** ORD/HOU — run incidence 58.9% (2943 runs, 2943 occurrences), mean age 32.3

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | You rent a cheaper room in a shared flat. One roommate is a woman inc… | 604 | 30.8 | — | clean | n/a | 2.6% | 4.3% | 604 |
| 2 | `TRUE` | A new flatmate explains that the woman built into the living-room wal… | 2339 | 32.7 | — | clean | n/a | 6.3% | 8.4% | 2339 |

**`EVT-ORD-HOU-2003`** ORD/HOU — run incidence 41.7% (2086 runs, 2086 occurrences), mean age 31.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPECIES=WINGED_KIN` | Your building installs wing-clearance markers after three complaints … | 361 | 31.2 | — | clean | n/a | 8.0% | 8.6% | 361 |
| 2 | `SPECIES=DWARF` | Your building lowers several control panels and raises the rent for “… | 374 | 30.8 | — | clean | n/a | 5.6% | 9.1% | 374 |
| 3 | `SPECIES=DRAGONKIN` | The landlord adds a thermal-load clause to the lease after learning w… | 327 | 31.1 | — | clean | n/a | 8.3% | 10.1% | 327 |
| 4 | `SPECIES=DEMONKIN` | The building finally permits horn-safe doorframes in renovated units.… | 348 | 30.6 | — | clean | n/a | 8.9% | 10.1% | 348 |
| 5 | `SPECIES=ELF` | The landlord advertises a renovated unit as “Elf-compatible” because … | 345 | 32.3 | — | clean | n/a | 7.5% | 9.3% | 345 |
| 6 | `TRUE` | Your building completes an accessibility retrofit. The notice congrat… | 331 | 31.1 | — | clean | n/a | 6.6% | 7.9% | 331 |

**`EVT-ORD-HOU-2004`** ORD/HOU — run incidence 32.1% (1603 runs, 1603 occurrences), mean age 28.1

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | A manifestation damages part of your rental unit. Basic housing insur… | 263 | 25.0 | +4 | costly | n/a | 2.7% | 14.4% | 263 |
| 2 | `TRUE` | A manifestation damages part of your rental unit. The landlord accept… | 1340 | 28.7 | — | clean | n/a | 4.5% | 16.9% | 1340 |

**`EVT-ORD-HOU-2005`** ORD/HOU — run incidence 57.7% (2883 runs, 2883 occurrences), mean age 40.6

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | You qualify for a subsidized insurance-compliant unit with reinforced… | 487 | 43.3 | +6 | costly | n/a | 22.6% | 17.7% | 487 |
| 2 | `TRUE` | You move into a unit certified for residents with material-risk histo… | 2396 | 40.0 | — | clean | n/a | 7.6% | 10.9% | 2396 |

**`EVT-SPC-SECR-2001`** SPC/SECR — run incidence 1.9% (97 runs, 97 occurrences), mean age 23.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024] | (INT>=10 & SPR>=7)` | The same DMMS case number appears on a new envelope. This time you an… | 2 | 21.5 | — | clean | n/a | 0.0% | 0.0% | 2 |
| 2 | `MNY<=2 | TLT[T1030]` | The Department renews your case supervision and waives a filing fee b… | 14 | 22.8 | +4 | costly | n/a | 42.9% | 42.9% | 14 |
| 3 | `TRUE` | A different DMMS officer reviews the same file and asks for documents… | 81 | 23.1 | — | clean | n/a | 1.2% | 2.5% | 81 |

**`EVT-SPC-SECR-2002`** SPC/SECR — run incidence 2.3% (117 runs, 117 occurrences), mean age 24.4

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] | (SPR>=10 & INT>=7)` | The Meridian representative who photographed you during the first con… | 2 | 24.5 | — | clean | n/a | 0.0% | 50.0% | 2 |
| 2 | `CHR>=8 & MNY<=3` | Meridian offers a sponsored presentation package: better clothes, bet… | 9 | 24.9 | +10 | predatory | n/a | 22.2% | 33.3% | 9 |
| 3 | `TRUE` | Meridian updates the photographs from your original consultation and … | 106 | 24.4 | +3 | costly | n/a | 52.8% | 52.8% | 106 |

**`EVT-SPC-SECR-2003`** SPC/SECR — run incidence 6.3% (316 runs, 316 occurrences), mean age 25.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] & INT>=7` | CRI sends the third consent revision since your enrollment. You use i… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `STR<=3` | CRI offers to correct the weakness its study keeps measuring. The int… | 50 | 24.9 | +10 | predatory | n/a | 56.0% | 56.0% | 50 |
| 3 | `INT>=8` | Your CRI coordinator asks you to help interpret your own longitudinal… | 255 | 26.0 | +4 | costly | n/a | 41.6% | 41.2% | 255 |
| 4 | `TRUE` | CRI repeats a test you remember taking years ago. The equipment has c… | 11 | 26.0 | +3 | costly | n/a | 27.3% | 27.3% | 11 |

**`EVT-SPC-SECR-2004`** SPC/SECR — run incidence 4.0% (200 runs, 200 occurrences), mean age 27.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=8 | TLT[T1013]` | Everlasting reviews the starter policy you stopped thinking about. Yo… | 24 | 26.9 | — | clean | n/a | 0.0% | 8.3% | 24 |
| 2 | `MNY<=2` | Everlasting grants temporary premium relief. Your monthly finances im… | 42 | 26.7 | +10 | predatory | n/a | 16.7% | 28.6% | 42 |
| 3 | `TRUE` | Everlasting updates your policy illustration using the same projectio… | 134 | 27.1 | +4 | costly | n/a | 1.5% | 14.2% | 134 |

**`EVT-SPC-SECR-2005`** SPC/SECR — run incidence 3.2% (158 runs, 158 occurrences), mean age 26.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | MNY>=7` | Black Ledger sends a servicing notice on the same account it once cal… | 19 | 27.0 | — | clean | n/a | 0.0% | 5.3% | 19 |
| 2 | `MNY<=1` | Black Ledger offers a payment holiday if you sign an updated collater… | 4 | 26.8 | +12 | predatory | n/a | 0.0% | 0.0% | 4 |
| 3 | `TRUE` | Black Ledger restructures the account again. The new payment is easie… | 135 | 26.0 | +6 | costly | n/a | 0.0% | 14.8% | 135 |

**`EVT-SPC-SECR-2006`** SPC/SECR — run incidence 3.6% (178 runs, 178 occurrences), mean age 24.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] | (INT>=10 & SPR>=8)` | The woman who first invited you to the Order asks whether you still i… | 4 | 23.3 | — | clean | n/a | 0.0% | 0.0% | 4 |
| 2 | `SPR<=3` | The Order gives you a room, meals, and several weeks in which nobody … | 47 | 23.7 | +10 | predatory | n/a | 59.6% | 59.6% | 47 |
| 3 | `CHR>=8` | The Order asks you to represent the community at a public ceremony. T… | 69 | 24.2 | +4 | costly | n/a | 42.0% | 42.0% | 69 |
| 4 | `TRUE` | You return to the same quiet hall from the first meeting. Someone rem… | 58 | 24.2 | +5 | costly | n/a | 0.0% | 6.9% | 58 |

### CURRENT_AUTHORED + Batch 008

| Rescue band | Occurrences |
|---|---|
| clean | 8741 |
| costly | 1181 |
| unclassified | 82 |
| predatory | 376 |

**`EVT-INS-ARC-2001`** INS/ARC — run incidence 5.1% (128 runs, 128 occurrences), mean age 31.3, gated on `MNY<=3`

Gating-stat band entering the year it fired — critical 76, vulnerable 52, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | A municipal housing program offers you a large rent subsidy in exchan… | 128 | 31.3 | +12 | predatory | 4.00 | 34.4% | 53.9% | 128 |

**`EVT-INS-ARC-2002`** INS/ARC — run incidence 4.8% (121 runs, 121 occurrences), mean age 33.1

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1024] | TLT[T1013] | MNY>=7` | You exit the structural-continuity pilot before the installation clau… | 60 | 32.7 | — | clean | n/a | 11.7% | 35.0% | 60 |
| 2 | `MAT=STON | MAT=METL` | The housing authority approves your committed material for structural… | 2 | 35.0 | +4 | costly | n/a | 100.0% | 0.0% | 2 |
| 3 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL]` | The pilot permanently stabilizes the stone manifestation it was desig… | 13 | 30.8 | +8 | unclassified | n/a | 61.5% | 100.0% | 13 |
| 4 | `MAT=NONE & FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_STON]` | The pilot permanently stabilizes your metallic manifestation into a s… | 20 | 31.9 | +8 | unclassified | n/a | 75.0% | 100.0% | 20 |
| 5 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & FLAG[MAT_MANIFEST_METL] & SPECIES=DWARF` | The pilot resolves your mixed manifestation history in favor of stone… | 4 | 36.0 | +8 | unclassified | n/a | 100.0% | 100.0% | 4 |
| 6 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & FLAG[MAT_MANIFEST_METL] & SPECIES=DRAGONKIN` | The pilot resolves your mixed manifestation history in favor of metal… | 5 | 34.0 | +8 | unclassified | n/a | 100.0% | 100.0% | 5 |
| 7 | `TRUE` | The pilot cannot settle on a legally usable structural material. The … | 17 | 36.4 | +5 | costly | n/a | 23.5% | 23.5% | 17 |

**`EVT-INS-ARC-2003`** INS/ARC — run incidence 1.4% (35 runs, 35 occurrences), mean age 35.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1024] | TLT[T1013]` | The housing project incorporates your Permanent Form into the buildin… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `TRUE` | Your subsidized tenancy converts into permanent structural occupancy.… | 35 | 35.8 | — | clean | n/a | 100.0% | 0.0% | 35 |

**`EVT-INS-CIV-2001`** INS/CIV — run incidence 3.2% (81 runs, 81 occurrences), mean age 20.0, gated on `CHR<=3`

Gating-stat band entering the year it fired — critical 26, vulnerable 55, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=7` | You pay for a professional presentation course after being described … | 41 | 19.7 | — | clean | 4.00 | 2.4% | 2.4% | 41 |
| 2 | `INT>=8` | A public-facing assignment forces you to become much better at readin… | 34 | 20.2 | — | clean | 3.00 | 2.9% | 2.9% | 34 |
| 3 | `TRUE` | A subsidized Presentation Access Program offers wardrobe, coaching, a… | 6 | 20.8 | +12 | predatory | 4.00 | 0.0% | 0.0% | 6 |

**`EVT-INS-COR-2001`** INS/COR — run incidence 4.5% (113 runs, 113 occurrences), mean age 32.3

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | Your employer gives you an unusually generous retention award and ask… | 113 | 32.3 | +5 | costly | n/a | 3.5% | 15.9% | 113 |

**`EVT-INS-COR-2002`** INS/COR — run incidence 4.4% (111 runs, 111 occurrences), mean age 36.4

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024] | MNY>=10` | The old retention contract finally reaches its durable-likeness claus… | 108 | 36.2 | — | clean | n/a | 2.8% | 16.7% | 108 |
| 2 | `FIX>=32 & MAT!=NONE` | The company exercises the preservation clause attached to your old re… | 1 | 37.0 | — | clean | n/a | 100.0% | 0.0% | 1 |
| 3 | `FIX>=32 & MAT=NONE` | The company exercises the preservation clause attached to your old re… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 4 | `TRUE` | The durable-likeness clause expires without becoming useful. Payroll … | 2 | 43.0 | — | clean | n/a | 0.0% | 0.0% | 2 |

**`EVT-INS-EDU-2001`** INS/EDU — run incidence 0.4% (9 runs, 9 occurrences), mean age 21.2, gated on `INT<=4`

Gating-stat band entering the year it fired — critical 0, vulnerable 9, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPR>=7` | You complete an intensive adult-certification course by giving up mos… | 9 | 21.2 | — | clean | 4.00 | 0.0% | 0.0% | 9 |
| 2 | `MNY>=7` | You pay for a private retraining program whose advertising is annoyin… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | A workforce agency places you in a fully subsidized “guided competenc… | 0 | n/a | +10 | — | n/a | n/a | n/a | 0 |

**`EVT-INS-FIN-2001`** INS/FIN — run incidence 10.0% (249 runs, 249 occurrences), mean age 20.3, gated on `MNY<=2`

Gating-stat band entering the year it fired — critical 249, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `INT>=10` | A hiring test you nearly ignored turns into a well-paid offer. For on… | 101 | 20.5 | +2 | clean | 4.00 | 0.0% | 1.0% | 101 |
| 2 | `TLT[T1009] | TLT[T1013]` | You negotiate a debt-restructuring plan that is merely unpleasant ins… | 23 | 20.1 | +4 | costly | 3.00 | 0.0% | 0.0% | 23 |
| 3 | `TRUE` | A lender offers Mobility-Backed Restructuring: your monthly position … | 125 | 20.2 | +14 | predatory | 5.00 | 0.8% | 3.2% | 125 |

**`EVT-INS-FIN-2002`** INS/FIN — run incidence 5.0% (124 runs, 124 occurrences), mean age 23.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=6` | Your restructuring account reaches the boring part where ordinary mon… | 92 | 23.1 | +2 | clean | n/a | 2.2% | 15.2% | 92 |
| 2 | `MAT!=NONE` | Your lender updates the collateral schedule to your committed materia… | 0 | n/a | +5 | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | Your lender extends the restructuring period because your future form… | 32 | 23.3 | +8 | unclassified | n/a | 6.3% | 28.1% | 32 |

**`EVT-INS-LEG-2001`** INS/LEG — run incidence 0.4% (9 runs, 9 occurrences), mean age 25.2, gated on `INT<=4`

Gating-stat band entering the year it fired — critical 0, vulnerable 9, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024]` | A provider offers you a “plain-language” continuity agreement. You no… | 1 | 31.0 | — | clean | 1.00 | 0.0% | 0.0% | 1 |
| 2 | `INT<=2 & MNY<=3` | A provider offers a one-page continuity agreement designed for “low-c… | 0 | n/a | +14 | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | A provider simplifies your continuity paperwork by deciding which sec… | 8 | 24.5 | +8 | unclassified | n/a | 0.0% | 25.0% | 8 |

**`EVT-INS-MED-2001`** INS/MED — run incidence 6.2% (156 runs, 156 occurrences), mean age 43.3, gated on `STR<=1`

Gating-stat band entering the year it fired — critical 156, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | Your basic insurer opens a Functional Continuity Review after your he… | 156 | 43.3 | — | clean | n/a | 5.1% | 3.8% | 156 |

**`EVT-INS-MED-2002`** INS/MED — run incidence 6.2% (155 runs, 155 occurrences), mean age 45.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `STR>=3` | Your Functional Continuity Review closes after your mobility measurem… | 9 | 20.6 | — | clean | n/a | 0.0% | 0.0% | 9 |
| 2 | `MNY>=8 | INT>=11 | TLT[T1015]` | You obtain a mobility-preserving treatment outside the basic benefit … | 117 | 48.5 | +6 | costly | n/a | 1.7% | 1.7% | 117 |
| 3 | `STR<=-3` | The insurer expedites your review. Continued mobility is now classifi… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 4 | `TRUE` | The insurer approves a covered stabilization course. Your strength im… | 29 | 39.3 | +12 | predatory | n/a | 24.1% | 20.7% | 29 |

**`EVT-INS-MED-2003`** INS/MED — run incidence 1.1% (28 runs, 28 occurrences), mean age 41.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `STR>=3` | The covered stabilization course improves your mobility enough that p… | 22 | 40.6 | +2 | clean | n/a | 0.0% | 9.1% | 22 |
| 2 | `TLT[T1015] | MNY>=9` | A last independent review finds a mobility-preserving alternative. It… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 3 | `MAT!=NONE` | Your Basic Continuity benefit is approved in full. The insurer perman… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 4 | `TRUE` | Your Basic Continuity benefit is approved in full. The approval does … | 6 | 43.2 | +6 | costly | n/a | 100.0% | 100.0% | 6 |

**`EVT-INS-MED-2004`** INS/MED — run incidence 0.5% (13 runs, 13 occurrences), mean age 27.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPR>=5 & FIX<28` | Your Continuity Leave file closes after the insurer concludes that or… | 6 | 24.7 | — | clean | n/a | 0.0% | 0.0% | 6 |
| 2 | `TLT[T1010]` | You refuse the insurer’s long-term stabilization addendum and keep th… | 0 | n/a | +2 | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | The insurer converts your temporary leave into a preservation-plannin… | 7 | 30.6 | +6 | costly | n/a | 28.6% | 42.9% | 7 |

**`EVT-ORD-FIN-2003`** ORD/FIN — run incidence 13.0% (324 runs, 324 occurrences), mean age 23.4, gated on `MNY<=2`

Gating-stat band entering the year it fired — critical 324, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | You buy one municipal lottery ticket because a clerk gives you the wr… | 324 | 23.4 | — | clean | 4.00 | 0.0% | 2.2% | 324 |

**`EVT-ORD-GEN-2001`** ORD/GEN — run incidence 75.9% (1897 runs, 1897 occurrences), mean age 51.8, gated on `INT>=8`

Gating-stat band entering the year it fired — critical 0, vulnerable 0, ordinary+ 1897.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `INT>=15` | A professional system you know inside out is replaced by one designed… | 1129 | 51.5 | — | clean | -2.00 | 0.8% | 0.0% | 1129 |
| 2 | `TRUE` | Several procedures you once knew by memory are replaced by new ones. … | 768 | 52.3 | — | clean | -1.00 | 2.0% | 0.0% | 768 |

**`EVT-ORD-HEA-2001`** ORD/HEA — run incidence 15.2% (379 runs, 379 occurrences), mean age 28.2, gated on `SPR<=2`

Gating-stat band entering the year it fired — critical 379, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `CHR>=8` | Friends organize your schedule for a while with the terrifying effici… | 178 | 31.3 | — | clean | 4.00 | 5.6% | 12.4% | 178 |
| 2 | `MNY>=7` | You take a real break before exhaustion becomes your permanent person… | 187 | 25.5 | +1 | clean | 4.00 | 1.1% | 4.3% | 187 |
| 3 | `TRUE` | Your basic insurer approves Continuity Leave: income support, mandato… | 14 | 25.8 | +12 | predatory | 4.00 | 21.4% | 7.1% | 14 |

**`EVT-ORD-HOU-2001`** ORD/HOU — run incidence 13.8% (346 runs, 346 occurrences), mean age 33.6

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | Your employer offers subsidized accommodation near the office. The re… | 26 | 35.4 | — | clean | n/a | 3.8% | 3.8% | 26 |
| 2 | `TRUE` | Your employer offers staff accommodation near the office. The lease i… | 320 | 33.5 | — | clean | n/a | 2.2% | 5.0% | 320 |

**`EVT-ORD-HOU-2002`** ORD/HOU — run incidence 68.4% (1709 runs, 1709 occurrences), mean age 34.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | You rent a cheaper room in a shared flat. One roommate is a woman inc… | 352 | 33.2 | — | clean | n/a | 2.0% | 2.0% | 352 |
| 2 | `TRUE` | A new flatmate explains that the woman built into the living-room wal… | 1357 | 34.2 | — | clean | n/a | 2.6% | 4.6% | 1357 |

**`EVT-ORD-HOU-2003`** ORD/HOU — run incidence 46.5% (1163 runs, 1163 occurrences), mean age 32.1

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPECIES=WINGED_KIN` | Your building installs wing-clearance markers after three complaints … | 205 | 32.9 | — | clean | n/a | 3.4% | 4.9% | 205 |
| 2 | `SPECIES=DWARF` | Your building lowers several control panels and raises the rent for “… | 193 | 31.5 | — | clean | n/a | 1.6% | 11.9% | 193 |
| 3 | `SPECIES=DRAGONKIN` | The landlord adds a thermal-load clause to the lease after learning w… | 189 | 30.9 | — | clean | n/a | 1.1% | 4.8% | 189 |
| 4 | `SPECIES=DEMONKIN` | The building finally permits horn-safe doorframes in renovated units.… | 190 | 32.1 | — | clean | n/a | 1.6% | 4.2% | 190 |
| 5 | `SPECIES=ELF` | The landlord advertises a renovated unit as “Elf-compatible” because … | 200 | 32.5 | — | clean | n/a | 2.0% | 5.0% | 200 |
| 6 | `TRUE` | Your building completes an accessibility retrofit. The notice congrat… | 186 | 32.7 | — | clean | n/a | 1.6% | 7.0% | 186 |

**`EVT-ORD-HOU-2004`** ORD/HOU — run incidence 32.0% (799 runs, 799 occurrences), mean age 28.5

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | A manifestation damages part of your rental unit. Basic housing insur… | 112 | 24.7 | +4 | costly | n/a | 3.6% | 9.8% | 112 |
| 2 | `TRUE` | A manifestation damages part of your rental unit. The landlord accept… | 687 | 29.1 | — | clean | n/a | 2.0% | 11.6% | 687 |

**`EVT-ORD-HOU-2005`** ORD/HOU — run incidence 74.8% (1871 runs, 1871 occurrences), mean age 41.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | You qualify for a subsidized insurance-compliant unit with reinforced… | 376 | 44.8 | +6 | costly | n/a | 7.2% | 8.8% | 376 |
| 2 | `TRUE` | You move into a unit certified for residents with material-risk histo… | 1495 | 41.0 | — | clean | n/a | 1.5% | 5.1% | 1495 |

**`EVT-SPC-SECR-2001`** SPC/SECR — run incidence 2.0% (49 runs, 49 occurrences), mean age 23.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024] | (INT>=10 & SPR>=7)` | The same DMMS case number appears on a new envelope. This time you an… | 2 | 23.0 | — | clean | n/a | 0.0% | 0.0% | 2 |
| 2 | `MNY<=2 | TLT[T1030]` | The Department renews your case supervision and waives a filing fee b… | 11 | 23.5 | +4 | costly | n/a | 36.4% | 36.4% | 11 |
| 3 | `TRUE` | A different DMMS officer reviews the same file and asks for documents… | 36 | 23.1 | — | clean | n/a | 0.0% | 0.0% | 36 |

**`EVT-SPC-SECR-2002`** SPC/SECR — run incidence 2.4% (60 runs, 60 occurrences), mean age 23.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] | (SPR>=10 & INT>=7)` | The Meridian representative who photographed you during the first con… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `CHR>=8 & MNY<=3` | Meridian offers a sponsored presentation package: better clothes, bet… | 3 | 23.7 | +10 | predatory | n/a | 0.0% | 0.0% | 3 |
| 3 | `TRUE` | Meridian updates the photographs from your original consultation and … | 57 | 24.0 | +3 | costly | n/a | 56.1% | 56.1% | 57 |

**`EVT-SPC-SECR-2003`** SPC/SECR — run incidence 5.9% (148 runs, 148 occurrences), mean age 25.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] & INT>=7` | CRI sends the third consent revision since your enrollment. You use i… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `STR<=3` | CRI offers to correct the weakness its study keeps measuring. The int… | 15 | 26.4 | +10 | predatory | n/a | 60.0% | 60.0% | 15 |
| 3 | `INT>=8` | Your CRI coordinator asks you to help interpret your own longitudinal… | 129 | 25.7 | +4 | costly | n/a | 38.0% | 36.4% | 129 |
| 4 | `TRUE` | CRI repeats a test you remember taking years ago. The equipment has c… | 4 | 26.3 | +3 | costly | n/a | 75.0% | 75.0% | 4 |

**`EVT-SPC-SECR-2004`** SPC/SECR — run incidence 4.5% (112 runs, 112 occurrences), mean age 26.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=8 | TLT[T1013]` | Everlasting reviews the starter policy you stopped thinking about. Yo… | 16 | 27.6 | — | clean | n/a | 0.0% | 0.0% | 16 |
| 2 | `MNY<=2` | Everlasting grants temporary premium relief. Your monthly finances im… | 32 | 27.4 | +10 | predatory | n/a | 12.5% | 18.8% | 32 |
| 3 | `TRUE` | Everlasting updates your policy illustration using the same projectio… | 64 | 26.6 | +4 | costly | n/a | 0.0% | 4.7% | 64 |

**`EVT-SPC-SECR-2005`** SPC/SECR — run incidence 3.6% (90 runs, 90 occurrences), mean age 26.5

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | MNY>=7` | Black Ledger sends a servicing notice on the same account it once cal… | 16 | 27.0 | — | clean | n/a | 0.0% | 0.0% | 16 |
| 2 | `MNY<=1` | Black Ledger offers a payment holiday if you sign an updated collater… | 3 | 26.3 | +12 | predatory | n/a | 33.3% | 33.3% | 3 |
| 3 | `TRUE` | Black Ledger restructures the account again. The new payment is easie… | 71 | 26.4 | +6 | costly | n/a | 0.0% | 2.8% | 71 |

**`EVT-SPC-SECR-2006`** SPC/SECR — run incidence 4.0% (101 runs, 101 occurrences), mean age 23.6

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] | (INT>=10 & SPR>=8)` | The woman who first invited you to the Order asks whether you still i… | 8 | 24.1 | — | clean | n/a | 0.0% | 0.0% | 8 |
| 2 | `SPR<=3` | The Order gives you a room, meals, and several weeks in which nobody … | 21 | 24.0 | +10 | predatory | n/a | 33.3% | 33.3% | 21 |
| 3 | `CHR>=8` | The Order asks you to represent the community at a public ceremony. T… | 37 | 24.1 | +4 | costly | n/a | 32.4% | 35.1% | 37 |
| 4 | `TRUE` | You return to the same quiet hall from the first meeting. Someone rem… | 35 | 22.7 | +5 | costly | n/a | 5.7% | 5.7% | 35 |

## 4. Basic Continuity Insurance (STR) chain

### LOW + Batch 008

| Field | Value |
|---|---|
| Functional Continuity Review opened | 278 (5.6%) |
| Mean review age | 43.8 |
| Two-year decision reached | 276 |
| Final outcome event reached | 58 |
| `END-MED-003 Benefit Approved` | 18 (0.4% of runs, 0.6% of completions) |
| Mean / median benefit age | 45.9 / 53 |
| Synthetic share of benefit endings | 88.9% |
| Adult runs ever at STR ≤ −3 | 1384 |
| …of which saw a review | 166 (12.0%) |
| Long survivors at STR ≤ −3 with no review | 1218 |

**Two-year decision split**

| Branch | Runs | Share |
|---|---|---|
| recovered (STR>=3) | 11 | 4.0% |
| independent treatment | 205 | 74.3% |
| expedited (STR<=-3) | 0 | 0.0% |
| covered stabilization | 60 | 21.7% |

**Final outcome split**

| Branch | Runs | Share |
|---|---|---|
| recovered | 40 | 69.0% |
| independent alternative | 0 | 0.0% |
| benefit approved (existing MAT) | 2 | 3.4% |
| benefit approved (SYNT) | 16 | 27.6% |

**Material at the Benefit Approved ending**

| Material | Runs |
|---|---|
| SYNT | 16 |
| CERA | 1 |
| CRYS | 1 |

### CURRENT_AUTHORED + Batch 008

| Field | Value |
|---|---|
| Functional Continuity Review opened | 156 (6.2%) |
| Mean review age | 43.3 |
| Two-year decision reached | 155 |
| Final outcome event reached | 28 |
| `END-MED-003 Benefit Approved` | 6 (0.2% of runs, 0.7% of completions) |
| Mean / median benefit age | 43.2 / 42 |
| Synthetic share of benefit endings | 100.0% |
| Adult runs ever at STR ≤ −3 | 1017 |
| …of which saw a review | 115 (11.3%) |
| Long survivors at STR ≤ −3 with no review | 902 |

**Two-year decision split**

| Branch | Runs | Share |
|---|---|---|
| recovered (STR>=3) | 9 | 5.8% |
| independent treatment | 117 | 75.5% |
| expedited (STR<=-3) | 0 | 0.0% |
| covered stabilization | 29 | 18.7% |

**Final outcome split**

| Branch | Runs | Share |
|---|---|---|
| recovered | 22 | 78.6% |
| independent alternative | 0 | 0.0% |
| benefit approved (existing MAT) | 0 | 0.0% |
| benefit approved (SYNT) | 6 | 21.4% |

**Material at the Benefit Approved ending**

| Material | Runs |
|---|---|
| SYNT | 6 |

## 5. Housing and relocation

Housing is attributed by the canonical `housing` route tag. **Relocation is not a canonical tag**: the registry has no `relocation` entry, so the diagnostic declares an explicit variant list (9 variants across 5 events) in `src/sim/h2bDiagnostic.ts`. That list is an analyst classification, not content — a canonical `relocation` metadata tag would replace it and is recommended for a later patch.

| Arm | Any housing | Housing events | Mean distinct housing IDs/run | Max distinct | Relocations | Relocation runs | Moves as share of housing | Runs with 2+ moves |
|---|---|---|---|---|---|---|---|---|
| **LOW + Batch 008** | 4968 (99.4%) | 21774 | 4.38 | 10 | 7363 | 3880 (77.6%) | 33.8% | 2459 |
| **CURRENT_AUTHORED + Batch 008** | 2491 (99.6%) | 11832 | 4.74 | 10 | 4314 | 2205 (88.2%) | 36.5% | 1468 |

**Aggregate authored deltas carried by housing-tagged events**

| Arm | CHR | INT | STR | MNY | SPR | FIX | Mean FIX per housing event |
|---|---|---|---|---|---|---|---|
| **LOW + Batch 008** | 348 | 0 | 0 | -7084 | 13551 | 7507 | 0.345 |
| **CURRENT_AUTHORED + Batch 008** | 190 | 0 | 0 | -3967 | 7627 | 4669 | 0.395 |

**Structural-housing route**

| Arm | Offer taken | Structural commitment | Pilot lapsed | Structural ending | Mean ending age | Endings |
|---|---|---|---|---|---|---|
| **LOW + Batch 008** | 488 (9.8%) | 353 | 126 | 65 (1.3%) | 34.3 | END-ARC-001×65 |
| **CURRENT_AUTHORED + Batch 008** | 246 (9.8%) | 170 | 77 | 35 (1.4%) | 35.8 | END-ARC-001×35 |

## 6. Faction exclusivity and chains

The single-active-faction rule is an invariant: **two simultaneously personally-active factions and a second contact opened before the previous relationship ended are both failures, not balance numbers.** Personalized touchpoints count `contact` / `personal` / `climax` events; news and lore are excluded.

| Arm | Max simultaneous active | Runs with any contact | Runs with 2+ factions contacted | Second contact after terminal exit |
|---|---|---|---|---|
| **LOW + Batch 008** | 1 | 1675 | 68 (1.4%) | 69 |
| **CURRENT_AUTHORED + Batch 008** | 1 | 878 | 50 (2.0%) | 50 |

### LOW + Batch 008 — chain shape

| Faction | Contact | ENGAGED | COMMITTED | OPTED_OUT | CLOSED | Endings | Touchpoints (mean) | Mean gap | Exit at first disposition | Climax after COMMITTED |
|---|---|---|---|---|---|---|---|---|---|---|
| DMMS | 237 (4.7%) | 1.9% | 0.1% | 0.0% | 4.6% | 7 | 2.85 | 2.20 | 59.1% | 100.0% |
| Everlasting Mutual | 317 (6.3%) | 4.0% | 0.1% | 4.7% | 1.4% | 5 | 3.22 | 2.54 | 36.9% | 100.0% |
| Meridian | 284 (5.7%) | 2.3% | 1.3% | 3.8% | 0.6% | 65 | 3.04 | 2.11 | 56.7% | 90.8% |
| CRI | 376 (7.5%) | 6.4% | 3.1% | 0.8% | 3.6% | 155 | 4.06 | 2.15 | 10.1% | 87.1% |
| Black Ledger | 178 (3.6%) | 3.2% | 0.0% | 2.8% | 0.7% | 0 | 3.74 | 1.91 | 11.2% | n/a |
| Last Posture | 352 (7.0%) | 3.6% | 1.2% | 5.1% | 0.8% | 61 | 3.18 | 2.16 | 48.3% | 93.4% |

**New intermediate touchpoints and escalation-schedule expiry**

| Intermediate event | Runs | Incidence |
|---|---|---|
| `EVT-SPC-SECR-2001` | 97 | 1.9% |
| `EVT-SPC-SECR-2002` | 117 | 2.3% |
| `EVT-SPC-SECR-2003` | 316 | 6.3% |
| `EVT-SPC-SECR-2004` | 200 | 4.0% |
| `EVT-SPC-SECR-2005` | 158 | 3.2% |
| `EVT-SPC-SECR-2006` | 178 | 3.6% |

_No escalation schedule expired._

### CURRENT_AUTHORED + Batch 008 — chain shape

| Faction | Contact | ENGAGED | COMMITTED | OPTED_OUT | CLOSED | Endings | Touchpoints (mean) | Mean gap | Exit at first disposition | Climax after COMMITTED |
|---|---|---|---|---|---|---|---|---|---|---|
| DMMS | 127 (5.1%) | 2.0% | 0.2% | 0.0% | 4.9% | 4 | 2.79 | 2.21 | 61.4% | 100.0% |
| Everlasting Mutual | 166 (6.6%) | 4.5% | 0.2% | 4.3% | 2.2% | 4 | 3.34 | 2.52 | 32.5% | 100.0% |
| Meridian | 171 (6.8%) | 2.4% | 1.5% | 4.5% | 0.8% | 38 | 2.91 | 2.07 | 61.4% | 84.2% |
| CRI | 175 (7.0%) | 5.9% | 2.5% | 1.0% | 3.5% | 62 | 4.09 | 2.13 | 14.9% | 98.4% |
| Black Ledger | 102 (4.1%) | 3.6% | 0.0% | 3.2% | 0.9% | 1 | 3.68 | 1.92 | 11.8% | 100.0% |
| Last Posture | 187 (7.5%) | 4.0% | 0.8% | 5.8% | 0.9% | 20 | 3.16 | 2.19 | 46.0% | 100.0% |

**New intermediate touchpoints and escalation-schedule expiry**

| Intermediate event | Runs | Incidence |
|---|---|---|
| `EVT-SPC-SECR-2001` | 49 | 2.0% |
| `EVT-SPC-SECR-2002` | 60 | 2.4% |
| `EVT-SPC-SECR-2003` | 148 | 5.9% |
| `EVT-SPC-SECR-2004` | 112 | 4.5% |
| `EVT-SPC-SECR-2005` | 90 | 3.6% |
| `EVT-SPC-SECR-2006` | 101 | 4.0% |

_No escalation schedule expired._

## 7. Age-stratified low-stat risk

Person-years classified by the stat entering that year and followed 5 years, split by adult life stage so old-age CHR/STR decline cannot invert the reading. Censored person-years are dropped rather than counted as "no event". **Correlation, not causation.**

### LOW + Batch 008

**Ages 18-24**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 884 | 884 | 2.5% | 884 | 3.7% |
| CHR | vulnerable | 6009 | 6009 | 1.3% | 6009 | 3.0% |
| CHR | ordinary_plus | 28042 | 28042 | 2.4% | 28033 | 5.0% |
| INT | critical | 12 | 12 | 0.0% | 12 | 0.0% |
| INT | vulnerable | 300 | 300 | 2.7% | 300 | 5.0% |
| INT | ordinary_plus | 34623 | 34623 | 2.2% | 34614 | 4.6% |
| STR | critical | 4972 | 4972 | 4.5% | 4970 | 5.6% |
| STR | vulnerable | 7446 | 7446 | 2.6% | 7445 | 4.7% |
| STR | ordinary_plus | 22517 | 22517 | 1.5% | 22511 | 4.4% |
| MNY | critical | 6039 | 6039 | 2.1% | 6038 | 4.5% |
| MNY | vulnerable | 7608 | 7608 | 1.1% | 7607 | 4.0% |
| MNY | ordinary_plus | 21288 | 21288 | 2.6% | 21281 | 4.9% |
| SPR | critical | 5329 | 5329 | 4.6% | 5328 | 6.7% |
| SPR | vulnerable | 2817 | 2817 | 2.7% | 2816 | 4.8% |
| SPR | ordinary_plus | 26789 | 26789 | 1.6% | 26782 | 4.2% |

**Ages 25-34**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 280 | 280 | 9.6% | 273 | 22.3% |
| CHR | vulnerable | 3026 | 3026 | 7.5% | 2905 | 21.2% |
| CHR | ordinary_plus | 44159 | 44159 | 9.2% | 41036 | 28.6% |
| INT | critical | 10 | 10 | 0.0% | 10 | 40.0% |
| INT | vulnerable | 269 | 269 | 11.2% | 245 | 36.3% |
| INT | ordinary_plus | 47186 | 47186 | 9.1% | 43959 | 28.0% |
| STR | critical | 2050 | 2050 | 8.5% | 1997 | 20.5% |
| STR | vulnerable | 6034 | 6034 | 7.8% | 5844 | 23.3% |
| STR | ordinary_plus | 39381 | 39381 | 9.3% | 36373 | 29.3% |
| MNY | critical | 3672 | 3672 | 10.9% | 3442 | 31.5% |
| MNY | vulnerable | 7220 | 7220 | 8.4% | 6719 | 27.9% |
| MNY | ordinary_plus | 36573 | 36573 | 9.0% | 34053 | 27.8% |
| SPR | critical | 6137 | 6137 | 14.8% | 5527 | 36.3% |
| SPR | vulnerable | 3399 | 3399 | 8.6% | 3218 | 27.9% |
| SPR | ordinary_plus | 37929 | 37929 | 8.2% | 35469 | 26.8% |

**Ages 35-49**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 172 | 172 | 15.7% | 134 | 11.2% |
| CHR | vulnerable | 2023 | 2023 | 15.0% | 1397 | 17.2% |
| CHR | ordinary_plus | 50953 | 50953 | 17.8% | 28315 | 25.8% |
| INT | critical | 12 | 12 | 0.0% | 2 | 100.0% |
| INT | vulnerable | 183 | 183 | 29.5% | 86 | 37.2% |
| INT | ordinary_plus | 52953 | 52953 | 17.7% | 29758 | 25.3% |
| STR | critical | 863 | 863 | 12.7% | 592 | 14.9% |
| STR | vulnerable | 3377 | 3377 | 12.2% | 2383 | 21.4% |
| STR | ordinary_plus | 48908 | 48908 | 18.2% | 26871 | 25.9% |
| MNY | critical | 5869 | 5869 | 17.1% | 3442 | 17.3% |
| MNY | vulnerable | 8147 | 8147 | 16.0% | 4677 | 21.4% |
| MNY | ordinary_plus | 39132 | 39132 | 18.2% | 21727 | 27.4% |
| SPR | critical | 4936 | 4936 | 26.2% | 2286 | 40.2% |
| SPR | vulnerable | 3112 | 3112 | 21.1% | 1691 | 33.8% |
| SPR | ordinary_plus | 45100 | 45100 | 16.6% | 25869 | 23.5% |

**Ages 50-64**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 370 | 370 | 1.6% | 309 | 0.0% |
| CHR | vulnerable | 2331 | 2331 | 1.7% | 1728 | 0.0% |
| CHR | ordinary_plus | 35069 | 35069 | 3.2% | 18873 | 0.2% |
| INT | vulnerable | 71 | 71 | 0.0% | 45 | 0.0% |
| INT | ordinary_plus | 37699 | 37699 | 3.1% | 20865 | 0.2% |
| STR | critical | 1925 | 1925 | 3.4% | 1362 | 2.5% |
| STR | vulnerable | 5107 | 5107 | 1.8% | 3528 | 0.1% |
| STR | ordinary_plus | 30738 | 30738 | 3.2% | 16020 | 0.0% |
| MNY | critical | 9928 | 9928 | 3.0% | 5879 | 0.3% |
| MNY | vulnerable | 8952 | 8952 | 3.0% | 5325 | 0.2% |
| MNY | ordinary_plus | 18890 | 18890 | 3.1% | 9706 | 0.1% |
| SPR | critical | 344 | 344 | 5.5% | 111 | 0.0% |
| SPR | vulnerable | 325 | 325 | 5.2% | 99 | 0.0% |
| SPR | ordinary_plus | 37101 | 37101 | 3.0% | 20700 | 0.2% |

**Ages 65+**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 42868 | 35948 | 0.0% | 25758 | 0.0% |
| CHR | vulnerable | 14456 | 13385 | 0.5% | 8610 | 0.0% |
| CHR | ordinary_plus | 68456 | 65302 | 1.3% | 36382 | 0.0% |
| INT | vulnerable | 168 | 153 | 0.0% | 153 | 0.0% |
| INT | ordinary_plus | 125612 | 114482 | 0.8% | 70597 | 0.0% |
| STR | critical | 64472 | 54976 | 0.1% | 36924 | 0.0% |
| STR | vulnerable | 16126 | 15185 | 0.9% | 9696 | 0.0% |
| STR | ordinary_plus | 45182 | 44474 | 1.7% | 24130 | 0.0% |
| MNY | critical | 38408 | 34993 | 0.7% | 22742 | 0.0% |
| MNY | vulnerable | 29085 | 26510 | 0.8% | 17628 | 0.0% |
| MNY | ordinary_plus | 58287 | 53132 | 1.0% | 30380 | 0.0% |
| SPR | critical | 10 | 10 | 0.0% | 3 | 0.0% |
| SPR | vulnerable | 21 | 21 | 0.0% | 5 | 0.0% |
| SPR | ordinary_plus | 125749 | 114604 | 0.8% | 70742 | 0.0% |

### CURRENT_AUTHORED + Batch 008

**Ages 18-24**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 389 | 389 | 0.3% | 389 | 0.5% |
| CHR | vulnerable | 2991 | 2991 | 0.5% | 2991 | 1.4% |
| CHR | ordinary_plus | 14107 | 14107 | 1.8% | 14107 | 2.7% |
| INT | vulnerable | 161 | 161 | 2.5% | 161 | 4.3% |
| INT | ordinary_plus | 17326 | 17326 | 1.5% | 17326 | 2.4% |
| STR | critical | 2426 | 2426 | 2.1% | 2426 | 2.3% |
| STR | vulnerable | 3634 | 3634 | 2.0% | 3634 | 2.3% |
| STR | ordinary_plus | 11427 | 11427 | 1.2% | 11427 | 2.5% |
| MNY | critical | 3030 | 3030 | 0.8% | 3030 | 1.9% |
| MNY | vulnerable | 3919 | 3919 | 1.3% | 3919 | 2.5% |
| MNY | ordinary_plus | 10538 | 10538 | 1.8% | 10538 | 2.5% |
| SPR | critical | 2736 | 2736 | 2.7% | 2736 | 3.2% |
| SPR | vulnerable | 1590 | 1590 | 2.5% | 1590 | 3.0% |
| SPR | ordinary_plus | 13161 | 13161 | 1.1% | 13161 | 2.2% |

**Ages 25-34**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 116 | 116 | 7.8% | 115 | 20.0% |
| CHR | vulnerable | 1431 | 1431 | 5.0% | 1390 | 14.3% |
| CHR | ordinary_plus | 22595 | 22595 | 4.4% | 21778 | 18.3% |
| INT | vulnerable | 120 | 120 | 15.8% | 113 | 36.3% |
| INT | ordinary_plus | 24022 | 24022 | 4.4% | 23170 | 17.9% |
| STR | critical | 914 | 914 | 3.7% | 900 | 9.6% |
| STR | vulnerable | 2959 | 2959 | 4.9% | 2934 | 14.0% |
| STR | ordinary_plus | 20269 | 20269 | 4.4% | 19449 | 19.0% |
| MNY | critical | 2078 | 2078 | 5.9% | 2008 | 21.0% |
| MNY | vulnerable | 3727 | 3727 | 3.9% | 3614 | 18.1% |
| MNY | ordinary_plus | 18337 | 18337 | 4.4% | 17661 | 17.7% |
| SPR | critical | 3302 | 3302 | 5.9% | 3127 | 25.4% |
| SPR | vulnerable | 1890 | 1890 | 4.3% | 1855 | 16.1% |
| SPR | ordinary_plus | 18950 | 18950 | 4.2% | 18301 | 17.0% |

**Ages 35-49**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 46 | 46 | 2.2% | 37 | 16.2% |
| CHR | vulnerable | 818 | 818 | 2.2% | 635 | 7.1% |
| CHR | ordinary_plus | 31830 | 31830 | 4.7% | 21590 | 12.5% |
| INT | vulnerable | 101 | 101 | 0.0% | 52 | 11.5% |
| INT | ordinary_plus | 32593 | 32593 | 4.6% | 22210 | 12.4% |
| STR | critical | 423 | 423 | 6.4% | 329 | 6.1% |
| STR | vulnerable | 1821 | 1821 | 3.4% | 1573 | 10.0% |
| STR | ordinary_plus | 30450 | 30450 | 4.7% | 20360 | 12.6% |
| MNY | critical | 4161 | 4161 | 4.8% | 2720 | 9.5% |
| MNY | vulnerable | 5487 | 5487 | 4.8% | 3711 | 11.4% |
| MNY | ordinary_plus | 23046 | 23046 | 4.6% | 15831 | 13.1% |
| SPR | critical | 3697 | 3697 | 7.5% | 1913 | 25.7% |
| SPR | vulnerable | 1990 | 1990 | 6.6% | 1299 | 15.3% |
| SPR | ordinary_plus | 27007 | 27007 | 4.1% | 19050 | 10.8% |

**Ages 50-64**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 143 | 143 | 7.0% | 118 | 0.0% |
| CHR | vulnerable | 1548 | 1548 | 1.9% | 1227 | 0.0% |
| CHR | ordinary_plus | 28439 | 28439 | 2.7% | 17716 | 0.1% |
| INT | vulnerable | 66 | 66 | 0.0% | 45 | 0.0% |
| INT | ordinary_plus | 30064 | 30064 | 2.6% | 19016 | 0.1% |
| STR | critical | 1197 | 1197 | 2.7% | 1010 | 1.4% |
| STR | vulnerable | 3663 | 3663 | 1.5% | 2962 | 0.0% |
| STR | ordinary_plus | 25270 | 25270 | 2.8% | 15089 | 0.1% |
| MNY | critical | 8596 | 8596 | 3.0% | 5592 | 0.0% |
| MNY | vulnerable | 7171 | 7171 | 2.3% | 4603 | 0.2% |
| MNY | ordinary_plus | 14363 | 14363 | 2.6% | 8866 | 0.1% |
| SPR | critical | 473 | 473 | 3.8% | 116 | 0.0% |
| SPR | vulnerable | 395 | 395 | 4.8% | 153 | 0.0% |
| SPR | ordinary_plus | 29262 | 29262 | 2.6% | 18792 | 0.1% |

**Ages 65+**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 31582 | 26393 | 0.1% | 21428 | 0.0% |
| CHR | vulnerable | 11072 | 10283 | 0.7% | 7897 | 0.0% |
| CHR | ordinary_plus | 53157 | 50690 | 2.2% | 35070 | 0.1% |
| INT | vulnerable | 168 | 153 | 0.0% | 153 | 0.0% |
| INT | ordinary_plus | 95643 | 87213 | 1.4% | 64242 | 0.0% |
| STR | critical | 47453 | 40314 | 0.1% | 32219 | 0.0% |
| STR | vulnerable | 12260 | 11563 | 1.1% | 8889 | 0.0% |
| STR | ordinary_plus | 36098 | 35489 | 2.9% | 23287 | 0.1% |
| MNY | critical | 31019 | 28284 | 1.5% | 21744 | 0.0% |
| MNY | vulnerable | 22587 | 20597 | 1.4% | 15377 | 0.1% |
| MNY | ordinary_plus | 42205 | 38485 | 1.3% | 27274 | 0.0% |
| SPR | critical | 3 | 3 | 66.7% | 0 | n/a |
| SPR | vulnerable | 17 | 17 | 5.9% | 2 | 0.0% |
| SPR | ordinary_plus | 95791 | 87346 | 1.4% | 64393 | 0.0% |

## 8. Stat ecology

Snapshots taken **entering** each age, including only runs still active then. `final` mixes a 25-year-old’s final state with a 120-year-old’s and is not comparable to a fixed-age row.

### LOW + Batch 008 — mean drift from post-setup start

| Snapshot | Active runs | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start (post-setup) | 5000 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| age 18 | 5000 | 4.09 | 9.25 | 2.74 | 0.24 | 5.72 |
| age 25 | 4964 | 6.02 | 10.42 | 4.07 | 2.02 | 6.32 |
| age 35 | 4422 | 8.49 | 11.52 | 6.03 | 3.77 | 5.97 |
| age 50 | 2663 | 9.44 | 12.61 | 5.75 | 0.83 | 12.29 |
| age 65 | 2471 | 8.23 | 12.66 | 3.71 | 0.29 | 24.90 |
| final | 5000 | 3.89 | 12.19 | -0.29 | 1.63 | 15.28 |

### LOW + Batch 008 — share ≥15

| Snapshot | Active runs | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start (post-setup) | 5000 | 0.5% | 0.0% | 1.6% | 0.2% | 1.2% |
| age 18 | 5000 | 15.8% | 40.3% | 10.1% | 0.1% | 55.1% |
| age 25 | 4964 | 20.2% | 42.1% | 17.7% | 2.4% | 50.9% |
| age 35 | 4422 | 28.0% | 47.1% | 29.5% | 8.3% | 46.0% |
| age 50 | 2663 | 33.6% | 54.4% | 26.8% | 3.0% | 67.7% |
| age 65 | 2471 | 27.7% | 55.4% | 14.6% | 4.4% | 96.0% |
| final | 5000 | 19.1% | 51.7% | 17.8% | 5.5% | 70.0% |

### LOW + Batch 008 — authored deltas per 1 000 run-years

| Stat | + deltas | + magnitude | − deltas | − magnitude | Final lower | Final equal | Final higher |
|---|---|---|---|---|---|---|---|
| CHR | 106.3 | 119.0 | 71.5 | -71.7 | 30.9% | 4.5% | 64.7% |
| INT | 147.0 | 166.9 | 6.3 | -10.2 | 0.0% | 0.0% | 100.0% |
| STR | 75.0 | 91.8 | 95.6 | -95.6 | 44.6% | 0.2% | 55.2% |
| MNY | 94.8 | 139.7 | 107.8 | -122.8 | 30.8% | 6.9% | 62.3% |
| SPR | 331.5 | 376.4 | 170.5 | -180.1 | 6.4% | 2.1% | 91.4% |

### CURRENT_AUTHORED + Batch 008 — mean drift from post-setup start

| Snapshot | Active runs | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start (post-setup) | 2500 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| age 18 | 2500 | 4.05 | 9.31 | 2.75 | 0.24 | 5.62 |
| age 25 | 2491 | 6.00 | 10.49 | 4.05 | 1.91 | 6.28 |
| age 35 | 2320 | 8.54 | 11.55 | 5.98 | 3.58 | 5.70 |
| age 50 | 2033 | 9.49 | 12.36 | 5.94 | 0.60 | 11.35 |
| age 65 | 1994 | 8.36 | 12.21 | 4.01 | 0.08 | 24.17 |
| final | 2500 | 1.16 | 12.17 | -3.92 | 0.60 | 20.46 |

### CURRENT_AUTHORED + Batch 008 — share ≥15

| Snapshot | Active runs | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start (post-setup) | 2500 | 0.6% | 0.0% | 1.2% | 0.4% | 1.5% |
| age 18 | 2500 | 15.5% | 41.2% | 9.2% | 0.2% | 53.9% |
| age 25 | 2491 | 20.2% | 42.8% | 16.3% | 2.4% | 50.9% |
| age 35 | 2320 | 27.5% | 47.2% | 28.9% | 9.1% | 43.9% |
| age 50 | 2033 | 33.9% | 53.4% | 27.3% | 3.5% | 62.8% |
| age 65 | 1994 | 28.8% | 52.1% | 14.8% | 4.8% | 94.3% |
| final | 2500 | 11.6% | 51.3% | 8.9% | 5.2% | 83.2% |

### CURRENT_AUTHORED + Batch 008 — authored deltas per 1 000 run-years

| Stat | + deltas | + magnitude | − deltas | − magnitude | Final lower | Final equal | Final higher |
|---|---|---|---|---|---|---|---|
| CHR | 86.1 | 96.2 | 86.6 | -86.9 | 46.6% | 6.8% | 46.6% |
| INT | 119.6 | 136.4 | 7.7 | -12.3 | 0.0% | 0.0% | 100.0% |
| STR | 60.5 | 73.4 | 113.3 | -113.3 | 67.6% | 0.4% | 32.0% |
| MNY | 83.7 | 120.8 | 104.3 | -117.6 | 36.7% | 7.4% | 55.9% |
| SPR | 315.3 | 363.4 | 146.2 | -154.8 | 3.2% | 1.2% | 95.6% |

## 9. Endings and routes

### LOW + Batch 008

| Route family | Endings | Share of completions | Median age |
|---|---|---|---|
| `INS/MED` | 881 | 31.8% | 40 |
| `ORD/FAM` | 436 | 15.7% | 67 |
| `SPC/ANO` | 352 | 12.7% | 42 |
| `INS/CIV` | 260 | 9.4% | 44 |
| `faction:CRI` | 155 | 5.6% | 30 |
| `INS/MUS` | 151 | 5.4% | 45 |
| `INS/ARC` | 141 | 5.1% | 40 |
| `INS/REL` | 137 | 4.9% | 44 |
| `faction:Meridian` | 65 | 2.3% | 28 |
| `TRN/TEMP` | 63 | 2.3% | 36 |
| `faction:Last Posture` | 61 | 2.2% | 28 |
| `INS/FIN` | 32 | 1.2% | 34 |
| `INS/COR` | 18 | 0.6% | 36 |
| `INS/ACA` | 7 | 0.3% | 46 |
| `faction:DMMS` | 7 | 0.3% | 27 |
| `faction:Everlasting Mutual` | 5 | 0.2% | 29 |

_All registry endings observed._

**Guardrail findings**

| Severity | ID | Finding |
|---|---|---|
| WARNING | `fallback-share` | Age-25+ fallback share 11.4% exceeds the warning threshold 5.0% (target 2.0%). |
| WARNING | `ending-age-share-18-24` | Ending age band 18-24: observed 1.3% vs target 18-22%. |
| WARNING | `ending-age-share-25-34` | Ending age band 25-34: observed 19.6% vs target 35-40%. |
| WARNING | `ending-age-share-35-44` | Ending age band 35-44: observed 48.0% vs target 20-25%. |
| WARNING | `ending-age-share-45-54` | Ending age band 45-54: observed 20.8% vs target 8-12%. |
| WARNING | `ending-age-share-55-64` | Ending age band 55-64: observed 1.6% vs target 4-7%. |
| WARNING | `ending-age-share-65+` | Ending age band 65+: observed 8.7% vs target 2-5%. |
| WARNING | `nonterminal-rate` | 2229/5000 runs (44.6%) reached the diagnostic maximum age without an ending. |

### CURRENT_AUTHORED + Batch 008

| Route family | Endings | Share of completions | Median age |
|---|---|---|---|
| `INS/MED` | 286 | 35.3% | 67 |
| `SPC/ANO` | 167 | 20.6% | 43 |
| `ORD/FAM` | 143 | 17.6% | 67 |
| `faction:CRI` | 62 | 7.6% | 30 |
| `faction:Meridian` | 38 | 4.7% | 27 |
| `INS/ARC` | 37 | 4.6% | 35 |
| `faction:Last Posture` | 20 | 2.5% | 28 |
| `INS/CIV` | 16 | 2.0% | 43 |
| `INS/MUS` | 12 | 1.5% | 49 |
| `INS/REL` | 10 | 1.2% | 41 |
| `TRN/TEMP` | 6 | 0.7% | 35 |
| `faction:Everlasting Mutual` | 4 | 0.5% | 30 |
| `faction:DMMS` | 4 | 0.5% | 28 |
| `INS/FIN` | 3 | 0.4% | 33 |
| `faction:Black Ledger` | 1 | 0.1% | 30 |
| `INS/ACA` | 1 | 0.1% | 48 |
| `INS/COR` | 1 | 0.1% | 37 |

Unobserved endings: `END-COR-002`, `END-MUS-001`, `END-MUS-003`.

**Guardrail findings**

| Severity | ID | Finding |
|---|---|---|
| WARNING | `fallback-share` | Age-25+ fallback share 12.6% exceeds the warning threshold 5.0% (target 2.0%). |
| WARNING | `ending-age-share-18-24` | Ending age band 18-24: observed 1.1% vs target 18-22%. |
| WARNING | `ending-age-share-25-34` | Ending age band 25-34: observed 21.1% vs target 35-40%. |
| WARNING | `ending-age-share-35-44` | Ending age band 35-44: observed 25.3% vs target 20-25%. |
| WARNING | `ending-age-share-45-54` | Ending age band 45-54: observed 12.3% vs target 8-12%. |
| WARNING | `ending-age-share-55-64` | Ending age band 55-64: observed 2.6% vs target 4-7%. |
| WARNING | `ending-age-share-65+` | Ending age band 65+: observed 37.6% vs target 2-5%. |
| FAILURE | `nonterminal-rate` | 1689/2500 runs (67.6%) reached the diagnostic maximum age without an ending. |
