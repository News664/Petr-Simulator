# SOLID STATE — H2A Human Playtest Protocol
## Version 0.1

The first human loop evaluates **experience**, not population balance.

## A. Blind player mode

Inspector closed. For each run record:
- Was setup understandable without explanation?
- Which drafted talents were tempting and why?
- Did allocation feel meaningful?
- Was 1x too slow / right / too fast?
- Was 2x still readable?
- Could you infer why major changes occurred?
- Did faction involvement feel like life rather than a route popup?
- Did safe disengagement feel natural?
- Was transformation pressure perceptible with FIX hidden?
- Did the ending feel supported by prior events?
- Which prose felt repetitive, vague or mechanically obvious?

## B. Designer mode

After writing the blind impression, replay/export the exact same life with the
developer inspector.

Check:
- event/variant IDs;
- FIX;
- Material Commitment;
- schedules;
- faction lifecycle/roles;
- route flags;
- ending source.

Use the inspector to explain feedback after the fact, not to teach the normal
player how the game works.

## Minimum first loop

Aim for:
- 3 normal random lives;
- 2 known terminating/reproducible lives;
- 1 faction-heavy life if available;
- 1 long/nonterminal life.

## Feedback labels

Use:
- `UI-BLOCKER`
- `CONFUSING`
- `PACING`
- `CONTENT-REPETITION`
- `CAUSALITY`
- `FACTION-FEEL`
- `TRANSFORMATION-FEEL`
- `ENDING-FEEL`
- `BALANCE-SUSPECT`

Every report includes reproduction JSON or at least:
seed + chosen talents + allocation + contentVersion.

## Balance discipline

A few human runs do not prove a statistical balance problem.

If feedback says "too many early endings", "too few endings", "this talent always
wins", or "this species always becomes X", label it `BALANCE-SUSPECT` and verify
with the retained simulation harness before changing numbers.
