# SOLID STATE — H2B Content Lint Report

Generated from canonical content. **Reports only** — no lint rewrites prose.

Content fingerprint: `67ad9c4a336a947db9c1da85ea5e55c5b31853c7062966878d62976d8efe3482`

## 1. All-female prose lint

Scanned **680** canonical player-facing English strings across events, endings, talents, species and factions for standalone male-coded terms. Designer notes are authoring commentary and are out of scope. Matching is case-insensitive and word-bounded, so `Human`, `woman` and `management` cannot false-positive.

**PASS — 0 findings.**

## 2. Hidden-token prose lint

Scanned the same **680** player-facing strings for internal identifiers that must never reach a player: word-bounded uppercase `FIX`, and the `ROUTE_` / `FAC_` namespaces. Conditions are not prose and are out of scope — `FIX>=28` in an `include` is correct authoring. Lowercase "fix" is an ordinary English word and is not matched.

**PASS — 0 findings.**

## 3. Age 0–1 audit

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

- `TRUE` — Another year is mostly spent growing, falling down, making demands with increasing precision, and being told not to touch things.
  - effects: STR +1

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

## 4. Stat-curve audit

Authored variant deltas counted statically over the corpus. An event contributes to every age band its window overlaps, because that is the set of ages at which it can fire. What a *run* observes is measured separately by the H2B diagnostic.

### Corpus totals

| Stat | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| CHR | 36 | +54 | 3 | -4 |
| INT | 49 | +75 | 2 | -3 |
| STR | 35 | +58 | 7 | -7 |
| MNY | 101 | +176 | 68 | -93 |
| SPR | 119 | +138 | 141 | -154 |
| FIX | 128 | +674 | 0 | 0 |

**No visible stat is strictly monotonic** — every one has at least one authored negative delta.

### CHR by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 0 | +0 | 0 | 0 |
| 6-11 | 1 | +1 | 0 | 0 |
| 12-17 | 2 | +2 | 0 | 0 |
| 18-24 | 32 | +50 | 0 | 0 |
| 25-34 | 32 | +50 | 2 | -3 |
| 35-44 | 19 | +26 | 2 | -3 |
| 45-54 | 2 | +2 | 2 | -3 |
| 55-64 | 0 | +0 | 1 | -1 |
| 65+ | 0 | +0 | 1 | -1 |

### INT by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 0 | +0 | 0 | 0 |
| 6-11 | 4 | +4 | 0 | 0 |
| 12-17 | 5 | +5 | 0 | 0 |
| 18-24 | 34 | +60 | 0 | 0 |
| 25-34 | 37 | +63 | 0 | 0 |
| 35-44 | 30 | +47 | 0 | 0 |
| 45-54 | 13 | +25 | 2 | -3 |
| 55-64 | 4 | +4 | 2 | -3 |
| 65+ | 2 | +2 | 2 | -3 |

### STR by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 4 | +4 | 0 | 0 |
| 6-11 | 0 | +0 | 0 | 0 |
| 12-17 | 2 | +2 | 0 | 0 |
| 18-24 | 24 | +44 | 4 | -4 |
| 25-34 | 28 | +51 | 4 | -4 |
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
| 18-24 | 79 | +144 | 42 | -63 |
| 25-34 | 85 | +155 | 52 | -77 |
| 35-44 | 58 | +99 | 49 | -69 |
| 45-54 | 11 | +16 | 18 | -26 |
| 55-64 | 5 | +5 | 9 | -15 |
| 65+ | 2 | +2 | 3 | -9 |

### SPR by age band

| Band | + variants | + magnitude | − variants | − magnitude |
|---|---|---|---|---|
| 0-5 | 9 | +9 | 0 | 0 |
| 6-11 | 4 | +4 | 4 | -4 |
| 12-17 | 2 | +2 | 18 | -18 |
| 18-24 | 73 | +90 | 96 | -108 |
| 25-34 | 79 | +97 | 108 | -120 |
| 35-44 | 63 | +81 | 88 | -96 |
| 45-54 | 32 | +35 | 28 | -29 |
| 55-64 | 26 | +27 | 9 | -9 |
| 65+ | 19 | +20 | 3 | -3 |
