# SOLID STATE — H2A UX Micro-Patch
## Version 0.1

This patch applies two user-facing corrections from the first five successful H2A
manual runs. It does not change simulation outcomes.

## UX-01 — Slower playback

Current H2A timing:
- 1x = 1000 ms / year
- 2x = 500 ms / year

Change to:
- 1x = 1300 ms / year
- 2x = 650 ms / year

Rationale:
- 1x is slightly too fast for careful reading.
- 2x should remain exactly twice the reveal rate of 1x.
- Timing remains presentation-only.

Update:
- canonical/machine UI token source if the repository retains it;
- `App.tsx` or wherever the runtime cadence is defined;
- UI timing tests.

Do not change animation duration merely to fake the cadence. The annual reveal
interval itself changes.

## UX-02 — "Review Life" instead of animated replay

Current normal ending action restarts playback from frame -1 and replays the annual
animation.

Replace the normal-player action with:

`REVIEW LIFE`

Behavior:
1. Keep the exact already-computed `PlaybackLife`.
2. Open a static full-life timeline with **all frames visible immediately**.
3. No timer, no annual reveal animation, no pause/speed controls.
4. Open/scroll near the final event by default so a player can immediately answer
   "what just happened?", while allowing free scrolling back to birth.
5. Clearly distinguish the final annual event.
6. Provide `BACK TO OUTCOME`.
7. The ending/nonterminal result remains unchanged.
8. Review mode must not recompute the simulation or touch RNG.

Recommended state model:
- add an app phase such as `life-review`;
- set the visible frame set to the complete already-computed frame list;
- do not reuse the animated `replay()` path for normal players.

The same behavior applies from both:
- Permanent Status ending screen;
- `RECORD REMAINS OPEN` nonterminal screen.

An animated replay may remain developer-only if useful, but is not required.

Persistence:
- if `life-review` is persisted, restore it as a static complete timeline;
- contentVersion compatibility rules remain unchanged.

## Tests

Add/update tests proving:
- 1x interval is 1300 ms and 2x is 650 ms;
- changing speed still never changes timeline/outcome;
- Review Life exposes all annual frames immediately;
- Review Life does not call/recompute the simulation;
- Review Life has no pause/1x/2x controls;
- final event is marked and the result can be returned to;
- Review Life works for ended and nonterminal lives;
- hidden developer state remains absent in normal review DOM.
