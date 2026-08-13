# SOLID STATE — Phase 1.1 Design Resolutions
## Version 0.1

This file is the authoritative design-resolution input for the Phase 1.1 patch.

Claude Code should merge these decisions into the matching Resolution blocks in
`docs/OPEN_QUESTIONS.md` rather than treating this file as a parallel permanent
question register.

Decision date: 2026-08-13.

## Status summary

| Q | Phase 1.1 status | Decision |
|---|---|---|
| Q-01 | RESOLVED | Add varied ages 0–5 content; repeats are supplementary, not the main fix. Strengthen schedulability validation. |
| Q-02 | RESOLVED DESIGN / NUMBERS EXPERIMENTAL | FIX stays event-driven. Add visible FIX sources/chains and lower commitment/climax gates via a parameter sweep. No passive drift. |
| Q-03 | RESOLVED | Preserve 65+ ending target; add dedicated late-life climax content. |
| Q-04 | RESOLVED | Separate broad family tendency from optional local refinement hooks; no extra drafting layer. |
| Q-05 | RESOLVED | Talent machine fields distinguish Favor / Strongly Favor / Suppress / Unlock / Redirect; narrative tags do not automatically become weights. |
| Q-06 | RESOLVED | Awareness is structured; Uncertain needs no authorization; Continuous/Intermittent/Displaced do. |
| Q-07 | RESOLVED | Canonical machine-validated Route Tag Registry. Academic has no TRN event favor. |
| Q-08 | RESOLVED | Cooldown means `AGE - lastAge >= cooldown`. |
| Q-09 | RESOLVED | `validityCondition` is a fire-time gate, not an automatic destruction test. |
| Q-10 | RESOLVED FOR PHASE 1.1 | Uniform eligible-family weighting is the design baseline; retain sum-of-event-weights only as A/B diagnostic. |
| Q-11 | RESOLVED | Add schedule `priorityOrder` default 0; equal values use seeded RNG. |
| Q-12 | RESOLVED | Visible stats unclamped; FIX floored at 0. |
| Q-13 | RESOLVED | `TMS` = completed prior runs. |
| Q-14 | OPEN / DEFERRED | T1027 starting FIX value remains provisional; sweep after revised FIX economy. |
| Q-15 | RESOLVED | T1025 -> `UNREGISTERED`; T1030 -> seeded other registered species, fixed for the run. |
| Q-16 | RESOLVED | Baseline starting FIX = 0. |
| Q-17 | RESOLVED | Report balanced, min-max, and archetypal allocation policies separately. |
| Q-18 | RESOLVED | `Uncertain` Awareness requires no special authorization. |
| Q-19 | RESOLVED | SPC content belongs in v1; Batch 005 supplies initial SPC events. |
| Q-20 | RESOLVED | Keep mandatory routes; Batch 005 supplies three committed sequences. |
| Q-21 | RESOLVED | Dedicated SPC anomalous routes reach END-ANO-001 and END-ANO-002. |
| Q-22 | RESOLVED | Wood >50% first-manifestation share is unintended; add competing adolescent manifestations and measure neutral-Human distribution. |
| Q-23 | OPEN / MONITOR | ~35% adult fallback is unacceptable; do not add filler yet. Re-measure after FIX/ending repair. |
| Q-24 | OPEN / MONITOR | Re-measure Late Bloomer after ending economy is repaired before changing its condition. |
| Q-25 | OPEN / DEFERRED | Achievement Registry remains a later meta-progression deliverable. |
| Q-26 | RESOLVED | No passive annual FIX drift. Age already changes channel pressure; FIX changes through authored causes. |

---

## Q-01

**Decision:** Solve the ages 0–5 defect with a broader childhood event pool, not
primarily by increasing reuse of the same repeatable event.

Batch 005 adds six varied early-childhood events, five one-time and one lightly
repeatable. Repeatable events remain a safety layer, but the player should not
receive an early impression that the content pool is shallow.

**Validation change:** replace capacity-only reasoning with schedulability
checking that considers once-per-run consumption, repeat cooldown, max count,
age windows, and reachable selection history.

**Files:** Event Batch 005; Content Schema v0.3; Phase 1.1 Acceptance Addendum.

## Q-02 and Q-26

**Decision:** FIX is event-driven. There is no passive age increment.

Age already changes transformation pressure through the age/channel profile.
Adding hidden yearly FIX merely because time passed would duplicate that signal
and would be difficult to explain to the player.

FIX may rise repeatedly across years when a concrete route explains it, e.g.
occupational exposure or a controlled-hardening treatment course.

Batch 005 adds visible FIX sources and multi-year FIX chains.

Commitment/climax gates should be lower than the original provisional values, but
the exact values are not frozen. Run LOW / MID / HIGH profiles plus the original
reference using `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`.

Do not add `fixAnnualDrift`.

## Q-03

**Decision:** Keep the 65+ target band.

Late-life Permanent Forms are a distinct second-wave narrative rather than old
mid-life climaxes simply remaining eligible forever. Batch 005 adds dedicated
65+ Medical and Family route entries/climaxes.

## Q-04

**Decision:** Do not collapse all refinement labels into broad-family tiers.

Use:
1. broad family tendency at family selection;
2. optional refinement hook at local event selection.

No extra refinement drafting stage is permitted.

`MAGICAL_SEAL` is a registered special hook with no broad material family.

Canonical structure: Species Registry v1.2.

## Q-05

**Decision:** Add typed talent machine semantics.

Drafting operations use stable channel/family targets:
- `drafting_favor`
- `drafting_strongly_favor`
- `drafting_suppress`

Non-weight operations remain explicit metadata:
- `unlock_tags`
- `redirect_tags`
- `narrative_tags`

Unlock/redirect/narrative tags do not become multipliers automatically.

Canonical structure: Talent Registry v1.1.

## Q-06 and Q-18

**Decision:** Awareness must be machine-structured rather than interpreted from
prose alternatives.

Rules:
- ordinary solid Permanent Form -> Unconscious;
- temporal -> Suspended;
- Uncertain is allowed when authored and requires no special authorization;
- Continuous / Intermittent / Displaced require authored authorization;
- END-ANO-001 authorizes Continuous/Intermittent through T1028;
- END-ANO-002 authorizes Displaced through T1029.

Canonical structure: Ending Registry v1.1.

## Q-07 / Q-07a

**Decision:** Route-tag mapping is canonical data and must be validator-checked.

Every event `routeTag` must exist in Route Tag Registry v1.0.

Under the Phase 1.1 uniform-family baseline, matching active route state may give
at most one event-level route-favor scalar. Route tags do not alter family
probability unless a future explicit field says so.

`academic` remains valid metadata on Temporal research events but cannot grant a
Transformation-event favor. Ratify the behavioral intent of E-01; move the rule
from the provisional adapter into canonical Route Tag Registry data.

## Q-08

**Decision:** Ratify `AGE - lastOccurrenceAge >= repeatCooldownYears`.

## Q-09

**Decision:** Ratify `validityCondition` as a yearly fire gate.

A false condition means "not ready this year", not "destroy the schedule".
A future explicit `cancelCondition` may be introduced if authored route
abandonment needs it.

## Q-10

**Decision:** Reject content-density family weighting as the design baseline.

Phase 1.1 baseline:
`channel -> uniform eligible family -> weighted event inside family`.

Retain `sum_of_event_weights` only for one A/B comparison in the next report.
If uniform families perform badly, the next design option is explicit family
base weights, not accidental content-density weighting.

## Q-11

**Decision:** Add `priorityOrder: integer = 0` to schedules.

Within the same priority class:
1. higher `priorityOrder`;
2. seeded RNG on an actual tie.

Do not use creation order as the permanent design tiebreak.

## Q-12

**Decision:** Ratify visible stats unclamped and FIX minimum 0.

## Q-13

**Decision:** Ratify TMS as number of completed prior runs. First life = 0.

## Q-14

**Status remains OPEN.**

Do not freeze T1027 at +15. Run sensitivity values 5 / 8 / 10 / 12 / 15 after
the revised FIX economy is in place and report separately.

## Q-15

**Decision:** Ratify:
- T1025 -> `RSPECIES = UNREGISTERED`;
- T1030 -> one seeded uniformly-selected species different from true `SPECIES`,
  assigned once and fixed for the run.

## Q-16

**Decision:** Baseline starting FIX = 0.

## Q-17

**Decision:** Diagnostic allocation must not pretend one player style is
representative.

Report separately:
- balanced/random fill;
- min-max primary/secondary;
- seeded archetype set.

Do not mix the three into one headline statistic.

## Q-19

**Decision:** SPC remains part of the v1 architecture.

Batch 005 adds initial ANO / REIN / TLNT content. Do not zero the SPC channel.

## Q-20

**Decision:** Mandatory committed routes are intentional.

Batch 005 provides:
- controlled-hardening Medical sequence;
- Object Permanence anomalous sequence;
- Soul Cannot Harden anomalous sequence.

Each remains one visible event per year.

## Q-21

**Decision:** END-ANO-001 and END-ANO-002 receive dedicated hidden SPC routes,
not generic redirects attached to every ordinary ending.

## Q-22

**Decision:** The previous ~52% Wood first-manifestation share is an availability
artifact and is not intended.

Batch 005 adds reversible adolescent STON/METL/CRYS/GLAS/CERA/TEMP events. Wood
may have a small age-window advantage but should no longer dominate a neutral
Human purely because it was the only pre-18 family.

Next report must measure:
`P(first manifestation family | HUMAN, no talents, no material evidence)`
and average first-manifestation age by family.

Synthetic remains primarily an intervention route rather than a spontaneous
adolescent symptom; MIXD/ANOM are not ordinary base manifestations.

## Q-23

**Status remains OPEN / MONITOR.**

35% adult fallback is unquestionably unintended.

Do not respond by bulk-authoring late-life filler before the revised ending
economy is measured. Re-run after Q-01/Q-02/Q-03 changes.

Target remains near zero; >5% age-25+ fallback is a warning.

## Q-24

**Status remains OPEN / MONITOR.**

Do not change T1017 yet. Re-measure activation age/rate under the revised ending
economy and multiple allocation policies.

## Q-25

**Status remains OPEN / DEFERRED.**

Achievement Registry belongs to the meta-progression phase. Until it exists,
unknown ACH behavior remains a documented provisional limitation.
