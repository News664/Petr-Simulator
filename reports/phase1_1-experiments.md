# SOLID STATE — Phase 1.1 Experiment Matrix Results

**Measurements only.** No threshold profile is selected, no baseline is switched,
and no creative content was tuned to produce these numbers.

| Field | Value |
|---|---|
| Generated at | 2026-08-13T02:13:36.231Z |
| Content fingerprint | `63ac31e8d496ec3688f75b52752c5b79…` |
| Balance constants | v0.2 |
| Experiment matrix | v0.1 |
| Runs per arm | 4000 |
| Base seed | `phase1_1` |

## threshold_sweep

FIX gate profiles from the Phase 1.1 experiment matrix, under the uniform-family design baseline and balanced allocation. Experiment inputs only — no profile is selected here.

| Arm | threshold | familyWeightMode | allocation | gatesRewritten |
|---|---|---|---|---|
| LOW | LOW | uniform | BALANCED_RANDOM_FILL | 31 |
| MID | MID | uniform | BALANCED_RANDOM_FILL | 31 |
| HIGH | HIGH | uniform | BALANCED_RANDOM_FILL | 31 |
| ORIGINAL_REFERENCE | ORIGINAL_REFERENCE | uniform | BALANCED_RANDOM_FILL | 31 |

| Arm | Completed | Nonterminal | Coverage defect | Committed | Commit age | Median end age | 65+ endings | Fallback 25+ | Route climax | Endings seen |
|---|---|---|---|---|---|---|---|---|---|---|
| LOW | 64.0% | 36.0% | 0.0% | 68.0% | 36.1 | 43.0 | 23.7% | 24.0% | 64.0% | 23/24 |
| MID | 47.7% | 52.3% | 0.0% | 57.4% | 36.5 | 43.0 | 17.8% | 27.7% | 47.7% | 21/24 |
| HIGH | 35.8% | 64.2% | 0.0% | 47.4% | 36.8 | 43.0 | 19.2% | 29.5% | 35.8% | 22/24 |
| ORIGINAL_REFERENCE | 9.9% | 90.1% | 0.0% | 40.8% | 36.9 | 45.0 | 34.5% | 32.0% | 9.9% | 13/24 |

Ending-age bands against target:

| Arm | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ |
|---|---|---|---|---|---|---|
| LOW | 0.0% | 7.9% | 49.4% | 17.1% | 1.8% | 23.7% |
| MID | 0.0% | 7.0% | 52.5% | 20.8% | 1.9% | 17.8% |
| HIGH | 0.0% | 6.9% | 53.6% | 18.5% | 1.7% | 19.2% |
| ORIGINAL_REFERENCE | 0.0% | 4.8% | 41.3% | 16.4% | 3.0% | 34.5% |

Targets: 18-24 18%–22% · 25-34 35%–40% · 35-44 20%–25% · 45-54 8%–12% · 55-64 4%–7% · 65+ 2%–5%

Final FIX distribution:

| Arm | p50 | p90 | p99 | max |
|---|---|---|---|---|
| LOW | 37 | 43 | 51 | 66 |
| MID | 39 | 45 | 52 | 64 |
| HIGH | 39 | 47 | 53 | 61 |
| ORIGINAL_REFERENCE | 36 | 49 | 55 | 70 |

Guardrail findings:

- `LOW` — **warning** fallback-share: Age-25+ fallback share 24.0% exceeds the warning threshold 5.0% (target 2.0%).
- `LOW` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `LOW` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 7.9% vs target 35-40%.
- `LOW` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 49.4% vs target 20-25%.
- `LOW` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 17.1% vs target 8-12%.
- `LOW` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.8% vs target 4-7%.
- `LOW` — **warning** ending-age-share-65+: Ending age band 65+: observed 23.7% vs target 2-5%.
- `LOW` — **warning** nonterminal-rate: 1441/4000 runs (36.0%) reached the diagnostic maximum age without an ending.
- `MID` — **warning** fallback-share: Age-25+ fallback share 27.7% exceeds the warning threshold 5.0% (target 2.0%).
- `MID` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `MID` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 7.0% vs target 35-40%.
- `MID` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 52.5% vs target 20-25%.
- `MID` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 20.8% vs target 8-12%.
- `MID` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.9% vs target 4-7%.
- `MID` — **warning** ending-age-share-65+: Ending age band 65+: observed 17.8% vs target 2-5%.
- `MID` — **failure** nonterminal-rate: 2092/4000 runs (52.3%) reached the diagnostic maximum age without an ending.
- `HIGH` — **warning** fallback-share: Age-25+ fallback share 29.5% exceeds the warning threshold 5.0% (target 2.0%).
- `HIGH` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `HIGH` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 6.9% vs target 35-40%.
- `HIGH` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 53.6% vs target 20-25%.
- `HIGH` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 18.5% vs target 8-12%.
- `HIGH` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.7% vs target 4-7%.
- `HIGH` — **warning** ending-age-share-65+: Ending age band 65+: observed 19.2% vs target 2-5%.
- `HIGH` — **failure** nonterminal-rate: 2569/4000 runs (64.2%) reached the diagnostic maximum age without an ending.
- `ORIGINAL_REFERENCE` — **warning** fallback-share: Age-25+ fallback share 32.0% exceeds the warning threshold 5.0% (target 2.0%).
- `ORIGINAL_REFERENCE` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `ORIGINAL_REFERENCE` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 4.8% vs target 35-40%.
- `ORIGINAL_REFERENCE` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 41.3% vs target 20-25%.
- `ORIGINAL_REFERENCE` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 16.4% vs target 8-12%.
- `ORIGINAL_REFERENCE` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 3.0% vs target 4-7%.
- `ORIGINAL_REFERENCE` — **warning** ending-age-share-65+: Ending age band 65+: observed 34.5% vs target 2-5%.
- `ORIGINAL_REFERENCE` — **failure** nonterminal-rate: 3603/4000 runs (90.1%) reached the diagnostic maximum age without an ending.

## family_weight_ab

Design baseline is uniform eligible family. `sum_of_event_weights` is retained only as this comparison and must not become the baseline without a design decision.

| Arm | threshold | familyWeightMode | allocation |
|---|---|---|---|
| uniform (design baseline) | MID | uniform | BALANCED_RANDOM_FILL |
| sum_of_event_weights (diagnostic) | MID | sum_of_event_weights | BALANCED_RANDOM_FILL |

| Arm | Completed | Nonterminal | Coverage defect | Committed | Commit age | Median end age | 65+ endings | Fallback 25+ | Route climax | Endings seen |
|---|---|---|---|---|---|---|---|---|---|---|
| uniform (design baseline) | 49.1% | 50.8% | 0.0% | 58.4% | 36.3 | 43.0 | 20.2% | 27.4% | 49.1% | 23/24 |
| sum_of_event_weights (diagnostic) | 51.2% | 48.8% | 0.0% | 61.1% | 36.6 | 42.0 | 15.1% | 27.4% | 51.2% | 22/24 |

Ending-age bands against target:

| Arm | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ |
|---|---|---|---|---|---|---|
| uniform (design baseline) | 0.0% | 8.3% | 50.7% | 19.1% | 1.7% | 20.2% |
| sum_of_event_weights (diagnostic) | 0.0% | 8.9% | 56.0% | 18.5% | 1.5% | 15.1% |

Targets: 18-24 18%–22% · 25-34 35%–40% · 35-44 20%–25% · 45-54 8%–12% · 55-64 4%–7% · 65+ 2%–5%

Final FIX distribution:

| Arm | p50 | p90 | p99 | max |
|---|---|---|---|---|
| uniform (design baseline) | 39 | 45 | 52 | 64 |
| sum_of_event_weights (diagnostic) | 39 | 45 | 52 | 64 |

Family distribution by channel (age 25–34 band):

**uniform (design baseline)** — ORD/CAR 6120, ORD/SOC 3255, INS/ACA 2771, ORD/HOU 2687, ORD/HEA 2324, INS/MED 2002, ORD/FAM 1664, INS/FIN 1571, TRN/CRYS 1497, TRN/GLAS 1494, TRN/STON 1475, TRN/METL 1456, TRN/TEMP 1442, TRN/WOOD 1409, ORD/CIV 1377, TRN/CERA 1366, INS/CIV 1258, INS/MUS 1253, INS/LEG 775, INS/REL 682, INS/COR 673, ORD/FIN 647, SPC/REIN 173, SPC/TLNT 157, SPC/ANO 77, INS/ARC 36, TRN/SYNT 29, TRN/MIXD 1

**sum_of_event_weights (diagnostic)** — ORD/CAR 6343, ORD/SOC 3727, INS/ACA 3199, INS/MED 2475, ORD/HOU 2344, ORD/HEA 2183, ORD/FAM 1614, TRN/STON 1574, TRN/CRYS 1505, TRN/GLAS 1491, TRN/METL 1452, TRN/CERA 1416, TRN/WOOD 1388, ORD/CIV 1329, INS/COR 1292, INS/FIN 1233, TRN/TEMP 1142, INS/MUS 1036, INS/CIV 840, INS/LEG 739, INS/REL 616, ORD/FIN 244, SPC/TLNT 157, SPC/REIN 148, TRN/SYNT 62, SPC/ANO 54, INS/ARC 20

Material distribution and entropy:

| Arm | Entropy (bits) | Committed | Top materials |
|---|---|---|---|
| uniform (design baseline) | 2.78 | 58.4% | STON 348, CRYS 344, GLAS 311, METL 298, SYNT 271 |
| sum_of_event_weights (diagnostic) | 2.86 | 61.1% | STON 358, SYNT 352, CRYS 324, METL 322, GLAS 290 |

Guardrail findings:

- `uniform (design baseline)` — **warning** fallback-share: Age-25+ fallback share 27.4% exceeds the warning threshold 5.0% (target 2.0%).
- `uniform (design baseline)` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `uniform (design baseline)` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 8.3% vs target 35-40%.
- `uniform (design baseline)` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 50.7% vs target 20-25%.
- `uniform (design baseline)` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 19.1% vs target 8-12%.
- `uniform (design baseline)` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.7% vs target 4-7%.
- `uniform (design baseline)` — **warning** ending-age-share-65+: Ending age band 65+: observed 20.2% vs target 2-5%.
- `uniform (design baseline)` — **failure** nonterminal-rate: 2034/4000 runs (50.8%) reached the diagnostic maximum age without an ending.
- `sum_of_event_weights (diagnostic)` — **warning** fallback-share: Age-25+ fallback share 27.4% exceeds the warning threshold 5.0% (target 2.0%).
- `sum_of_event_weights (diagnostic)` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `sum_of_event_weights (diagnostic)` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 8.9% vs target 35-40%.
- `sum_of_event_weights (diagnostic)` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 56.0% vs target 20-25%.
- `sum_of_event_weights (diagnostic)` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 18.5% vs target 8-12%.
- `sum_of_event_weights (diagnostic)` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.5% vs target 4-7%.
- `sum_of_event_weights (diagnostic)` — **warning** ending-age-share-65+: Ending age band 65+: observed 15.1% vs target 2-5%.
- `sum_of_event_weights (diagnostic)` — **warning** nonterminal-rate: 1951/4000 runs (48.8%) reached the diagnostic maximum age without an ending.

## allocation_policy_compare

Q-17: allocation policies are reported separately and never mixed into one headline statistic. Threshold-talent activation differs sharply by policy.

| Arm | threshold | familyWeightMode | allocation |
|---|---|---|---|
| BALANCED_RANDOM_FILL | MID | uniform | BALANCED_RANDOM_FILL |
| MINMAX_PRIMARY_SECONDARY | MID | uniform | MINMAX_PRIMARY_SECONDARY |
| ARCHETYPE_SET | MID | uniform | ARCHETYPE_SET |

| Arm | Completed | Nonterminal | Coverage defect | Committed | Commit age | Median end age | 65+ endings | Fallback 25+ | Route climax | Endings seen |
|---|---|---|---|---|---|---|---|---|---|---|
| BALANCED_RANDOM_FILL | 49.3% | 50.7% | 0.0% | 58.2% | 36.4 | 43.0 | 19.7% | 27.4% | 49.3% | 22/24 |
| MINMAX_PRIMARY_SECONDARY | 48.6% | 51.3% | 0.0% | 58.4% | 36.5 | 43.0 | 19.1% | 27.5% | 48.6% | 22/24 |
| ARCHETYPE_SET | 47.9% | 52.1% | 0.0% | 58.2% | 36.5 | 43.0 | 19.3% | 27.7% | 47.9% | 23/24 |

Ending-age bands against target:

| Arm | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ |
|---|---|---|---|---|---|---|
| BALANCED_RANDOM_FILL | 0.0% | 7.4% | 53.8% | 17.0% | 2.1% | 19.7% |
| MINMAX_PRIMARY_SECONDARY | 0.0% | 7.2% | 52.5% | 19.7% | 1.5% | 19.1% |
| ARCHETYPE_SET | 0.0% | 8.3% | 51.7% | 18.9% | 1.9% | 19.3% |

Targets: 18-24 18%–22% · 25-34 35%–40% · 35-44 20%–25% · 45-54 8%–12% · 55-64 4%–7% · 65+ 2%–5%

Final FIX distribution:

| Arm | p50 | p90 | p99 | max |
|---|---|---|---|---|
| BALANCED_RANDOM_FILL | 39 | 45 | 52 | 64 |
| MINMAX_PRIMARY_SECONDARY | 39 | 45 | 52 | 61 |
| ARCHETYPE_SET | 39 | 45 | 51 | 63 |

Threshold-talent activation by allocation policy:

| Arm | T1002 rate / age | T1007 rate / age | T1009 rate / age | T1017 rate / age |
|---|---|---|---|---|
| BALANCED_RANDOM_FILL | 100% / 3.3 | 94% / 11.5 | 86% / 7.6 | 37% / 96.2 |
| MINMAX_PRIMARY_SECONDARY | 100% / 6.0 | 87% / 11.7 | 70% / 6.4 | 37% / 70.4 |
| ARCHETYPE_SET | 100% / 6.1 | 76% / 18.9 | 69% / 6.2 | 51% / 67.1 |

Guardrail findings:

- `BALANCED_RANDOM_FILL` — **warning** fallback-share: Age-25+ fallback share 27.4% exceeds the warning threshold 5.0% (target 2.0%).
- `BALANCED_RANDOM_FILL` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `BALANCED_RANDOM_FILL` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 7.4% vs target 35-40%.
- `BALANCED_RANDOM_FILL` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 53.8% vs target 20-25%.
- `BALANCED_RANDOM_FILL` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 17.0% vs target 8-12%.
- `BALANCED_RANDOM_FILL` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 2.1% vs target 4-7%.
- `BALANCED_RANDOM_FILL` — **warning** ending-age-share-65+: Ending age band 65+: observed 19.7% vs target 2-5%.
- `BALANCED_RANDOM_FILL` — **failure** nonterminal-rate: 2029/4000 runs (50.7%) reached the diagnostic maximum age without an ending.
- `MINMAX_PRIMARY_SECONDARY` — **warning** fallback-share: Age-25+ fallback share 27.5% exceeds the warning threshold 5.0% (target 2.0%).
- `MINMAX_PRIMARY_SECONDARY` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `MINMAX_PRIMARY_SECONDARY` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 7.2% vs target 35-40%.
- `MINMAX_PRIMARY_SECONDARY` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 52.5% vs target 20-25%.
- `MINMAX_PRIMARY_SECONDARY` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 19.7% vs target 8-12%.
- `MINMAX_PRIMARY_SECONDARY` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.5% vs target 4-7%.
- `MINMAX_PRIMARY_SECONDARY` — **warning** ending-age-share-65+: Ending age band 65+: observed 19.1% vs target 2-5%.
- `MINMAX_PRIMARY_SECONDARY` — **failure** nonterminal-rate: 2054/4000 runs (51.3%) reached the diagnostic maximum age without an ending.
- `ARCHETYPE_SET` — **warning** fallback-share: Age-25+ fallback share 27.7% exceeds the warning threshold 5.0% (target 2.0%).
- `ARCHETYPE_SET` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `ARCHETYPE_SET` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 8.3% vs target 35-40%.
- `ARCHETYPE_SET` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 51.7% vs target 20-25%.
- `ARCHETYPE_SET` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 18.9% vs target 8-12%.
- `ARCHETYPE_SET` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.9% vs target 4-7%.
- `ARCHETYPE_SET` — **warning** ending-age-share-65+: Ending age band 65+: observed 19.3% vs target 2-5%.
- `ARCHETYPE_SET` — **failure** nonterminal-rate: 2086/4000 runs (52.1%) reached the diagnostic maximum age without an ending.

## t1027_sensitivity

Q-14 remains OPEN. Canonical `start_fix_bonus` is blank; these arms sweep the diagnostic value against the anomalous-talent scenario (which holds T1027). No value is frozen.

| Arm | threshold | familyWeightMode | t1027StartFIX |
|---|---|---|---|
| startFIX = 5 | MID | uniform | 5 |
| startFIX = 8 | MID | uniform | 8 |
| startFIX = 10 | MID | uniform | 10 |
| startFIX = 12 | MID | uniform | 12 |
| startFIX = 15 | MID | uniform | 15 |

| Arm | Completed | Nonterminal | Coverage defect | Committed | Commit age | Median end age | 65+ endings | Fallback 25+ | Route climax | Endings seen |
|---|---|---|---|---|---|---|---|---|---|---|
| startFIX = 5 | 76.4% | 23.6% | 0.0% | 76.6% | 36.0 | 41.0 | 0.3% | 21.0% | 76.4% | 16/24 |
| startFIX = 8 | 86.0% | 14.0% | 0.0% | 86.1% | 35.0 | 39.0 | 0.4% | 16.4% | 86.0% | 16/24 |
| startFIX = 10 | 91.4% | 8.6% | 0.0% | 91.6% | 34.3 | 39.0 | 0.3% | 12.3% | 91.4% | 16/24 |
| startFIX = 12 | 94.2% | 5.8% | 0.0% | 94.2% | 33.8 | 38.0 | 0.3% | 9.5% | 94.2% | 16/24 |
| startFIX = 15 | 98.2% | 1.8% | 0.0% | 98.2% | 32.7 | 37.0 | 0.5% | 3.9% | 98.2% | 16/24 |

Ending-age bands against target:

| Arm | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ |
|---|---|---|---|---|---|---|
| startFIX = 5 | 0.0% | 9.6% | 66.3% | 21.4% | 2.5% | 0.3% |
| startFIX = 8 | 0.0% | 14.2% | 69.1% | 14.4% | 1.9% | 0.4% |
| startFIX = 10 | 0.0% | 18.9% | 65.6% | 13.1% | 2.0% | 0.3% |
| startFIX = 12 | 0.0% | 23.2% | 63.4% | 11.8% ✓ | 1.3% | 0.3% |
| startFIX = 15 | 0.0% | 32.6% | 58.1% | 8.0% | 0.8% | 0.5% |

Targets: 18-24 18%–22% · 25-34 35%–40% · 35-44 20%–25% · 45-54 8%–12% · 55-64 4%–7% · 65+ 2%–5%

Final FIX distribution:

| Arm | p50 | p90 | p99 | max |
|---|---|---|---|---|
| startFIX = 5 | 42 | 46 | 53 | 59 |
| startFIX = 8 | 43 | 48 | 55 | 64 |
| startFIX = 10 | 43 | 49 | 56 | 64 |
| startFIX = 12 | 44 | 50 | 58 | 64 |
| startFIX = 15 | 45 | 53 | 60 | 71 |

Guardrail findings:

- `startFIX = 5` — **warning** fallback-share: Age-25+ fallback share 21.0% exceeds the warning threshold 5.0% (target 2.0%).
- `startFIX = 5` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `startFIX = 5` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 9.6% vs target 35-40%.
- `startFIX = 5` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 66.3% vs target 20-25%.
- `startFIX = 5` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 21.4% vs target 8-12%.
- `startFIX = 5` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 2.5% vs target 4-7%.
- `startFIX = 5` — **warning** ending-age-share-65+: Ending age band 65+: observed 0.3% vs target 2-5%.
- `startFIX = 5` — **warning** nonterminal-rate: 943/4000 runs (23.6%) reached the diagnostic maximum age without an ending.
- `startFIX = 8` — **warning** fallback-share: Age-25+ fallback share 16.4% exceeds the warning threshold 5.0% (target 2.0%).
- `startFIX = 8` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `startFIX = 8` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 14.2% vs target 35-40%.
- `startFIX = 8` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 69.1% vs target 20-25%.
- `startFIX = 8` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 14.4% vs target 8-12%.
- `startFIX = 8` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.9% vs target 4-7%.
- `startFIX = 8` — **warning** ending-age-share-65+: Ending age band 65+: observed 0.4% vs target 2-5%.
- `startFIX = 8` — **warning** nonterminal-rate: 560/4000 runs (14.0%) reached the diagnostic maximum age without an ending.
- `startFIX = 10` — **warning** fallback-share: Age-25+ fallback share 12.3% exceeds the warning threshold 5.0% (target 2.0%).
- `startFIX = 10` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `startFIX = 10` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 18.9% vs target 35-40%.
- `startFIX = 10` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 65.6% vs target 20-25%.
- `startFIX = 10` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 13.1% vs target 8-12%.
- `startFIX = 10` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 2.0% vs target 4-7%.
- `startFIX = 10` — **warning** ending-age-share-65+: Ending age band 65+: observed 0.3% vs target 2-5%.
- `startFIX = 10` — **warning** nonterminal-rate: 343/4000 runs (8.6%) reached the diagnostic maximum age without an ending.
- `startFIX = 12` — **warning** fallback-share: Age-25+ fallback share 9.5% exceeds the warning threshold 5.0% (target 2.0%).
- `startFIX = 12` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `startFIX = 12` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 23.2% vs target 35-40%.
- `startFIX = 12` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 63.4% vs target 20-25%.
- `startFIX = 12` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 1.3% vs target 4-7%.
- `startFIX = 12` — **warning** ending-age-share-65+: Ending age band 65+: observed 0.3% vs target 2-5%.
- `startFIX = 12` — **warning** nonterminal-rate: 233/4000 runs (5.8%) reached the diagnostic maximum age without an ending.
- `startFIX = 15` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `startFIX = 15` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 32.6% vs target 35-40%.
- `startFIX = 15` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 58.1% vs target 20-25%.
- `startFIX = 15` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 8.0% vs target 8-12%.
- `startFIX = 15` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 0.8% vs target 4-7%.
- `startFIX = 15` — **warning** ending-age-share-65+: Ending age band 65+: observed 0.5% vs target 2-5%.
- `startFIX = 15` — **warning** nonterminal-rate: 73/4000 runs (1.8%) reached the diagnostic maximum age without an ending.

## first_manifestation

Q-22 neutrality diagnostic. HUMAN has no family tendencies and no refinement hooks, and the scenario holds no talents, so any residual skew is an availability artifact of the content itself. WOOD above 50% is a stated failure.

| Arm | threshold | familyWeightMode | species | talents |
|---|---|---|---|---|
| HUMAN, no talents, no material evidence | MID | uniform | HUMAN | none |

| Arm | Completed | Nonterminal | Coverage defect | Committed | Commit age | Median end age | 65+ endings | Fallback 25+ | Route climax | Endings seen |
|---|---|---|---|---|---|---|---|---|---|---|
| HUMAN, no talents, no material evidence | 42.7% | 57.3% | 0.0% | 55.3% | 37.2 | 44.0 | 30.2% | 28.0% | 42.7% | 14/24 |

Ending-age bands against target:

| Arm | 18-24 | 25-34 | 35-44 | 45-54 | 55-64 | 65+ |
|---|---|---|---|---|---|---|
| HUMAN, no talents, no material evidence | 0.0% | 3.9% | 47.9% | 16.0% | 2.0% | 30.2% |

Targets: 18-24 18%–22% · 25-34 35%–40% · 35-44 20%–25% · 45-54 8%–12% · 55-64 4%–7% · 65+ 2%–5%

Final FIX distribution:

| Arm | p50 | p90 | p99 | max |
|---|---|---|---|---|
| HUMAN, no talents, no material evidence | 38 | 44 | 48 | 55 |

| Family | Runs | Share | Mean age | Median age |
|---|---|---|---|---|
| WOOD | 993 | 24.8% | 15.5 | 13.0 |
| CERA | 551 | 13.8% | 18.7 | 18.0 |
| STON | 534 | 13.4% | 19.2 | 19.0 |
| METL | 520 | 13.0% | 19.2 | 19.0 |
| GLAS | 507 | 12.7% | 18.9 | 18.0 |
| CRYS | 506 | 12.7% | 18.9 | 18.0 |
| TEMP | 387 | 9.7% | 20.6 | 20.0 |

Runs with no manifestation: **0.1%**.

Guardrail findings:

- `HUMAN, no talents, no material evidence` — **warning** fallback-share: Age-25+ fallback share 28.0% exceeds the warning threshold 5.0% (target 2.0%).
- `HUMAN, no talents, no material evidence` — **warning** ending-age-share-18-24: Ending age band 18-24: observed 0.0% vs target 18-22%.
- `HUMAN, no talents, no material evidence` — **warning** ending-age-share-25-34: Ending age band 25-34: observed 3.9% vs target 35-40%.
- `HUMAN, no talents, no material evidence` — **warning** ending-age-share-35-44: Ending age band 35-44: observed 47.9% vs target 20-25%.
- `HUMAN, no talents, no material evidence` — **warning** ending-age-share-45-54: Ending age band 45-54: observed 16.0% vs target 8-12%.
- `HUMAN, no talents, no material evidence` — **warning** ending-age-share-55-64: Ending age band 55-64: observed 2.0% vs target 4-7%.
- `HUMAN, no talents, no material evidence` — **warning** ending-age-share-65+: Ending age band 65+: observed 30.2% vs target 2-5%.
- `HUMAN, no talents, no material evidence` — **failure** nonterminal-rate: 2292/4000 runs (57.3%) reached the diagnostic maximum age without an ending.

---

Per the Phase 1.1 instructions, H2 remains CLOSED and no profile is frozen here.
