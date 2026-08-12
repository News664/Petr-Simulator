# SOLID STATE - Talent Bible
## Version 1.0 - Frozen Core Talent Design

### 1. Purpose

Talents are a primary source of replayability. Species describes what society expects from the protagonist; talents describe what is unusual about this specific incarnation.

The first playable contains 30 talents. The long-term target is roughly 200-300.

After setup, the life simulation is automatic. The player does not make event choices. Talents alter automatic event drafting, eligibility, branches, attribute development, and ending interpretation.

### 2. Player Agency Rule

The player's active decisions occur before the life simulation:
- select 3 talents from 10 drafted;
- allocate starting attributes.

During life progression the player may observe, change playback speed, or open informational UI. She does not choose dialogue, treatment, route, legal response, or ending.

In this Bible:
- **Route** = emergent internal event chain.
- **Branch** = automatically selected conditional outcome.
- **Variant** = alternate authored result.
- **Choice/Option** = reserved for actual UI choices and should not be used for mid-life events.

### 3. Event Attribute Drift - Mandatory Rule

Events are the primary source of attribute change after age 18.

Events may modify:
- CHR
- INT
- STR
- MNY
- SPR
- FIX

Visible attributes must not remain nearly static after setup. Ordinary, institutional, transformation, and route events may all change attributes.

**First-slice content target:** at least 45% of authored random events should modify one or more visible attributes, and at least 15% should modify two or more. Transformation events may also modify FIX.

This is required so threshold talents can naturally trigger years after the run begins.

### 4. Conditional Talent Trigger Model

Conditional talents are persistent one-shot triggers.

State:
`Dormant -> condition becomes true -> Triggered -> effect applied once -> Spent`

Checkpoints:
1. after starting allocation and species effects;
2. after unconditional start talents;
3. after every completed event/event-chain;
4. after any exceptional system operation that directly changes attributes.

When a dormant condition becomes true:
- apply its effect permanently;
- mark the talent triggered;
- never revoke the effect if the condition later becomes false.

Newly triggered talents may satisfy other dormant talents. Repeat evaluation until no additional talent triggers. Because one-shot talents become spent, this process terminates.

A talent triggered by an event is evaluated **after the entire event chain**, so it cannot retroactively change a branch inside the chain that caused the threshold crossing.

### 5. Trigger Types

- `start` - visible unconditional effect at run start.
- `start_hidden` - hidden run-start effect.
- `threshold_once` - checked at checkpoints until true; fires once.
- `passive` - modifies drafting/eligibility/branches without being consumed.
- Future scheduled triggers may use age conditions, but version 1 can express them as `threshold_once` conditions involving AGE.

### 6. Attribute Modifier Philosophy

Talent modifiers are not limited to +/-1.

Common and Uncommon talents may use:
- +2, +3, +4;
- mixed positive/negative effects;
- threshold-based bonuses.

Legendary and Anomalous talents often provide no direct stat modifiers because their structural effects are already powerful.

Humor may arise from the relationship between flavor and mechanics, but explicit UI mechanics must never lie.

### 7. Rarity

| Tier | Rarity | Meaning |
|---|---|---|
| 1 | Common | Small trait, blunt stat change, mundane joke |
| 2 | Uncommon | Upbringing/profession/institution interaction |
| 3 | Rare | Significant route or survival influence |
| 4 | Legendary | A social/physical rule works differently |
| 5 | Anomalous | A world assumption becomes unreliable |

Rarity means unusual/influential, not strictly beneficial.

### 8. Rarity Progression

Reincarnation and achievements gradually improve the draft distribution. Exact probabilities live in machine-facing balance rules.

Requirements:
- early lives dominated by Common/Uncommon;
- Rare becomes more frequent with progression;
- Legendary remains exciting;
- Anomalous remains unusual;
- Common never disappears.

### 9. Draft and Incompatibility

Ten distinct talents are drafted; the player selects exactly three.

Incompatible talents may appear in the same draft, but selecting one disables the other with a visible explanation.

Initial incompatibilities:
- T1010 Keeps a Low Profile <-> T1023 Main Character Syndrome
- T1025 Unregistered Species <-> T1030 Wrong Species Certificate
- T1028 Object Permanence <-> T1029 Soul Cannot Harden

### 10. Tendency Vocabulary

Exact numeric tendency multipliers are intentionally absent from this Bible until hierarchical event-drafting constants are simulation-tested.

- **Favor** - modest increase at the relevant drafting layer.
- **Strongly Favor** - clearly perceptible increase.
- **Suppress** - lower likelihood without making content impossible.
- **Unlock** - make an event/branch/route eligible.
- **Redirect** - automatically change an authored branch target.

Talents may operate at:
- event channel;
- event family;
- individual event/branch.

### 11. Core Design Rule

A good talent should make the player think:

> "I wonder what kind of life these three together will produce."

not:

> "Which three give the most points?"


## T1001 - Sharp Eyes
**Rarity:** Common

> You notice details other people miss.

**Trigger:** `start`

**Visible mechanics:** INT +2

**Hidden / route mechanics:** Unlocks selected early-detection branches.

**Drafting hooks:** Channel: none; Family: medical; investigation.

**Incompatible with:** none.

**Design note:** Straightforward useful Common; stronger than +1 to make low rarity still feel relevant.


## T1002 - Knows Excel
**Rarity:** Common

> Your parents remain unsure whether this counts as a professional qualification.

**Trigger:** `threshold_once`  
**Condition:** `INT>=5`

**Visible mechanics:** When INT >= 5: MNY +2

**Hidden / route mechanics:** Favors office/corporate ordinary events.

**Drafting hooks:** Channel: ordinary; Family: corporate; finance.

**Incompatible with:** none.

**Design note:** Can trigger at start or years later after INT rises.


## T1003 - Heavy Sleeper
**Rarity:** Common

> You can sleep through almost anything.

**Trigger:** `start`

**Visible mechanics:** SPR +2

**Hidden / route mechanics:** Suppresses some early overnight symptom-detection events and enables delayed variants.

**Drafting hooks:** Channel: none; Family: medical; transformation_symptom.

**Incompatible with:** none.

**Design note:** Visible benefit, hidden risk.


## T1004 - Likes Pigeons
**Rarity:** Common

> They seem to like you too.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Favors parks/public-square events; unlocks rare monument epilogue interactions.

**Drafting hooks:** Channel: ordinary; Family: civic; outdoor; memorial.

**Incompatible with:** none.

**Design note:** Apparently trivial talent with rare long-tail payoff.


## T1005 - Built Different
**Rarity:** Common

> Your physician dislikes this phrase.

**Trigger:** `start`

**Visible mechanics:** STR +3, INT -1

**Hidden / route mechanics:** None.

**Drafting hooks:** Channel: none; Family: none.

**Incompatible with:** none.

**Design note:** Blunt, slightly stupid numeric comedy.


## T1006 - Bad Knees
**Rarity:** Common

> Standing for long periods has never been your specialty.

**Trigger:** `start`

**Visible mechanics:** STR -1

**Hidden / route mechanics:** Favors seated/supported Permanent Form variants where authored.

**Drafting hooks:** Channel: none; Family: display; memorial.

**Incompatible with:** none.

**Design note:** Nominally negative but can redirect presentation outcomes.


## T1007 - Pretty Privilege
**Rarity:** Common

> Society has made several regrettable decisions in your favor.

**Trigger:** `threshold_once`  
**Condition:** `CHR>=8`

**Visible mechanics:** When CHR >= 8: MNY +3

**Hidden / route mechanics:** Favors selected social and luxury-service branches.

**Drafting hooks:** Channel: institutional; Family: finance; luxury; social.

**Incompatible with:** none.

**Design note:** Explicit threshold talent; may trigger after CHR rises during life.


## T1008 - No Thoughts, Head Empty
**Rarity:** Common

> Life is considerably easier when you stop examining it.

**Trigger:** `start`

**Visible mechanics:** INT -2, SPR +4

**Hidden / route mechanics:** None.

**Drafting hooks:** Channel: none; Family: none.

**Incompatible with:** none.

**Design note:** Mechanics deliver the joke rather than contradicting the text.


## T1009 - Frugal
**Rarity:** Common

> You can make three coins behave suspiciously like five.

**Trigger:** `threshold_once`  
**Condition:** `MNY<=3`

**Visible mechanics:** When MNY <= 3: MNY +2

**Hidden / route mechanics:** Favors lower-cost branches in insurance, treatment, and preservation.

**Drafting hooks:** Channel: institutional; Family: finance; insurance; medical.

**Incompatible with:** none.

**Design note:** Can rescue a poor run without equating synthetic forms with cheapness.


## T1010 - Keeps a Low Profile
**Rarity:** Common

> You prefer not to become the center of attention.

**Trigger:** `start`

**Visible mechanics:** SPR +1

**Hidden / route mechanics:** Suppresses celebrity, political-symbol, and public-display families.

**Drafting hooks:** Channel: institutional; Family: celebrity; political_symbol; display.

**Incompatible with:** T1023.

**Design note:** Does not forbid public endings.


## T1011 - Stoneworker's Daughter
**Rarity:** Uncommon

> You knew the difference between granite and marble before long division.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Favors stone family; unlocks craft/restoration branches.

**Drafting hooks:** Channel: transformation; Family: stone; craft; restoration.

**Incompatible with:** none.

**Design note:** Upbringing alters destiny across all species.


## T1012 - Perfect Posture
**Rarity:** Uncommon

> People keep telling you to hold that pose.

**Trigger:** `start`

**Visible mechanics:** CHR +2

**Hidden / route mechanics:** Favors memorial, ceremonial, modeling, and standing display variants.

**Drafting hooks:** Channel: institutional; Family: memorial; ceremonial; display.

**Incompatible with:** none.

**Design note:** Clear benefit with visible long-term risk.


## T1013 - Property Lawyer
**Rarity:** Uncommon

> You know exactly how disturbing the phrase "fixture attached to land" can become.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Unlocks legal branches involving self-ownership, liens, bankruptcy, inheritance, and attached-property disputes.

**Drafting hooks:** Channel: institutional; Family: legal; finance.

**Incompatible with:** none.

**Design note:** Automatic branches only; no player choice UI.


## T1014 - Corporate Favorite
**Rarity:** Uncommon

> Management sees long-term potential in you.

**Trigger:** `start`

**Visible mechanics:** MNY +3, SPR -1

**Hidden / route mechanics:** Favors promotions and corporate-preservation chains.

**Drafting hooks:** Channel: institutional; Family: corporate.

**Incompatible with:** none.

**Design note:** Career success creates preservation exposure.


## T1015 - Second Opinion
**Rarity:** Uncommon

> One doctor is an opinion. Two doctors are paperwork.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Unlocks alternative automatic branches when irreversible treatment is proposed.

**Drafting hooks:** Channel: institutional; Family: medical.

**Incompatible with:** none.

**Design note:** Provides alternative outcomes, not player options.


## T1016 - No Pain, No Gain
**Rarity:** Uncommon

> Your body has filed several complaints. None were reviewed.

**Trigger:** `start`

**Visible mechanics:** STR +3, SPR -1

**Hidden / route mechanics:** Suppresses some early warning events; favors delayed severe variants.

**Drafting hooks:** Channel: transformation; Family: symptom; medical.

**Incompatible with:** none.

**Design note:** Strong early benefit with delayed risk.


## T1017 - Late Bloomer
**Rarity:** Uncommon

> Eventually everyone agrees you were merely taking your time.

**Trigger:** `threshold_once`  
**Condition:** `AGE>=35 & CHR<=5`

**Visible mechanics:** When AGE >= 35 and CHR <= 5: CHR +4

**Hidden / route mechanics:** None.

**Drafting hooks:** Channel: none; Family: none.

**Incompatible with:** none.

**Design note:** Demonstrates age-plus-stat threshold triggers.


## T1018 - Museum Quality
**Rarity:** Rare

> Curators use words like "preservation potential" around you.

**Trigger:** `start`

**Visible mechanics:** CHR +3

**Hidden / route mechanics:** Strongly favors museum/display routes, including acquisition and ownership disputes.

**Drafting hooks:** Channel: institutional; Family: museum; display; art.

**Incompatible with:** none.

**Design note:** Prestige is not autonomy.


## T1019 - Hard to Kill
**Rarity:** Rare

> Death has repeatedly demonstrated poor follow-through.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Authored fatal events may redirect into emergency solidification, temporal suspension, or synthetic/medical preservation.

**Drafting hooks:** Channel: route_special; Family: medical; temporal; preservation.

**Incompatible with:** none.

**Design note:** Does not prevent permanent endings.


## T1020 - Old Soul
**Rarity:** Rare

> Some places feel familiar before you have ever visited them.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Unlocks stronger AEVT/reincarnation-memory events.

**Drafting hooks:** Channel: route_special; Family: memory; reincarnation.

**Incompatible with:** none.

**Design note:** Cross-run depth without simultaneous selves.


## T1021 - Magnetic Personality
**Rarity:** Rare

> People are drawn to you. Occasionally, so are metal objects.

**Trigger:** `start`

**Visible mechanics:** CHR +2

**Hidden / route mechanics:** Favors metal transformation family and selected public/social events.

**Drafting hooks:** Channel: transformation; Family: metal; social.

**Incompatible with:** none.

**Design note:** Literal mechanical pun.


## T1022 - Union Member
**Rarity:** Rare

> Your employment contract is not the only contract in the room.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Unlocks labor/legal branches; suppresses some unilateral employer outcomes; favors arbitration/strike chains.

**Drafting hooks:** Channel: institutional; Family: labor; legal; corporate.

**Incompatible with:** none.

**Design note:** Changes leverage, not whether workplace transformation can occur.


## T1023 - Main Character Syndrome
**Rarity:** Rare

> Statistically improbable things keep happening near you.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Strongly favors Route/Special channel; reduces uneventful outcomes.

**Drafting hooks:** Channel: route_special; Family: rare; hidden.

**Incompatible with:** T1010.

**Design note:** High variance rather than raw power.


## T1024 - My Body, My Property
**Rarity:** Legendary

> You have unusually strong opinions about the meaning of "self-ownership." The courts may eventually hear them.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Unlocks self-ownership/personhood branches after Permanent Form.

**Drafting hooks:** Channel: route_special; Family: legal; ownership.

**Incompatible with:** none.

**Design note:** Changes ending meaning, not transformation probability.


## T1025 - Unregistered Species
**Rarity:** Legendary

> According to several databases, you do not technically have a species.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Institutional events may treat species as unavailable while biological tendencies remain true species.

**Drafting hooks:** Channel: route_special; Family: bureaucracy; species_registration.

**Incompatible with:** T1030.

**Design note:** Classification anomaly without extra numeric meters.


## T1026 - Cheap Immortality
**Rarity:** Legendary

> Eternal preservation is surprisingly affordable if you stop asking questions.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Dangerous events may redirect into low-cost permanent preservation with legal/location/maintenance tradeoffs.

**Drafting hooks:** Channel: route_special; Family: preservation; finance; medical.

**Incompatible with:** none.

**Design note:** Cheap describes service/route, not synthetic material as a category.


## T1027 - Hairline Fracture
**Rarity:** Legendary

> Something about you has been slightly wrong for as long as you can remember.

**Trigger:** `start_hidden`

**Visible mechanics:** No visible attribute modifier

**Hidden / route mechanics:** Raises starting FIX; unlocks fracture/restoration/anomalous-material routes and earlier transformation eligibility.

**Drafting hooks:** Channel: route_special; Family: fracture; restoration; anomaly.

**Incompatible with:** none.

**Design note:** FIX effect remains completely hidden in UI.


## T1028 - Object Permanence
**Rarity:** Anomalous

> Changing the object does not necessarily change the person.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Where authored, consciousness continuity can survive carving, cracking, repair, recasting, relocation, or incorporation.

**Drafting hooks:** Channel: route_special; Family: identity; continuity.

**Incompatible with:** T1029.

**Design note:** Creates unsettling epilogues, not invulnerability.


## T1029 - Soul Cannot Harden
**Rarity:** Anomalous

> Your body may become permanent. Something else refuses to stay.

**Trigger:** `passive`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Where authored, consciousness need not remain permanently bound to the final object.

**Drafting hooks:** Channel: route_special; Family: identity; soul; reincarnation.

**Incompatible with:** T1028.

**Design note:** Permanent body still exists.


## T1030 - Wrong Species Certificate
**Rarity:** Anomalous

> Your biology and your paperwork disagree.

**Trigger:** `start_hidden`

**Visible mechanics:** No direct attribute modifier

**Hidden / route mechanics:** Assigns a different registeredSpecies while keeping true biological species for transformation tendencies.

**Drafting hooks:** Channel: route_special; Family: bureaucracy; species_registration.

**Incompatible with:** T1025.

**Design note:** Institutional branches may use registeredSpecies; biological tendencies use true species.


# 12. Cross-System Rules

## Species interaction
Talents can push against species expectations. For example:
- Elf + Stoneworker's Daughter can make stone a serious route.
- Dwarf + Museum Quality can produce prestigious sculpture rather than industrial preservation.
- Winged Kin + Keeps a Low Profile can suppress some public-symbol pressure.
- Demonkin + Property Lawyer strengthens contractual/legal trajectories.
- Dragonkin + Frugal can resist luxury preservation expectations.
- Human + Main Character Syndrome creates intentionally unpredictable lives.

## No mid-life choice UI
Any phrase such as "offers another option" in design notes means an alternate **automatic branch**, not a button presented to the player.

## Hidden effects
The registry separates visible and hidden mechanics. Codex implements both; UI renders only approved visible text.

`Hairline Fracture` must not display its starting FIX increase.

## Event requirement
The Event Bible / Event Registry must preserve the attribute-drift target defined in section 3. If Monte Carlo simulation shows threshold talents rarely trigger after age 18, increase event-driven stat movement before changing threshold conditions.

# 13. Localization

Canonical creative workflow:
1. stabilize English wording and mechanics;
2. freeze IDs;
3. localize into Traditional Chinese;
4. adapt jokes where literal translation is weak;
5. never localize IDs.

This v1.0 Registry begins with canonical English. Traditional Chinese columns are intentionally reserved for the localization pass.

# 14. Handoff Rule

ChatGPT owns:
- talent concepts;
- prose;
- mechanics intent;
- conditions;
- interactions;
- localization.

Coding agents own:
- schema implementation;
- trigger engine;
- event checks;
- validators;
- tests;
- data import.

Coding agents must not rewrite approved talent prose or invent substitute mechanics unless a documented contradiction prevents implementation.
