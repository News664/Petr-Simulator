# SOLID STATE - Ending Registry v1.0

## Stable ending family codes

- `COR` - Corporate
- `MUS` - Museum / Art
- `MED` - Medical / Preservation
- `LEG` - Legal
- `FIN` - Finance
- `FAM` - Family
- `CIV` - Civic / Political
- `REL` - Religious / Ceremonial
- `ARC` - Architectural / Industrial
- `ACA` - Academic / Research
- `TMP` - Temporal
- `ANO` - Anomalous / Hidden

## ID contract
- Format: `END-{FAMILY}-{NNN}`.
- Primary family only. Secondary families are metadata.
- Never encode age, species, material, rarity, weight, or route stage in the ID.
- Existing IDs are immutable after publication.
- Future expansion families register a new code; they do not renumber core content.

## Awareness contract
- Default ordinary material ending: `Unconscious`.
- Default temporal ending: `Suspended`.
- `Continuous`, `Intermittent`, and `Displaced` require explicit authored override authorization.
- `Uncertain` requires explicit narrative justification.
- Consent, awareness, autonomy, ownership, and legal status are independent fields.

## Initial endings

| ID | Family | Title | Default awareness | Hidden |
|---|---|---|---|---|
| END-COR-001 | COR | Employee of the Century | Unconscious | false |
| END-COR-002 | COR | Benefits Package | Unconscious; Suspended if temporal | false |
| END-MUS-001 | MUS | Permanent Collection | Unconscious | false |
| END-MUS-002 | MUS | Excellent Condition, Minor Wear | Unconscious | false |
| END-MUS-003 | MUS | Crystal Archivist | Uncertain | false |
| END-LEG-001 | LEG | Self-Owned Permanent Citizen | Unconscious | false |
| END-LEG-002 | LEG | Fixture Attached to Land | Unconscious | false |
| END-FIN-001 | FIN | Collateral Realized | Unconscious | false |
| END-FIN-002 | FIN | Paid in Full | Unconscious | false |
| END-FAM-001 | FAM | Family Heirloom | Unconscious | false |
| END-FAM-002 | FAM | The Garden Figure | Unconscious | false |
| END-CIV-001 | CIV | Living Memorial | Unconscious | false |
| END-CIV-002 | CIV | Politically Neutral Landmark | Unconscious | false |
| END-ARC-001 | ARC | Structural Support | Unconscious | false |
| END-ACA-001 | ACA | Tenure | Unconscious | false |
| END-ACA-002 | ACA | Peer-Reviewed Permanence | Unconscious or Uncertain | false |
| END-MED-001 | MED | Last Version of You | Unconscious | false |
| END-MED-002 | MED | Cheap Immortality | Unconscious; Suspended if temporal | false |
| END-REL-001 | REL | Sacred Object, Pending Appeal | Unconscious | false |
| END-TMP-001 | TMP | Time Served | Suspended | false |
| END-FIN-003 | FIN | No Longer Depreciating | Unconscious | false |
| END-MUS-004 | MUS | Mixed Media | Unconscious | false |
| END-ANO-001 | ANO | Object Permanence | Continuous or Intermittent | true |
| END-ANO-002 | ANO | Soul Cannot Harden | Displaced | true |