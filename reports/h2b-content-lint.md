# SOLID STATE — H2B Content Lint Report

Generated from canonical content. **Reports only** — no lint rewrites prose.

Content fingerprint: `30bc4280bffd848ece939fb8ceb2ddd3715bd3d7e026ab5d81f657ed70fd1bf5`

## 1. All-female prose lint

Scanned **644** canonical player-facing English strings across events, endings, talents, species and factions for standalone male-coded terms. Designer notes are authoring commentary and are out of scope. Matching is case-insensitive and word-bounded, so `Human`, `woman` and `management` cannot false-positive.

**PASS — 0 findings.**

## 2. Age 0–1 audit

**7** event(s) can fire at age 0 or 1. Human review must confirm protagonist agency is age-plausible, that purchases and decisions belong to the family or guardians, and that household changes do not imply implausibly poor preparation for an ordinary new baby without an explicit reason.

### `EVT-INS-CIV-0001` — INS/CIV, ages 0–3, random, NORMAL

Include: `TRUE`

- `TRUE` — Your birth certificate includes a blank for expected post-mobility material. Your parents leave it empty; the clerk circles it in red.
  - effects: SPR +1

### `EVT-ORD-FAM-0002` — ORD/FAM, ages 0–5, random, NORMAL

Include: `TRUE`

- `TRUE` — A relative remarks on how much you have grown. The family record updates your height and leaves Material Status blank.
  - effects: STR +1

### `EVT-ORD-FAM-0006` — ORD/FAM, ages 0–5, random, NORMAL

Include: `TRUE`

- `MNY<=3` — Before you are old enough to notice, your family keeps a hand-me-down stroller in service. Its warranty excludes future structural conversion, which nobody remembers purchasing.
  - effects: MNY +1, SPR +1
- `TRUE` — Your family discovers how quickly baby supplies become the wrong size. The receipts are kept longer than the useful sizing labels.
  - effects: STR +1, MNY -1

### `EVT-ORD-FAM-0008` — ORD/FAM, ages 0–2, random, NORMAL

Include: `TRUE`

- `TRUE` — You learn the household by voices, footsteps, and furniture. A relative labels every sharp corner 'pre-mobility safe.'
  - effects: SPR +1

### `EVT-ORD-GEN-0004` — ORD/GEN, ages 1–5, random, NORMAL

Include: `TRUE`

- `TRUE` — Another year is mostly spent growing, falling down, asking questions, and being told not to touch things.
  - effects: INT +1, STR +1

### `EVT-ORD-HEA-0003` — ORD/HEA, ages 1–4, random, NORMAL

Include: `TRUE`

- `TRUE` — A routine pediatric checkup confirms that you are developing normally. The mobility milestone chart has a final column nobody discusses.
  - effects: STR +1, SPR +1

### `EVT-ORD-HOU-0003` — ORD/HOU, ages 0–5, random, NORMAL

Include: `TRUE`

- `MNY<=3` — Around your arrival and early growth, your household rearranges rooms to make more space without buying much. Several pieces of furniture acquire a second career.
  - effects: MNY +1, SPR +1
- `TRUE` — Your household keeps rearranging rooms around your early growth. The adults discover that storage is a permanent condition.
  - effects: MNY -1, SPR +1

## 3. Stat-curve audit

Authored variant deltas counted statically over the corpus. An event contributes to every age band its window overlaps, because that is the set of ages at which it can fire. What a *run* observes is measured separately by the H2B diagnostic.

### Corpus totals

| Stat | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| CHR | 39 | +58 | 3 | -4 |
| INT | 71 | +99 | 2 | -3 |
| STR | 33 | +55 | 7 | -7 |
| MNY | 92 | +160 | 61 | -86 |
| SPR | 120 | +142 | 139 | -152 |
| FIX | 111 | +544 | 0 | 0 |

**No visible stat is strictly monotonic** — every one has at least one authored negative delta.

### CHR by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 1 | +1 | 0 | 0 |
| 6-11 | 3 | +3 | 0 | 0 |
| 12-17 | 3 | +3 | 0 | 0 |
| 18-24 | 32 | +51 | 0 | 0 |
| 25-34 | 32 | +51 | 2 | -3 |
| 35-44 | 19 | +27 | 2 | -3 |
| 45-54 | 2 | +2 | 2 | -3 |
| 55-64 | 0 | +0 | 1 | -1 |
| 65+ | 0 | +0 | 1 | -1 |

### INT by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 2 | +2 | 0 | 0 |
| 6-11 | 9 | +10 | 0 | 0 |
| 12-17 | 13 | +15 | 0 | 0 |
| 18-24 | 45 | +71 | 0 | 0 |
| 25-34 | 46 | +72 | 0 | 0 |
| 35-44 | 33 | +50 | 0 | 0 |
| 45-54 | 13 | +25 | 2 | -3 |
| 55-64 | 4 | +4 | 2 | -3 |
| 65+ | 2 | +2 | 2 | -3 |

### STR by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 4 | +4 | 0 | 0 |
| 6-11 | 0 | +0 | 0 | 0 |
| 12-17 | 2 | +2 | 0 | 0 |
| 18-24 | 22 | +41 | 4 | -4 |
| 25-34 | 26 | +48 | 4 | -4 |
| 35-44 | 18 | +37 | 2 | -2 |
| 45-54 | 8 | +16 | 2 | -2 |
| 55-64 | 6 | +14 | 2 | -2 |
| 65+ | 5 | +12 | 1 | -1 |

### MNY by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 3 | +3 | 3 | -3 |
| 6-11 | 0 | +0 | 0 | 0 |
| 12-17 | 2 | +2 | 2 | -2 |
| 18-24 | 78 | +143 | 40 | -61 |
| 25-34 | 76 | +139 | 48 | -73 |
| 35-44 | 57 | +98 | 45 | -65 |
| 45-54 | 11 | +16 | 15 | -23 |
| 55-64 | 5 | +5 | 6 | -12 |
| 65+ | 2 | +2 | 3 | -9 |

### SPR by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 9 | +9 | 0 | 0 |
| 6-11 | 4 | +4 | 4 | -4 |
| 12-17 | 5 | +5 | 18 | -18 |
| 18-24 | 72 | +89 | 96 | -108 |
| 25-34 | 78 | +98 | 107 | -119 |
| 35-44 | 62 | +83 | 87 | -95 |
| 45-54 | 31 | +35 | 28 | -29 |
| 55-64 | 25 | +27 | 9 | -9 |
| 65+ | 18 | +19 | 3 | -3 |
