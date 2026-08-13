# SOLID STATE — H2A Human Playtest Gate
## Version 0.1

Phase 1.3 is the final planned headless-only content iteration.

Simulation cannot answer whether the game is readable, funny, repetitive, causally
legible, or satisfying. H2A therefore opens before final balance freeze.

## Hard H2A blockers

After Phase 1.3 integration, run one compact sanity diagnostic. H2A opens if:

1. canonical content loads/validates;
2. no duplicate IDs;
3. deterministic/golden correctness tests pass after intentional regeneration;
4. exactly one visible event per age remains true;
5. no ending or Material Commitment before age 18;
6. no pre-25 coverage defect in the sanity corpus;
7. faction FSM never has two lifecycle states for one faction;
8. every transition is registered/legal;
9. after OPTED_OUT/CLOSED, ordinary personalized events from that faction do not occur;
10. news/lore may still occur after opt-out without reopening personal state;
11. no simulation crash or invalid ending/material state.

**Balance misses are not H2A blockers.**

Known balance issues may remain: ending-age targets, provisional FIX thresholds,
T1027, faction-ending share, late-life fallback mix, achievements, Afterform, zh-TW.

## H2A minimum browser experience

Setup:
- species roll/display;
- draft 10 talents;
- choose 3;
- allocate starting visible stats;
- start life.

Playback:
- annual timeline;
- age;
- CHR/INT/STR/MNY/SPR;
- FIX hidden normally;
- 1x / 2x / pause;
- deterministic playback independent of UI timing.

Ending:
- ending title;
- Permanent Form summary;
- Certificate fields supported by current Ending Record;
- replay/new life;
- seed display/copy.

Persistence:
- basic localStorage for current run/replay data;
- do not block on achievements/meta progression.

## Developer/playtest inspector

Developer-only toggle/query parameter should show:
- seed;
- FIX;
- MAT/prior materials;
- flags;
- schedules;
- faction lifecycle per faction;
- faction roles;
- route flags;
- event/variant IDs;
- ending source event;
- export run JSON.

Normal mode hides these.

## Exact-run reproduction

Export at minimum:
seed, species, drafted talents, chosen talents, allocation, content fingerprint,
timeline event IDs + variant indexes, ending ID.

## First human-loop questions

- Is setup understandable and interesting?
- Does one event/year feel right?
- Are 1x and 2x readable?
- Are causal connections understandable without route flags?
- Can faction involvement be felt without a faction dashboard?
- Does safe disengagement feel like life moving on?
- Do sudden endings feel surprising but supported?
- Do longer faction relationships feel distinct?
- Is transformation pressure perceptible without FIX?
- Are visible stat changes too noisy?
- Does the ending feel meaningful for the run length?
- Which events feel repetitive or too mechanically obvious?

## H2B

After human H2A feedback, return to retained diagnostics:
FIX threshold sweep; isolated T1027; allocation comparison; faction escalation/opt-out
distribution; ending-age regression; material distribution/determinism; and family-weight
A/B only when that dimension materially changes.
