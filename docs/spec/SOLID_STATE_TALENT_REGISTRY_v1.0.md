# SOLID STATE - Talent Registry v1.0

Machine-facing summary. Creative rationale lives in `SOLID_STATE_TALENT_BIBLE_v1.0.pdf`.

## Trigger semantics
- `start`: visible unconditional effect at start.
- `start_hidden`: hidden unconditional effect at start.
- `threshold_once`: evaluate at defined checkpoints until true; apply once permanently.
- `passive`: persistent drafting/eligibility/branch modifier.
- After each event chain, evaluate dormant threshold talents repeatedly until stable.
- Events are allowed and expected to change CHR/INT/STR/MNY/SPR; this is required for mid-life talent triggers.

## Talent table

| ID | Rarity | Name | Trigger | Condition | Visible effect | Incompatibility |
|---|---|---|---|---|---|---|
| T1001 | Common | Sharp Eyes | `start` | `` | INT +2 | - |
| T1002 | Common | Knows Excel | `threshold_once` | `INT>=5` | When INT >= 5: MNY +2 | - |
| T1003 | Common | Heavy Sleeper | `start` | `` | SPR +2 | - |
| T1004 | Common | Likes Pigeons | `passive` | `` | No direct attribute modifier | - |
| T1005 | Common | Built Different | `start` | `` | STR +3, INT -1 | - |
| T1006 | Common | Bad Knees | `start` | `` | STR -1 | - |
| T1007 | Common | Pretty Privilege | `threshold_once` | `CHR>=8` | When CHR >= 8: MNY +3 | - |
| T1008 | Common | No Thoughts, Head Empty | `start` | `` | INT -2, SPR +4 | - |
| T1009 | Common | Frugal | `threshold_once` | `MNY<=3` | When MNY <= 3: MNY +2 | - |
| T1010 | Common | Keeps a Low Profile | `start` | `` | SPR +1 | T1023 |
| T1011 | Uncommon | Stoneworker's Daughter | `passive` | `` | No direct attribute modifier | - |
| T1012 | Uncommon | Perfect Posture | `start` | `` | CHR +2 | - |
| T1013 | Uncommon | Property Lawyer | `passive` | `` | No direct attribute modifier | - |
| T1014 | Uncommon | Corporate Favorite | `start` | `` | MNY +3, SPR -1 | - |
| T1015 | Uncommon | Second Opinion | `passive` | `` | No direct attribute modifier | - |
| T1016 | Uncommon | No Pain, No Gain | `start` | `` | STR +3, SPR -1 | - |
| T1017 | Uncommon | Late Bloomer | `threshold_once` | `AGE>=35 & CHR<=5` | When AGE >= 35 and CHR <= 5: CHR +4 | - |
| T1018 | Rare | Museum Quality | `start` | `` | CHR +3 | - |
| T1019 | Rare | Hard to Kill | `passive` | `` | No direct attribute modifier | - |
| T1020 | Rare | Old Soul | `passive` | `` | No direct attribute modifier | - |
| T1021 | Rare | Magnetic Personality | `start` | `` | CHR +2 | - |
| T1022 | Rare | Union Member | `passive` | `` | No direct attribute modifier | - |
| T1023 | Rare | Main Character Syndrome | `passive` | `` | No direct attribute modifier | T1010 |
| T1024 | Legendary | My Body, My Property | `passive` | `` | No direct attribute modifier | - |
| T1025 | Legendary | Unregistered Species | `passive` | `` | No direct attribute modifier | T1030 |
| T1026 | Legendary | Cheap Immortality | `passive` | `` | No direct attribute modifier | - |
| T1027 | Legendary | Hairline Fracture | `start_hidden` | `` | No visible attribute modifier | - |
| T1028 | Anomalous | Object Permanence | `passive` | `` | No direct attribute modifier | T1029 |
| T1029 | Anomalous | Soul Cannot Harden | `passive` | `` | No direct attribute modifier | T1028 |
| T1030 | Anomalous | Wrong Species Certificate | `start_hidden` | `` | No direct attribute modifier | T1025 |