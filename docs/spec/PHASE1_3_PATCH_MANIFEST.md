# SOLID STATE — Phase 1.3 Patch Manifest
## Version 0.1

Phase 1.3 is the final planned headless-only content iteration before H2A.

## Main changes

- Faction Registry v0.2: flag-backed lifecycle FSM + orthogonal roles.
- Safe OPTED_OUT/CLOSED states.
- Structured event `factionTransitions`.
- Faction event metadata `factionIds` / `factionInteraction`.
- Six Phase 1.2 contact seeds no longer schedule climaxes directly.
- Six existing faction climaxes require COMMITTED and open at age 25.
- 12 new disposition/escalation events.
- 12 one-time progressive faction-news events.
- 6 rare repeatable lore-fallback bulletins.
- New `lore_fallback_only` tier ahead of generic fallback.
- Late-life Medical/Family entry conditions tightened again.
- Explicit H2A human-playtest gate.
- Content-tool v0.3 requirements so new faction/FSM fields appear in generated review mirrors.

## Content size

Batch 007 adds **30 events**:
- 12 faction lifecycle events;
- 12 one-time news events;
- 6 lore-fallback events.

Existing Batch 006 is structurally patched rather than duplicated.

## Coding handoff

Use `CLAUDE_PHASE1_3_FULL_RUN.txt` for the current handoff. It performs integration,
deterministic validation, the single 5,000-run Phase 1.3 sanity diagnostic, and the
H2A gate check in one task.

The earlier split instructions are retained as reference/fallback, but are not needed
when using the combined full-run instruction.

Skipped sweep/A-B/allocation/T1027 diagnostics remain retained for H2B or future
large/relevant balance patches.

## H2A

After the later sanity run, H2A opens if correctness blockers pass.
Statistical balance misses alone do not keep the browser prototype closed.
