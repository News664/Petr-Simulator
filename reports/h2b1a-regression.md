# SOLID STATE — H2B Batch 008 Diagnostic

**Measurements only.** Generated from
`docs/validation/SOLID_STATE_H2B_DIAGNOSTIC_PLAN_v0.1.md`.

LOW is the **provisional diagnostic baseline**, applied through the retained reversible rewrite in `src/sim/experiments.ts`. No canonical FIX gate is written, no profile is frozen, and Batch 008 is not auto-tuned from this run. Written analysis is in [`docs/H2B_BATCH008_FINDINGS.md`](../docs/H2B_BATCH008_FINDINGS.md); decisions stay in [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md). This file is regenerated on every run.

| Field | Value |
|---|---|
| Generated at | 2026-08-14T11:59:45.667Z |
| Content fingerprint | `8638e2e1ebd977878d09c28c1d554d7b85e2174f24fcf7aa568df018541d214e` |
| Balance constants | v0.2 |
| Experiment matrix (LOW values) | v0.1 |
| Base seed | `h2b1a_timing` |
| Events in corpus | 215 |
| Endings in registry | 25 |
| runs | `3000` |
| speciesMode | `STRATIFY_EQUALLY_BY_SPECIES` |
| talentScenario | `UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC` |
| allocationPolicy | `ARCHETYPE_SET` |
| familyWeightMode | `uniform` |
| maxAge | `120` |

## 1. Headline balance

Bucket shares are shares of **completed** runs.

| Arm | Runs | Completion | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ | Largest | Median ending age |
|---|---|---|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 3000 | 71.6% | 0.9% | 21.2% | 35.2% | 14.0% | 1.7% | 26.9% | 35-44 | 42 |

| Arm | Commitment | Mean commit age | Median commit age | Ending coverage | Faction endings | Material entropy | Guardrail failures |
|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 83.4% | 41.4 | 36 | 100.0% (25/25) | 10.1% | 3.132 | 0 |

### Review goals from the plan

These are **review goals, not hard final targets**. Nothing is selected from them.

| Review goal (primary arm) | Observed | Met |
|---|---|---|
| completion 50–70% under LOW | 71.6% | no |
| mean commitment materially earlier than 35, preferably 28–31 | 41.4 | no |
| 25–34 the largest or a clearly major bucket | 21.2% (largest: 35-44) | no |
| 18–24 visibly nontrivial | 0.9% | no |
| 35–44 falls substantially from ~48% | 35.2% | yes |
| 65+ low rather than survivor-dominant | 26.9% | no |
| faction endings stay secondary | 10.1% | yes |

## 2. Correctness counters

All must be zero in every arm.

| Arm | Pre-25 coverage | Pre-25 fallback | Illegal transitions | Lifecycle collisions | Personal after exit | Ending <18 | Commit <18 | Two active factions | Contact while active |
|---|---|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## 3. Pressure chains — Batch 008 event behaviour

One row per new event, then one row per authored variant. `Rescue band` follows the Pressure & Tone spec: clean luck 0–2 FIX, costly-but-legitimate 3–6, predatory institutional 10+. The 7–9 gap is unnamed in the spec and is reported separately rather than folded into a neighbour. `P(ending ≤5y)` and `P(commit ≤5y)` are conditional on complete follow-up; censored occurrences are dropped, not counted as "no event".

### H2B.1A working canonical balance (LOW applied)

| Rescue band | Occurrences |
|---|---|
| clean | 9465 |
| costly | 1782 |
| unclassified | 319 |
| predatory | 1269 |

**`EVT-INS-ARC-2001`** INS/ARC — run incidence 3.8% (113 runs, 113 occurrences), mean age 30.8, gated on `MNY<=3`

Gating-stat band entering the year it fired — critical 77, vulnerable 36, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | A municipal housing program offers you a large rent subsidy in exchan… | 113 | 30.8 | +12 | predatory | 4.00 | 52.2% | 71.7% | 113 |

**`EVT-INS-ARC-2002`** INS/ARC — run incidence 3.5% (105 runs, 105 occurrences), mean age 32.6

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=7` | You exit the structural-continuity pilot before the installation clau… | 31 | 30.0 | — | clean | n/a | 12.9% | 61.3% | 31 |
| 2 | `TLT[T1024] | TLT[T1013]` | You renegotiate the structural pilot so the future installation remai… | 16 | 33.4 | +4 | costly | n/a | 43.8% | 56.3% | 16 |
| 3 | `MAT=STON | MAT=METL` | The housing authority approves your committed material for structural… | 4 | 35.8 | +4 | costly | n/a | 100.0% | 0.0% | 4 |
| 4 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL]` | The pilot permanently stabilizes the stone manifestation it was desig… | 26 | 32.0 | +8 | unclassified | n/a | 88.5% | 100.0% | 26 |
| 5 | `MAT=NONE & FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_STON]` | The pilot permanently stabilizes your metallic manifestation into a s… | 15 | 33.5 | +8 | unclassified | n/a | 73.3% | 100.0% | 15 |
| 6 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & FLAG[MAT_MANIFEST_METL] & SPECIES=DWARF` | The pilot resolves your mixed manifestation history in favor of stone… | 2 | 35.5 | +8 | unclassified | n/a | 100.0% | 100.0% | 2 |
| 7 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & FLAG[MAT_MANIFEST_METL] & SPECIES=DRAGONKIN` | The pilot resolves your mixed manifestation history in favor of metal… | 2 | 39.0 | +8 | unclassified | n/a | 100.0% | 100.0% | 2 |
| 8 | `TRUE` | The pilot cannot settle on a legally usable structural material. The … | 9 | 37.3 | +5 | costly | n/a | 55.6% | 33.3% | 9 |

**`EVT-INS-ARC-2003`** INS/ARC — run incidence 1.4% (41 runs, 41 occurrences), mean age 36.1

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `FLAG[ROUTE_ARC_SELF_OWNED]` | The housing project incorporates your Permanent Form into the buildin… | 5 | 37.6 | — | clean | n/a | 100.0% | 0.0% | 5 |
| 2 | `TRUE` | Your subsidized tenancy converts into permanent structural occupancy.… | 36 | 35.9 | — | clean | n/a | 100.0% | 0.0% | 36 |

**`EVT-INS-CIV-2001`** INS/CIV — run incidence 3.2% (96 runs, 96 occurrences), mean age 20.4, gated on `CHR<=3`

Gating-stat band entering the year it fired — critical 28, vulnerable 68, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=7` | You pay for a professional presentation course after being described … | 48 | 20.7 | — | clean | 4.00 | 0.0% | 4.2% | 48 |
| 2 | `INT>=8` | A public-facing assignment forces you to become much better at readin… | 44 | 20.3 | — | clean | 3.00 | 0.0% | 0.0% | 44 |
| 3 | `TRUE` | A subsidized Presentation Access Program offers wardrobe, coaching, a… | 4 | 18.3 | +12 | predatory | 4.00 | 0.0% | 0.0% | 4 |

**`EVT-INS-COR-2001`** INS/COR — run incidence 3.8% (114 runs, 114 occurrences), mean age 31.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | Your employer gives you an unusually generous retention award and ask… | 114 | 31.9 | +5 | costly | n/a | 14.0% | 27.2% | 114 |

**`EVT-INS-COR-2002`** INS/COR — run incidence 3.3% (98 runs, 98 occurrences), mean age 35.5

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024] | MNY>=10` | The old retention contract finally reaches its durable-likeness claus… | 95 | 35.5 | — | clean | n/a | 15.8% | 27.4% | 95 |
| 2 | `FIX>=32 & MAT!=NONE` | The company exercises the preservation clause attached to your old re… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 3 | `FIX>=32 & MAT=NONE` | The company exercises the preservation clause attached to your old re… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 4 | `TRUE` | The durable-likeness clause expires without becoming useful. Payroll … | 3 | 35.0 | — | clean | n/a | 0.0% | 0.0% | 3 |

**`EVT-INS-EDU-2001`** INS/EDU — run incidence 0.4% (11 runs, 11 occurrences), mean age 20.0, gated on `INT<=4`

Gating-stat band entering the year it fired — critical 0, vulnerable 11, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPR>=7` | You complete an intensive adult-certification course by giving up mos… | 11 | 20.0 | — | clean | 4.00 | 0.0% | 0.0% | 11 |
| 2 | `MNY>=7` | You pay for a private retraining program whose advertising is annoyin… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | A workforce agency places you in a fully subsidized “guided competenc… | 0 | n/a | +10 | — | n/a | n/a | n/a | 0 |

**`EVT-INS-FIN-2001`** INS/FIN — run incidence 11.0% (329 runs, 329 occurrences), mean age 20.6, gated on `MNY<=2`

Gating-stat band entering the year it fired — critical 329, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `INT>=10` | A hiring test you nearly ignored turns into a well-paid offer. For on… | 108 | 20.6 | +2 | clean | 4.00 | 0.9% | 0.0% | 108 |
| 2 | `TLT[T1009] | TLT[T1013]` | You negotiate a debt-restructuring plan that is merely unpleasant ins… | 29 | 20.7 | +4 | costly | 3.00 | 0.0% | 3.4% | 29 |
| 3 | `TRUE` | A lender offers Mobility-Backed Restructuring: your monthly position … | 192 | 20.5 | +14 | predatory | 5.00 | 6.3% | 14.1% | 192 |

**`EVT-INS-FIN-2002`** INS/FIN — run incidence 6.1% (184 runs, 184 occurrences), mean age 23.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | MNY>=10` | Your restructuring account reaches the boring part where ordinary mon… | 6 | 24.5 | +2 | clean | n/a | 0.0% | 16.7% | 6 |
| 2 | `MAT!=NONE` | Your lender updates the collateral schedule to your committed materia… | 3 | 35.0 | +5 | costly | n/a | 100.0% | 0.0% | 3 |
| 3 | `TRUE` | Your lender extends the restructuring period because your future form… | 175 | 23.0 | +8 | unclassified | n/a | 22.3% | 58.3% | 175 |

**`EVT-INS-FIN-2004`** INS/FIN — run incidence 5.2% (156 runs, 156 occurrences), mean age 25.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MAT!=NONE` | The restructuring agreement reaches its first collateral revaluation.… | 9 | 25.7 | +6 | costly | n/a | 100.0% | 0.0% | 9 |
| 2 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your lender orders a collateral assessment based on the manifestation… | 7 | 25.7 | +10 | predatory | n/a | 57.1% | 100.0% | 7 |
| 3 | `MAT=NONE & FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your lender orders a collateral assessment based on the manifestation… | 6 | 25.7 | +10 | predatory | n/a | 50.0% | 100.0% | 6 |
| 4 | `MAT=NONE & FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your lender orders a collateral assessment based on the manifestation… | 12 | 26.0 | +10 | predatory | n/a | 50.0% | 100.0% | 12 |
| 5 | `MAT=NONE & FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your lender orders a collateral assessment based on the manifestation… | 11 | 25.8 | +10 | predatory | n/a | 45.5% | 100.0% | 11 |
| 6 | `MAT=NONE & FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your lender orders a collateral assessment based on the manifestation… | 6 | 25.3 | +10 | predatory | n/a | 66.7% | 100.0% | 6 |
| 7 | `MAT=NONE & FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_SYNT]` | Your lender orders a collateral assessment based on the manifestation… | 10 | 25.9 | +10 | predatory | n/a | 50.0% | 100.0% | 10 |
| 8 | `MAT=NONE & FLAG[MAT_MANIFEST_SYNT] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA]` | Your lender orders a collateral assessment based on the manifestation… | 0 | n/a | +10 | — | n/a | n/a | n/a | 0 |
| 9 | `TRUE` | The collateral assessor cannot agree on what you might become. Black-… | 95 | 25.7 | +8 | unclassified | n/a | 50.5% | 57.9% | 95 |

**`EVT-INS-LEG-2001`** INS/LEG — run incidence 0.1% (4 runs, 4 occurrences), mean age 22.5, gated on `INT<=4`

Gating-stat band entering the year it fired — critical 0, vulnerable 4, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024]` | A provider offers you a “plain-language” continuity agreement. You no… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `INT<=2 & MNY<=3` | A provider offers a one-page continuity agreement designed for “low-c… | 0 | n/a | +14 | — | n/a | n/a | n/a | 0 |
| 3 | `TRUE` | A provider simplifies your continuity paperwork by deciding which sec… | 4 | 22.5 | +8 | unclassified | n/a | 0.0% | 25.0% | 4 |

**`EVT-INS-MED-2001`** INS/MED — run incidence 39.1% (1172 runs, 1172 occurrences), mean age 83.5, gated on `STR<=1`

Gating-stat band entering the year it fired — critical 1172, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | Your basic insurer opens a Functional Continuity Review after your he… | 1172 | 83.5 | — | clean | n/a | 43.9% | 28.5% | 1100 |

**`EVT-INS-MED-2002`** INS/MED — run incidence 37.8% (1133 runs, 1133 occurrences), mean age 84.3

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `STR>=3` | Your Functional Continuity Review closes after your mobility measurem… | 7 | 21.9 | — | clean | n/a | 14.3% | 14.3% | 7 |
| 2 | `STR<=-3` | The insurer expedites your review. Continued mobility is now classifi… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 3 | `TLT[T1015] | (MNY>=10 & INT>=12)` | You obtain a mobility-preserving treatment outside the basic benefit … | 335 | 81.4 | +6 | costly | n/a | 1.2% | 0.3% | 329 |
| 4 | `TRUE` | The insurer approves a covered stabilization course. Your strength im… | 791 | 86.1 | +12 | predatory | n/a | 64.4% | 42.2% | 747 |

**`EVT-INS-MED-2003`** INS/MED — run incidence 25.4% (762 runs, 762 occurrences), mean age 87.5

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `STR>=3` | The covered stabilization course improves your mobility enough that p… | 292 | 79.2 | +2 | clean | n/a | 1.9% | 3.4% | 266 |
| 2 | `TLT[T1015] | (MNY>=10 & INT>=12)` | A last independent review finds a mobility-preserving alternative. It… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 3 | `MAT!=NONE` | Your Basic Continuity benefit is approved in full. The insurer perman… | 164 | 94.6 | — | clean | n/a | 100.0% | 0.0% | 164 |
| 4 | `MAT=NONE & FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 13 | 86.0 | +6 | costly | n/a | 100.0% | 100.0% | 13 |
| 5 | `MAT=NONE & FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 11 | 96.5 | +6 | costly | n/a | 100.0% | 100.0% | 11 |
| 6 | `MAT=NONE & FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 8 | 81.5 | +6 | costly | n/a | 100.0% | 100.0% | 8 |
| 7 | `MAT=NONE & FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 7 | 85.6 | +6 | costly | n/a | 100.0% | 100.0% | 7 |
| 8 | `MAT=NONE & FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 8 | 88.1 | +6 | costly | n/a | 100.0% | 100.0% | 8 |
| 9 | `MAT=NONE & FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_SYNT]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 12 | 86.6 | +6 | costly | n/a | 100.0% | 100.0% | 12 |
| 10 | `MAT=NONE & FLAG[MAT_MANIFEST_SYNT] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA]` | Your Basic Continuity benefit is approved in full. The insurer stabil… | 0 | n/a | +6 | — | n/a | n/a | n/a | 0 |
| 11 | `TRUE` | Your Basic Continuity benefit is approved in full. The approval does … | 247 | 92.4 | +6 | costly | n/a | 100.0% | 100.0% | 247 |

**`EVT-INS-MED-2004`** INS/MED — run incidence 0.6% (17 runs, 17 occurrences), mean age 28.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPR>=5 & FIX<28` | Your Continuity Leave file closes after the insurer concludes that or… | 5 | 24.8 | — | clean | n/a | 0.0% | 0.0% | 5 |
| 2 | `TLT[T1010]` | You refuse the insurer’s long-term stabilization addendum and keep th… | 1 | 32.0 | +2 | clean | n/a | 0.0% | 0.0% | 1 |
| 3 | `TRUE` | The insurer converts your temporary leave into a preservation-plannin… | 11 | 29.1 | +6 | costly | n/a | 90.9% | 81.8% | 11 |

**`EVT-ORD-FIN-2003`** ORD/FIN — run incidence 3.0% (90 runs, 90 occurrences), mean age 25.2, gated on `MNY<=0`

Gating-stat band entering the year it fired — critical 90, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TRUE` | You buy one municipal lottery ticket because a clerk gives you the wr… | 90 | 25.2 | — | clean | 4.00 | 2.2% | 3.3% | 90 |

**`EVT-ORD-GEN-2001`** ORD/GEN — run incidence 48.4% (1452 runs, 1452 occurrences), mean age 51.3, gated on `INT>=8`

Gating-stat band entering the year it fired — critical 0, vulnerable 0, ordinary+ 1452.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `INT>=15` | A professional system you know inside out is replaced by one designed… | 921 | 51.2 | — | clean | -2.00 | 2.4% | 0.1% | 921 |
| 2 | `TRUE` | Several procedures you once knew by memory are replaced by new ones. … | 531 | 51.5 | — | clean | -1.00 | 3.4% | 0.2% | 531 |

**`EVT-ORD-HEA-2001`** ORD/HEA — run incidence 13.1% (394 runs, 394 occurrences), mean age 27.9, gated on `SPR<=2`

Gating-stat band entering the year it fired — critical 394, vulnerable 0, ordinary+ 0.

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `CHR>=8` | Friends organize your schedule for a while with the terrifying effici… | 182 | 31.2 | — | clean | 4.00 | 6.6% | 22.0% | 182 |
| 2 | `MNY>=7` | You take a real break before exhaustion becomes your permanent person… | 194 | 25.0 | +1 | clean | 4.00 | 4.6% | 11.3% | 194 |
| 3 | `TRUE` | Your basic insurer approves Continuity Leave: income support, mandato… | 18 | 25.6 | +12 | predatory | 4.00 | 55.6% | 55.6% | 18 |

**`EVT-ORD-HOU-2001`** ORD/HOU — run incidence 13.5% (406 runs, 406 occurrences), mean age 33.1

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | Your employer offers subsidized accommodation near the office. The re… | 28 | 33.8 | — | clean | n/a | 0.0% | 0.0% | 28 |
| 2 | `TRUE` | Your employer offers staff accommodation near the office. The lease i… | 378 | 33.0 | — | clean | n/a | 8.5% | 10.3% | 378 |

**`EVT-ORD-HOU-2002`** ORD/HOU — run incidence 58.5% (1756 runs, 1756 occurrences), mean age 31.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | You rent a cheaper room in a shared flat. One roommate is a woman inc… | 406 | 29.8 | — | clean | n/a | 6.2% | 3.9% | 406 |
| 2 | `TRUE` | A new flatmate explains that the woman built into the living-room wal… | 1350 | 32.5 | — | clean | n/a | 5.9% | 7.2% | 1350 |

**`EVT-ORD-HOU-2003`** ORD/HOU — run incidence 40.5% (1216 runs, 1216 occurrences), mean age 31.2

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `SPECIES=WINGED_KIN` | Your building installs wing-clearance markers after three complaints … | 196 | 30.5 | — | clean | n/a | 4.6% | 8.2% | 196 |
| 2 | `SPECIES=DWARF` | Your building lowers several control panels and raises the rent for “… | 210 | 31.9 | — | clean | n/a | 7.1% | 9.5% | 210 |
| 3 | `SPECIES=DRAGONKIN` | The landlord adds a thermal-load clause to the lease after learning w… | 228 | 30.7 | — | clean | n/a | 7.0% | 11.8% | 228 |
| 4 | `SPECIES=DEMONKIN` | The building finally permits horn-safe doorframes in renovated units.… | 186 | 31.2 | — | clean | n/a | 9.7% | 11.8% | 186 |
| 5 | `SPECIES=ELF` | The landlord advertises a renovated unit as “Elf-compatible” because … | 201 | 31.5 | — | clean | n/a | 5.0% | 8.5% | 201 |
| 6 | `TRUE` | Your building completes an accessibility retrofit. The notice congrat… | 195 | 31.2 | — | clean | n/a | 3.1% | 7.2% | 195 |

**`EVT-ORD-HOU-2004`** ORD/HOU — run incidence 30.8% (924 runs, 924 occurrences), mean age 27.5

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | A manifestation damages part of your rental unit. Basic housing insur… | 182 | 24.7 | +4 | costly | n/a | 1.6% | 11.0% | 182 |
| 2 | `TRUE` | A manifestation damages part of your rental unit. The landlord accept… | 742 | 28.1 | — | clean | n/a | 4.2% | 15.6% | 742 |

**`EVT-ORD-HOU-2005`** ORD/HOU — run incidence 54.3% (1630 runs, 1630 occurrences), mean age 40.6

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY<=3` | You qualify for a subsidized insurance-compliant unit with reinforced… | 308 | 43.0 | +6 | costly | n/a | 16.9% | 17.2% | 308 |
| 2 | `TRUE` | You move into a unit certified for residents with material-risk histo… | 1322 | 40.1 | — | clean | n/a | 8.5% | 10.5% | 1322 |

**`EVT-SPC-SECR-2001`** SPC/SECR — run incidence 2.0% (61 runs, 61 occurrences), mean age 22.8

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | TLT[T1024] | (INT>=10 & SPR>=7)` | The same DMMS case number appears on a new envelope. This time you an… | 3 | 22.3 | — | clean | n/a | 0.0% | 0.0% | 3 |
| 2 | `MNY<=2 | TLT[T1030]` | The Department renews your case supervision and waives a filing fee b… | 11 | 23.2 | +4 | costly | n/a | 27.3% | 27.3% | 11 |
| 3 | `TRUE` | A different DMMS officer reviews the same file and asks for documents… | 47 | 22.7 | — | clean | n/a | 12.8% | 14.9% | 47 |

**`EVT-SPC-SECR-2002`** SPC/SECR — run incidence 2.3% (69 runs, 69 occurrences), mean age 24.3

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] | (SPR>=10 & INT>=7)` | The Meridian representative who photographed you during the first con… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `CHR>=8 & MNY<=3` | Meridian offers a sponsored presentation package: better clothes, bet… | 2 | 23.5 | +10 | predatory | n/a | 0.0% | 0.0% | 2 |
| 3 | `TRUE` | Meridian updates the photographs from your original consultation and … | 67 | 24.3 | +3 | costly | n/a | 61.2% | 61.2% | 67 |

**`EVT-SPC-SECR-2003`** SPC/SECR — run incidence 4.9% (148 runs, 148 occurrences), mean age 25.7

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] & INT>=7` | CRI sends the third consent revision since your enrollment. You use i… | 0 | n/a | — | — | n/a | n/a | n/a | 0 |
| 2 | `STR<=3` | CRI offers to correct the weakness its study keeps measuring. The int… | 18 | 25.3 | +10 | predatory | n/a | 94.4% | 94.4% | 18 |
| 3 | `INT>=8` | Your CRI coordinator asks you to help interpret your own longitudinal… | 125 | 25.7 | +4 | costly | n/a | 46.4% | 46.4% | 125 |
| 4 | `TRUE` | CRI repeats a test you remember taking years ago. The equipment has c… | 5 | 25.2 | +3 | costly | n/a | 80.0% | 80.0% | 5 |

**`EVT-SPC-SECR-2004`** SPC/SECR — run incidence 4.7% (142 runs, 142 occurrences), mean age 26.6

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `MNY>=8 | TLT[T1013]` | Everlasting reviews the starter policy you stopped thinking about. Yo… | 15 | 27.6 | — | clean | n/a | 6.7% | 13.3% | 15 |
| 2 | `MNY<=2` | Everlasting grants temporary premium relief. Your monthly finances im… | 36 | 26.8 | +10 | predatory | n/a | 16.7% | 30.6% | 36 |
| 3 | `TRUE` | Everlasting updates your policy illustration using the same projectio… | 91 | 26.4 | +4 | costly | n/a | 1.1% | 5.5% | 91 |

**`EVT-SPC-SECR-2005`** SPC/SECR — run incidence 2.8% (84 runs, 84 occurrences), mean age 26.0

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1013] | MNY>=7` | Black Ledger sends a servicing notice on the same account it once cal… | 6 | 27.0 | — | clean | n/a | 0.0% | 16.7% | 6 |
| 2 | `MNY<=1` | Black Ledger offers a payment holiday if you sign an updated collater… | 5 | 26.4 | +12 | predatory | n/a | 100.0% | 100.0% | 5 |
| 3 | `TRUE` | Black Ledger restructures the account again. The new payment is easie… | 73 | 25.9 | +6 | costly | n/a | 24.7% | 32.9% | 73 |

**`EVT-SPC-SECR-2006`** SPC/SECR — run incidence 4.3% (128 runs, 128 occurrences), mean age 23.9

| # | When | Text | Occurrences | Mean age | FIX | Band | Δ gate stat | P(ending ≤5y) | P(commit ≤5y) | n |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `TLT[T1010] | (INT>=10 & SPR>=8)` | The woman who first invited you to the Order asks whether you still i… | 6 | 23.2 | — | clean | n/a | 0.0% | 0.0% | 6 |
| 2 | `SPR<=3` | The Order gives you a room, meals, and several weeks in which nobody … | 38 | 24.1 | +10 | predatory | n/a | 55.3% | 57.9% | 38 |
| 3 | `CHR>=8` | The Order asks you to represent the community at a public ceremony. T… | 50 | 24.2 | +4 | costly | n/a | 50.0% | 50.0% | 50 |
| 4 | `TRUE` | You return to the same quiet hall from the first meeting. Someone rem… | 34 | 23.3 | +5 | costly | n/a | 0.0% | 2.9% | 34 |

## 4. Basic Continuity Insurance (STR) chain

### H2B.1A working canonical balance (LOW applied)

| Field | Value |
|---|---|
| Functional Continuity Review opened | 1172 (39.1%) |
| Mean review age | 83.5 |
| Two-year decision reached | 1133 |
| Final outcome event reached | 762 |
| `END-MED-003 Benefit Approved` | 470 (15.7% of runs, 21.9% of completions) |
| Mean / median benefit age | 92.6 / 92 |
| Synthetic share of benefit endings | 53.8% |
| Adult runs ever at STR ≤ −3 | 355 |
| …of which saw a review | 355 (100.0%) |
| Long survivors at STR ≤ −3 with no review | 0 |

**Two-year decision split**

| Branch | Runs | Share |
|---|---|---|
| recovered (STR>=3) | 7 | 0.6% |
| independent treatment | 0 | 0.0% |
| expedited (STR<=-3) | 335 | 29.6% |
| covered stabilization | 791 | 69.8% |

**Final outcome split**

| Branch | Runs | Share |
|---|---|---|
| recovered | 292 | 38.3% |
| independent alternative | 0 | 0.0% |
| benefit approved (existing MAT) | 164 | 21.5% |
| benefit approved (SYNT) | 13 | 1.7% |

**Material at the Benefit Approved ending**

| Material | Runs |
|---|---|
| SYNT | 253 |
| STON | 48 |
| CERA | 42 |
| CRYS | 40 |
| METL | 30 |
| WOOD | 29 |
| GLAS | 28 |

## 5. Housing and relocation

Housing is attributed by the canonical `housing` route tag, and a literal change of address by the canonical `relocation` metadata tag added in H2B.1A (A-10). Both are read from the corpus; the analyst variant list the H2B run relied on is gone. The tag is event-level, so one variant of `EVT-ORD-HOU-2002` that is a move cannot be expressed separately from its non-move sibling — recorded as a conflict rather than patched around.

| Arm | Any housing | Housing events | Mean distinct housing IDs/run | Max distinct | Relocations | Relocation runs | Moves as share of housing | Runs with 2+ moves |
|---|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 2970 (99.0%) | 12627 | 4.24 | 11 | 3880 | 2197 (73.2%) | 30.7% | 1303 |

**Aggregate authored deltas carried by housing-tagged events**

| Arm | CHR | INT | STR | MNY | SPR | FIX | Mean FIX per housing event |
|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 186 | 0 | 0 | -3783 | 7717 | 4417 | 0.350 |

**Structural-housing route**

| Arm | Offer taken | Structural commitment | Pilot lapsed | Structural ending | Mean ending age | Endings |
|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 252 (8.4%) | 208 | 40 | 41 (1.4%) | 36.1 | END-ARC-001×36, END-LEG-002×5 |

## 6. Faction exclusivity and chains

The single-active-faction rule is an invariant: **two simultaneously personally-active factions and a second contact opened before the previous relationship ended are both failures, not balance numbers.** Personalized touchpoints count `contact` / `personal` / `climax` events; news and lore are excluded.

| Arm | Max simultaneous active | Runs with any contact | Runs with 2+ factions contacted | Second contact after terminal exit |
|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 1 | 979 | 38 (1.3%) | 38 |

### H2B.1A working canonical balance (LOW applied) — chain shape

| Faction | Contact | ENGAGED | COMMITTED | OPTED_OUT | CLOSED | Endings | Touchpoints (mean) | Mean gap | Exit at first disposition | Climax after COMMITTED |
|---|---|---|---|---|---|---|---|---|---|---|
| DMMS | 138 (4.6%) | 2.0% | 0.3% | 0.0% | 4.3% | 8 | 2.93 | 2.22 | 55.8% | 100.0% |
| Everlasting Mutual | 216 (7.2%) | 4.7% | 0.2% | 5.2% | 1.7% | 6 | 3.29 | 2.55 | 34.3% | 100.0% |
| Meridian | 162 (5.4%) | 2.3% | 1.8% | 3.0% | 0.6% | 54 | 3.14 | 2.08 | 50.6% | 79.6% |
| CRI | 182 (6.1%) | 5.0% | 2.7% | 0.9% | 2.3% | 82 | 4.07 | 2.13 | 14.8% | 93.9% |
| Black Ledger | 98 (3.3%) | 2.8% | 0.7% | 2.4% | 0.1% | 22 | 3.89 | 1.88 | 14.3% | 100.0% |
| Last Posture | 221 (7.4%) | 4.3% | 1.5% | 4.9% | 0.8% | 46 | 3.34 | 2.18 | 41.2% | 97.8% |

**New intermediate touchpoints and escalation-schedule expiry**

| Intermediate event | Runs | Incidence |
|---|---|---|
| `EVT-SPC-SECR-2001` | 61 | 2.0% |
| `EVT-SPC-SECR-2002` | 69 | 2.3% |
| `EVT-SPC-SECR-2003` | 148 | 4.9% |
| `EVT-SPC-SECR-2004` | 142 | 4.7% |
| `EVT-SPC-SECR-2005` | 84 | 2.8% |
| `EVT-SPC-SECR-2006` | 128 | 4.3% |

_No escalation schedule expired._

## 7. Age-stratified low-stat risk

Person-years classified by the stat entering that year and followed 5 years, split by adult life stage so old-age CHR/STR decline cannot invert the reading. Censored person-years are dropped rather than counted as "no event". **Correlation, not causation.**

### H2B.1A working canonical balance (LOW applied)

**Ages 18-24**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 603 | 603 | 1.0% | 603 | 2.8% |
| CHR | vulnerable | 3523 | 3523 | 2.4% | 3521 | 4.5% |
| CHR | ordinary_plus | 16838 | 16838 | 3.4% | 16829 | 6.5% |
| INT | vulnerable | 107 | 107 | 7.5% | 107 | 10.3% |
| INT | ordinary_plus | 20857 | 20857 | 3.1% | 20846 | 6.1% |
| STR | critical | 3057 | 3057 | 4.3% | 3057 | 7.0% |
| STR | vulnerable | 4473 | 4473 | 3.3% | 4473 | 5.7% |
| STR | ordinary_plus | 13434 | 13434 | 2.8% | 13423 | 6.0% |
| MNY | critical | 3855 | 3855 | 1.6% | 3854 | 3.8% |
| MNY | vulnerable | 4844 | 4844 | 1.6% | 4841 | 3.3% |
| MNY | ordinary_plus | 12265 | 12265 | 4.2% | 12258 | 7.9% |
| SPR | critical | 3321 | 3321 | 5.5% | 3318 | 8.0% |
| SPR | vulnerable | 1774 | 1774 | 3.4% | 1774 | 6.5% |
| SPR | ordinary_plus | 15869 | 15869 | 2.6% | 15861 | 5.6% |

**Ages 25-34**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 276 | 276 | 9.1% | 264 | 18.6% |
| CHR | vulnerable | 1597 | 1597 | 10.4% | 1543 | 23.6% |
| CHR | ordinary_plus | 25937 | 25937 | 11.4% | 24101 | 29.5% |
| INT | vulnerable | 55 | 55 | 12.7% | 40 | 72.5% |
| INT | ordinary_plus | 27755 | 27755 | 11.3% | 25868 | 28.9% |
| STR | critical | 1211 | 1211 | 9.4% | 1140 | 22.9% |
| STR | vulnerable | 3640 | 3640 | 10.1% | 3510 | 24.2% |
| STR | ordinary_plus | 22959 | 22959 | 11.6% | 21258 | 30.1% |
| MNY | critical | 2491 | 2491 | 10.2% | 2367 | 27.2% |
| MNY | vulnerable | 4214 | 4214 | 9.8% | 4026 | 25.8% |
| MNY | ordinary_plus | 21105 | 21105 | 11.7% | 19515 | 29.9% |
| SPR | critical | 3754 | 3754 | 13.4% | 3355 | 36.5% |
| SPR | vulnerable | 2082 | 2082 | 10.0% | 1961 | 29.6% |
| SPR | ordinary_plus | 21974 | 21974 | 11.1% | 20592 | 27.7% |

**Ages 35-49**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 111 | 111 | 9.0% | 91 | 9.9% |
| CHR | vulnerable | 1077 | 1077 | 9.2% | 777 | 12.4% |
| CHR | ordinary_plus | 29110 | 29110 | 17.5% | 16179 | 26.6% |
| INT | vulnerable | 40 | 40 | 27.5% | 2 | 100.0% |
| INT | ordinary_plus | 30258 | 30258 | 17.1% | 17045 | 25.9% |
| STR | critical | 580 | 580 | 9.3% | 353 | 11.3% |
| STR | vulnerable | 2128 | 2128 | 14.9% | 1395 | 22.3% |
| STR | ordinary_plus | 27590 | 27590 | 17.5% | 15299 | 26.5% |
| MNY | critical | 3781 | 3781 | 16.8% | 2191 | 19.6% |
| MNY | vulnerable | 4543 | 4543 | 15.4% | 2662 | 21.6% |
| MNY | ordinary_plus | 21974 | 21974 | 17.5% | 12194 | 27.9% |
| SPR | critical | 3228 | 3228 | 25.6% | 1429 | 41.1% |
| SPR | vulnerable | 1992 | 1992 | 19.7% | 1078 | 32.7% |
| SPR | ordinary_plus | 25078 | 25078 | 15.8% | 14540 | 23.9% |

**Ages 50-64**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 192 | 192 | 0.5% | 145 | 0.0% |
| CHR | vulnerable | 1400 | 1400 | 2.4% | 1091 | 0.3% |
| CHR | ordinary_plus | 20377 | 20377 | 3.4% | 10677 | 0.6% |
| INT | vulnerable | 1 | 1 | 0.0% | 0 | n/a |
| INT | ordinary_plus | 21968 | 21968 | 3.3% | 11913 | 0.5% |
| STR | critical | 1335 | 1335 | 11.5% | 879 | 6.9% |
| STR | vulnerable | 3101 | 3101 | 1.9% | 1987 | 0.2% |
| STR | ordinary_plus | 17533 | 17533 | 2.9% | 9047 | 0.0% |
| MNY | critical | 5956 | 5956 | 2.8% | 3442 | 0.4% |
| MNY | vulnerable | 5185 | 5185 | 3.5% | 2912 | 0.5% |
| MNY | ordinary_plus | 10828 | 10828 | 3.4% | 5559 | 0.6% |
| SPR | critical | 222 | 222 | 5.4% | 46 | 0.0% |
| SPR | vulnerable | 210 | 210 | 3.3% | 64 | 0.0% |
| SPR | ordinary_plus | 21537 | 21537 | 3.3% | 11803 | 0.5% |

**Ages 65+**

| Stat | Band | Person-years | Observed | P(ending) | Uncommitted n | P(commitment) |
|---|---|---|---|---|---|---|
| CHR | critical | 21998 | 19053 | 4.5% | 13839 | 4.8% |
| CHR | vulnerable | 7614 | 7233 | 4.0% | 4719 | 3.6% |
| CHR | ordinary_plus | 32367 | 31438 | 6.4% | 15510 | 5.8% |
| INT | ordinary_plus | 61979 | 57724 | 5.5% | 34068 | 5.1% |
| STR | critical | 21983 | 18947 | 12.0% | 12352 | 11.7% |
| STR | vulnerable | 13152 | 12401 | 4.1% | 7751 | 3.6% |
| STR | ordinary_plus | 26844 | 26376 | 1.4% | 13965 | 0.0% |
| MNY | critical | 19344 | 18007 | 6.3% | 11367 | 5.8% |
| MNY | vulnerable | 14139 | 13271 | 6.2% | 7771 | 6.2% |
| MNY | ordinary_plus | 28496 | 26446 | 4.6% | 14930 | 4.0% |
| SPR | critical | 2 | 2 | 0.0% | 0 | n/a |
| SPR | vulnerable | 10 | 10 | 0.0% | 0 | n/a |
| SPR | ordinary_plus | 61967 | 57712 | 5.5% | 34068 | 5.1% |

## 8. Stat ecology

Snapshots taken **entering** each age, including only runs still active then. `final` mixes a 25-year-old’s final state with a 120-year-old’s and is not comparable to a fixed-age row.

### H2B.1A working canonical balance (LOW applied) — mean drift from post-setup start

| Snapshot | Active runs | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start (post-setup) | 3000 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| age 18 | 3000 | 4.04 | 9.32 | 2.73 | 0.22 | 5.67 |
| age 25 | 2980 | 5.94 | 10.50 | 4.04 | 1.90 | 6.11 |
| age 35 | 2524 | 8.45 | 11.71 | 5.96 | 3.35 | 5.62 |
| age 50 | 1539 | 9.34 | 12.86 | 5.65 | 0.49 | 11.77 |
| age 65 | 1430 | 8.13 | 12.95 | 3.64 | -0.06 | 24.43 |
| final | 3000 | 4.74 | 12.20 | 1.53 | 1.21 | 15.15 |

### H2B.1A working canonical balance (LOW applied) — share ≥15

| Snapshot | Active runs | CHR | INT | STR | MNY | SPR |
|---|---|---|---|---|---|---|
| start (post-setup) | 3000 | 0.4% | 0.0% | 0.9% | 0.3% | 1.4% |
| age 18 | 3000 | 14.9% | 41.3% | 9.1% | 0.0% | 54.2% |
| age 25 | 2980 | 19.5% | 42.8% | 16.9% | 2.3% | 49.3% |
| age 35 | 2524 | 27.1% | 49.9% | 27.9% | 9.0% | 42.0% |
| age 50 | 1539 | 32.9% | 57.0% | 25.0% | 3.6% | 63.4% |
| age 65 | 1430 | 26.9% | 57.6% | 13.1% | 4.8% | 96.2% |
| final | 3000 | 22.6% | 51.7% | 16.6% | 4.4% | 68.7% |

### H2B.1A working canonical balance (LOW applied) — authored deltas per 1 000 run-years

| Stat | + deltas | + magnitude | − deltas | − magnitude | Final lower | Final equal | Final higher |
|---|---|---|---|---|---|---|---|
| CHR | 113.0 | 126.6 | 63.3 | -63.5 | 24.2% | 3.5% | 72.3% |
| INT | 157.9 | 179.5 | 6.7 | -10.9 | 0.0% | 0.0% | 100.0% |
| STR | 84.7 | 108.6 | 87.4 | -87.4 | 34.2% | 2.7% | 63.1% |
| MNY | 99.4 | 144.0 | 113.8 | -131.4 | 36.2% | 6.5% | 57.3% |
| SPR | 355.1 | 400.3 | 180.9 | -190.9 | 6.8% | 2.3% | 90.9% |

## 9. Endings and routes

### H2B.1A working canonical balance (LOW applied)

| Route family | Endings | Share of completions | Median age |
|---|---|---|---|
| `INS/MED` | 965 | 44.9% | 46 |
| `SPC/ANO` | 235 | 10.9% | 41 |
| `ORD/FAM` | 213 | 9.9% | 67 |
| `INS/CIV` | 139 | 6.5% | 43 |
| `INS/FIN` | 101 | 4.7% | 30 |
| `INS/ARC` | 82 | 3.8% | 40 |
| `faction:CRI` | 82 | 3.8% | 29 |
| `INS/MUS` | 79 | 3.7% | 45 |
| `INS/REL` | 63 | 2.9% | 46 |
| `faction:Meridian` | 54 | 2.5% | 26 |
| `faction:Last Posture` | 46 | 2.1% | 28 |
| `TRN/TEMP` | 40 | 1.9% | 37 |
| `faction:Black Ledger` | 22 | 1.0% | 30 |
| `INS/COR` | 11 | 0.5% | 36 |
| `faction:DMMS` | 8 | 0.4% | 26 |
| `faction:Everlasting Mutual` | 6 | 0.3% | 31 |
| `INS/ACA` | 3 | 0.1% | 50 |

_All registry endings observed._

**Guardrail findings**

| Severity | ID | Finding |
|---|---|---|
| WARNING | `fallback-share` | Age-25+ fallback share 8.3% exceeds the warning threshold 5.0% (target 2.0%). |
| WARNING | `ending-age-share-18-24` | Ending age band 18-24: observed 0.9% vs target 18-22%. |
| WARNING | `ending-age-share-25-34` | Ending age band 25-34: observed 21.2% vs target 35-40%. |
| WARNING | `ending-age-share-35-44` | Ending age band 35-44: observed 35.2% vs target 20-25%. |
| WARNING | `ending-age-share-45-54` | Ending age band 45-54: observed 14.0% vs target 8-12%. |
| WARNING | `ending-age-share-55-64` | Ending age band 55-64: observed 1.7% vs target 4-7%. |
| WARNING | `ending-age-share-65+` | Ending age band 65+: observed 26.9% vs target 2-5%. |
| WARNING | `nonterminal-rate` | 851/3000 runs (28.4%) reached the diagnostic maximum age without an ending. |

## 10. Financial maturation (A-01 / A-02)

A rescue removes the vulnerability that made the offer attractive. It does not remove the lien. The buyout is now `TLT[T1013] | MNY>=10`; everything else keeps the obligation and matures into `EVT-INS-FIN-2004`.

| Arm | Rescue | Follow-up | Bought out | Obligation survived | Maturation | Mean maturation age | Finance climax |
|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 329 | 184 | 6 (3.3%) | 178 | 156 (5.2%) | 25.8 | 101 |

**H2B.1A working canonical balance (LOW applied)** — maturation branches and committed material

| Branch | Runs | Share |
|---|---|---|
| `MAT!=NONE` | 9 | 5.8% |
| `MAT=NONE & FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | 7 | 4.5% |
| `MAT=NONE & FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | 6 | 3.8% |
| `MAT=NONE & FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | 12 | 7.7% |
| `MAT=NONE & FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | 11 | 7.1% |
| `MAT=NONE & FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_SYNT]` | 6 | 3.8% |
| `MAT=NONE & FLAG[MAT_MANIFEST_CERA] & !FLAG[MAT_MANIFEST_STON] & !FLAG[MAT_MANIFEST_METL] & !FLAG[MAT_MANIFEST_CRYS] & !FLAG[MAT_MANIFEST_WOOD] & !FLAG[MAT_MANIFEST_GLAS] & !FLAG[MAT_MANIFEST_SYNT]` | 10 | 6.4% |
| `TRUE` | 95 | 60.9% |

| Outcome | Runs |
|---|---|
| ambiguous — none | 95 |
| CRYS | 12 |
| WOOD | 11 |
| CERA | 10 |
| already committed | 9 |
| STON | 7 |
| GLAS | 6 |
| METL | 6 |

| Ending (secured-debt runs) | Runs |
|---|---|
| `END-FIN-003` | 66 |
| `END-FIN-001` | 33 |
| `END-MED-003` | 22 |
| `END-MED-001` | 20 |
| `END-ANO-002` | 8 |
| `END-CIV-001` | 8 |
| `END-ANO-001` | 7 |
| `END-TMP-001` | 7 |
| `END-ARC-001` | 6 |
| `END-FAM-002` | 5 |
| `END-REL-001` | 3 |
| `END-FIN-002` | 2 |
| `END-COR-001` | 1 |
| `END-MUS-002` | 1 |
| `END-MED-002` | 1 |
| `END-FAM-001` | 1 |
| `END-CIV-002` | 1 |
| `END-MUS-004` | 1 |
| `END-ACA-001` | 1 |
| `END-LEG-002` | 1 |

## 11. Black Ledger (A-03)

Escalation now depends on the DEBTOR obligation plus FIX/material evidence rather than on the protagonist remaining poor. Wealth and Property Lawyer still permit a genuine pre-COMMITTED opt-out.

| Arm | Contact | ENGAGED | COMMITTED | OPTED_OUT | CLOSED | Endings | Mean COMMITTED age | DEBTOR at escalation |
|---|---|---|---|---|---|---|---|---|
| **H2B.1A working canonical balance (LOW applied)** | 98 | 84 | 22 (0.7%) | 72 | 3 | 22 (0.7%) | 28.2 | 22 |

## 12. State triggers (A-04)

Data-driven triggers declared in `content/balance/SOLID_STATE_STATE_TRIGGERS_v0.1.json`. A trigger may only enqueue an authored future event, never an ending, and duplicate suppression means one pending review at a time. Nothing is stored between years.

**H2B.1A working canonical balance (LOW applied)**

_No trigger fired._

65+ survivors that ever sat at STR ≤ −3: **355**, of which **355** saw a Continuity Review (**100.0%**).

## 13. Stat contributor audit (A-12)

Ranked authored CHR / INT / SPR contributors by event variant, age band and total magnitude. **Report only — no stat effect was edited in H2B.1A.** This is the input to the later Stat Ecology correction.

### H2B.1A working canonical balance (LOW applied)

**CHR · ages 0-17**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-SOC-0001` | 1 | +1 | 4628 | +4628 | You make a friend at school. You agree that neither of you wants to b… |
| `EVT-ORD-SOC-0002` | 1 | +1 | 4309 | +4309 | You spend more time with classmates after school. Someone starts a ru… |
| `EVT-ORD-SOC-0009` | 1 | +1 | 2326 | +2326 | You make a first friend and immediately establish several rules that … |
| `EVT-ORD-EDU-0006` | 1 | +1 | 512 | +512 | You are cast as a statue in the school play because you can stand sti… |
| `EVT-INS-EDU-0005` | 1 | +1 | 318 | +318 | The school updates its uniform policy to permit horns. The helmet req… |
| `EVT-SPC-SECR-0002` | 1 | +1 | 29 | +29 | Meridian Preservation Group offers your graduating class a “best year… |

**CHR · ages 18-34**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-CIV-0002` | 1 | +2 | 942 | +1884 | You become unexpectedly visible in a local civic campaign. Someone de… |
| `EVT-TRN-CERA-0001` | 1 | +2 | 801 | +1602 | A smooth porcelain-like patch appears along your collarbone and resis… |
| `EVT-ORD-SOC-0007` | 2 | +1 | 1328 | +1328 | You go on a few dates. One person asks about your future Permanent Fo… |
| `EVT-TRN-CRYS-0001` | 2 | +1 | 1308 | +1308 | Thin crystalline lines appear beneath your skin. The clinic asks you … |
| `EVT-TRN-GLAS-0001` | 2 | +1 | 1131 | +1131 | A translucent glassy patch forms around one wrist and fades only slig… |
| `EVT-ORD-SOC-0007` | 1 | +1 | 849 | +849 | Dating becomes easier than deciding what to write under 'long-term mo… |
| `EVT-TRN-GLAS-0001` | 1 | +2 | 282 | +564 | A dark glassy patch forms around one wrist and reflects light like po… |
| `EVT-TRN-CERA-0001` | 2 | +1 | 475 | +475 | A pale ceramic patch appears along your collarbone and gives a faint … |
| `EVT-INS-CIV-0007` | 2 | -1 | 8 | -8 | The civic campaign that promoted you quietly changes its name, colors… |
| `EVT-INS-CIV-0007` | 1 | -2 | 3 | -6 | The civic campaign that promoted you becomes politically inconvenient… |

**CHR · ages 35-64**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-SOC-0003` | 1 | +1 | 957 | +957 | Several friends begin discussing whether they should preserve themsel… |
| `EVT-INS-CIV-0005` | 1 | +1 | 470 | +470 | Officials propose recognizing your public service through the Civic L… |
| `EVT-ORD-CIV-0002` | 1 | +2 | 202 | +404 | You become unexpectedly visible in a local civic campaign. Someone de… |
| `EVT-TRN-CRYS-0002` | 2 | +2 | 173 | +346 | The crystalline lines stop receding and lock into a permanent lattice… |
| `EVT-INS-MUS-0001` | 2 | +1 | 157 | +157 | A museum curator asks whether you have ever considered long-term pres… |
| `EVT-TRN-CERA-0002` | 2 | +1 | 119 | +119 | The ceramic surface stops receding and becomes structurally permanent… |
| `EVT-TRN-GLAS-0002` | 2 | +1 | 104 | +104 | The glassy patch at your wrist becomes permanent and begins spreading… |
| `EVT-TRN-GLAS-0002` | 1 | +2 | 45 | +90 | The dark glass at your wrist stops fading and spreads in a clean obsi… |
| `EVT-ORD-SOC-0004` | 1 | -1 | 1407 | -1407 | You attend another reunion and are once again the only person who arr… |
| `EVT-INS-CIV-0007` | 2 | -1 | 429 | -429 | The civic campaign that promoted you quietly changes its name, colors… |
| `EVT-INS-CIV-0007` | 1 | -2 | 50 | -100 | The civic campaign that promoted you becomes politically inconvenient… |

**CHR · ages 65+**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-SOC-0004` | 1 | -1 | 11835 | -11835 | You attend another reunion and are once again the only person who arr… |

**INT · ages 0-17**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-EDU-0007` | 1 | +2 | 1916 | +3832 | You take an advanced elective. The teacher warns that university cred… |
| `EVT-ORD-EDU-0005` | 2 | +1 | 3397 | +3397 | Exam season arrives again. You study hard enough to recognize several… |
| `EVT-ORD-GEN-0004` | 1 | +1 | 3082 | +3082 | Another year is mostly spent growing, falling down, making demands wi… |
| `EVT-ORD-EDU-0004` | 2 | +1 | 2288 | +2288 | Another school year passes. You learn several useful things and one o… |
| `EVT-ORD-EDU-0001` | 1 | +1 | 1958 | +1958 | You start school. Your first timetable includes mathematics, language… |
| `EVT-ORD-EDU-0002` | 1 | +2 | 923 | +1846 | You score unusually well on a standardized aptitude test. Several adu… |
| `EVT-ORD-EDU-0006` | 2 | +1 | 1835 | +1835 | You join an after-school club and discover that adults will supervise… |
| `EVT-ORD-EDU-0004` | 1 | +1 | 1546 | +1546 | Another school year ends with excellent marks. The school recommends … |

**INT · ages 18-34**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-CIV-0002` | 2 | +1 | 984 | +984 | You volunteer for a local civic program. Most of the work consists of… |
| `EVT-INS-ACA-0001` | 2 | +1 | 798 | +798 | A research institute recruits you for a study on Permanent Form conti… |
| `EVT-ORD-CAR-0002` | 2 | +1 | 507 | +507 | You spend another year learning how work actually functions. This kno… |
| `EVT-SPC-REIN-0001` | 1 | +2 | 216 | +432 | A place you have never visited feels familiar enough that you remembe… |
| `EVT-ORD-CAR-0004` | 1 | +1 | 411 | +411 | You change jobs for better pay. The new employer promises a 'modern a… |
| `EVT-INS-REL-0001` | 4 | +1 | 383 | +383 | A local religious group distributes a leaflet explaining the spiritua… |
| `EVT-ORD-EDU-0003` | 1 | +1 | 339 | +339 | You graduate with excellent marks. Several institutions congratulate … |
| `EVT-INS-ACA-0008` | 2 | +3 | 86 | +258 | You complete a comparative-material rotation involving crystallizatio… |

**INT · ages 35-64**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-FAM-0007` | 1 | +1 | 1635 | +1635 | A younger relative asks whether your committed material means you wil… |
| `EVT-INS-ACA-0002` | 1 | +2 | 279 | +558 | The Continuity Research Institute invites you into a temporal study. … |
| `EVT-INS-ACA-0009` | 2 | +3 | 103 | +309 | You work on studies comparing unconscious Permanent Forms, temporal s… |
| `EVT-ORD-CAR-0004` | 1 | +1 | 229 | +229 | You change jobs for better pay. The new employer promises a 'modern a… |
| `EVT-INS-ACA-0007` | 1 | +2 | 114 | +228 | Your research shifts toward continuity of identity: temporal suspensi… |
| `EVT-INS-MED-0007` | 1 | +1 | 129 | +129 | A clinic asks you to file maintenance directives for your committed m… |
| `EVT-INS-ACA-0008` | 2 | +3 | 38 | +114 | You complete a comparative-material rotation involving crystallizatio… |
| `EVT-SPC-ANO-0004` | 1 | +1 | 107 | +107 | A continuity examination records an impossible mismatch: your Permane… |
| `EVT-ORD-GEN-2001` | 1 | -2 | 920 | -1840 | A professional system you know inside out is replaced by one designed… |
| `EVT-ORD-GEN-2001` | 2 | -1 | 522 | -522 | Several procedures you once knew by memory are replaced by new ones. … |

**INT · ages 65+**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-FAM-0007` | 1 | +1 | 279 | +279 | A younger relative asks whether your committed material means you wil… |
| `EVT-ORD-GEN-2001` | 2 | -1 | 9 | -9 | Several procedures you once knew by memory are replaced by new ones. … |
| `EVT-ORD-GEN-2001` | 1 | -2 | 1 | -2 | A professional system you know inside out is replaced by one designed… |

**SPR · ages 0-17**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-SOC-0001` | 1 | +1 | 4628 | +4628 | You make a friend at school. You agree that neither of you wants to b… |
| `EVT-ORD-SOC-0002` | 1 | +1 | 4309 | +4309 | You spend more time with classmates after school. Someone starts a ru… |
| `EVT-ORD-SOC-0009` | 1 | +1 | 2326 | +2326 | You make a first friend and immediately establish several rules that … |
| `EVT-ORD-HEA-0003` | 1 | +1 | 2076 | +2076 | A routine pediatric checkup confirms that you are developing normally… |
| `EVT-ORD-EDU-0006` | 2 | +1 | 1835 | +1835 | You join an after-school club and discover that adults will supervise… |
| `EVT-ORD-EDU-0007` | 2 | +1 | 1536 | +1536 | You take an elective mostly because your friends are there. It become… |
| `EVT-INS-CIV-0001` | 1 | +1 | 1525 | +1525 | Your birth certificate includes a blank for expected post-mobility ma… |
| `EVT-ORD-HOU-0003` | 1 | +1 | 1472 | +1472 | Around your arrival and early growth, your household rearranges rooms… |
| `EVT-ORD-EDU-0007` | 1 | -1 | 1916 | -1916 | You take an advanced elective. The teacher warns that university cred… |
| `EVT-ORD-EDU-0004` | 1 | -1 | 1546 | -1546 | Another school year ends with excellent marks. The school recommends … |
| `EVT-ORD-EDU-0002` | 1 | -1 | 923 | -923 | You score unusually well on a standardized aptitude test. Several adu… |
| `EVT-ORD-EDU-0005` | 1 | -1 | 700 | -700 | Exam season arrives again. Your school reminds students that stress-r… |
| `EVT-TRN-WOOD-0001` | 2 | -1 | 425 | -425 | Two fingers turn wooden during an exam and return to normal before lu… |
| `EVT-INS-EDU-0003` | 4 | -1 | 330 | -330 | Your career counselor suggests finance because of your 'natural relat… |
| `EVT-INS-EDU-0003` | 1 | -1 | 318 | -318 | Your career counselor recommends construction before asking what you … |
| `EVT-INS-EDU-0005` | 1 | -1 | 318 | -318 | The school updates its uniform policy to permit horns. The helmet req… |

**SPR · ages 18-34**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-SOC-0006` | 2 | +2 | 1347 | +2694 | You meet friends for dinner and spend most of the evening discussing … |
| `EVT-ORD-HEA-0002` | 2 | +1 | 2038 | +2038 | You become temporarily serious about exercise. Your body responds bet… |
| `EVT-ORD-FAM-0003` | 2 | +1 | 1675 | +1675 | Your family casually discusses future Permanent Form arrangements ove… |
| `EVT-ORD-SOC-0007` | 2 | +1 | 1328 | +1328 | You go on a few dates. One person asks about your future Permanent Fo… |
| `EVT-INS-MED-0001` | 3 | +1 | 1095 | +1095 | An adult Fixation screening finds nothing urgent. The clinic recommen… |
| `EVT-ORD-CAR-0008` | 1 | +1 | 1023 | +1023 | A second screening confirms cumulative hardening, and you are reassig… |
| `EVT-ORD-CIV-0002` | 2 | +1 | 984 | +984 | You volunteer for a local civic program. Most of the work consists of… |
| `EVT-ORD-HEA-0002` | 1 | +1 | 873 | +873 | You attempt to get into better shape. Progress is slow, measurable, a… |
| `EVT-TRN-TEMP-0001` | 2 | -2 | 1113 | -2226 | For eleven seconds, your reflection stops moving before you do. The c… |
| `EVT-TRN-STON-0001` | 2 | -1 | 1310 | -1310 | A patch of skin at your shoulder hardens into smooth stone and slowly… |
| `EVT-TRN-CRYS-0001` | 2 | -1 | 1308 | -1308 | Thin crystalline lines appear beneath your skin. The clinic asks you … |
| `EVT-TRN-GLAS-0001` | 2 | -1 | 1131 | -1131 | A translucent glassy patch forms around one wrist and fades only slig… |
| `EVT-ORD-CAR-0007` | 1 | -1 | 1127 | -1127 | Your annual occupational screening finds small but measurable fixatio… |
| `EVT-TRN-METL-0001` | 2 | -1 | 1090 | -1090 | A metallic sheen appears beneath your skin whenever you are tired. Th… |
| `EVT-ORD-CAR-0004` | 2 | -1 | 1003 | -1003 | Your work becomes more complicated without becoming more important. Y… |
| `EVT-TRN-WOOD-0002` | 2 | -1 | 954 | -954 | Fine wood grain appears along your forearms and fades only partially.… |

**SPR · ages 35-64**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-ORD-FAM-0005` | 1 | +2 | 3143 | +6286 | A family gathering lasts longer than planned. Nobody discusses preser… |
| `EVT-ORD-HEA-0001` | 2 | +1 | 3865 | +3865 | A routine checkup finds nothing immediately alarming. The doctor cong… |
| `EVT-ORD-FAM-0007` | 2 | +2 | 1928 | +3856 | A younger relative asks why you are still mobile. You give a simpler … |
| `EVT-ORD-GEN-0002` | 1 | +1 | 2773 | +2773 | You reorganize part of your life for reasons that feel important at t… |
| `EVT-ORD-CAR-0003` | 2 | +1 | 1903 | +1903 | Another working year passes without permanent conversion. A younger c… |
| `EVT-ORD-FAM-0007` | 1 | +1 | 1635 | +1635 | A younger relative asks whether your committed material means you wil… |
| `EVT-ORD-SOC-0008` | 2 | +1 | 1419 | +1419 | You reconnect with an old friend. Both of you have acquired enough pa… |
| `EVT-INS-CIV-0002` | 2 | +1 | 1381 | +1381 | A government survey asks why you remain mobile past the national medi… |
| `EVT-TRN-TEMP-0001` | 2 | -2 | 719 | -1438 | For eleven seconds, your reflection stops moving before you do. The c… |
| `EVT-ORD-SOC-0003` | 1 | -1 | 957 | -957 | Several friends begin discussing whether they should preserve themsel… |
| `EVT-ORD-GEN-2001` | 1 | -1 | 920 | -920 | A professional system you know inside out is replaced by one designed… |
| `EVT-ORD-CAR-0004` | 2 | -1 | 593 | -593 | Your work becomes more complicated without becoming more important. Y… |
| `EVT-INS-CIV-0005` | 1 | -1 | 470 | -470 | Officials propose recognizing your public service through the Civic L… |
| `EVT-INS-LEG-0002` | 2 | -1 | 323 | -323 | A routine Material Status filing asks whether your committed material… |
| `EVT-INS-MED-0009` | 1 | -1 | 306 | -306 | The second stabilization session fixes a wider band of tissue. Your p… |
| `EVT-INS-ACA-0002` | 1 | -1 | 279 | -279 | The Continuity Research Institute invites you into a temporal study. … |

**SPR · ages 65+**

| Event | Variant | Δ | Occurrences | Total magnitude | Text |
|---|---|---|---|---|---|
| `EVT-INS-MED-2001` | 1 | +1 | 988 | +988 | Your basic insurer opens a Functional Continuity Review after your he… |
| `EVT-ORD-FAM-0007` | 2 | +2 | 376 | +752 | A younger relative asks why you are still mobile. You give a simpler … |
| `EVT-INS-MED-2002` | 4 | +1 | 691 | +691 | The insurer approves a covered stabilization course. Your strength im… |
| `EVT-ORD-FAM-0010` | 1 | +1 | 457 | +457 | Your family starts treating future placement as an inheritance questi… |
| `EVT-ORD-FAM-0007` | 1 | +1 | 279 | +279 | A younger relative asks whether your committed material means you wil… |
| `EVT-INS-MED-2003` | 1 | +1 | 231 | +231 | The covered stabilization course improves your mobility enough that p… |
| `EVT-INS-CIV-0002` | 1 | +1 | 51 | +51 | A government survey classifies you as an Older Mobile Citizen. The ca… |
| `EVT-INS-FIN-0003` | 2 | +1 | 30 | +30 | Your insurer requests confirmation that you are still capable of move… |
| `EVT-INS-CIV-0009` | 2 | -1 | 1386 | -1386 | Your identity card renewal requires an additional mobility declaratio… |
| `EVT-ORD-GEN-2001` | 1 | -1 | 1 | -1 | A professional system you know inside out is replaced by one designed… |
