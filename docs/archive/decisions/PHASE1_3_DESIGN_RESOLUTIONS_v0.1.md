# SOLID STATE — Phase 1.3 Design Resolutions
## Version 0.1

Merge these into `docs/OPEN_QUESTIONS.md`. Do not create a competing permanent register.

## P12-C1 — duplicate event ID

Ratify Claude's Phase 1.2 resolution:
- published Batch 005 `EVT-INS-ACA-0011` remains immutable;
- Batch 006 research follow-up remains `EVT-INS-ACA-0012`;
- future patch validation compares proposed IDs against the entire published corpus.

## Q-28 — faction relationship model

**RESOLVED.**

Use a small flag-backed FSM for lifecycle:
`NONE -> CONTACTED -> ENGAGED -> COMMITTED`
with authored exits to `OPTED_OUT` / `CLOSED`.

Roles such as CLIENT, SUBJECT, DEBTOR, MEMBER, TARGETED and OBLIGATED are orthogonal flags, not FSM states.

Events use structured `factionTransitions`; conditions still use `FLAG`.
No faction condition syntax and no numeric reputation/alignment meter.

`OPTED_OUT` is a genuine safe exit that blocks ordinary personalized faction chains.

## Q-29 — faction prominence

**RESOLVED IN DIRECTION / numeric target later.**

Faction presence may be broad. Faction terminality should be substantially lower than
the Phase 1.2 result where 48.6% of endings were faction-caused.

Measure separately: news exposure, contact, engagement, opt-out, closure, commitment,
targeting, and faction-caused ending.

Do not freeze a target percentage yet.

## Q-30 — passive faction news / lore fallback

**RESOLVED.**

Most faction news is once-per-run and protagonist-unrelated. It creates no personal faction state.

Add `lore_fallback_only` as a separate fallback tier ahead of generic fallback.
One rare repeatable bulletin per faction is enough for the first slice.

Report lore fallback separately from generic fallback.

## Q-27 — ending-age distribution

**OPEN NUMERICALLY; Phase 1.3 structural change approved.**

Phase 1.2 faction contact behaved like a 1–3 year fuse. Phase 1.3 standard path is:

`CONTACT -> DISPOSITION -> ENGAGED/EXIT -> ESCALATION -> COMMITTED/EXIT -> CLIMAX`

Only strongly conditioned disposition variants keep sudden 18–24 faction endings.

Existing faction climaxes require `COMMITTED` and age min 25, so ordinary faction
terminal paths should populate 25–34 instead.

Late-life Medical/Family entries are tightened by prior-route conjunctions.
Their `FIX>=40` climax gates stay unchanged for this content iteration.

Do not run LOW/MID/HIGH or freeze global FIX thresholds until this structure is measured.

## Q-23 — fallback

**OPEN / MONITOR.**

No filler expansion. Lore fallback is for world texture, not a claim that generic fallback is solved.
Report both metrics separately.

## Q-24 and Q-22

Remain CLOSED. No changes.

## Q-02 / Q-14 / Q-25

No global/numeric change:
- Q-02 threshold numbers remain deferred until Phase 1.3 structure is measured;
- Q-14 T1027 remains deferred;
- Q-25 achievements remain meta-progression work.

## H2A milestone

**RESOLVED.**

Phase 1.3 is the final planned headless-only content iteration.

After one compact Phase 1.3 sanity diagnostic, H2A opens if the correctness blockers in
`SOLID_STATE_H2A_HUMAN_PLAYTEST_GATE_v0.1.md` pass.

Balance target misses alone do not keep H2A closed.
