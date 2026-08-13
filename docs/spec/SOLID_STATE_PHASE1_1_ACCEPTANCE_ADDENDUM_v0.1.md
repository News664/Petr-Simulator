# SOLID STATE — Phase 1.1 Acceptance Addendum
## Version 0.1

Run all Phase-1 acceptance tests plus the following.

## 1. Strict childhood schedulability

Remove/deprecate the diagnostic `reuse_baseline_repeatables` escape hatch once
the new content is integrated.

Under strict policy:
- no simulated run may terminate from a pre-25 content coverage defect;
- add a deterministic reachability/schedulability test for ages 0–24;
- the test must model once-per-run consumption, repeat cooldown, repeat max count,
  age windows, include/exclude conditions where tractable, and actual annual
  selection history.

At minimum, ages 0–5 must have substantial slack rather than an exact-capacity fit.

## 2. Route tag registry integrity

Reject:
- any event routeTag absent from Route Tag Registry v1.0;
- duplicate registered route tags;
- malformed flag prefixes;
- route-context mappings that reference no recognized state namespace without an
  explicit approved exception.

Assert that `academic` does not alter TRN event weight.

## 3. Species refinement integrity

Reject unknown `refinementTags`.

Assert:
- family tendencies affect family selection only;
- refinement hooks affect local event selection only;
- `MAGICAL_SEAL` contributes no broad material-family scalar;
- no extra refinement drafting stage exists.

## 4. Talent typed operations

Load Talent Registry v1.1 typed fields.

Assert that:
- only channel/family drafting fields become weight modifiers;
- unlock/redirect/narrative tags do not automatically alter weights;
- T1023 strongly favors SPC and suppresses GEN;
- talent incompatibilities remain unchanged.

## 5. Awareness registry

Load Ending Registry v1.1 without parsing prose alternatives.

Assert:
- Uncertain requires no authorization;
- END-ANO-001 requires T1028 for Continuous/Intermittent;
- END-ANO-002 requires T1029 for Displaced;
- ordinary temporal outcomes use Suspended unless an explicit exceptional ending overrides it.

## 6. Schedule priorityOrder

Existing schedules default to 0.

Within a class:
- higher priorityOrder wins;
- equal priorityOrder uses seeded RNG;
- identical seed/state yields identical tie result.

## 7. SPC and mandatory content

Strict simulations must observe:
- non-zero SPC channel use;
- canonical `mandatory_only` events;
- END-ANO-001 and END-ANO-002 in targeted talent scenarios.

## 8. Late-life ending reachability

Targeted simulations must demonstrate at least one canonical ending at age 65+.

The full distribution remains a balance metric, not an acceptance pass/fail target yet.

## 9. FIX threshold experiment

Run `SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json`.

Do not add passive FIX drift.

For LOW, MID, HIGH, ORIGINAL_REFERENCE report:
- completion/nonterminal;
- commitment rate/age;
- ending age buckets;
- schedule expiry;
- fallback;
- ending coverage;
- final FIX distribution.

Do not select/freeze a winning profile automatically.

## 10. Family-weighting A/B

Design baseline = uniform eligible family.

Compare against `sum_of_event_weights` using MID threshold profile only.

Report:
- family distribution;
- ending distribution;
- route entry/climax;
- material distribution;
- entropy/concentration;
- fallback.

Do not silently switch the baseline based on the comparison.

## 11. Allocation policies

Using MID + uniform family weighting, report separately:
- BALANCED_RANDOM_FILL;
- MINMAX_PRIMARY_SECONDARY;
- ARCHETYPE_SET.

Threshold-talent activation statistics must be split by policy.

## 12. First manifestation neutrality diagnostic

Run a dedicated diagnostic:
- SPECIES = HUMAN;
- no talents;
- no prior material hint/evidence.

Report:
- first manifestation family distribution;
- mean/median first manifestation age by family;
- fraction with no manifestation before commitment/ending.

Wood >50% is a failure of the intended opportunity balance.

Do not demand mathematically identical shares; flag structural dominance.

## 13. Fallback monitoring

Re-measure Q-23 after the revised ending economy.

Age-25+ fallback:
- target near 2%;
- warn >5%;
- if still >10%, return to design before adding bulk filler.

## 14. Deferred questions

Do not resolve automatically:
- Q-14 T1027 magnitude;
- Q-23 fallback content response;
- Q-24 Late Bloomer condition;
- Q-25 Achievement Registry.
