# SOLID STATE — H2A Manual Playtest Round 1
## Design intake · 5 successful manual runs

This document records qualitative H2A feedback. It is not statistical evidence.

## Outcome

- 5 lives completed manually.
- 1 reached a Permanent Form ending: Dragonkin, mixed material.
- 4 reached the current open-record/nonterminal outcome.

This is directionally consistent with the known low completion rate, but five runs
must not be used to estimate the population rate.

## UX observations

1. 1x playback is slightly too fast for careful reading.
   - Design response: slow by 30%, to 1300 ms/year.
   - Preserve 2x as exactly twice the reveal rate: 650 ms/year.

2. Certificate is visually/lore-wise too simple and not sufficiently black-comic.
   - Deferred to the upcoming Pressure & Tone/certificate design pass.
   - Do not improvise new certificate lore in the threshold task.

3. `Replay Life` is counterintuitive after an ending.
   - Player intent is usually to inspect "what happened?"
   - Replace with static `Review Life`: all frames immediately visible and
     scrollable, preferably positioned near the final event.

## Content observations

- Housing / "move home" appears repetitive and often interacts with MNY.
  Measure before rewriting.
- CHR and INT sometimes appear to exceed 15.
- MNY and SPR appeared flatter / somewhat downward.
  Measure distributions; do not clamp yet.
- Faction chains can feel disconnected.
- Safe opt-out feels frequent enough that the player may not perceive a chain.
- Overall tone currently feels closer to "slightly weird life simulation" than
  dystopian black comedy.

## Design direction after calibration

The next creative content pass is expected to address:
- authored low-stat vulnerability/crisis events;
- some high-stat institutional attention/risk;
- more varied housing reasons/outcomes;
- faction textual callbacks and visible institutional identity;
- stronger ordinary-life dystopian normalization;
- richer black-humor certificate.

Low visible stats should not directly trigger generic random death. They should
make specific authored bad institutional outcomes more eligible/likely.

No such content is added in the current UX + threshold calibration task.
