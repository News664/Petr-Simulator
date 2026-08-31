# SOLID STATE — H2B.1B Part A regression

Generated output. Conclusions live in [`docs/H2B1B_A_FINDINGS.md`](../docs/H2B1B_A_FINDINGS.md).

- generated: `2026-08-31T19:26:49.018Z`
- content fingerprint: `a764cf41467fe8db3ab2db0f985188f606f735d92c3ed8e6457595a85d5d08f2`
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
| S1 | mean INT drift entering age 18 (general arm) | 4.01 | +3.0 to +4.5 | **PASS** | pre-patch 9.21 |
| S2 | allocation INT=0: median INT entering 18 | 4.00 | <= 4 | **PASS** |  |
| S3 | allocation INT=0: P(INT >= 8 entering 18) | 0.3% | < 5% | **PASS** |  |
| S4 | allocation INT=0: P(INT >= 10 entering 18) | 0.0% | < 1% | **PASS** |  |
| S5 | median age-18 INT gap, allocation 0 vs 10 | 11.00 | >= 6 | **PASS** | 4.00 -> 15.00 |
| S6 | Spearman rank correlation, allocated INT -> age-18 INT | 0.940 | >= 0.75 | **PASS** | combined 0/5/10 arms |
| S7 | mean CHR drift entering age 18 (general arm) | 1.92 | +1.0 to +2.5 | **PASS** | pre-patch 4.08 |
| S8 | median age-18 CHR gap, allocation 0 vs 10 | 10.00 | >= 6 | **PASS** |  |
| S9 | share of runs active entering 65 holding SPR >= 15 | 72.2% | <= 80.3% | **PASS** | pre-patch 95.3% |
| S10 | no unlimited-repeat late-CHR pathology | none | no unlimited repeatable is a CHR outlier | **PASS** |  |
| F1 | overall personal faction contact incidence | 34.0% | 25% – 40% | **PASS** | pre-patch 33.7% |
| F2 | ENGAGED runs reaching 3+ personalized touchpoints | 99.6% | >= 75% | **PASS** | pre-patch 99.9% |
| F3 | median gap between consecutive personalized faction events | 2.00 | 1 – 2 years | **PASS** | pre-patch 2.00 |
| F4 | p90 gap between consecutive personalized faction events | 2.00 | <= 3 years | **PASS** | pre-patch 3.00 |
| F5 | median contact -> commitment/terminal span | 5.00 | 3 – 6 years | **PASS** |  |
| F6 | faction endings as a share of completed runs | 7.8% | 8% – 15% | **REVIEW** | pre-patch 10.0% |
| F7 | first-disposition exit rate by faction | DMMS 17.2%, Everlasting Mutual 28.1%, Meridian 17.7%, CRI 9.7%, Black Ledger 10.8%, Last Posture 17.8% | measured, not tuned in Part A | **MEASURED** |  |
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
| C11 | compressed-chain expiries costing a touchpoint | 0 | 0 | **PASS** |  |

## Stat ecology

### general population (ARCHETYPE_SET)

4000 runs; 4000 reached age 18; 3301 completed.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.09 / 0.00 / 0.00 / 10.00 | 4.16 / 1.00 / -1.00 / 10.00 | 8.16 / 5.00 / 3.00 / 15.00 | 4.01 / 4.00 / 3.00 / 5.00 | 58.8% | 40.9% | 40.6% | 21.1% |
| CHR | 2.05 / 0.00 / 0.00 / 10.00 | 3.28 / 2.00 / 0.00 / 11.00 | 5.21 / 3.00 / 1.00 / 13.00 | 1.92 / 2.00 / 2.00 / 2.00 | 35.6% | 20.8% | 19.9% | 3.5% |
| SPR | 5.98 / 10.00 / 0.00 / 10.00 | 6.33 / 9.00 / -1.00 / 12.00 | 9.81 / 13.00 / 0.00 / 17.00 | 3.48 / 4.00 / 0.00 / 6.00 | 64.9% | 60.2% | 59.4% | 39.7% |

### allocation INT 0

600 runs; 600 reached age 18; 560 completed.

Explicit pre-species allocation: CHR 4, INT 0, STR 3, MNY 10, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 0.00 / 0.00 / 0.00 / 0.00 | 0.10 / 0.00 / -1.00 / 1.00 | 3.79 / 4.00 / 2.00 / 6.00 | 3.69 / 4.00 / 3.00 / 5.00 | 27.0% | 0.3% | 0.0% | 0.0% |
| CHR | 4.00 / 4.00 / 4.00 / 4.00 | 5.18 / 5.00 / 3.00 / 7.00 | 7.12 / 7.00 / 5.00 / 9.00 | 1.94 / 2.00 / 2.00 / 2.00 | 99.7% | 34.3% | 8.5% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.21 / 3.00 / 2.00 / 5.00 | 7.54 / 7.00 / 5.00 / 10.00 | 4.33 / 4.00 / 2.90 / 6.00 | 95.2% | 49.7% | 14.2% | 0.0% |

### allocation INT 5

600 runs; 600 reached age 18; 544 completed.

Explicit pre-species allocation: CHR 4, INT 5, STR 3, MNY 5, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 5.00 / 5.00 / 5.00 / 5.00 | 5.09 / 5.00 / 4.00 / 6.00 | 9.11 / 9.00 / 7.00 / 11.00 | 4.01 / 4.00 / 3.00 / 5.00 | 100.0% | 84.5% | 40.2% | 0.0% |
| CHR | 4.00 / 4.00 / 4.00 / 4.00 | 5.18 / 5.00 / 3.00 / 7.00 | 7.12 / 7.00 / 5.00 / 9.00 | 1.94 / 2.00 / 2.00 / 2.00 | 99.7% | 34.3% | 8.5% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.21 / 3.00 / 2.00 / 5.00 | 6.60 / 6.00 / 4.00 / 9.00 | 3.40 / 3.00 / 1.00 / 5.00 | 84.3% | 30.7% | 8.8% | 0.0% |

### allocation INT 10

600 runs; 600 reached age 18; 545 completed.

Explicit pre-species allocation: CHR 4, INT 10, STR 3, MNY 0, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 10.00 / 10.00 / 10.00 / 10.00 | 10.10 / 10.00 / 9.00 / 11.00 | 14.48 / 15.00 / 13.00 / 16.00 | 4.39 / 4.00 / 3.00 / 6.00 | 100.0% | 100.0% | 100.0% | 51.3% |
| CHR | 4.00 / 4.00 / 4.00 / 4.00 | 5.18 / 5.00 / 3.00 / 7.00 | 7.12 / 7.00 / 5.00 / 9.00 | 1.94 / 2.00 / 2.00 / 2.00 | 99.7% | 34.3% | 8.5% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.21 / 3.00 / 2.00 / 5.00 | 5.58 / 6.00 / 3.00 / 8.00 | 2.38 / 2.00 / 0.00 / 4.00 | 70.8% | 16.0% | 4.0% | 0.0% |

### allocation CHR 0

600 runs; 600 reached age 18; 534 completed.

Explicit pre-species allocation: CHR 0, INT 4, STR 3, MNY 10, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.00 / 4.00 / 4.00 / 4.00 | 4.09 / 4.00 / 3.00 / 5.00 | 7.87 / 8.00 / 6.00 / 10.00 | 3.77 / 4.00 / 3.00 / 5.00 | 99.0% | 60.5% | 12.5% | 0.0% |
| CHR | 0.00 / 0.00 / 0.00 / 0.00 | 1.18 / 1.00 / -1.00 / 3.00 | 3.12 / 3.00 / 1.00 / 5.00 | 1.94 / 2.00 / 2.00 / 2.00 | 16.8% | 1.2% | 0.3% | 0.0% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.21 / 3.00 / 2.00 / 5.00 | 7.18 / 7.00 / 5.00 / 10.00 | 3.97 / 4.00 / 2.00 / 6.00 | 93.2% | 40.8% | 11.2% | 0.0% |

### allocation CHR 5

600 runs; 600 reached age 18; 550 completed.

Explicit pre-species allocation: CHR 5, INT 4, STR 3, MNY 5, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.00 / 4.00 / 4.00 / 4.00 | 4.09 / 4.00 / 3.00 / 5.00 | 7.87 / 8.00 / 6.00 / 10.00 | 3.77 / 4.00 / 3.00 / 5.00 | 99.0% | 60.5% | 12.5% | 0.0% |
| CHR | 5.00 / 5.00 / 5.00 / 5.00 | 6.18 / 6.00 / 4.00 / 8.00 | 8.12 / 8.00 / 6.00 / 10.00 | 1.94 / 2.00 / 2.00 / 2.00 | 100.0% | 61.7% | 16.8% | 0.3% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.21 / 3.00 / 2.00 / 5.00 | 7.25 / 7.00 / 5.00 / 10.00 | 4.04 / 4.00 / 2.00 / 6.00 | 93.8% | 43.0% | 11.2% | 0.0% |

### allocation CHR 10

600 runs; 600 reached age 18; 569 completed.

Explicit pre-species allocation: CHR 10, INT 4, STR 3, MNY 0, SPR 3.

| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |
|---|---|---|---|---|---|---|---|---|
| INT | 4.00 / 4.00 / 4.00 / 4.00 | 4.09 / 4.00 / 3.00 / 5.00 | 7.87 / 8.00 / 6.00 / 10.00 | 3.77 / 4.00 / 3.00 / 5.00 | 99.0% | 60.5% | 12.5% | 0.0% |
| CHR | 10.00 / 10.00 / 10.00 / 10.00 | 11.18 / 11.00 / 9.00 / 13.00 | 13.12 / 13.00 / 11.00 / 15.00 | 1.94 / 2.00 / 2.00 / 2.00 | 100.0% | 100.0% | 100.0% | 16.8% |
| SPR | 3.00 / 3.00 / 3.00 / 3.00 | 3.21 / 3.00 / 2.00 / 5.00 | 7.94 / 8.00 / 6.00 / 10.00 | 4.74 / 5.00 / 3.00 / 6.00 | 97.3% | 57.3% | 20.0% | 0.2% |

## Run outcomes (general arm)

Completed 3301 (82.5%), nonterminal 699, coverage errors 0. Ending age: mean 53.7, median 43.0, p10 29.0, p90 95.0.


Pre-patch: completed 71.5%, median ending age 43.0, 35-44 34.0%, 65+ 27.6%. Part A changes no ending gate; this table is reported so the shift caused by the stat ecology is visible, not treated as a target.

| Ending age band | Runs | Share of completed |
|---|---|---|
| 18-24 | 35 | 1.1% |
| 25-34 | 635 | 19.2% |
| 35-44 | 1155 | 35.0% |
| 45-54 | 455 | 13.8% |
| 55-64 | 43 | 1.3% |
| 65+ | 978 | 29.6% |

## Mean drift by snapshot (general arm)

| Snapshot | active runs | INT drift | CHR drift | SPR drift | INT | CHR | SPR |
|---|---|---|---|---|---|---|---|
| age 18 | 4000 | 4.01 | 1.92 | 3.48 | 8.16 | 5.21 | 9.81 |
| age 25 | 3965 | 4.99 | 3.88 | 3.77 | 9.16 | 7.11 | 10.08 |
| age 35 | 3330 | 5.75 | 6.09 | 2.24 | 10.23 | 9.25 | 8.23 |
| age 50 | 1848 | 6.48 | 6.56 | 6.07 | 11.36 | 9.60 | 11.68 |
| age 65 | 1677 | 6.13 | 5.37 | 13.97 | 11.04 | 8.34 | 19.56 |
| final | 4000 | 5.96 | 6.01 | 7.25 | 10.11 | 9.29 | 13.58 |

SPR >= 15 entering 65: 1211 of 1677 still-active runs (72.2%).

## Contributor audit (authored INT / CHR / SPR deltas)

Top five positive and negative contributors per stat and age band, ranked by
total magnitude. `R` marks a repeatable event; `!` marks one flagged as a severe
outlier for its band.

| Stat | Band | Sign | Event | Variant | Delta | Occurrences | Total | |
|---|---|---|---|---|---|---|---|---|
| INT | 0-17 | + | EVT-ORD-EDU-0005 | 1 | 1 | 4016 | 4016 | R |
| INT | 0-17 | + | EVT-ORD-EDU-0001 | 0 | 1 | 2590 | 2590 |  |
| INT | 0-17 | + | EVT-ORD-EDU-0007 | 3 | 1 | 2072 | 2072 | R |
| INT | 0-17 | + | EVT-ORD-EDU-0004 | 3 | 1 | 2031 | 2031 | R |
| INT | 0-17 | + | EVT-ORD-EDU-0004 | 2 | 1 | 1415 | 1415 | R |
| INT | 18-34 | + | EVT-INS-EDU-2001 | 0 | 4 | 628 | 2512 |  |
| INT | 18-34 | + | EVT-ORD-CAR-0002 | 1 | 1 | 628 | 628 | R |
| INT | 18-34 | + | EVT-INS-ACA-0001 | 1 | 1 | 562 | 562 |  |
| INT | 18-34 | + | EVT-SPC-REIN-0001 | 0 | 2 | 263 | 526 |  |
| INT | 18-34 | + | EVT-INS-REL-0001 | 3 | 1 | 510 | 510 |  |
| INT | 35-64 | + | EVT-ORD-FAM-0007 | 2 | 1 | 897 | 897 | R |
| INT | 35-64 | + | EVT-INS-ACA-0002 | 0 | 2 | 211 | 422 |  |
| INT | 35-64 | + | EVT-INS-ACA-0009 | 1 | 3 | 90 | 270 |  |
| INT | 35-64 | + | EVT-INS-ACA-0007 | 0 | 2 | 97 | 194 |  |
| INT | 35-64 | + | EVT-INS-LEG-0002 | 0 | 2 | 80 | 160 |  |
| INT | 35-64 | - | EVT-ORD-GEN-2001 | 0 | -2 | 756 | -1512 |  |
| INT | 35-64 | - | EVT-ORD-GEN-2001 | 1 | -1 | 377 | -377 |  |
| INT | 65+ | - | EVT-ORD-GEN-2001 | 0 | -2 | 2 | -4 |  |
| INT | 65+ | - | EVT-ORD-GEN-2001 | 1 | -1 | 2 | -2 |  |
| CHR | 0-17 | + | EVT-ORD-SOC-0001 | 1 | 1 | 3889 | 3889 | R |
| CHR | 0-17 | + | EVT-ORD-SOC-0002 | 1 | 1 | 3778 | 3778 | R |
| CHR | 0-17 | + | EVT-SPC-SECR-0002 | 0 | 1 | 30 | 30 |  |
| CHR | 18-34 | + | EVT-TRN-CRYS-0001 | 1 | 1 | 1691 | 1691 |  |
| CHR | 18-34 | + | EVT-ORD-SOC-0007 | 3 | 1 | 1642 | 1642 | R |
| CHR | 18-34 | + | EVT-TRN-GLAS-0001 | 1 | 1 | 1453 | 1453 |  |
| CHR | 18-34 | + | EVT-TRN-CERA-0001 | 0 | 2 | 717 | 1434 |  |
| CHR | 18-34 | + | EVT-INS-CIV-2001 | 0 | 4 | 310 | 1240 |  |
| CHR | 18-34 | - | EVT-INS-CIV-0007 | 0 | -2 | 9 | -18 |  |
| CHR | 18-34 | - | EVT-INS-CIV-0007 | 1 | -1 | 14 | -14 |  |
| CHR | 35-64 | + | EVT-ORD-SOC-0003 | 1 | 1 | 739 | 739 | R |
| CHR | 35-64 | + | EVT-INS-CIV-0005 | 0 | 1 | 472 | 472 |  |
| CHR | 35-64 | + | EVT-TRN-CRYS-0002 | 1 | 2 | 211 | 422 |  |
| CHR | 35-64 | + | EVT-ORD-CIV-0002 | 0 | 1 | 178 | 178 |  |
| CHR | 35-64 | + | EVT-TRN-GLAS-0002 | 1 | 1 | 162 | 162 |  |
| CHR | 35-64 | - | EVT-ORD-SOC-0004 | 2 | -1 | 1506 | -1506 | R! |
| CHR | 35-64 | - | EVT-INS-CIV-0007 | 1 | -1 | 493 | -493 |  |
| CHR | 35-64 | - | EVT-INS-CIV-0007 | 0 | -2 | 145 | -290 |  |
| CHR | 65+ | - | EVT-ORD-SOC-0004 | 2 | -1 | 23 | -23 | R |
| SPR | 0-17 | + | EVT-ORD-SOC-0001 | 1 | 1 | 3889 | 3889 | R |
| SPR | 0-17 | + | EVT-ORD-SOC-0009 | 0 | 1 | 3108 | 3108 |  |
| SPR | 0-17 | + | EVT-ORD-HEA-0003 | 0 | 1 | 2826 | 2826 |  |
| SPR | 0-17 | + | EVT-ORD-EDU-0006 | 1 | 1 | 2544 | 2544 |  |
| SPR | 0-17 | + | EVT-INS-CIV-0001 | 0 | 1 | 1991 | 1991 |  |
| SPR | 0-17 | - | EVT-ORD-EDU-0004 | 2 | -1 | 1415 | -1415 | R |
| SPR | 0-17 | - | EVT-ORD-EDU-0007 | 2 | -1 | 1398 | -1398 | R |
| SPR | 0-17 | - | EVT-ORD-EDU-0005 | 0 | -1 | 1354 | -1354 | R |
| SPR | 0-17 | - | EVT-ORD-EDU-0002 | 0 | -1 | 1163 | -1163 |  |
| SPR | 0-17 | - | EVT-TRN-WOOD-0001 | 1 | -1 | 618 | -618 |  |
| SPR | 18-34 | + | EVT-ORD-FAM-0003 | 1 | 1 | 2145 | 2145 |  |
| SPR | 18-34 | + | EVT-ORD-CIV-0002 | 1 | 1 | 1788 | 1788 |  |
| SPR | 18-34 | + | EVT-ORD-HEA-0002 | 3 | 1 | 1759 | 1759 | R |
| SPR | 18-34 | + | EVT-ORD-HEA-2001 | 1 | 4 | 414 | 1656 |  |
| SPR | 18-34 | + | EVT-ORD-SOC-0007 | 3 | 1 | 1642 | 1642 | R |
| SPR | 18-34 | - | EVT-TRN-TEMP-0001 | 1 | -2 | 1481 | -2962 |  |
| SPR | 18-34 | - | EVT-TRN-CRYS-0001 | 1 | -1 | 1691 | -1691 |  |
| SPR | 18-34 | - | EVT-TRN-STON-0001 | 1 | -1 | 1677 | -1677 |  |
| SPR | 18-34 | - | EVT-ORD-CAR-0004 | 1 | -1 | 1664 | -1664 | R |
| SPR | 18-34 | - | EVT-TRN-GLAS-0001 | 1 | -1 | 1453 | -1453 |  |
| SPR | 35-64 | + | EVT-ORD-HEA-0001 | 1 | 1 | 4557 | 4557 | R |
| SPR | 35-64 | + | EVT-ORD-GEN-0002 | 0 | 1 | 3545 | 3545 | R |
| SPR | 35-64 | + | EVT-ORD-CAR-0003 | 1 | 1 | 2351 | 2351 | R |
| SPR | 35-64 | + | EVT-INS-CIV-0002 | 1 | 1 | 1637 | 1637 |  |
| SPR | 35-64 | + | EVT-ORD-FAM-0005 | 2 | 1 | 1403 | 1403 | R |
| SPR | 35-64 | - | EVT-TRN-TEMP-0001 | 1 | -2 | 866 | -1732 |  |
| SPR | 35-64 | - | EVT-ORD-CAR-0004 | 1 | -1 | 1017 | -1017 | R |
| SPR | 35-64 | - | EVT-ORD-GEN-2001 | 0 | -1 | 756 | -756 |  |
| SPR | 35-64 | - | EVT-ORD-SOC-0003 | 1 | -1 | 739 | -739 | R |
| SPR | 35-64 | - | EVT-INS-CIV-0005 | 0 | -1 | 472 | -472 |  |
| SPR | 65+ | + | EVT-INS-MED-2001 | 0 | 1 | 1234 | 1234 |  |
| SPR | 65+ | + | EVT-INS-MED-2002 | 3 | 1 | 845 | 845 |  |
| SPR | 65+ | + | EVT-ORD-FAM-0010 | 0 | 1 | 529 | 529 |  |
| SPR | 65+ | + | EVT-INS-CIV-0002 | 0 | 1 | 41 | 41 |  |
| SPR | 65+ | + | EVT-INS-FIN-0003 | 1 | 1 | 29 | 29 |  |
| SPR | 65+ | - | EVT-INS-CIV-0009 | 1 | -1 | 1626 | -1626 |  |
| SPR | 65+ | - | EVT-ORD-GEN-2001 | 0 | -1 | 2 | -2 |  |

### Repeatable severe outliers

| Stat | Band | Event | Variant | Delta | Occurrences | Total | repeatMaxCount |
|---|---|---|---|---|---|---|---|
| CHR | 35-64 | EVT-ORD-SOC-0004 | 2 | -1 | 1506 | -1506 | 2 |

## Faction coherence

| Faction | contact | disposition | ENGAGED | COMMITTED | exits | endings | tp/contacted (med) | tp/ENGAGED (med) | 3+ | gap med/p90/max | span med/p90 | 1st-disp exit | expiries |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DMMS | 4.8% | 4.8% | 4.0% | 0.5% | 4.3% | 19 (0.6%) | 4.0 | 4.0 | 100.0% | 2.0/2.0/4 | 5.0/5.0 | 17.2% | 0 |
| Everlasting Mutual | 6.8% | 6.8% | 4.9% | 0.1% | 6.6% | 4 (0.1%) | 4.0 | 4.0 | 99.5% | 2.0/2.0/3 | 5.0/5.0 | 28.1% | 1 |
| Meridian | 5.7% | 5.7% | 4.3% | 1.1% | 4.5% | 44 (1.3%) | 4.0 | 4.0 | 100.0% | 2.0/2.0/7 | 5.0/5.0 | 17.7% | 0 |
| CRI | 7.0% | 7.0% | 5.8% | 2.7% | 4.2% | 108 (3.3%) | 4.0 | 4.0 | 99.6% | 2.0/2.0/3 | 5.0/5.0 | 9.7% | 0 |
| Black Ledger | 4.2% | 4.2% | 3.7% | 0.8% | 3.3% | 33 (1.0%) | 4.0 | 4.0 | 100.0% | 1.0/2.0/4 | 4.0/4.0 | 10.8% | 0 |
| Last Posture | 6.7% | 6.7% | 5.5% | 1.2% | 5.5% | 48 (1.5%) | 4.0 | 4.0 | 99.1% | 2.0/2.0/4 | 5.0/5.0 | 17.8% | 1 |

Overall: 1358 runs with a contact (34.0%); 1124 reached ENGAGED, 1120 of those saw 3+ personalized touchpoints (99.6%). Gaps: median 2.0, p75 2.0, p90 2.0, max 7. Contact -> commitment/terminal span: median 5.0, p75 5.0, p90 5.0. Maximum simultaneously active factions: 1.

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
| compressed-chain schedule expiries (raw total) | 2 |
| — of those, costing a touchpoint | 0 |
| — of those, in the run's terminal year | 2 |

Compressed-chain expiries by event: EVT-SPC-SECR-2006 1, EVT-SPC-SECR-2004 1.

The acceptance plan requires zero *newly caused* expiries. C11 therefore counts only
the ones that cost the player a touchpoint; an expiry booked in the run's own terminal
year cost nothing, because the life ends that same year. The raw total is above.

## Derived

- Spearman allocated INT -> age-18 INT (combined 0/5/10 arms): 0.940
- Spearman allocated CHR -> age-18 CHR (combined 0/5/10 arms): 0.929
- median age-18 INT gap, allocation 0 vs 10: 11.00
- median age-18 CHR gap, allocation 0 vs 10: 10.00

Corpus: 215 events across 8 batches.
