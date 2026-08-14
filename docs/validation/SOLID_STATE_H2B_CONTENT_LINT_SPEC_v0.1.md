# SOLID STATE — H2B Content Consistency Lint
## Version 0.1

### All-female prose lint

Scan canonical player-facing English prose in events, endings, talents, species, factions and future Afterform/certificate copy for standalone male-coded terms, case-insensitive:

`he`, `him`, `his`, `himself`, `father`, `dad`, `son`, `brother`, `husband`, `boyfriend`, `boy`, `man`, `men`, `male`

Use word boundaries so `Human`, etc. do not false-positive. Add an explicit allowlist only for a reviewed exceptional string; no silent suppression.

### Age 0–1 manual audit

Generate a list of every event eligible at age 0 or 1 with its English text/variants. Human review must confirm:
- protagonist agency is age-plausible;
- purchases/decisions belong to family/guardians;
- household changes do not imply bizarrely poor preparation for an ordinary new baby unless the event explicitly supplies a reason;
- effects represent household resources/development where appropriate.

### Stat-curve audit

Report positive/negative delta counts by stat and age band after Batch 008. INT must no longer have zero negative authored deltas; late SPR must no longer be an automatic accumulator.
