# SOLID STATE — Phase 1.3.1 Micro-Patch Manifest
## Version 0.1

Purpose: a small pre-H2A calibration after Phase 1.3. It does not reopen the
faction architecture and does not perform the global FIX threshold sweep.

Included:
- `content/events/SOLID_STATE_EVENT_BATCH_007_PATCH_v0.2.json`
  - four condition-only edits;
- `content/balance/SOLID_STATE_PHASE1_3_1_TARGETED_SANITY_v0.1.json`
  - 2,500-run targeted diagnostic;
- `docs/PHASE1_3_1_DESIGN_RESOLUTIONS_v0.1.md`
  - P13-C1 ratification, P13-C2 cleanup rule, Q-27/Q-29 micro-calibration;
- `CLAUDE_PHASE1_3_1_MICRO_RUN.txt`
  - integration + targeted-run instruction.

No new events, prose, factions, roles, endings, schema, engine feature, or global
balance profile is supplied.

Expected workflow:
condition edits -> deterministic validation -> 2,500 targeted runs -> report -> stop.

H2A remains open throughout; this is not a new H2A gate.
