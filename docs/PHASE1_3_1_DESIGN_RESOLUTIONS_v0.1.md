# SOLID STATE — Phase 1.3.1 Micro-Calibration Resolutions
## Version 0.1

Merge these decisions into `docs/OPEN_QUESTIONS.md`; do not create a competing
permanent question register.

## P13-C1 — missing Phase 1.3 handoff inputs

**CLOSE / RATIFY IMPLEMENTATION.**

Design ratifies Claude's mechanically derived implementations as canonical:

- Content Tool v0.3 must render/check `factionIds`, `factionInteraction`,
  `factionTransitions`, and `lore_fallback_only` so generated review mirrors do
  not omit canonical Schema v0.4 fields.
- Route Tag Registry v1.2 is correct with faction route context activated only
  by `STATE_CONTACTED`, `STATE_ENGAGED`, and `STATE_COMMITTED`.
- Historical `FAC_*_CONTACT`, `STATE_OPTED_OUT`, and `STATE_CLOSED` do not grant
  faction route Favor.
- `faction_news` is metadata-only: no flag prefix, no active route Favor, and no
  transformation-family Favor.

The missing files were a packaging error, not a design disagreement.

`PHASE1_CONFLICTS.md` currently says two Phase 1.3 conflicts, P13-C1 and P13-C2.
If there is no actual `## P13-C2` definition anywhere in the authoritative docs,
correct that sentence to say one conflict, P13-C1. If a real P13-C2 exists,
preserve it and report it instead of deleting it.

## Q-27 — pre-H2A young-ending observability

**OPEN NUMERICALLY; Phase 1.3.1 micro-calibration approved.**

The faction FSM and safe-exit architecture remain unchanged.

Apply four condition-only edits in Batch 007:

1. Last Posture disposition safe exit:
   `TLT[T1010] | INT>=8`
   becomes
   `TLT[T1010] | (INT>=8 & SPR>=6)`.

2. Meridian sudden preservation:
   `CHR>=9 & FIX>=14`
   becomes
   `CHR>=8 & FIX>=12`
   in both MAT=NONE and existing-material variants.

3. CRI sudden experiment:
   `FIX>=18 & STR<=3`
   becomes
   `FIX>=16 & STR<=3`
   in both MAT=NONE and existing-material variants.

4. Black Ledger sudden enforcement:
   `MNY<=0 & MAT!=NONE`
   becomes
   `MNY<=1 & MAT!=NONE`.

These are observability edits, not the final 18-24 balance target.

Do not change age windows, schedules, faction lifecycle transitions, normal
commitment ladders, or global FIX thresholds.

## Q-29 — faction prominence

No target is frozen. Keep Phase 1.3's broad direction: faction presence may be
common, but faction-caused endings should remain substantially below the old
48.6% Phase 1.2 result.

For this micro-run, sudden faction endings should remain a minority branch.
Do not globally raise faction COMMITTED rates.

## Q-02 / Q-14

Remain deferred for this micro-patch.

The retained LOW/MID/HIGH threshold sweep is still planned after this small
condition calibration and may be run in parallel with early H2A/UI work.

T1027 remains outside this run.

## H2A

H2A remains OPEN. This micro-calibration is not a new UI gate.

After the targeted sanity report, stop for design review. Do not start React/UI
inside the same task.
