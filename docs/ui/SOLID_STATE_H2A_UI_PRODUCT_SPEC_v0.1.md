# SOLID STATE — H2A UI Product & Interaction Specification
## Version 0.1

## 1. Purpose

H2A is the first human-playable browser version of SOLID STATE.

The objective is **not** final visual polish or final balance. It exists to put a
human into the loop and answer experience questions Monte Carlo cannot:

- Is setup understandable and fun?
- Does one visible event per year feel readable?
- Can causes and consequences be inferred without route flags?
- Do faction interactions feel persistent without becoming a faction dashboard?
- Are 1x and 2x readable?
- Is transformation pressure perceptible with FIX hidden?
- Does an ending feel meaningful for the time spent watching the run?

No new mid-life player agency is introduced.

## 2. Player agency contract

Normal player actions are only:
1. start a new run / receive the random species;
2. choose exactly 3 talents from the drafted 10;
3. allocate starting visible attributes;
4. begin life;
5. during life: pause/resume, switch 1x/2x, scroll/inspect already revealed UI;
6. after life: replay, copy seed, or start another life.

No dialogue choices, contracts, treatment choices, faction choices, route buttons,
manual event selection, ending selection, or normal-mode "next year" button.

## 3. Visual direction — Institutional Dark

The application should feel like a public-service portal built for a society in
which bodily permanence is mundane.

Reference mood:
- municipal record system;
- insurance / civil-service portal;
- museum accession database;
- understated modern fantasy;
- dark graphite shell with muted brass institutional accents;
- deadpan stamps, labels and filing terminology.

Avoid cyberpunk neon, horror gore, ornate medieval fantasy, fetish framing,
gamified faction reputation UI, generic SaaS dashboard styling, and giant hero
illustrations in H2A.

The ending certificate deliberately contrasts with the dark shell by appearing as
an off-white paper document.

Use `content/ui/SOLID_STATE_H2A_UI_TOKENS_v0.1.json`.

## 4. Global shell

Desktop:
- max application width around 1180–1280 px;
- narrow utility/header strip;
- main content centered;
- during playback: timeline is primary; profile/status rail sticky to the right.

Mobile:
- single column;
- compact sticky status strip above the timeline;
- inspector becomes a full-screen drawer when enabled.

Header:
- `SOLID STATE`;
- subtle record/version text in monospace;
- optional minimal settings/help;
- dev mode may show `DEV`.

Do not display a faction status widget in normal mode.

## 5. Screen flow

### 5.1 Landing

Title: `SOLID STATE`
Subline: `Everyone becomes something.`
Institutional microcopy: `Citizen Lifecycle Record System`

Primary: `BEGIN NEW LIFE`
Secondary only if a compatible save exists: `CONTINUE RECORD`
Optional: `ABOUT THIS RECORD`

Developer-only:
- explicit seed field;
- known test-seed presets.

A footer may say `Outcomes are not subject to appeal.`

Do not make this a huge marketing landing page; reach setup quickly.

### 5.2 Species reveal — Birth Registration

A normal new run creates one seed and derives one random species. The player
cannot choose the species and cannot reroll it without abandoning that run.

Heading: `BIRTH REGISTRATION`
Institutional label: `REGISTERED BIOLOGICAL CLASSIFICATION`

Show:
- formal species name;
- colloquial name in smaller text when different;
- visible starting modifiers;
- allocation-point budget;
- a short registry note if already available.

Primary: `ACKNOWLEDGE RECORD`

Do not expose material tendencies numerically in H2A.

### 5.3 Talent selection — Personal Irregularities

Heading: `PERSONAL IRREGULARITIES`
Instruction: `Select exactly three traits for the permanent record.`

Show the ten drafted talents in deterministic draft order.

Each card:
- name;
- rarity stars / rarity label;
- description;
- selected state;
- incompatibility state if applicable.

Never show hidden drafting hooks, route weights, FIX effects that are not authored
as visible, unlock tags, or designer notes.

Interaction:
- keyboard accessible toggle;
- counter `2 / 3 SELECTED`;
- incompatible selection is blocked with a short explanation;
- after three are selected, remaining cards stay visible but cannot be added until
  one is deselected.

Primary: `CONTINUE TO ASSESSMENT`

### 5.4 Attribute allocation — Initial Assessment

Heading: `INITIAL ASSESSMENT`

Visible attributes:
- Appearance `CHR`
- Intelligence `INT`
- Constitution `STR`
- Wealth `MNY`
- Spirit `SPR`

Allocation is pre-species-modifier; every base stat remains 0–10.

Show:
- points remaining;
- plus/minus;
- base value;
- species modifier;
- projected post-species value.

Example:
`Constitution STR   4   +2 species   = 6`

Do not expose FIX.

Selected talents may appear in compact summary. Do not attempt to preview every
threshold-talent result.

Actions:
- `RESET ALLOCATION`
- `REVIEW RECORD`

No auto-build/archetype button in H2A; manual allocation is part of the playtest.

### 5.5 Review — Record Summary

Show:
- species;
- three talents;
- base allocation;
- visible species modifiers;
- seed in a subdued expandable row.

Primary: `BEGIN LIFE`
Secondary: `BACK`

This is the last player decision before observation-only playback.

## 6. Life playback

### Layout

Primary timeline:
- chronological vertical feed;
- exactly one card per age/year;
- newest revealed entry emphasized;
- previous entries remain readable;
- gently auto-scroll unless player has manually scrolled upward;
- if scrolled upward, show `RETURN TO PRESENT`.

Right rail / mobile status:
- Age;
- Species;
- Material Status;
- CHR / INT / STR / MNY / SPR;
- playback controls.

### Event card

Normal mode shows only:
- `AGE 23`
- authored event text;
- optional visible stat-delta chips;
- optional talent-activation annotation.

Do not show event ID, variant index, channel, family, route tags, schedule source,
faction lifecycle, or FIX.

Stat-delta chips may read `INT +1`, `SPR −1`.

A threshold talent activation may be attached to the same annual card:
`Talent activated — Late Bloomer`

This is not another life event.

### Material status

Before commitment:
`MATERIAL STATUS — MOBILE`

After authored commitment:
use readable material text such as `MATERIAL STATUS — STONE TRAJECTORY`.

Never show the internal MAT code or a progress bar.

### Playback controls

Exactly:
- Pause / Resume
- `1×`
- `2×`

Default 1x: 1000 ms per annual reveal.
Default 2x: 500 ms.

Speed affects reveal timing only. No normal-mode step button and no 4x in H2A.

### Precomputed playback

At `BEGIN LIFE`, the browser may compute the complete deterministic life
immediately and reveal immutable annual frames progressively.

This is preferred because the player has no mid-life choices and it guarantees
that browser timing cannot affect RNG.

Never expose future frames or final future state before they are revealed.

## 7. Ending

After the final event is revealed, transition to the ending presentation.

Title strip: `NOTICE OF PERMANENT STATUS`

Show:
- ending title;
- canonical ending description;
- ending age;
- final transformation summary.

Then a paper-like `CERTIFICATE OF PERMANENT STATUS`.

Fields where supported:
- Primary Material
- Form
- Awareness
- Integrity
- Legal Status
- Ownership
- Autonomy
- Conversion Consent
- Location
- Social Meaning

Footer:
- species / registered species when meaningfully different;
- seed;
- content fingerprint in small technical text.

Normal actions:
- `NEW LIFE`
- `REPLAY THIS LIFE`
- `COPY SEED`

No universal GOOD/BAD ending label.

## 8. Nonterminal diagnostic horizon

Current balance still produces many runs that reach the diagnostic maximum
without an ending. Handle this honestly.

Do not fabricate a Permanent Form ending.

Heading: `RECORD REMAINS OPEN`

Copy:
`This life reached the current simulation horizon without a Permanent Form ending.
No ending has been assigned.`

Actions:
- `NEW LIFE`
- `REPLAY THIS LIFE`
- `COPY SEED`

In developer mode expose reached age and diagnostics.

This is temporary H2A behavior, not a world claim about age 120.

## 9. Local persistence

Namespace: `solid-state:h2a:v1:*`

Persist enough to regenerate:
- contentVersion;
- seed;
- setup preview;
- chosen talents;
- explicit base allocation;
- current phase;
- revealed frame index;
- speed;
- paused state.

Reload:
- matching contentVersion: regenerate and restore reveal position;
- mismatched contentVersion: explain incompatibility and offer a new life.

Do not silently replay an old record under new content.

## 10. Accessibility / responsive requirements

- keyboard-accessible talent/allocation controls;
- visible focus states;
- minimum 44x44 px primary touch targets;
- readable at 360 px viewport;
- no meaning by color alone;
- `aria-live="polite"` for the newly revealed annual event only;
- honor `prefers-reduced-motion`;
- reduced motion removes decorative movement but preserves reveal cadence;
- sufficient contrast.

## 11. i18n architecture

H2A exposes English because the event/talent corpus is not fully translated.

But UI strings are keyed from day one:
- locale provider/hook;
- `en` message file;
- locale type already allowing `en` and `zh-TW`;
- no component prose hard-coded beyond IDs/tests.

Do not expose a `zh-TW` switch until the necessary canonical content actually
has translations. Do not machine-fill missing translations.

## 12. Explicitly deferred

- achievements/meta progression;
- Afterform;
- faction dashboard;
- route log;
- public FIX meter;
- public developer data;
- advanced art/animation;
- audio;
- backend/cloud save;
- sharing service;
- 4x/skip playback;
- final localization coverage.
