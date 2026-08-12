# SOLID STATE — Provisional Balance Constants
## Version 0.1 — Simulation Only

**Canonical source:** `SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json`

These constants are deliberately **not frozen design**. They exist so the Phase-1 engine can run Monte Carlo simulations.

The coding agent must:
- load them as configuration/data;
- avoid scattering them as magic numbers;
- make them easy to replace;
- report simulation behavior before anyone treats them as final.

## Initial channel weights

| Age | ORD | INS | TRN | SPC |
|---|---:|---:|---:|---:|
| 0–5 | 82 | 15 | 3 | 0 |
| 6–11 | 72 | 22 | 6 | 0 |
| 12–17 | 62 | 25 | 11 | 2 |
| 18–24 | 49 | 23 | 22 | 6 |
| 25–34 | 37 | 22 | 31 | 10 |
| 35–44 | 38 | 21 | 29 | 12 |
| 45–54 | 41 | 20 | 27 | 12 |
| 55–64 | 39 | 19 | 30 | 12 |
| 65+ | 35 | 18 | 34 | 13 |

## Weight-class scalar

- VERY_LOW = 0.35
- LOW = 0.65
- NORMAL = 1.00
- HIGH = 1.45
- VERY_HIGH = 2.00

## Initial soft material evidence

- Species Primary = ×1.50
- Species Secondary = ×1.20
- Species Uncommon = ×0.70
- Matching childhood hint = ×1.15
- Matching manifestation = ×1.35
- Route Favor = ×1.20
- Talent Favor = ×1.25
- Talent Strongly Favor = ×1.55
- Talent Suppress = ×0.65

These stack only where the implementation contract/event drafting rules permit them.

They are specifically intended to test whether hints/manifestations become too deterministic.

## FIX -> Transformation channel

- 0–20: ×0.75
- 21–40: ×1.00
- 41–60: ×1.25
- 61–80: ×1.60
- 81+: ×2.00

FIX still does not directly end a life.

## Diagnostic maximum age

Phase-1 simulation maximum: **120**.

Reaching age 120 without a canonical ending is not converted into a fake ending. Count it as a nonterminal diagnostic failure and report it.

## Diagnostic sampling

Species should be stratified equally so each species has comparable sample size.

Because final talent rarity/meta sampling is not frozen, run several talent modes:
- no-talents baseline;
- uniform random three compatible talents (diagnostic only);
- targeted threshold cases;
- targeted material cases;
- targeted anomalous cases.

Do not present uniform-talent results as final gameplay distribution.

## Ending-age targets

These are balance targets:

- 18–24: 18–22%
- 25–34: 35–40%
- 35–44: 20–25%
- 45–54: 8–12%
- 55–64: 4–7%
- 65+: 2–5%

## Material determinism warnings

Warn if broad neutral simulations show:

- P(final X | only childhood hint X) > ~70%
- P(final X | first manifestation X) > ~80%

These are diagnostic guardrails, not hard-coded caps.

## Fallback warning

- fallback is forbidden before age 25;
- desirable 25+ fallback rate: near zero;
- provisional warning threshold: >5% of age-25+ annual events.

## Freeze procedure

These values become a first-playable balance version only after:

1. engine correctness tests pass;
2. Monte Carlo report is produced;
3. design reviews the report;
4. constants are revised;
5. the new balance file is explicitly marked `FROZEN_FIRST_PLAYABLE`.
