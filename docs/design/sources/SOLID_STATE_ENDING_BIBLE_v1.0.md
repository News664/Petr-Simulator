# SOLID STATE - Route Bible
## Version 1.0 - Frozen Ending Design

### 1. Core principle

A final transformation answers **what the protagonist's body became**. An ending answers **what her life made that transformation mean**.

All canonical v1 endings involve an irreversible or effectively irreversible Permanent Form. Permanent Form is not scored as victory or failure.

### 2. Ending IDs and stable family namespaces

Ending IDs encode only a stable primary narrative family:

| Code | Family |
|---|---|
| `COR` | Corporate |
| `MUS` | Museum / Art |
| `MED` | Medical / Preservation |
| `LEG` | Legal |
| `FIN` | Finance |
| `FAM` | Family |
| `CIV` | Civic / Political |
| `REL` | Religious / Ceremonial |
| `ARC` | Architectural / Industrial |
| `ACA` | Academic / Research |
| `TMP` | Temporal |
| `ANO` | Anomalous / Hidden |

Format:

`END-{FAMILY}-{NNN}`

Examples:
- `END-COR-001`
- `END-MUS-003`
- `END-TMP-001`

Secondary route families remain metadata. IDs never encode age, species, rarity, balance weight, material commitment, or route stage because those may change during balancing.

New future factions/features may add new family prefixes without renumbering existing content.

Events should later mirror this philosophy with stable channel/family IDs such as:
- `EVT-ORD-EDU-0001`
- `EVT-INS-COR-0001`
- `EVT-TRN-WOOD-0001`
- `EVT-SPC-ANO-0001`

### 3. Ending event and Ending Record

The final annual event remains one short timeline event. It stops normal yearly simulation and creates an Ending Record.

The engine does not synthesize arbitrary endings by mixing axis values. An authored ending ID provides a coherent base state; the climax event and current route/material history may apply allowed variants.

### 4. Ending axes

Every Ending Record may include:
- Primary Material
- Form
- Awareness State
- Integrity
- Legal Status
- Ownership
- Autonomy
- Conversion Consent
- Location
- Durability / maintenance condition
- Social Meaning
- Ending Age
- optional Apparent Age

Material and Form remain separate.

### 5. Awareness State - frozen rule

Ordinary Permanent Forms are **not assumed to remain consciously aware**.

Recommended enum:

| Awareness State | Meaning |
|---|---|
| `Unconscious` | Default for ordinary solid materials. No continuing subjective experience through the body. |
| `Suspended` | Awareness is preserved but no subjective passage of time occurs. Default for ordinary temporal fixation. |
| `Intermittent` | Awareness occurs only under authored conditions. Rare. |
| `Continuous` | Fully aware while immobile. Very rare and deliberately consequential. |
| `Displaced` | Permanent body remains while consciousness/soul exists elsewhere. |
| `Uncertain` | The world cannot reliably establish whether awareness persists. |

Continuous, Intermittent, and Displaced awareness require explicit authored support. They must never appear accidentally through generic ending assembly.

This keeps the dystopian focus on institutions, ownership, classification, and consent without making every ordinary statue ending equivalent to eternal conscious imprisonment.

### 6. Consent, Awareness, and Autonomy are independent

**Conversion Consent** answers: what did she want before/during conversion?

Suggested states:
- Enthusiastic
- Accepting
- Resigned
- Ambiguous
- Unwilling
- Impossible to Determine

**Awareness State** answers: does she subjectively experience existence afterward?

**Autonomy** answers: who can make decisions concerning the Permanent Form afterward?

An unconscious protagonist may still be self-owned and represented through advance directives. A conscious protagonist may legally be an object. The axes must not be collapsed.

### 7. Default awareness policy

For first-playable content:
- ordinary stone/metal/wood/crystal/glass/ceramic/synthetic endings default to `Unconscious`;
- ordinary temporal fixation defaults to `Suspended`;
- `Uncertain` is allowed only when uncertainty is narratively meaningful;
- `Continuous`, `Intermittent`, and `Displaced` are rare/anomalous overrides.

A practical content target is that roughly 80-90% of ordinary discovered endings resolve to Unconscious or Suspended awareness.

### 8. Material continuity

Normally final Primary Material equals existing Material Commitment.

An ending family cannot overwrite committed wood with crystal simply because a Museum route wins. Material-flexible endings adapt to the existing committed material.

Material-specific Ending IDs exist only where material itself changes the narrative meaning.

### 9. Ending archetype vs physical variant

An Ending ID represents a meaningful social/legal fate, not every material variation.

For example, `END-COR-001 Employee of the Century` may appear as bronze, wood, crystal, or synthetic where the route allows. Do not create separate IDs unless the physical difference materially changes the story.

### 10. Afterform

After the ending event, normal simulation stops. A short Afterform epilogue of 2-6 authored entries may occur immediately, years later, decades later, or centuries later.

Afterform is not a second simulator. It uses Ending ID, material, form, awareness, integrity, ownership, location, talents, and selected history to choose concise epilogue entries.

### 11. Certificate of Permanent Status

The final report should resemble an administrative certificate and may display:

- Species
- Registered Species
- Age at Permanent Form
- Primary Material
- Form
- Material Status
- Awareness State
- Legal Classification
- Recognized Owner
- Autonomy Status
- Conversion Consent
- Integrity Status
- Current Location
- Primary Social Function
- Ending

`Unknown` and `Disputed` are valid values.

### 12. Ending validation

Build validation should detect:
- referenced ending missing;
- malformed family-coded ID;
- family code not registered;
- required material conflicting with Material Commitment;
- illegal material/form combination where constrained;
- canonical ending lacking Permanent Form;
- contradictory route conditions;
- invalid axis enum;
- hidden ending exposed in discovery UI;
- Continuous/Intermittent/Displaced awareness without explicit override authorization;
- canonical ending before age 18.

### 13. Extensibility rule

The core taxonomy is intentionally open-ended. Future faction packs, additional institutions, species expansions, or special event chains may register new family codes and route tags.

Existing IDs must never be repurposed or renumbered because a new family is introduced.

DnD-style alignment-inspired factions are explicitly deferred to a later expansion iteration rather than being part of the v1 core.


# 14. Initial 24 canonical endings

## END-COR-001 - Employee of the Century
**Primary family:** `COR`  
**Core routes:** Corporate  
**Allowed / typical materials:** flexible  
**Typical forms:** statue; mannequin; preserved humanoid

The protagonist becomes a permanent corporate display while remaining officially associated with the company.

**Default Awareness:** Unconscious  
**Legal status:** Corporate Asset or Contractual Post-Mobile Citizen  
**Ownership:** Corporation or contractual self-ownership  
**Autonomy:** Contractual or Restricted  
**Conversion consent:** route-derived  
**Typical location:** corporate headquarters  
**Social meaning:** employee; memorial; brand asset  
**Internal discovery class:** common  
**Hidden:** false

**Design note:** HR insists this counts as retention.

## END-COR-002 - Benefits Package
**Primary family:** `COR`  
**Core routes:** Corporate; Medical  
**Allowed / typical materials:** synthetic; temporal; crystal; compatible other  
**Typical forms:** preserved humanoid; mannequin; temporal still-frame

Employer-sponsored preservation permanently stabilizes the protagonist; the procedure succeeds according to the contract.

**Default Awareness:** Unconscious; Suspended if temporal  
**Legal status:** Contractual Post-Mobile Citizen  
**Ownership:** Self or Corporation depending event  
**Autonomy:** Contractual  
**Conversion consent:** route-derived  
**Typical location:** corporate facility; hospital; headquarters  
**Social meaning:** employee; insured beneficiary  
**Internal discovery class:** common  
**Hidden:** false

**Design note:** Success is defined contractually.

## END-MUS-001 - Permanent Collection
**Primary family:** `MUS`  
**Core routes:** Museum  
**Allowed / typical materials:** wood; marble; crystal; porcelain; glass; synthetic; compatible other  
**Typical forms:** statue; preserved figure; mannequin

The protagonist becomes part of a recognized museum collection.

**Default Awareness:** Unconscious  
**Legal status:** Cultural Property or Post-Mobile Citizen  
**Ownership:** Museum; Self with museum custody; Disputed  
**Autonomy:** Restricted or Represented  
**Conversion consent:** route-derived  
**Typical location:** museum  
**Social meaning:** artwork; cultural property; citizen  
**Internal discovery class:** common  
**Hidden:** false

**Design note:** Prestige does not imply autonomy.

## END-MUS-002 - Excellent Condition, Minor Wear
**Primary family:** `MUS`  
**Core routes:** Museum; Restoration  
**Allowed / typical materials:** wood; stone; ceramic; synthetic; mixed  
**Typical forms:** statue; preserved figure; installation

The protagonist survives indefinitely through regular conservation work and becomes progressively maintained or modified.

**Default Awareness:** Unconscious  
**Legal status:** Cultural Property or Post-Mobile Citizen  
**Ownership:** Museum or Self with custody  
**Autonomy:** Restricted or Represented  
**Conversion consent:** route-derived  
**Typical location:** museum; conservation facility  
**Social meaning:** artwork; conservation subject  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** Condition-report terminology becomes the joke.

## END-MUS-003 - Crystal Archivist
**Primary family:** `MUS`  
**Core routes:** Museum; Academic  
**Allowed / typical materials:** crystal; gemstone  
**Typical forms:** preserved humanoid; archive object

The protagonist's crystal structure preserves information unusually well, making the Permanent Form both person-history and archive.

**Default Awareness:** Uncertain  
**Legal status:** Cultural Property; Research Subject; Disputed  
**Ownership:** Museum; University; Self  
**Autonomy:** Represented or Restricted  
**Conversion consent:** route-derived  
**Typical location:** museum; archive; university  
**Social meaning:** archive; research object; cultural artifact  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** Information preservation does not imply conscious experience.

## END-LEG-001 - Self-Owned Permanent Citizen
**Primary family:** `LEG`  
**Core routes:** Legal  
**Allowed / typical materials:** flexible  
**Typical forms:** flexible

The protagonist retains recognized ownership and substantial legal control over her Permanent Form.

**Default Awareness:** Unconscious  
**Legal status:** Protected Permanent Citizen  
**Ownership:** Self  
**Autonomy:** Represented or Independent by directive  
**Conversion consent:** route-derived  
**Typical location:** route-derived  
**Social meaning:** citizen  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** Favorable legal outcome; still permanent.

## END-LEG-002 - Fixture Attached to Land
**Primary family:** `LEG`  
**Core routes:** Legal; Architectural  
**Allowed / typical materials:** stone; concrete; metal; mixed  
**Typical forms:** architectural component

The law determines that the protagonist has become part of real property; ownership follows the building or land.

**Default Awareness:** Unconscious  
**Legal status:** Fixture Attached to Land  
**Ownership:** Property Owner  
**Autonomy:** None or Represented  
**Conversion consent:** route-derived  
**Typical location:** building; infrastructure  
**Social meaning:** fixture; infrastructure  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** Rare awareness overrides can make this substantially darker.

## END-FIN-001 - Collateral Realized
**Primary family:** `FIN`  
**Core routes:** Finance  
**Allowed / typical materials:** precious metal; gemstone; valuable stone; compatible other  
**Typical forms:** statue; preserved humanoid; asset object

A creditor's claim against the protagonist's projected Permanent Form becomes enforceable.

**Default Awareness:** Unconscious  
**Legal status:** Asset or Limited Person  
**Ownership:** Creditor  
**Autonomy:** None or Restricted  
**Conversion consent:** route-derived  
**Typical location:** creditor custody; auction storage; display  
**Social meaning:** collateral; asset  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** The valuation was accurate.

## END-FIN-002 - Paid in Full
**Primary family:** `FIN`  
**Core routes:** Finance; Medical; Corporate  
**Allowed / typical materials:** flexible  
**Typical forms:** flexible

A debt-for-preservation arrangement eliminates the protagonist's financial obligations by creating a different sort of obligation.

**Default Awareness:** Unconscious  
**Legal status:** Asset or Contractual Post-Mobile Citizen  
**Ownership:** Creditor or Corporation  
**Autonomy:** Contractual or None  
**Conversion consent:** route-derived  
**Typical location:** route-derived  
**Social meaning:** settlement asset; preserved debtor  
**Internal discovery class:** common  
**Hidden:** false

**Design note:** Outstanding Debt: 0.

## END-FAM-001 - Family Heirloom
**Primary family:** `FAM`  
**Core routes:** Family; Inheritance  
**Allowed / typical materials:** wood; porcelain; stone; metal; crystal  
**Typical forms:** statue; figurine; preserved figure

The protagonist remains physically within the family across generations.

**Default Awareness:** Unconscious  
**Legal status:** Estate; Family Property; Post-Mobile Citizen  
**Ownership:** Family; Self via trust; Shared  
**Autonomy:** Represented or Restricted  
**Conversion consent:** route-derived  
**Typical location:** family home  
**Social meaning:** heirloom; family presence  
**Internal discovery class:** common  
**Hidden:** false

**Design note:** Tone can range from affectionate to possessive.

## END-FAM-002 - The Garden Figure
**Primary family:** `FAM`  
**Core routes:** Family; Housing  
**Allowed / typical materials:** stone; ceramic; metal; wood  
**Typical forms:** garden statue; preserved figure

The protagonist's permanent placement is a family garden or courtyard.

**Default Awareness:** Unconscious  
**Legal status:** Family Property or Post-Mobile Citizen  
**Ownership:** Family; Self via directive  
**Autonomy:** Represented or Restricted  
**Conversion consent:** route-derived  
**Typical location:** family garden; courtyard  
**Social meaning:** household presence; memorial  
**Internal discovery class:** common  
**Hidden:** false

**Design note:** May be loved, ignored, or seasonally decorated.

## END-CIV-001 - Living Memorial
**Primary family:** `CIV`  
**Core routes:** Civic; Political  
**Allowed / typical materials:** marble; bronze; stone; crystal  
**Typical forms:** public monument

The protagonist becomes an official civic memorial; the word 'living' survives mainly in administrative language.

**Default Awareness:** Unconscious  
**Legal status:** Protected Permanent Citizen or Municipal Property  
**Ownership:** Government or Self under public custody  
**Autonomy:** Restricted or Represented  
**Conversion consent:** route-derived  
**Typical location:** public square; government site  
**Social meaning:** memorial; civic symbol  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** Rare awareness variants are explicit overrides, not default.

## END-CIV-002 - Politically Neutral Landmark
**Primary family:** `CIV`  
**Core routes:** Civic; Legal  
**Allowed / typical materials:** monument-compatible flexible  
**Typical forms:** monument; landmark

After political circumstances change, officials retain the protagonist while removing nearly all information about what she originally represented.

**Default Awareness:** Unconscious  
**Legal status:** Municipal Property or Cultural Property  
**Ownership:** Government  
**Autonomy:** None or Represented  
**Conversion consent:** route-derived  
**Typical location:** public site  
**Social meaning:** landmark  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** Historical context is administratively simplified.

## END-ARC-001 - Structural Support
**Primary family:** `ARC`  
**Core routes:** Architectural; Industrial  
**Allowed / typical materials:** concrete; stone; metal; composite  
**Typical forms:** column; support; facade element; structural figure

The protagonist becomes a literal part of infrastructure or architecture.

**Default Awareness:** Unconscious  
**Legal status:** Fixture Attached to Land or Corporate/Municipal Asset  
**Ownership:** Property Owner; Corporation; Government  
**Autonomy:** None  
**Conversion consent:** route-derived  
**Typical location:** building; infrastructure  
**Social meaning:** infrastructure; employee  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** Employment may technically remain active.

## END-ACA-001 - Tenure
**Primary family:** `ACA`  
**Core routes:** Academic  
**Allowed / typical materials:** stone; bronze; crystal; wood; compatible other  
**Typical forms:** statue; memorial; preserved humanoid

The protagonist acquires permanent academic status shortly before acquiring permanent physical status.

**Default Awareness:** Unconscious  
**Legal status:** Post-Mobile Citizen or University Property  
**Ownership:** Self; University; Disputed  
**Autonomy:** Represented or Restricted  
**Conversion consent:** route-derived  
**Typical location:** university campus  
**Social meaning:** academic; memorial  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** The institution finally guarantees her position.

## END-ACA-002 - Peer-Reviewed Permanence
**Primary family:** `ACA`  
**Core routes:** Academic; Medical; Research  
**Allowed / typical materials:** variable  
**Typical forms:** research specimen; preserved humanoid; installation

The protagonist becomes the most convincing evidence in her own research.

**Default Awareness:** Unconscious or Uncertain  
**Legal status:** Research Subject; Post-Mobile Citizen; Disputed  
**Ownership:** University; Institute; Self  
**Autonomy:** Restricted or Represented  
**Conversion consent:** route-derived  
**Typical location:** research institute; university  
**Social meaning:** research evidence; academic artifact  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** Her paper may continue receiving citations.

## END-MED-001 - Last Version of You
**Primary family:** `MED`  
**Core routes:** Medical; Commercial Preservation; Mid-Life  
**Allowed / typical materials:** flexible; often prestige or synthetic  
**Typical forms:** preserved humanoid; statue; mannequin

The protagonist undergoes deliberate mid-life preservation marketed as locking in her best self.

**Default Awareness:** Unconscious  
**Legal status:** Post-Mobile Citizen or Contractual Asset  
**Ownership:** Self; Provider under contract  
**Autonomy:** Represented or Contractual  
**Conversion consent:** Enthusiastic; Accepting; Resigned; Ambiguous  
**Typical location:** private residence; preservation facility; display  
**Social meaning:** preserved self; consumer product  
**Internal discovery class:** uncommon  
**Hidden:** false

**Design note:** Mid-life crisis industrialized.

## END-MED-002 - Cheap Immortality
**Primary family:** `MED`  
**Core routes:** Medical; Finance  
**Allowed / typical materials:** synthetic; temporal; low-cost stone/ceramic; compatible other  
**Typical forms:** flexible

Permanent preservation works at remarkably low cost; the expense reappears in rights, placement, maintenance, or aesthetics.

**Default Awareness:** Unconscious; Suspended if temporal  
**Legal status:** Contractual Post-Mobile Citizen or Asset  
**Ownership:** route-derived  
**Autonomy:** Contractual or Restricted  
**Conversion consent:** route-derived  
**Typical location:** route-derived  
**Social meaning:** preserved patient; low-cost contract  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** T1026 synergy. Synthetic is not inherently cheap.

## END-REL-001 - Sacred Object, Pending Appeal
**Primary family:** `REL`  
**Core routes:** Religious; Legal  
**Allowed / typical materials:** wood; marble; crystal; obsidian; ceremonial metal  
**Typical forms:** statue; relic; ceremonial object

A religious institution recognizes the protagonist as sacred property while civil authorities dispute whether she remains a legal person.

**Default Awareness:** Unconscious  
**Legal status:** Legally Disputed  
**Ownership:** Religious Institution; Self; Disputed  
**Autonomy:** Restricted or Represented  
**Conversion consent:** route-derived  
**Typical location:** religious site  
**Social meaning:** sacred object; citizen; relic  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** Sacred and litigated.

## END-TMP-001 - Time Served
**Primary family:** `TMP`  
**Core routes:** Temporal; Legal; Finance  
**Allowed / typical materials:** temporal  
**Typical forms:** temporal still-frame

The protagonist enters indefinite temporal fixation; no subjective time passes while outside obligations continue.

**Default Awareness:** Suspended  
**Legal status:** Post-Mobile Citizen; Disputed; Asset  
**Ownership:** Self; institution; disputed  
**Autonomy:** Contractual or Represented  
**Conversion consent:** route-derived  
**Typical location:** temporal facility; archive; route-derived  
**Social meaning:** preserved person; legal anomaly  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** Elapsed legal time and experienced time diverge.

## END-FIN-003 - No Longer Depreciating
**Primary family:** `FIN`  
**Core routes:** Finance; Museum; Corporate  
**Allowed / typical materials:** durable or valuable  
**Typical forms:** asset object; statue; preserved humanoid

Conversion causes the protagonist's assessed financial value to stabilize or increase.

**Default Awareness:** Unconscious  
**Legal status:** Asset; Cultural Property; Corporate Asset  
**Ownership:** route-derived  
**Autonomy:** Restricted or None  
**Conversion consent:** route-derived  
**Typical location:** route-derived  
**Social meaning:** asset; investment  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** An accountant calls this an improvement.

## END-MUS-004 - Mixed Media
**Primary family:** `MUS`  
**Core routes:** Museum; Restoration; Anomalous  
**Allowed / typical materials:** mixed only  
**Typical forms:** statue; installation; preserved humanoid

The protagonist intentionally or accidentally becomes a recognized multi-material work.

**Default Awareness:** Unconscious  
**Legal status:** Cultural Property or Post-Mobile Citizen  
**Ownership:** Museum; Self; Disputed  
**Autonomy:** Restricted or Represented  
**Conversion consent:** route-derived  
**Typical location:** museum; gallery; conservation facility  
**Social meaning:** artwork; conservation subject  
**Internal discovery class:** rare  
**Hidden:** false

**Design note:** Requires explicit authored mixed-material transition.

## END-ANO-001 - Object Permanence
**Primary family:** `ANO`  
**Core routes:** Anomalous  
**Allowed / typical materials:** flexible  
**Typical forms:** flexible

The protagonist remains subjectively herself despite substantial later alteration to the Permanent Form.

**Default Awareness:** Continuous or Intermittent  
**Legal status:** route-derived  
**Ownership:** route-derived  
**Autonomy:** route-derived  
**Conversion consent:** route-derived  
**Typical location:** route-derived  
**Social meaning:** anomalous continuous identity  
**Internal discovery class:** hidden  
**Hidden:** true

**Design note:** Requires T1028 or explicit equivalent. Not invulnerability.

## END-ANO-002 - Soul Cannot Harden
**Primary family:** `ANO`  
**Core routes:** Anomalous; Religious; Reincarnation  
**Allowed / typical materials:** flexible  
**Typical forms:** flexible

The body reaches permanent solidification while consciousness does not remain bound to it.

**Default Awareness:** Displaced  
**Legal status:** route-derived  
**Ownership:** route-derived  
**Autonomy:** route-derived  
**Conversion consent:** route-derived  
**Typical location:** route-derived  
**Social meaning:** permanent body; displaced self  
**Internal discovery class:** hidden  
**Hidden:** true

**Design note:** Requires T1029 or explicit equivalent.


# 15. First-playable ending balance

The 24 endings should not be equally likely.

More common:
- Corporate
- Museum
- Medical
- Family
- Finance

Moderately uncommon:
- Legal victories
- Civic
- Architectural
- Academic
- Temporal

Rare:
- mixed-material and unusual ownership outcomes

Very rare / hidden:
- Object Permanence
- Soul Cannot Harden
- deeper reincarnation endings

Exact rates belong in simulation-tested balance constants.

# 16. Ending diversity test

A healthy ending set should produce variation across:
- material;
- form;
- awareness;
- ownership;
- autonomy;
- location;
- social meaning;
- consent;
- legal classification.

If two Ending IDs answer these questions almost identically, they probably should be merged.

# 17. Handoff rule

ChatGPT owns ending concepts, titles, prose, axis intent, localization, route relationships, and allowed variants.

Coding agents own schema implementation, validators, registry loading, Ending Record construction, deterministic resolution, tests, discovery storage, and UI rendering.

Coding agents must not invent new ending meanings merely to satisfy a schema.
