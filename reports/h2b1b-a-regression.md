# SOLID STATE — H2B.1B Part A regression

Generated output. Conclusions live in [`docs/H2B1B_A_FINDINGS.md`](../docs/H2B1B_A_FINDINGS.md).

- generated: `2026-08-30T18:32:28.459Z`
- content fingerprint: `67ad9c4a336a947db9c1da85ea5e55c5b31853c7062966878d62976d8efe3482`
- balance: `0.2`
- base seed: `h2b1b_a`
- sampling: runs=4000, targetedRuns=600, speciesMode=STRATIFY_EQUALLY_BY_SPECIES, talentScenario=UNIFORM_RANDOM_THREE_COMPATIBLE_DIAGNOSTIC, generalAllocationPolicy=ARCHETYPE_SET, familyWeightMode=uniform, maxAge=120
- pre-patch baseline fingerprint: `3af02c428c7fd5de7b64a3c1c07ae84b084ad1576b9ee9f35a8da06087b5b54d`

## Review bands

PASS satisfies the band. REVIEW is outside it and asks for a human look — nothing
is auto-tuned toward a band. FAIL is a non-zero hard correctness counter, or a value
that moved away from its band relative to the recorded pre-patch baseline.

| # | Band | Measured | Target | Verdict | Note |
|---|---|---|---|---|---|
| S1 | mean INT drift entering age 18 (general arm) | 4.03 | +3.0 to +4.5 | **PASS** | pre-patch 9.21 |
| S2 | allocation INT=0: median INT entering 18 | 4.00 | <= 4 | **PASS** |  |
| S3 | allocation INT=0: P(INT >= 8 entering 18) | 0.3% | < 5% | **PASS** |  |
| S4 | allocation INT=0: P(INT >= 10 entering 18) | 0.0% | < 1% | **PASS** |  |
| S5 | median age-18 INT gap, allocation 0 vs 10 | 11.00 | >= 6 | **PASS** | 4.00 -> 15.00 |
| S6 | Spearman rank correlation, allocated INT -> age-18 INT | 0.937 | >= 0.75 | **PASS** | combined 0/5/10 arms |
| S7 | mean CHR drift entering age 18 (general arm) | 1.92 | +1.0 to +2.5 | **PASS** | pre-patch 4.08 |
| S8 | median age-18 CHR gap, allocation 0 vs 10 | 10.00 | >= 6 | **PASS** |  |
| S9 | share of runs active entering 65 holding SPR >= 15 | 84.0% | <= 80.3% | **REVIEW** | pre-patch 95.3% |
| S10 | no unlimited-repeat late-CHR pathology | none | no unlimited repeatable is a CHR outlier | **PASS** |  |
| F1 | overall personal faction contact incidence | 35.0% | 25% – 40% | **PASS** | pre-patch 33.7% |
| F2 | ENGAGED runs reaching 3+ personalized touchpoints | 99.6% | >= 75% | **PASS** | pre-patch 99.9% |
| F3 | median gap between consecutive personalized faction events | 2.00 | 1 – 2 years | **PASS** | pre-patch 2.00 |
| F4 | p90 gap between consecutive personalized faction events | 2.00 | <= 3 years | **PASS** | pre-patch 3.00 |
| F5 | median contact -> commitment/terminal span | 5.00 | 3 – 6 years | **PASS** |  |
| F6 | faction endings as a share of completed runs | 7.6% | 8% – 15% | **REVIEW** | pre-patch 10.0% |
| F7 | first-disposition exit rate by faction | DMMS 21.8%, Everlasting Mutual 33.7%, Meridian 15.7%, CRI 21.8%, Black Ledger 12.9%, Last Posture 13.9% | measured, not tuned in Part A | **MEASURED** |  |
| C1 | endings before age 18 | 0 | 0 | **PASS** |  |
| C2 | Material Commitments before age 18 | 0 | 0 | **PASS** |  |
| C3 | pre-25 content coverage defects | 0 | 0 | **PASS** |  |
| C4 | pre-25 generic fallback years | 0 | 0 | **PASS** |  |
| C5 | years with more than one visible event | 0 | 0 | **PASS** |  |
| C6 | illegal faction transitions | 0 | 0 | **PASS** |  |
| C7 | faction lifecycle collisions | 0 | 0 | **PASS** |  |
| C8 | personalized faction events after a terminal exit | 0 | 0 | **PASS** |  |
| C9 | runs holding two personally-active factions | 0 | 0 | **PASS** |  |
| C10 | contacts opened while another faction was active | 0 | 0 | **PASS** |  |
| C11 | compressed-chain schedule expiries | 0 | 0 | **PASS** |  |

## Stat ecology

### general population (ARCHETYPE_SET)

4000 runs; 4000 reached age 18; 3294 completed.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.11 / 0.00 / 0.00 / 10.00 | 4.17 / 1.00 / 0.00 / 10.00 | 8.21 / 5.00 / 3.00 / 15.00 | 4.03 / 4.00 / 3.00 / 5.00 | 59.3% | 41.1% | 40.8% | 20.3% |
| CHR | 2.01 / 0.00 / 0.00 / 10.00 | 3.22 / 1.00 / 0.00 / 11.00 | 5.14 / 3.00 / 1.00 / 13.00 | 1.92 / 2.00 / 2.00 / 2.00 | 35.1% | 20.1% | 19.4% | 3.3% |
| SPR | 5.96 / 10.00 / 0.00 / 10.00 | 6.30 / 9.00 / -1.00 / 12.00 | 9.81 / 14.00 / 0.00 / 17.00 | 3.52 / 4.00 / 0.00 / 7.00 | 64.1% | 59.7% | 59.2% | 41.1% |

### allocation INT 0

600 runs; 600 reached age 18; 558 completed.

Explicit pre-species allocation: CHR 4, INT 0, STR 3, MNY 10, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 0.00 / 0.00 / 0.00 / 0.00 | 0.03 / 0.00 / -1.00 / 1.00 | 3.83 / 4.00 / 2.00 / 6.00 | 3.80 / 4.00 / 3.00 / 5.00 | 30.7% | 0.3% | 0.0% | 0.0% |
| CHR | 4.00 / 4.00 / 4.00 / 4.00 | 5.22 / 5.00 / 3.00 / 7.00 | 7.16 / 7.00 / 5.00 / 9.00 | 1.94 / 2.00 / 2.00 / 2.00 | 98.8% | 37.7% | 8.3% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.37 / 3.00 / 2.00 / 6.00 | 7.75 / 8.00 / 5.00 / 11.00 | 4.38 / 4.00 / 2.00 / 6.00 | 94.7% | 53.8% | 18.0% | 0.0% |

### allocation INT 5

600 runs; 600 reached age 18; 534 completed.

Explicit pre-species allocation: CHR 4, INT 5, STR 3, MNY 5, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 5.00 / 5.00 / 5.00 / 5.00 | 5.03 / 5.00 / 4.00 / 6.00 | 9.17 / 9.00 / 7.00 / 11.00 | 4.14 / 4.00 / 3.00 / 6.00 | 99.8% | 85.2% | 39.8% | 0.0% |
| CHR | 4.00 / 4.00 / 4.00 / 4.00 | 5.22 / 5.00 / 3.00 / 7.00 | 7.16 / 7.00 / 5.00 / 9.00 | 1.94 / 2.00 / 2.00 / 2.00 | 98.8% | 37.7% | 8.3% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.37 / 3.00 / 2.00 / 6.00 | 6.75 / 7.00 / 4.00 / 10.10 | 3.38 / 4.00 / 1.00 / 5.00 | 84.7% | 32.2% | 13.2% | 0.0% |

### allocation INT 10

600 runs; 600 reached age 18; 531 completed.

Explicit pre-species allocation: CHR 4, INT 10, STR 3, MNY 0, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 10.00 / 10.00 / 10.00 / 10.00 | 10.03 / 10.00 / 9.00 / 11.00 | 14.56 / 15.00 / 13.00 / 16.00 | 4.52 / 4.00 / 3.00 / 6.00 | 100.0% | 100.0% | 100.0% | 50.2% |
| CHR | 4.00 / 4.00 / 4.00 / 4.00 | 5.22 / 5.00 / 3.00 / 7.00 | 7.16 / 7.00 / 5.00 / 9.00 | 1.94 / 2.00 / 2.00 / 2.00 | 98.8% | 37.7% | 8.3% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.37 / 3.00 / 2.00 / 6.00 | 5.70 / 6.00 / 3.00 / 9.00 | 2.33 / 2.00 / 0.00 / 4.00 | 72.7% | 18.5% | 5.5% | 0.0% |

### allocation CHR 0

600 runs; 600 reached age 18; 527 completed.

Explicit pre-species allocation: CHR 0, INT 4, STR 3, MNY 10, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.00 / 4.00 / 4.00 / 4.00 | 4.03 / 4.00 / 3.00 / 5.00 | 7.92 / 8.00 / 6.00 / 10.00 | 3.88 / 4.00 / 3.00 / 5.00 | 98.8% | 60.7% | 12.7% | 0.0% |
| CHR | 0.00 / 0.00 / 0.00 / 0.00 | 1.22 / 1.00 / -1.00 / 3.00 | 3.15 / 3.00 / 1.00 / 5.00 | 1.94 / 2.00 / 2.00 / 2.00 | 16.3% | 0.7% | 0.0% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.37 / 3.00 / 2.00 / 6.00 | 7.37 / 7.00 / 5.00 / 11.00 | 4.00 / 4.00 / 2.00 / 6.00 | 91.3% | 46.0% | 15.0% | 0.0% |

### allocation CHR 5

600 runs; 600 reached age 18; 547 completed.

Explicit pre-species allocation: CHR 5, INT 4, STR 3, MNY 5, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.00 / 4.00 / 4.00 / 4.00 | 4.03 / 4.00 / 3.00 / 5.00 | 7.92 / 8.00 / 6.00 / 10.00 | 3.88 / 4.00 / 3.00 / 5.00 | 98.8% | 60.7% | 12.7% | 0.0% |
| CHR | 5.00 / 5.00 / 5.00 / 5.00 | 6.22 / 6.00 / 4.00 / 8.00 | 8.15 / 8.00 / 6.00 / 10.00 | 1.94 / 2.00 / 2.00 / 2.00 | 100.0% | 63.8% | 16.3% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.37 / 3.00 / 2.00 / 6.00 | 7.45 / 7.00 / 5.00 / 11.00 | 4.08 / 4.00 / 2.00 / 6.00 | 92.0% | 47.0% | 15.5% | 0.2% |

### allocation CHR 10

600 runs; 600 reached age 18; 559 completed.

Explicit pre-species allocation: CHR 10, INT 4, STR 3, MNY 0, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.00 / 4.00 / 4.00 / 4.00 | 4.03 / 4.00 / 3.00 / 5.00 | 7.92 / 8.00 / 6.00 / 10.00 | 3.88 / 4.00 / 3.00 / 5.00 | 98.8% | 60.7% | 12.7% | 0.0% |
| CHR | 10.00 / 10.00 / 10.00 / 10.00 | 11.22 / 11.00 / 9.00 / 13.00 | 13.15 / 13.00 / 11.00 / 15.00 | 1.94 / 2.00 / 2.00 / 2.00 | 100.0% | 100.0% | 100.0% | 16.3% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.37 / 3.00 / 2.00 / 6.00 | 8.12 / 8.00 / 5.00 / 11.10 | 4.75 / 5.00 / 3.00 / 7.00 | 95.5% | 58.5% | 24.7% | 0.5% |

## Run outcomes (general arm)

Completed 3294 (82.3%), nonterminal 706, coverage errors 0. Ending age: mean 55.1, median 44.0, p10 28.3, p90 99.0.


Pre-patch: completed 71.5%, median ending age 43.0, 35-44 34.0%, 65+ 27.6%. Part A changes no ending gate; this table is reported so the shift caused by the stat ecology is visible, not treated as a target.

| Ending age band | Runs | Share of completed |
|---|---|---|
| 18-24 | 39 | 1.2% |
| 25-34 | 625 | 19.0% |
| 35-44 | 1082 | 32.8% |
| 45-54 | 454 | 13.8% |
| 55-64 | 35 | 1.1% |
| 65+ | 1059 | 32.1% |

## Mean drift by snapshot (general arm)

| Snapshot | active runs | INT drift | CHR drift | SPR drift | INT | CHR | SPR |
|---|---|---|---|---|---|---|---|
| age 18 | 4000 | 4.03 | 1.92 | 3.52 | 8.21 | 5.14 | 9.81 |
| age 25 | 3961 | 5.04 | 3.82 | 3.82 | 9.21 | 7.00 | 10.12 |
| age 35 | 3336 | 5.84 | 5.98 | 2.42 | 10.24 | 9.08 | 8.49 |
| age 50 | 1917 | 6.61 | 6.51 | 6.51 | 11.40 | 9.46 | 12.20 |
| age 65 | 1765 | 6.25 | 5.30 | 16.95 | 11.14 | 8.22 | 22.53 |
| final | 4000 | 6.00 | 5.92 | 9.22 | 10.18 | 9.14 | 15.52 |

SPR >= 15 entering 65: 1482 of 1765 still-active runs (84.0%).

## Contributor audit (authored INT / CHR / SPR deltas)

Top five positive and negative contributors per stat and age band, ranked by
total magnitude. `R` marks a repeatable event; `!` marks one flagged as a severe
outlier for its band.

| Stat | Band | Sign | Event | Variant | Delta | Occurrences | Total | |
|---|---|---|---|---|---|---|---|---|
| INT | 0-17 | + | EVT-ORD-EDU-0005 | 1 | 1 | 4078 | 4078 | R |
| INT | 0-17 | + | EVT-ORD-EDU-0001 | 0 | 1 | 2616 | 2616 |  |
| INT | 0-17 | + | EVT-ORD-EDU-0004 | 3 | 1 | 2092 | 2092 | R |
| INT | 0-17 | + | EVT-ORD-EDU-0007 | 3 | 1 | 2065 | 2065 | R |
| INT | 0-17 | + | EVT-ORD-EDU-0004 | 2 | 1 | 1420 | 1420 | R |
| INT | 18-34 | + | EVT-INS-EDU-2001 | 0 | 4 | 621 | 2484 |  |
| INT | 18-34 | + | EVT-ORD-CAR-0002 | 1 | 1 | 652 | 652 | R |
| INT | 18-34 | + | EVT-INS-ACA-0001 | 1 | 1 | 582 | 582 |  |
| INT | 18-34 | + | EVT-INS-REL-0001 | 3 | 1 | 539 | 539 |  |
| INT | 18-34 | + | EVT-SPC-REIN-0001 | 0 | 2 | 269 | 538 |  |
| INT | 35-64 | + | EVT-ORD-FAM-0007 | 1 | 1 | 942 | 942 | R |
| INT | 35-64 | + | EVT-INS-ACA-0002 | 0 | 2 | 217 | 434 |  |
| INT | 35-64 | + | EVT-INS-ACA-0009 | 1 | 3 | 82 | 246 |  |
| INT | 35-64 | + | EVT-INS-ACA-0007 | 0 | 2 | 89 | 178 |  |
| INT | 35-64 | + | EVT-INS-MED-0007 | 0 | 1 | 173 | 173 |  |
| INT | 35-64 | - | EVT-ORD-GEN-2001 | 0 | -2 | 807 | -1614 |  |
| INT | 35-64 | - | EVT-ORD-GEN-2001 | 1 | -1 | 382 | -382 |  |
| INT | 65+ | - | EVT-ORD-GEN-2001 | 0 | -2 | 2 | -4 |  |
| INT | 65+ | - | EVT-ORD-GEN-2001 | 1 | -1 | 1 | -1 |  |
| CHR | 0-17 | + | EVT-ORD-SOC-0001 | 1 | 1 | 3875 | 3875 | R |
| CHR | 0-17 | + | EVT-ORD-SOC-0002 | 1 | 1 | 3789 | 3789 | R |
| CHR | 0-17 | + | EVT-SPC-SECR-0002 | 0 | 1 | 31 | 31 |  |
| CHR | 18-34 | + | EVT-TRN-CRYS-0001 | 1 | 1 | 1697 | 1697 |  |
| CHR | 18-34 | + | EVT-ORD-SOC-0007 | 3 | 1 | 1638 | 1638 | R |
| CHR | 18-34 | + | EVT-TRN-GLAS-0001 | 1 | 1 | 1401 | 1401 |  |
| CHR | 18-34 | + | EVT-TRN-CERA-0001 | 0 | 2 | 672 | 1344 |  |
| CHR | 18-34 | + | EVT-INS-CIV-2001 | 0 | 4 | 296 | 1184 |  |
| CHR | 18-34 | - | EVT-INS-CIV-0007 | 0 | -2 | 10 | -20 |  |
| CHR | 18-34 | - | EVT-INS-CIV-0007 | 1 | -1 | 14 | -14 |  |
| CHR | 35-64 | + | EVT-ORD-SOC-0003 | 1 | 1 | 756 | 756 | R |
| CHR | 35-64 | + | EVT-TRN-CRYS-0002 | 1 | 2 | 227 | 454 |  |
| CHR | 35-64 | + | EVT-INS-CIV-0005 | 0 | 1 | 428 | 428 |  |
| CHR | 35-64 | + | EVT-ORD-CIV-0002 | 0 | 1 | 209 | 209 |  |
| CHR | 35-64 | + | EVT-INS-MUS-0001 | 1 | 1 | 160 | 160 |  |
| CHR | 35-64 | - | EVT-ORD-SOC-0004 | 2 | -1 | 1673 | -1673 | R! |
| CHR | 35-64 | - | EVT-INS-CIV-0007 | 1 | -1 | 463 | -463 |  |
| CHR | 35-64 | - | EVT-INS-CIV-0007 | 0 | -2 | 130 | -260 |  |
| CHR | 65+ | - | EVT-ORD-SOC-0004 | 2 | -1 | 17 | -17 | R |
| SPR | 0-17 | + | EVT-ORD-SOC-0001 | 1 | 1 | 3875 | 3875 | R |
| SPR | 0-17 | + | EVT-ORD-SOC-0009 | 0 | 1 | 3132 | 3132 |  |
| SPR | 0-17 | + | EVT-ORD-HEA-0003 | 0 | 1 | 2841 | 2841 |  |
| SPR | 0-17 | + | EVT-ORD-EDU-0006 | 1 | 1 | 2564 | 2564 |  |
| SPR | 0-17 | + | EVT-ORD-HOU-0003 | 0 | 1 | 1983 | 1983 |  |
| SPR | 0-17 | - | EVT-ORD-EDU-0004 | 2 | -1 | 1420 | -1420 | R |
| SPR | 0-17 | - | EVT-ORD-EDU-0007 | 2 | -1 | 1394 | -1394 | R |
| SPR | 0-17 | - | EVT-ORD-EDU-0005 | 0 | -1 | 1320 | -1320 | R |
| SPR | 0-17 | - | EVT-ORD-EDU-0002 | 0 | -1 | 1151 | -1151 |  |
| SPR | 0-17 | - | EVT-TRN-WOOD-0001 | 1 | -1 | 587 | -587 |  |
| SPR | 18-34 | + | EVT-ORD-FAM-0003 | 1 | 1 | 2168 | 2168 |  |
| SPR | 18-34 | + | EVT-ORD-HEA-0002 | 3 | 1 | 1762 | 1762 | R |
| SPR | 18-34 | + | EVT-ORD-HEA-2001 | 1 | 4 | 428 | 1712 |  |
| SPR | 18-34 | + | EVT-ORD-CIV-0002 | 1 | 1 | 1693 | 1693 |  |
| SPR | 18-34 | + | EVT-ORD-SOC-0007 | 3 | 1 | 1638 | 1638 | R |
| SPR | 18-34 | - | EVT-TRN-TEMP-0001 | 1 | -2 | 1450 | -2900 |  |
| SPR | 18-34 | - | EVT-TRN-CRYS-0001 | 1 | -1 | 1697 | -1697 |  |
| SPR | 18-34 | - | EVT-TRN-STON-0001 | 1 | -1 | 1692 | -1692 |  |
| SPR | 18-34 | - | EVT-ORD-CAR-0004 | 1 | -1 | 1607 | -1607 | R |
| SPR | 18-34 | - | EVT-TRN-METL-0001 | 1 | -1 | 1405 | -1405 |  |
| SPR | 35-64 | + | EVT-ORD-HEA-0001 | 1 | 1 | 4829 | 4829 | R |
| SPR | 35-64 | + | EVT-ORD-FAM-0007 | 2 | 2 | 2260 | 4520 | R |
| SPR | 35-64 | + | EVT-ORD-GEN-0002 | 0 | 1 | 3640 | 3640 | R |
| SPR | 35-64 | + | EVT-ORD-CAR-0003 | 1 | 1 | 2364 | 2364 | R |
| SPR | 35-64 | + | EVT-INS-CIV-0002 | 1 | 1 | 1712 | 1712 |  |
| SPR | 35-64 | - | EVT-TRN-TEMP-0001 | 1 | -2 | 865 | -1730 |  |
| SPR | 35-64 | - | EVT-ORD-CAR-0004 | 1 | -1 | 983 | -983 | R |
| SPR | 35-64 | - | EVT-ORD-GEN-2001 | 0 | -1 | 807 | -807 |  |
| SPR | 35-64 | - | EVT-ORD-SOC-0003 | 1 | -1 | 756 | -756 | R |
| SPR | 35-64 | - | EVT-INS-LEG-0002 | 1 | -1 | 485 | -485 |  |
| SPR | 65+ | + | EVT-INS-MED-2001 | 0 | 1 | 1299 | 1299 |  |
| SPR | 65+ | + | EVT-INS-MED-2002 | 3 | 1 | 908 | 908 |  |
| SPR | 65+ | + | EVT-ORD-FAM-0007 | 2 | 2 | 446 | 892 | R |
| SPR | 65+ | + | EVT-ORD-FAM-0010 | 0 | 1 | 554 | 554 |  |
| SPR | 65+ | + | EVT-ORD-FAM-0007 | 0 | 1 | 363 | 363 | R |
| SPR | 65+ | - | EVT-INS-CIV-0009 | 1 | -1 | 1705 | -1705 |  |
| SPR | 65+ | - | EVT-ORD-GEN-2001 | 0 | -1 | 2 | -2 |  |

### Repeatable severe outliers

| Stat | Band | Event | Variant | Delta | Occurrences | Total | repeatMaxCount |
|---|---|---|---|---|---|---|---|
| CHR | 35-64 | EVT-ORD-SOC-0004 | 2 | -1 | 1673 | -1673 | 2 |

## Faction coherence

| Faction | contact | disposition | ENGAGED | COMMITTED | exits | endings | tp/contacted (med) | tp/ENGAGED (med) | 3+ | gap med/p90/max | span med/p90 | 1st-disp exit | expiries |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DMMS | 4.8% | 4.8% | 3.8% | 0.5% | 4.3% | 20 (0.6%) | 4.0 | 4.0 | 100.0% | 2.0/2.0/4 | 5.0/5.0 | 21.8% | 0 |
| Everlasting Mutual | 6.2% | 6.2% | 4.1% | 0.1% | 6.0% | 4 (0.1%) | 4.0 | 4.0 | 99.4% | 2.0/2.0/4 | 5.0/5.0 | 33.7% | 0 |
| Meridian | 6.2% | 6.2% | 4.8% | 1.7% | 4.5% | 69 (2.1%) | 4.0 | 4.0 | 100.0% | 2.0/2.0/5 | 5.0/5.0 | 15.7% | 0 |
| CRI | 7.7% | 7.7% | 5.7% | 1.9% | 5.7% | 77 (2.3%) | 4.0 | 4.0 | 99.1% | 2.0/2.0/4 | 5.0/5.0 | 21.8% | 0 |
| Black Ledger | 3.9% | 3.9% | 3.4% | 0.9% | 2.9% | 38 (1.2%) | 4.0 | 4.0 | 100.0% | 1.0/2.0/4 | 4.0/4.0 | 12.9% | 0 |
| Last Posture | 7.6% | 7.5% | 6.5% | 1.1% | 6.4% | 42 (1.3%) | 4.0 | 4.0 | 99.6% | 2.0/2.0/4 | 5.0/5.0 | 13.9% | 0 |

Overall: 1402 runs with a contact (35.0%); 1126 reached ENGAGED, 1122 of those saw 3+ personalized touchpoints (99.6%). Gaps: median 2.0, p75 2.0, p90 2.0, max 5. Contact -> commitment/terminal span: median 5.0, p75 5.0, p90 5.0. Maximum simultaneously active factions: 1.

## Correctness counters

| Counter | Value |
|---|---|
| endings before 18 | 0 |
| Material Commitments before 18 | 0 |
| pre-25 coverage defects | 0 |
| pre-25 generic fallback years | 0 |
| years with more than one visible event | 0 |
| illegal faction transitions | 0 |
| faction lifecycle collisions | 0 |
| personalized faction events after terminal exit | 0 |
| runs with two personally-active factions | 0 |
| contacts opened while another faction was active | 0 |
| compressed-chain schedule expiries | 0 |

## Derived

- Spearman allocated INT -> age-18 INT (combined 0/5/10 arms): 0.937
- Spearman allocated CHR -> age-18 CHR (combined 0/5/10 arms): 0.933
- median age-18 INT gap, allocation 0 vs 10: 11.00
- median age-18 CHR gap, allocation 0 vs 10: 10.00

Corpus: 215 events across 8 batches.
