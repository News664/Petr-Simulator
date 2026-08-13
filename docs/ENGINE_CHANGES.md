# SOLID STATE — Engine Behaviour Log

## Version 0.2 — Phase 1 + Phase 1.1

Every point where the engine's behaviour was **decided, corrected, or made
stricter** during Phase-1 implementation, with the reason and the test that pins
it.

This exists so a reviewer never has to reverse-engineer *why* the engine behaves
a particular way from the code alone. Entries marked **needs ratification** link
to an entry in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); the rest are mechanical
and need no design input.

**No creative content was changed.** All files under `content/events/`,
`content/registries/` and `content/balance/` are byte-identical to their source
artifact — snapshot v0.7 for Batches 001–004, and Phase 1.1 patch v0.1 for
Batch 005, the v1.1/v1.2 registries, Balance Constants v0.2, the experiment
matrix and `tools/SOLID_STATE_CONTENT_TOOL_v0.2.py`. Superseded files are kept
under `content/superseded/` and are never loaded at runtime.

---

# 0. Phase 1.1 integration (patch v0.1)

The patch retired most of section 2 below. What the engine now reads canonically:

| Was (Phase 1 adapter) | Now (canonical) |
|---|---|
| `speciesTendencyFamilyMap`, `speciesTendencyUnmapped` | Species Registry v1.2 `family_tendencies` + `refinement_tags` |
| `talentAdapters.*` drafting polarity | Talent Registry v1.1 `drafting_favor` / `_strongly_favor` / `_suppress` |
| `talentAdapters.*.registeredSpeciesRule` | Talent Registry v1.1 `registered_species_rule` |
| `endingAwarenessRules`, `endingAwarenessAuthorizingTalents` | Ending Registry v1.1 structured awareness columns |
| `routeTagFlagPrefixes`, `routeTagsWithNoTransformationFavor` | Route Tag Registry v1.0 |
| `engineRules.familyWeightMode` | Balance Constants v0.2 `familyWeightMode` |
| `engineRules.statClamp`, `startingFIX` | Balance Constants v0.2 |
| `engineRules.repeatCooldownSemantics` | Balance Constants v0.2 |
| `engineRules.scheduleWindowSemantics`, `scheduleValidityIsFireGate` | Balance Constants v0.2 `scheduleSemantics` |
| `engineRules.pre25CoveragePolicy` | **deleted** — Q-01 resolved, strict is the only policy |
| `materialFlagPrefixes` | engine constants (Tag Registry namespaces) |
| `engineRules.startingAllocationRange` | engine constant citing Core Contract §5 |

**What is left in the adapter file**: the T1027 diagnostic start-FIX value
(Q-14 is OPEN) and the Ending Record `Unknown` placeholder convention. Nothing
else.

## E-19 — Drafting is now explicitly three-layered

Event Drafting Rules v0.3 moved route context to the event layer and made the
family layer uniform. The engine now applies evidence in three named places
(`src/engine/drafting.ts`):

| Layer | Inputs |
|---|---|
| channel | neutral age weights × FIX scalar (TRN) × talent `channel:` ops |
| family | **uniform base 1.0** × species family tendency (TRN, pre-commitment) × hint × manifestation × talent `family:` ops |
| event | `weightClass` × routeFavor (at most one) × species refinement hook (only on a matching `refinementTag`) |

`sum_of_event_weights` changes only the family base, and is the A/B diagnostic.

**Assumption recorded**: the specs place route context at the event layer and
species tendency at the family layer explicitly, but do not say which layer
talent `family:`/`channel:` operations act on. The engine puts them at the layer
matching their target kind, consistent with Drafting Rules v0.2 §3 grouping
talent tendency with species/hint/manifestation as family evidence. See
`PHASE1_1_FINDINGS.md`; raise it if design intended otherwise.

## E-20 — Threshold override is a derived bundle, never a file edit

`src/sim/experiments.ts` implements the experiment matrix by rewriting `FIX>=N`
in a **copy** of the content bundle. It rewrites both gate sites — the target
event's own `include` and the `validityCondition` of every schedule pointing at
it — keyed by target event ID, so a profile cannot be half-applied. Every
rewritten condition is re-parsed, and a test asserts the base bundle is
untouched and that no gate-assigned event was left unrewritten.

Note that `ORIGINAL_REFERENCE` is a *reference profile*, not "as authored": it
sets `climax_anomalous`/`climax_late` to 50 where Batch 005 authors 40.

## E-21 — priorityOrder replaced creation order as the tiebreak

Q-11: within a priority class the engine now ranks by `priorityOrder`
descending, then breaks an actual tie with the seeded RNG. Creation order
survives only as a stable pre-sort so the RNG sees a deterministic candidate
list. A test asserts the winner varies across seeds but is identical for a
repeated seed.

## E-22 — Route-tag flag-prefix validation is a whole-corpus property

The Route Tag Registry requires every flag prefix to match a real namespace.
That can only be checked against the complete event corpus, so the check lives in
cross-reference validation rather than the registry loader, and the test harness
that builds throwaway content roots now copies **all** batches and substitutes
one. A single-batch root would fail for reasons unrelated to the test.

Note that a prefix may legitimately be a complete flag name
(`MAT_MANIFEST_TEMP` for the `temporal` tag) — the shape check accepts any valid
flag identifier, not only ones ending in `_`.

---

# 1. Bugs found and fixed

## E-01 — The academic route biased the TEMP material family

**Severity** rules violation · **Ratify via** [Q-07a](OPEN_QUESTIONS.md#q-07)

`EVENT_DRAFTING_RULES_v0.2` §Comparative Materials states the route *"must not
favor one specific final material merely because the route is active"*.

The route-favor scalar keys off an event's `routeTags` matching an active flag
namespace. `EVT-TRN-TEMP-0001` and `EVT-TRN-TEMP-0002` both carry the `academic`
routeTag, so any run holding a `ROUTE_ACA_*` flag — including
`ROUTE_ACA_MATERIALS`, the Comparative Materials route itself — multiplied the
TEMP family's weight by `routeFavor` (1.2). That is exactly the forbidden
behaviour, and it was reached by every academic run.

**Found by** writing the Acceptance L test for "Comparative Materials does not
hard-select a material"; the first version of the assertion failed.

**Fix** `src/engine/drafting.ts::evidenceScalar` now skips route-favor for tags
listed in `routeTagsWithNoTransformationFavor` (currently `["academic"]`) when
the event is on the `TRN` channel. The tag still applies on ORD/INS/SPC.

**Test** `tests/acceptance-l-m-n-endings.test.ts` — asserts the evidence scalar
for both TEMP events is unchanged by adding `ROUTE_ACA_RESEARCH` /
`ROUTE_ACA_MATERIALS`, and that an INS-channel academic event still gains the
scalar.

**Open alternative** Removing the `academic` routeTag from the two TEMP events
would be a content-side fix. Left to design — see Q-07a.

---

## E-02 — Cooldown reading made every run fail at age 5

**Severity** blocking · **Ratify via** [Q-08](OPEN_QUESTIONS.md#q-08)

The first implementation read `repeatCooldownYears` as `AGE - lastAge > C`
("C full years must pass"). Under that reading `EVT-ORD-FAM-0002` (cooldown 2)
could occur at most twice in ages 0–5, giving the band five event-years for six
years of life. **100% of runs terminated at age 4–5.**

Under `>= C` the band supplies exactly six, which is a suspiciously exact fit for
six years of childhood, and runs proceed.

**Fix** `repeatCooldownSemantics: "at_least"` in the adapters file;
`src/engine/state.ts::repeatAllows` honours both readings so the alternative
stays measurable. A repeat additionally always requires at least one
chronological year, since the cadence is one visible event per year.

**Test** `tests/acceptance-f-g-repeats-schedules.test.ts` — asserts occurrence
gaps are `>= cooldown` across 40 seeded runs.

**Note** This fix does *not* resolve the pre-25 coverage defect; it reduces it
from 100% to 83–85%. See [Q-01](OPEN_QUESTIONS.md#q-01).

---

## E-03 — Schedule validity as a destruction test suppressed all endings

**Severity** blocking · **Ratify via** [Q-09](OPEN_QUESTIONS.md#q-09)

Contract §14 says a schedule expires when validity "becomes impossible". Read as
"drop the schedule the first year its condition is false", every canonical climax
would be discarded the year it was created: `EVT-INS-ACA-0004` schedules
`EVT-INS-ACA-0005` with validity `... & MAT!=NONE & FIX>=55` while `MAT` is still
`NONE`. **No canonical ending could ever fire.**

**Fix** `scheduleValidityIsFireGate: true` — validity is evaluated yearly as a
precondition for firing, never as a destruction test. A schedule is discarded
only when `AGE > latestAge`.

**Test** `tests/acceptance-f-g-repeats-schedules.test.ts` — "treats validity as a
fire-time gate, not a destruction test": a schedule created at age 10 with a
flag-gated condition survives until the flag arrives at 15 and fires at 16.

---

## E-04 — A zero-weight channel could starve a year with eligible events

**Severity** latent · No design input needed

`ageChannelWeights` gives `SPC` weight **0** below age 12. If the only eligible
events in some year were `SPC` events, weighted selection over the surviving
channels would have had total weight 0 and thrown, ending a run that in fact had
eligible content.

Not reachable today (there are no `SPC` events at all — see
[Q-19](OPEN_QUESTIONS.md#q-19)), but it would become reachable the moment SPC
content is authored.

**Fix** `src/engine/drafting.ts::draftNormalEvent` falls back to uniform
selection across the non-empty channels when every surviving channel has zero
neutral weight. The same guard exists at the family and event steps. An empty
pool is still a genuine empty pool; this only covers "events exist but all their
channels are weighted zero".

---

# 2. Behaviour decided where the contract was silent or ambiguous

Each of these is a field in
`content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json` and is
reversible without touching code.

| ID | Decision | Where | Ratify via |
|---|---|---|---|
| E-05 | Family weight = sum of eligible event weights | `familyWeightMode` | [Q-10](OPEN_QUESTIONS.md#q-10) |
| E-06 | Same-class priority ties break by soonest window close, then creation order; RNG tiebreak unreachable | `src/engine/schedules.ts::rankCandidates` | [Q-11](OPEN_QUESTIONS.md#q-11) |
| E-07 | Visible stats unclamped; FIX floored at 0 | `statClamp` | [Q-12](OPEN_QUESTIONS.md#q-12) |
| E-08 | `TMS` = completed prior runs | `src/engine/state.ts::conditionContext` | [Q-13](OPEN_QUESTIONS.md#q-13) |
| E-09 | Schedule window = `earliest + windowYears`, inclusive | `scheduleWindowSemantics` | — |
| E-10 | Species tendency tier collisions resolve strongest-tier-wins | `speciesTendencyPrecedence` | [Q-04](OPEN_QUESTIONS.md#q-04) |
| E-11 | T1027 grants +15 starting FIX; baseline FIX is 0 | `talentAdapters.T1027.startFIX`, `startingFIX.base` | [Q-14](OPEN_QUESTIONS.md#q-14), [Q-16](OPEN_QUESTIONS.md#q-16) |
| E-12 | T1025 → `RSPECIES = UNREGISTERED`; T1030 → seeded other species | `talentAdapters.*.registeredSpeciesRule` | [Q-15](OPEN_QUESTIONS.md#q-15) |
| E-13 | `Uncertain` awareness needs no authorization; the other three rare states do | `AUTHORIZATION_REQUIRED_AWARENESS` | [Q-18](OPEN_QUESTIONS.md#q-18) |
| E-14 | Ending Record prose fields resolve to first-listed, or `Unknown` for "route-derived" | `src/engine/endings.ts::resolveRegistryField` | — |
| E-15 | Talent hook scalars encoded only where the registry states explicit family/channel polarity | `talentAdapters` | [Q-05](OPEN_QUESTIONS.md#q-05) |

## E-16 — Deterministic ordering wherever a Set or Map is iterated

**No design input needed**, but load-bearing for reproducibility.

JavaScript `Set`/`Map` iterate in insertion order, which for talents and flags
depends on draft order and event order — meaning a semantically irrelevant change
could reorder evaluation and shift results. Every such iteration is explicitly
sorted:

- threshold talent evaluation iterates `[...dormantTalents].sort()`
  (`src/engine/talents.ts`)
- registered-species rules iterate `[...talents].sort()` (`src/engine/setup.ts`)
- family candidates sort by family code, event candidates by event ID
  (`src/engine/drafting.ts`)
- the content fingerprint sorts source files by path (`src/engine/content/load.ts`)

**Test** `tests/golden-runs.test.ts` pins 36 complete runs; any ordering
regression changes a timeline.

## E-18 — The content fingerprint covers the whole adapter file

**No design input needed, but expect this when editing.**

A run's seed is `contentVersion + seed`, where `contentVersion` is a SHA-256 over
**every** canonical source file including
`SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json`. So editing that file — even
a purely documentary field such as `warning` or a `*Note` string — changes the
fingerprint, which reshuffles every seeded run.

**Consequences when you edit content, balance or adapters:**

1. `tests/golden-runs.test.ts` fails on the fingerprint assertion. Regenerate
   deliberately with `UPDATE_GOLDEN=1 npm test -- tests/golden-runs.test.ts` and
   review the diff.
2. Regenerate both reports, or the figures quoted in
   [`PHASE1_FINDINGS.md`](PHASE1_FINDINGS.md) and
   [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) will drift from `reports/`.

Third-decimal movement between regenerations is expected sampling noise, not a
behaviour change — the qualitative conclusions (83–85% coverage defect,
sub-1% completion outside the anomalous scenario) are stable across reruns.

This is deliberately conservative: fingerprinting only the "behavioural" fields
would require deciding which fields are behavioural, and would silently miss a
real change. Reproducibility is worth the churn.

## E-17 — Diagnostic pre-25 coverage policy

**Ratify via** [Q-01](OPEN_QUESTIONS.md#q-01)

Added `pre25CoveragePolicy` with two modes. Default `"strict"` is the
contract-faithful behaviour: an empty pre-25 pool ends the run as a content
coverage defect. `"reuse_baseline_repeatables"` exists **only** so the remaining
Phase-1 metrics stay measurable while Q-01 is open — it re-drafts from
`baseline`-tagged repeatable events ignoring cooldown and max count, still
respects age windows, `include`/`exclude` and the material lock, and never emits
a `fallback_only` event before age 25.

Every scenario header in the generated report states which policy produced it.
**Delete this policy once Q-01 is resolved.**

---

# 3. Validation made stricter than the supplied tooling

`tools/SOLID_STATE_CONTENT_TOOL_v0.1.py` remains the reference for the JSON →
Markdown mirror, and the TypeScript port is asserted byte-identical against it.
The engine's *loader* additionally rejects the following, which the Python tool
does not check. None of these fire on current content — they are guards against
future drift.

| Check | Rationale |
|---|---|
| Unknown `endingId` on a variant | Contract §22 — ending IDs must resolve |
| Unknown `eventId` in a schedule | Contract §14 — schedules must target real events |
| A schedule that can never fire (earliest age already past the target's `age.max`) | Silent dead content |
| A `scheduled_only` / `mandatory_only` / `climax` event that no schedule references | Unreachable content |
| Scheduling a `fallback_only` event | Contract §10 — fallback never participates in normal selection |
| A `TRN` event whose family is not a material code | [ASSUMPTION A-14](PHASE1_ASSUMPTIONS.md) |
| `setMaterialCommitment: "NONE"` | Commitment is irreversible; un-committing has no defined meaning |
| `endingOverrides` without an `endingId` | Dead metadata |
| Asymmetric or unknown talent incompatibility | Registry integrity |
| A talent effect string the parser cannot read | Prevents an unreadable effect being silently dropped |
| A species tendency label neither mapped nor declared unmapped | Prevents a new registry label being silently ignored |
| An ending `default_awareness` string with no resolution rule | Prevents a new awareness value defaulting silently |
| Duplicate event, talent or ending IDs | Acceptance A |
| An event ID that disagrees with its own channel/family | Taxonomy §Event ID |

Cross-batch duplicate IDs are also caught, which per-file validation cannot see.

---

# 4. Deliberately *not* implemented

Listed so their absence is not mistaken for an oversight.

| Not implemented | Reason |
|---|---|
| Any React or UI code | Gate H2 is not open |
| 0.5-year cadence | Contract §7 — explicitly forbidden in v1 |
| Afterform | Contract §26 — not part of the annual timeline; not required for Phase 1 |
| localStorage persistence | Contract §27 — browser-side, belongs to H2 |
| Achievements / meta-progression | No registry exists — [Q-25](OPEN_QUESTIONS.md#q-25) |
| `zh-TW` text | Contract §28 — agents must not invent translations; empty strings preserved |
| Any balance retune | Handoff §7 — provisional constants are simulation inputs, and §Q requires design review first |
| A FIX drift rule | No canonical field exists — [Q-26](OPEN_QUESTIONS.md#q-26) |

---

## Change log for this file

| Date | Change |
|---|---|
| 2026-08-12 | Created at Phase-1 handoff with E-01 … E-18 |
| 2026-08-13 | Phase 1.1 patch integrated. Adapter shrunk to two diagnostic entries; E-19 … E-22 added. E-01, E-02, E-03, E-05 … E-13, E-17 are now canonical data rather than engine decisions. |
