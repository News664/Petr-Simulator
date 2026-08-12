# SOLID STATE — Phase-1 Acceptance Tests
## Version 0.1

A coding-agent Phase-1 implementation is not complete until these behaviors are demonstrably tested.

# A. Content loading

- All current event JSON batches load successfully.
- Species Registry loads successfully.
- Talent Registry loads successfully.
- Ending Registry loads successfully.
- Unknown/duplicate IDs fail validation.
- Current event JSON -> generated Markdown checks remain passing.
- No runtime code loads generated event Markdown.

# B. Deterministic RNG

Required tests:

1. same seed + same setup => identical full timeline;
2. same seed + same setup => identical ending record;
3. repeated Node runs are identical;
4. changing playback/UI timing cannot alter engine results;
5. no engine use of `Math.random()`.

Prefer a snapshot/golden test for at least several known seeds.

# C. Condition parser

Must test:
- numeric comparisons;
- species comparison;
- RSPECIES;
- MAT;
- TLT;
- EVT;
- AEVT;
- FLAG;
- ACH;
- TMS;
- `&`;
- `|`;
- `!`;
- parentheses;
- TRUE/FALSE;
- operator precedence.

Must reject malformed expressions safely.

No `eval`.

# D. One-event-per-year invariant

Across complete simulated runs:

- at most one visible annual event at each age;
- no same-age visible chains;
- internal variants/effects do not create additional timeline entries;
- Afterform is not part of annual timeline.

# E. Childhood safety

Automated tests must prove:

- no canonical ending before age 18;
- no under-18-capable event sets Material Commitment;
- fallback-only is never used before age 25;
- representative reachable states at each age 0–24 retain at least one non-fallback eligible event.

# F. Repeats

Test:
- once-per-run appears at most once;
- repeatable event respects cooldown;
- repeatMaxCount is respected;
- unlimited repeatMaxCount (`null`) works;
- repeat occurrence tracking resets on new reincarnation.

# G. Scheduling / priority

Test:
- scheduled event appears no earlier than eligible target;
- displacement by higher priority works;
- scheduled window expiration works;
- invalid route schedule is discarded/ignored;
- climax priority outranks scheduled ordinary event;
- mandatory committed route outranks scheduled ordinary event;
- only one visible event is selected.

# H. Event variants

Test:
- variants evaluate against pre-event state;
- first matching variant wins;
- only selected variant effects apply;
- event history records selected Event ID;
- effect-caused threshold talent cannot retroactively change the variant.

# I. Talent engine

Test:
- start talents apply once;
- threshold talent may be dormant at start then trigger later;
- one-shot trigger never revokes;
- one triggered talent may trigger another;
- reevaluation continues until stable;
- incompatible talent selection is rejected;
- current event threshold changes cannot alter current event retroactively.

# J. EVT / AEVT

Test:
- EVT sees events from active run;
- AEVT sees completed prior runs;
- AEVT does not include active run before completion;
- after run completion relevant event history becomes available to next run.

# K. Material continuity

Test:
- hint does not set MAT;
- manifestation does not set MAT;
- multiple distinct manifestations may coexist;
- commitment sets MAT;
- after MAT, unrelated ordinary transformation family is excluded;
- explicit transition/mixed/anomaly events can bypass the exclusion;
- transition to MIXD preserves prior primary material metadata.

# L. Academic research

Test:
- Academic specialization is automatic;
- specialization flags are mutually coherent;
- Comparative Materials does not hard-select a material;
- Continuity research does not change global ordinary-awareness defaults;
- tenure requires/reflects substantive Academic specialization according to current event data.

# M. Ending resolution

Test:
- ending Event ID resolves to known Ending ID;
- Ending Record preserves current material;
- ending cannot casually replace committed material;
- ordinary solid material defaults Awareness to Unconscious unless explicitly overridden;
- temporal defaults Awareness to Suspended;
- Continuous/Intermittent/Displaced require explicit authorization;
- consent/autonomy/ownership/legal status remain separate;
- ending terminates annual simulation.

# N. Headless diagnostic maximum

At age 120:
- if no ending occurred, stop diagnostic run;
- mark run as nonterminal failure;
- do not synthesize a fake ending.

Report the count/rate.

# O. Monte Carlo CLI

Required CLI behavior:

- accepts run count;
- accepts seed/base seed;
- accepts balance constants path;
- supports species-stratified mode;
- supports talent scenario selection;
- outputs JSON summary;
- outputs human-readable Markdown summary.

Recommended command shape:

```text
npm run simulate -- --runs 10000 --scenario no-talents --seed 12345
```

Exact CLI syntax may differ.

# P. Required Monte Carlo metrics

At minimum:

- completed vs nonterminal rate;
- ending age histogram / target buckets;
- average/median ending age;
- average run length;
- channel counts by age band;
- family counts by age band;
- fallback use rate;
- route entry rate;
- route climax rate;
- route abandonment/expiry rate;
- schedule collision/displacement rate;
- final material distribution;
- final material by species;
- P(final X | hint X);
- P(final X | first manifestation X);
- multiple-material-manifestation-before-commitment rate;
- average hint/manifestation/commitment ages;
- talent activation rate and activation age;
- ending distribution;
- distinct ending coverage.

# Q. Phase-1 stop condition

When all above correctness tests pass and a Monte Carlo report exists:

**STOP.**

Do not tune creative content or proceed deep into UI implementation without design review of the simulation report.
