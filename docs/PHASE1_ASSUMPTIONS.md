# SOLID STATE — Phase-1 Assumptions

## Version 0.1

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).** Resolve them there, not here.


Decisions the engine had to make because no canonical file specified them, or
because a canonical file admitted more than one reading.

Per `SOLID_STATE_AGENTS_v0.2.md` §"Provisional-data discipline", none of these is
buried in code: each is a field in
`content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json`, and each
is reversible by editing that file or passing `--adapters` to the CLI.

---

## A-1 — `TMS` is the reincarnation count

**Gap.** `TMS` is listed as a numeric condition reference in the Core
Implementation Contract §12 and the Content Schema, but never defined. No
canonical event uses it.

**Assumption.** `TMS` = the number of **completed prior runs** (the
reincarnation count), consistent with `AEVT` meaning completed prior runs only.
A first life has `TMS = 0`.

**Reversal cost.** Trivial — one field in `ConditionContext`. Nothing in
canonical content depends on it.

---

## A-2 — T1027 "Hairline Fracture" raises starting FIX by 15

**Gap.** The Talent Registry says T1027 *"Raises starting FIX"* and marks it
`start_hidden`, but states no magnitude, and `BALANCE_CONSTANTS` has no field
for one.

**Assumption.** `talentAdapters.T1027.startFIX = 15`, on a baseline starting FIX
of 0 (also unspecified; see A-8).

**Why 15.** Commitment gates sit at `FIX>=35` and the whole content slice offers
39 FIX before commitment (see CONFLICT C-6), so a value in this range makes the
talent meaningful without trivialising the gate. It is a simulation input, not a
proposal.

**Impact — large, and deliberately surfaced.** The anomalous-talent scenario is
the only one where endings occur at a measurable rate (6.4% vs 0.09–0.73%),
purely because it holds T1027. Design should read that contrast as evidence
about the FIX economy (C-6), not as a recommendation for 15.

---

## A-3 — T1030 assigns a seeded different registered species; T1025 marks it unregistered

**Gap.** T1030 *"Wrong Species Certificate"* says it *"Assigns a different
registeredSpecies"* but not which. T1025 *"Unregistered Species"* says
institutional events *"may treat species as unavailable"* but names no value.

**Assumption.**
- T1030 → seeded uniform pick among the five species other than the true one.
- T1025 → `RSPECIES` becomes the literal `UNREGISTERED`.
- Both leave `SPECIES` untouched, so biological material tendencies stay true
  species, as both registry rows require.

**Reversal cost.** Trivial. No canonical event condition reads `RSPECIES`, so
this affects only the Ending Record's `registeredSpecies` field today.

---

## A-4 — `validityCondition` is a fire-time gate, not a destruction test

**Ambiguity.** Core Contract §14 says a schedule expires when "the window closes;
or validity becomes impossible / current route state invalidates it". An engine
cannot compute "impossible" in general, and the two readings differ sharply.

**Resolution — settled by the content.** Canonical schedules are routinely
created while their validity condition is *false*. `EVT-INS-ACA-0004` schedules
`EVT-INS-ACA-0005` with validity
`FLAG[ROUTE_ACA_TENURE_REVIEW] & MAT!=NONE & FIX>=55` at a moment when `MAT` is
still `NONE`. Under a destruction reading every academic climax would be
discarded the year it was created and **no canonical ending would ever fire**.

**Assumption.** `scheduleValidityIsFireGate: true` — validity is evaluated each
year as a precondition for firing. A schedule is discarded only when
`AGE > latestAge`. Regression-tested in
`tests/acceptance-f-g-repeats-schedules.test.ts`.

**Consequence.** "Route abandonment/expiry" is measured as window expiry, which
is the only expiry the engine can observe.

---

## A-5 — Family weight is the sum of its eligible events' weights

**Gap.** The contract specifies the drafting hierarchy (`channel → family →
event`) and supplies channel weights and per-event `weightClass` scalars, but no
family-level weights.

**Assumption.** `familyWeightMode: "sum_of_event_weights"` — a family's weight is
the sum of `weightClassScalar × evidenceScalar` over its eligible events, and the
event is then drawn within the family by the same product. This makes family
probability proportional to authored content density, so adding events to a
family raises that family's share rather than diluting it.

**Alternative available.** `"uniform"` weights every non-empty family equally,
making family choice independent of content density. Switch via the adapters
file to compare.

**Note for review.** Content density currently varies a lot by family (EDU 12
events, SYNT 1), so this choice materially shapes the family mix. It should be
confirmed before balance freeze.

---

## A-6 — Stats are unclamped; FIX has a floor of 0

**Gap.** No canonical file states minimum or maximum stat values. The starting
range is "0–10 before modifiers", but species modifiers can push below 0 (ELF has
`STR -1`) and events accumulate freely over 120 years.

**Assumption.** `statClamp: { visibleMin: null, visibleMax: null, fixMin: 0,
fixMax: null }` — visible stats are pure arithmetic with no clamp; FIX cannot go
below 0 because `fixTransformationChannelScalar`'s lowest band starts at
`minFIX: 0` and a negative FIX would have no defined scalar.

**Reversal cost.** Trivial, but not behaviour-neutral: clamping visible stats at
0 would change the outcome of conditions such as `MNY<=2` and `STR<=4`.

---

## A-7 — `repeatCooldownYears` means "at least C years later"

**Ambiguity.** Taxonomy v0.2 defines the field as "minimum full chronological
years before the same event may recur". For an event last resolved at age `L`
with cooldown `C`, that admits both `AGE - L >= C` and `AGE - L > C`.

**Resolution — settled by the content.** Under `>=`, ages 0–5 supply exactly six
event-years for six years of life (three `once_per_run` events plus three
permitted occurrences of `EVT-ORD-FAM-0002` at cooldown 2). Under `>` they supply
five, and *every* run fails at age 5. An exact fit under one reading and a
universal failure under the other is decisive.

**Assumption.** `repeatCooldownSemantics: "at_least"`. A repeat additionally
always needs at least one chronological year, since the cadence is one visible
event per year. The `"strictly_greater"` reading remains selectable for
comparison.

**Caveat.** Even under `>=` the band has zero margin — see CONFLICT C-5.

---

## A-8 — Baseline starting FIX is 0

**Gap.** No canonical file states a starting FIX.

**Assumption.** `startingFIX.base = 0`; T1027 adds its bonus on top.

---

## A-9 — Schedule window is `earliest + windowYears`, inclusive

**Gap.** The Content Schema gives `offsetYears` and `windowYears`; Route Rules
instead names `earliestAge` and `latestAge`. Neither states how the two relate.

**Assumption.** `earliestAge = triggerAge + offsetYears`;
`latestAge = earliestAge + windowYears`, both inclusive. So `+2y, window 6y`
fired at age 20 is eligible over ages 22–28 inclusive.

---

## A-10 — Same-class priority ties break deterministically, not by RNG

**Ambiguity.** Contract §8: "Within the same class: authored priority first;
seeded RNG if truly equal."

**Assumption.** Within a priority class, candidates are ordered by (1) soonest
`latestAge` — the most urgent authored window — then (2) creation sequence. Since
the creation sequence is unique per schedule, the ordering is total and the RNG
tiebreak is never reached. This keeps runs reproducible and avoids spending RNG
draws on ties, which would make results sensitive to schedule-queue ordering.

**Reversal cost.** Low, but it would change every seeded run's output.

---

## A-11 — Ending Record fields resolve to first-listed, or `Unknown`

**Gap.** Ending Registry cells hold prose alternatives ("Museum; Self; Disputed",
"Restricted or Represented") or the literal "route-derived". Contract §25 permits
"Unknown/Disputed" values but gives no resolution rule.

**Assumption.** For each field: an authored `endingOverrides` entry wins; else
"route-derived" and empty cells resolve to the `Unknown` placeholder; else the
first listed alternative is taken as the authored default. `integrity` has no
registry column at all and is always `Unknown` unless overridden.

**Note.** This is presentation metadata. It does not affect simulation, and the
raw registry strings remain available on `EndingDef` for a future UI that wants
to show the full range.

---

## A-12 — Setup policies for headless simulation

**Gap.** Species roll, talent draft/choice and stat allocation are *player*
decisions (Contract §5). Headless simulation needs a policy for each.

**Assumption.**
- **Species** — seeded uniform, or equal stratification when
  `--species-stratified` is used (matching `diagnosticSampling.speciesMode:
  STRATIFY_EQUALLY_BY_SPECIES`). Stratified is the CLI default.
- **Talent draft** — 10 distinct talents drawn uniformly from the 30-talent
  registry. Uniform, not rarity-weighted, because
  `diagnosticSampling` states final rarity/meta draw distributions are not
  frozen.
- **Talent choice** — walk the drafted order and take the first three mutually
  compatible talents.
- **Allocation** — distribute the species' free points one at a time to a
  uniformly-chosen stat that still has room in the 0–10 range.
- **`NO_TALENTS_BASELINE`** still performs the 10-talent draft (so the RNG
  stream matches the other scenarios) but chooses zero talents.

**Note for review.** The allocation policy produces roughly-even spreads and so
under-samples the extreme builds (`CHR 10`, everything else 0) a real player
would sometimes make. Threshold-talent activation rates should be read with that
in mind.

---

## A-13 — Diagnostic pre-25 coverage policy

See CONFLICT C-5 for the underlying content defect.

**Assumption.** `pre25CoveragePolicy` defaults to `"strict"`: an empty pre-25
pool ends the run as a content coverage defect, exactly as the taxonomy requires.
The `"reuse_baseline_repeatables"` policy exists **only** so the remaining
Phase-1 metrics are measurable while C-5 is open. It re-drafts from
`baseline`-tagged repeatable events ignoring cooldown and max count, still
respects age windows, `include`/`exclude` and the material lock, never emits a
`fallback_only` event before age 25, and never modifies content. Every scenario
header in the report states which policy produced it.

---

## A-14 — The engine's family-code space is the material enum

**Assumption.** Transformation-channel families are exactly the non-`NONE`
`MAT` values, so `EVT-TRN-{FAMILY}-NNNN` maps one-to-one onto Material
Commitment values. Content validation rejects a `TRN` event whose family is not
a material code. This is implied by Taxonomy v0.2's transformation family list
matching the material enum, but is nowhere stated as an invariant.
