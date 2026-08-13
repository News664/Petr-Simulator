# SOLID STATE — Provisional Balance Constants
## Version 0.2 — Phase 1.1 Simulation Only

**Canonical source:** `content/balance/SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.2.json`

Changes from v0.1:

- family baseline = **uniform among eligible families**;
- `sum_of_event_weights` retained only as a diagnostic comparison;
- **no passive annual FIX drift**;
- baseline starting FIX = 0;
- visible stats remain unclamped; FIX floor = 0;
- cooldown semantics = `AGE - lastAge >= cooldown`;
- schedule validity = fire-time gate;
- species refinement hook scalars added for local event selection;
- diagnostic allocation policies expanded.

The age channel profile is unchanged.

### Species refinement scalars

- Favor: ×1.15
- Strongly Favor: ×1.30
- Suppress: ×0.75

These are local event-selection modifiers only.

### FIX

FIX is changed by authored event/talent effects only.

Exact commitment and climax gates are **not frozen in this file**. Phase 1.1
compares the profiles in `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`.

### Family weighting

Design baseline:

`channel -> uniform eligible family -> locally weighted event`

The density-weighted rule remains measurable but is not authoritative.
