# SOLID STATE — Open Questions Register

## Version 0.6 — the live decision list

This file is the **single authoritative list of everything the coding agent
cannot decide alone**. Anything discussed in a chat log but not written here is
not official.

Version 0.6 is a compaction, not a revision. Every question ID `Q-01 … Q-30` and
every recorded decision is preserved:

- **Open and deferred questions are written out in full below.** They are the
  only ones that need a decision.
- **Resolved questions are indexed** with their decision in one line. The full
  entry — evidence, options, trade-offs, engine behaviour, every per-milestone
  decision and outcome line — is preserved verbatim in
  [`archive/decisions/DECISION_HISTORY.md`](archive/decisions/DECISION_HISTORY.md).

**No question changed status in the compaction.** Nothing was closed, reopened,
reworded or dropped.

### How to use this file

Resolve a question by editing its **Resolution** block here in place: set
`Status`, write the decision, and name the files that change. Do not delete a
question — move it to the resolved index once decided, with its decision line.

Each open entry is self-contained: the question, the evidence with file paths,
what the engine does today, the options with trade-offs, and a recommendation.
An agent should be able to act on one entry without reading the rest of the
repository. When a resolution requires an engine change, the "Engine change
required" line names the exact file and field. When it requires content or
registry authoring, that is stated explicitly — **the coding agent will not
author creative content or rewrite registries without a decision here.**

### Status vocabulary

| Status | Meaning |
|---|---|
| `OPEN` | Needs a design decision |
| `RATIFY` | Engine already behaves a certain way; needs confirmation or correction |
| `RESOLVED` | Decided — decision recorded, in the index below or in the entry |

### Current state

Corpus fingerprint `8638e2e1ebd977878d09c28c1d554d7b85e2174f24fcf7aa568df018541d214e`
· 215 events · 25 endings · 39 route tags · LOW is the **working** H2B balance,
not a freeze. Current measurements: [`H2B1A_FINDINGS.md`](H2B1A_FINDINGS.md) and
[`reports/h2b1a-regression.md`](../reports/h2b1a-regression.md). Repository
status: [`CURRENT_STATE.md`](CURRENT_STATE.md).

---

## Summary

Five questions are open. One resolved question — **Q-02** — is resolved in
design but **numerically unfrozen**, and is restated below for that reason.

| ID | Question | Owner | Blocking | Status |
|---|---|---|---|---|
| [Q-14](#q-14) | How much starting FIX does T1027 grant? | Balance | no | **`OPEN`** / deferred |
| [Q-23](#q-23) | Is a 35% adult fallback share acceptable? | Content | no | **`OPEN`** / monitor |
| [Q-25](#q-25) | What is the achievements registry, for `ACH[id]`? | Design | no | **`OPEN`** / deferred |
| [Q-27](#q-27) | How should the ending-age distribution be shaped? | Content | **yes** | **`OPEN`** |
| [Q-29](#q-29) | How prominent should factions be? | Balance | no | **`OPEN`** (direction resolved, number not frozen) |
| [Q-02](#q-02) | How should the FIX economy reach the climax gates? | Balance | **yes** | `RESOLVED` (design) / **numbers not frozen** |

---

# Open questions

<a id="q-14"></a>
## Q-14 — How much starting FIX does T1027 grant?

**Owner** Balance · **Blocking** no · **Status** `OPEN` / **DEFERRED**
**Evidence** [`PHASE1_ASSUMPTIONS.md#A-2`](PHASE1_ASSUMPTIONS.md) · full trail in
[`DECISION_HISTORY.md#q-14`](archive/decisions/DECISION_HISTORY.md#q-14)

The Talent Registry says T1027 "Raises starting FIX" with no magnitude, and
`BALANCE_CONSTANTS` has no field for one.

**Engine today** `talentAdapters.T1027.startFIX = 15`, on a baseline of 0. This
is a diagnostic value, not a decision.

**Measured** Completion in the anomalous scenario at MID: 76.4% (+5), 86.0%
(+8), 91.4% (+10), 94.2% (+12), 98.2% (+15). Even +5 makes the talent close to
an auto-completion, and mean commitment age falls 36.0 → 32.7 across the range.

**Engine change required** `content/balance/SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json`
keeps the diagnostic value; the sweep lives in
`src/sim/experiments.ts::withT1027StartFix`. Freezing a value means writing
`start_fix_bonus` in the Talent Registry and retiring the adapter entry.

**Recommendation** Decide **after** Q-02, since the right value depends on the
total FIX budget. Rerun T1027 in isolation rather than bundled with T1028/T1030.

> **Resolution** — _status_: **OPEN / DEFERRED**
> _Decision_: Do **not** freeze T1027 at +15. The sweep is recorded; design picks a value — the engine does not.
> _Not measured since_: no T1027 sweep has been run against the H2B corpus. `withT1027StartFix` and the matrix entry are retained unchanged and still run via `npm run experiment -- --only t1027_sensitivity`.

---

<a id="q-23"></a>
## Q-23 — Is a 35% adult fallback share acceptable?

**Owner** Content · **Blocking** no · **Status** `OPEN` / **MONITOR**
**Evidence** [`PHASE1_FINDINGS.md §3`](PHASE1_FINDINGS.md) · full trail in
[`DECISION_HISTORY.md#q-23`](archive/decisions/DECISION_HISTORY.md#q-23)

Generic fallback — the "quiet year" filler — was filling roughly a third of
adult years, which means the corpus was not supplying enough eligible content
for ordinary adult lives.

**Engine today** Fallback resolution is scheduled → normal draft → eligible
`lore_fallback_only` → generic `fallback_only`. `loreFallbackYears` is reported
as a separate diagnostic from `fallbackYears`, so lore texture is never counted
as a fix for generic emptiness.

**Measured** Age-25+ generic fallback improved from ~35% but remains well above
the 5% warning line. The `lore_fallback_only` tier (Q-30) removed generic
fallback from 55–64 entirely and cut 65+ substantially, but **combined**
emptiness at 65+ was essentially unchanged — lore fallback replaced generic
fallback rather than filling the year with content.

**Target** near 2%; **>5%** is a warning; the acceptance addendum's
**>10% → return to design** threshold is exceeded, which is why this stays with
design rather than being patched in the engine.

**Options**

| # | Option | Trade-off |
|---|---|---|
| A | Author more ordinary adult/late-life content | Directly fixes the supply; the expensive option, and overlaps with Q-27 option A |
| B | Widen age windows / repeat allowances on existing adult events | Cheap; risks repetitive lives and contradicts authored meaning |
| C | Accept a higher fallback share as canonical texture | Free; makes long lives feel empty, which Round 1 already flagged qualitatively |

**Recommendation** Treat as part of the same content-supply decision as
[Q-27](#q-27) rather than separately — both are asking for adult-life content
volume, and A here is close to A there.

> **Resolution** — _status_: **OPEN / MONITOR**
> _Decision_: ~35% adult fallback is unquestionably unintended, but do **not** respond by bulk-authoring late-life filler before the ending economy is settled. Target remains near 2%; >5% is a warning.
> _Latest outcome_: improved but still far above the warning line; the lore tier changed the *kind* of empty year, not the amount.

---

<a id="q-25"></a>
## Q-25 — What is the achievements registry, for `ACH[id]`?

**Owner** Design · **Blocking** no · **Status** `OPEN` / **DEFERRED**
**Evidence** full trail in
[`DECISION_HISTORY.md#q-25`](archive/decisions/DECISION_HISTORY.md#q-25)

The condition grammar accepts `ACH[id]`, but no Achievement Registry exists, so
there is nothing to validate an ID against.

**Engine today** `ACH[id]` is implemented and tested; an unknown ID evaluates to
**false** rather than failing validation, precisely because no registry exists.
This is a documented provisional limitation, not an accident.

**Engine change required** None until a registry exists. When one does,
validation should reject unknown IDs the way it already rejects unknown route
tags, talents and species.

> **Resolution** — _status_: **OPEN / DEFERRED**
> _Decision_: The Achievement Registry belongs to the meta-progression phase. Until it exists, unknown `ACH` behaviour remains a documented provisional limitation.
> _Unchanged since Phase 1.1._ No authored content currently depends on `ACH[...]`.

---

<a id="q-27"></a>
## Q-27 — How should the ending-age distribution be shaped?

**Owner** Content · **Blocking** **yes** · **Status** `OPEN`
**Evidence** [`PHASE1_2_FINDINGS.md §1`](PHASE1_2_FINDINGS.md) ·
[`PHASE1_3_FINDINGS.md §3`](PHASE1_3_FINDINGS.md) ·
[`H2B_BATCH008_FINDINGS.md §2`](H2B_BATCH008_FINDINGS.md) ·
[`H2B1A_FINDINGS.md §1`](H2B1A_FINDINGS.md) · full trail in
[`DECISION_HISTORY.md#q-27`](archive/decisions/DECISION_HISTORY.md#q-27)

This is the one blocking question. The content-shape decision was taken in
Phase 1.2 and applied; **the numeric shape is still open**, and four separate
instruments have now measured the same conclusion from different directions.

**Where it stands (H2B.1A, 3 000 runs, current corpus)**

| Bucket | H2B (LOW + Batch 008) | **H2B.1A** |
|---|---|---|
| 18–24 | 1.3% | 0.9% |
| 25–34 | 19.6% | **21.2%** |
| 35–44 | 48.0% | **35.2%** |
| 45–54 | 20.8% | 14.0% |
| 55–64 | 1.6% | 1.7% |
| 65+ | 8.7% | **26.9%** |

Completion 71.6%, ending coverage 25/25, all correctness counters zero.

**What has been ruled out**

1. **Thresholds are not the lever.** The four-arm calibration
   (`CURRENT_AUTHORED` / LOW / MID / HIGH, 3 000 runs each) moved mass out of
   65+ and into **35–44**, not 25–34. 25–34 barely moved (16.9% → 16.6/17.1/
   18.1%) and mean commitment age stayed 35.3–35.7 in all four arms.
2. **Corpus volume is not the lever either.** Batch 008 added 28 events and mean
   commitment age moved 35.3 → 34.9.
3. **The faction ladder cannot supply the gap.** It works as specified —
   endings arrive on the committed path, 94% via the intended route — but ~90%
   of contacts take a safe exit, which is the Q-28 design working correctly.

**The measured lever is the age at which large-FIX bargains land**, not their
magnitude.

**The live H2B.1A observation** Removing the review age caps (correction A-04,
a frozen design instruction) moved a large block of endings into 65+:
`END-MED-003 Benefit Approved` now produces **470 endings (15.7% of runs)** at a
mean review age of **83.5**, and 65+ rose 8.7% → 26.9%. This also explains the
commitment-age split — **mean 41.4 against median 36** — so quoting the mean
alone here would mislead. Recorded as **H2B1A-C1** in
[`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md).

**Timing-design position, and why 35–44 was not chased.** The H2B.1A timing
design states that the current age shape is acceptable for Human Playtest
Round 2 and that the original target distribution is long-range direction, **not
a Round-2 blocker**. 35–44 remaining the largest bucket was therefore not
treated as a failure and no lethality was added to force the buckets. It fell
12.8 points anyway.

**Options — none applied**

| # | Option | Change | Trade-off |
|---|---|---|---|
| A | Make the non-faction mid-life ladders (academic, corporate, museum, legal, finance) reachable in 25–34 | Authored content on the routes whose endings are still rarely observed | Fixes two findings at once; the expensive option |
| B | Let more than ~9% of faction contacts reach `COMMITTED` | Loosen escalation conditions | Smallest edit, but pushes faction terminality back up, against [Q-29](#q-29) |
| C | Loosen the sudden branch so 18–24 is not empty | Condition-only | Restores the band directly; risks re-creating the Phase 1.2 "1–3 year fuse" the Q-28 restructure deliberately removed |
| D | Decide the late-life review pathway | Cap the benefit chain by age, weight it down in old age, or accept a late-life insurance ending as canonical | This is the H2B1A-C1 decision; it is the largest single mover in the current data |

**Recommendation** Take D first — it is one decision about one authored chain
and it accounts for the 18.2-point move in 65+ — then A for the 25–34 supply.
Do not take B without revisiting Q-29.

> **Resolution** — _status_: **OPEN.** Content shape resolved (Phase 1.2), structure resolved (Phase 1.3, Q-28); **numeric shape open.**
> _Standing decision_: no canonical Permanent Form ending before 18; faction contact may begin at 16+ where age-appropriate; late-life endings remain a small survivor wave requiring meaningful prior route history, never the cheapest catch-all; **no passive age-based FIX drift** (see Q-26).
> _Not done_: LOW is not frozen, no threshold profile has been selected, no condition has been auto-tuned from its own regression, and no Monte Carlo or balance experiment was run in Part B.

---

<a id="q-29"></a>
## Q-29 — How prominent should factions be?

**Owner** Balance · **Blocking** no · **Status** `OPEN` (direction resolved,
number not frozen)
**Evidence** [`PHASE1_3_FINDINGS.md §5`](PHASE1_3_FINDINGS.md) ·
[`H2B1A_FINDINGS.md §3`](H2B1A_FINDINGS.md) · full trail in
[`DECISION_HISTORY.md#q-29`](archive/decisions/DECISION_HISTORY.md#q-29)

Phase 1.2 introduced factions as lightweight authored context and they ended up
supplying **48.6%** of all endings — half the game's terminal outcomes from a
layer that was not meant to be a primary route.

**Direction, already decided** Faction **presence** may be broad. Faction
**terminality** must stay substantially below 48.6%. Measure news exposure,
contact, engagement, opt-out, closure, commitment, targeting and faction-caused
endings **separately**. **No target percentage is frozen.**

**Measured now (H2B.1A)** Faction-caused endings **10.1%** of completions;
contact incidence ~33.5% of runs; the single-active-personalized-faction
invariant holds absolutely (max 1 simultaneously active, 0 contacts opened while
another relationship was live), and sequential relationships do occur after a
terminal exit. Black Ledger escalation now reads the DEBTOR obligation plus
FIX/material evidence: 98 contacts → 84 ENGAGED → **22 COMMITTED at mean age
28.2**, with 72 opt-outs, so wealth and Property Lawyer still buy a genuine
pre-`COMMITTED` exit.

**The two open numbers**

1. **Is ~10% faction terminality now too low?** It fell 48.6% → 15.4% → 16.7% →
   10.6% → 10.1% across milestones without ever being tuned toward a target.
2. **Is near-universal news exposure more than "occasional world texture"?**
   Every faction reaches 82–87% of runs, because the news events are
   `random` / `VERY_LOW` / `include: TRUE` over wide adult windows and the
   average run is long.

**Also measured** A contacted faction gives a life a mean of **2.1–3.1
personalized touchpoints about two years apart**, and three of six factions exit
at the first disposition in more than half of contacts. With per-faction contact
at 4–9%, a typical life meets one faction, twice. The escalation path itself is
not broken: after `ENGAGED` a later touchpoint follows in 99–100% of runs, and
after `COMMITTED` a climax follows in 83–100%.

**Engine change required** None. This is a content/conditions decision; the FSM
(Q-28) is settled and the registry schema pins `numericReputationMeter: false`
and `playerChoosesFaction: false` as literals.

> **Resolution** — _status_: **RESOLVED IN DIRECTION / numeric target later**
> _Decision_: Presence broad, terminality substantially below 48.6%, sudden faction endings a minority branch. **Do not globally raise faction `COMMITTED` rates** and do not freeze a target percentage yet.
> _Interaction_: [Q-27](#q-27) option B would push terminality back up. These two questions must be decided together.

---

<a id="q-02"></a>
## Q-02 — How should the FIX economy reach the climax gates? *(resolved in design, numbers not frozen)*

**Owner** Balance · **Blocking** **yes** · **Status** `RESOLVED` (design) /
numbers experimental
**Evidence** [`PHASE1_CONFLICTS.md#C-6`](PHASE1_CONFLICTS.md) ·
[`PHASE1_FINDINGS.md §2`](PHASE1_FINDINGS.md) · full trail in
[`DECISION_HISTORY.md#q-02`](archive/decisions/DECISION_HISTORY.md#q-02)

Listed here rather than in the resolved index because the **numbers are still
open**, and a reader of the index alone would reasonably assume the balance is
frozen. It is not.

**Decided** FIX stays **event-driven**; no passive drift (see Q-26). Commitment
and climax gates are lower than the original provisional values.

**Not decided** The exact gate values. LOW is the **working canonical H2B
balance** — applied mechanically to the retained gate assignments, **31 FIX
gates rewritten** across event `include` conditions and the `validityCondition`
of every schedule pointing at a gate-assigned event, so a profile can never be
half-applied:

| Gate | Value |
|---|---|
| `commitment_standard` | 28 |
| `climax_temporal` | 34 |
| `climax_medical` | 36 |
| `climax_standard` | 40 |
| `climax_anomalous` | 36 |
| `climax_late` | 36 |

**This is a working balance for Human Playtest Round 2, not the final freeze.**
The historical profile machinery is untouched:
`SOLID_STATE_PHASE1_1_EXPERIMENT_MATRIX_v0.1.json` and `applyThresholdProfile`
still work, and the reversible LOW/MID/HIGH rewrite still applies on top of the
new baseline for any future sweep.

**What the sweeps showed** Threshold height moves *where* endings land but not
*when* commitment happens: mean commitment age was 35.3–35.7 across all four
calibration arms. See [Q-27](#q-27).

> **Resolution** — _status_: **RESOLVED (design) / numbers experimental**
> _Decision_: event-driven FIX, no passive drift, gates lower than the original provisional values; exact numbers not frozen.
> _Freeze condition_: LOW becomes canonical only by an explicit decision recorded here, after Human Playtest Round 2.

---

# Resolved index

Every question below is decided. The line given is the decision; the full entry —
evidence, options, trade-offs, engine behaviour, per-milestone outcome lines and
the date and reviewer — is preserved verbatim in
[`archive/decisions/DECISION_HISTORY.md`](archive/decisions/DECISION_HISTORY.md),
anchored at `#q-nn`.

| ID | Question | Decision |
|---|---|---|
| [Q-01](archive/decisions/DECISION_HISTORY.md#q-01) | How should ages 0–5 be given coverage slack? | Broader childhood event pool, not more reuse of one repeatable. Batch 005 adds six varied 0–5 events; validation now checks schedulability, not capacity. **Verified: 0 coverage defects in 720 strict runs.** |
| [Q-03](archive/decisions/DECISION_HISTORY.md#q-03) | Should any ending be reachable after age 64? | Keep the 65+ band: late-life Permanent Forms are a distinct second-wave narrative, not mid-life climaxes staying eligible forever. Dedicated 65+ Medical/Family entries added. Over-reach is tracked under Q-27, not here. |
| [Q-04](archive/decisions/DECISION_HISTORY.md#q-04) | How do species tendency labels map to family codes? | Two layers — broad family tendency at family selection, optional refinement hook at event selection. No extra drafting stage. `MAGICAL_SEAL` is a registered special hook with `family: null`. |
| [Q-05](archive/decisions/DECISION_HISTORY.md#q-05) | What polarity do talent channel/family hooks carry? | Typed talent semantics: `drafting_favor` / `drafting_strongly_favor` / `drafting_suppress` change weighting; `unlock_tags` / `redirect_tags` / `narrative_tags` are metadata and never become multipliers. |
| [Q-06](archive/decisions/DECISION_HISTORY.md#q-06) | How should `default_awareness` prose be structured? | Awareness is machine-structured, never interpreted from prose. Ordinary solid → Unconscious, temporal → Suspended, `Uncertain` unrestricted; Continuous/Intermittent/Displaced need authored authorization. |
| [Q-07](archive/decisions/DECISION_HISTORY.md#q-07) | How do route tags map to route flag namespaces? | Route-tag mapping is canonical, validator-checked data. A matching active route grants at most one event-level favor scalar and never alters family probability. `academic` grants no Transformation-event favor (`allowTransformationEventFavor: false`). |
| [Q-08](archive/decisions/DECISION_HISTORY.md#q-08) | Is `repeatCooldownYears` "at least C" or "more than C"? | Ratified `AGE - lastOccurrenceAge >= repeatCooldownYears`; moved into canonical balance data. |
| [Q-09](archive/decisions/DECISION_HISTORY.md#q-09) | Is `validityCondition` a fire gate or a destruction test? | Ratified as a yearly fire gate — false means "not ready this year", not "destroy the schedule". A future explicit `cancelCondition` may be added if authored route abandonment needs it. |
| [Q-10](archive/decisions/DECISION_HISTORY.md#q-10) | Should family weight follow content density? | Rejected as the baseline. Baseline is `channel → uniform eligible family → weighted event inside family`; `sum_of_event_weights` retained only as an A/B comparison. Measured close; baseline not switched. |
| [Q-11](archive/decisions/DECISION_HISTORY.md#q-11) | How should same-class priority ties break? | `priorityOrder: integer = 0` on schedules; within a class, higher first, then seeded RNG on a true tie. Creation order is not the permanent tiebreak. |
| [Q-12](archive/decisions/DECISION_HISTORY.md#q-12) | Should visible stats be clamped? | Ratified: visible stats unclamped, FIX minimum 0. Moved out of the provisional adapter. |
| [Q-13](archive/decisions/DECISION_HISTORY.md#q-13) | What does `TMS` mean? | Ratified as the number of completed prior runs; first life = 0. Now stated in the canonical schema. |
| [Q-15](archive/decisions/DECISION_HISTORY.md#q-15) | What registered species do T1025 and T1030 assign? | T1025 → `RSPECIES = UNREGISTERED`; T1030 → one seeded uniformly-selected species different from the true `SPECIES`, assigned once and fixed for the run. |
| [Q-16](archive/decisions/DECISION_HISTORY.md#q-16) | What is the baseline starting FIX? | Baseline starting FIX = 0. Moved out of the provisional adapter. |
| [Q-17](archive/decisions/DECISION_HISTORY.md#q-17) | Is the diagnostic allocation policy player-realistic? | Do not pretend one player style is representative: report balanced/random fill, min-max primary/secondary and a seeded archetype set **separately**, never mixed into one headline. Outcome rates barely move; talent activation moves a lot. |
| [Q-18](archive/decisions/DECISION_HISTORY.md#q-18) | Does `Uncertain` awareness require authorization? | No. `Uncertain` never appears in any ending's `authorization_required_states`. |
| [Q-19](archive/decisions/DECISION_HISTORY.md#q-19) | Should `SPC` channel content exist? | SPC stays part of the v1 architecture; Batch 005 adds ANO/REIN/TLNT content. Do not zero the channel. Measured thin outside anomalous talents — tracked as a content observation, not a reopened question. |
| [Q-20](archive/decisions/DECISION_HISTORY.md#q-20) | Should any route use `mandatory_only`? | Yes — mandatory committed routes are intentional (controlled-hardening Medical sequence, two anomalous sequences). One visible event per year still holds through them. |
| [Q-21](archive/decisions/DECISION_HISTORY.md#q-21) | How are `END-ANO-001` / `END-ANO-002` reached? | Dedicated hidden SPC routes, not generic redirects on every ordinary ending. Both endings, previously unreachable, now occur. |
| [Q-22](archive/decisions/DECISION_HISTORY.md#q-22) | Should first manifestation be 52% WOOD and pinned to age 18? | No — it was an availability artifact. Reversible adolescent STON/METL/CRYS/GLAS/CERA/TEMP events added. Neutral Human now WOOD 24.8% with an earlier mean age, which is the intended small age-window advantage. |
| [Q-24](archive/decisions/DECISION_HISTORY.md#q-24) | Is T1017's activation profile intended? | Resolved in Phase 1.2 after re-measurement under multiple allocation policies: the Phase-1 reading was largely an allocation artifact. No T1017 change. |
| [Q-26](archive/decisions/DECISION_HISTORY.md#q-26) | Should FIX drift passively with age? | **No passive annual FIX drift.** Age already changes transformation pressure through `ageChannelWeights`. `fixAnnualDrift` stays pinned null; a behavioural test proves FIX changes only through authored effects. |
| [Q-28](archive/decisions/DECISION_HISTORY.md#q-28) | What is the faction relationship model? | A flag-backed FSM — `NONE → CONTACTED → ENGAGED → COMMITTED` with authored exits to `OPTED_OUT` / `CLOSED`. Roles are orthogonal flags. **No faction condition syntax and no numeric reputation meter.** `OPTED_OUT` is a genuine permanent safe exit. Verified: 0 illegal transitions, 0 lifecycle collisions, 0 personalized events after a safe exit. |
| [Q-30](archive/decisions/DECISION_HISTORY.md#q-30) | Should passive faction news exist, and how? | Yes — mostly once-per-run, protagonist-unrelated, creating no personal faction state, plus a `lore_fallback_only` tier ahead of generic fallback. Lore fallback is weighted by `weightClass` only and the schema rejects any variant carrying effects. Reported separately from generic fallback. |

---

## Related registers

| File | What it holds |
|---|---|
| [`archive/decisions/DECISION_HISTORY.md`](archive/decisions/DECISION_HISTORY.md) | The full historical register, Q-01 … Q-30, frozen at H2B.1A |
| [`PHASE1_CONFLICTS.md`](PHASE1_CONFLICTS.md) | Schema/content conflicts, including the current **H2B1A-C1 … C4** and **H2B-C1 … C4** observations awaiting design review |
| [`PHASE1_ASSUMPTIONS.md`](PHASE1_ASSUMPTIONS.md) | Decisions made where no canonical file specified one |
| [`ENGINE_CHANGES.md`](ENGINE_CHANGES.md) | Bugs found and fixed, behaviour decided, validation added, what was deliberately left out |
| [`H2B1A_FINDINGS.md`](H2B1A_FINDINGS.md) | The current measurements |

---

## Change log for this file

Milestone-by-milestone detail is in the archived register's own change log. This
is the compact version.

| Date | Change |
|---|---|
| 2026-08-12 | Created at Phase-1 handoff with Q-01 … Q-26 |
| 2026-08-13 | Phase 1.1: 22 questions RESOLVED; Q-14, Q-23, Q-24, Q-25 deliberately open |
| 2026-08-13 | Phase 1.2: added **Q-27**; **Q-24 RESOLVED** |
| 2026-08-13 | Phase 1.3: added **Q-28** (RESOLVED), **Q-29** (direction only), **Q-30** (RESOLVED); H2A gate opened |
| 2026-08-13 | Phase 1.3.1: **P13-C1 closed**; four condition-only Batch 007 edits under Q-27. No status change |
| 2026-08-13 | H2A UI foundation: two pre-UI condition corrections under Q-27, unmeasured by instruction. No status change |
| 2026-08-14 | H2A UX micro-patch + four-arm threshold calibration (12 000 runs): evidence only for Q-02, Q-12, Q-27, Q-29. No status change, no profile selected |
| 2026-08-14 | H2B Pressure & Tone / Batch 008: 28 events, `END-MED-003`, single-active-faction rule, two new lints. Evidence only for Q-02, Q-12, Q-23, Q-27, Q-29. No status change |
| 2026-08-14 | H2B.1A: **LOW adopted as the working canonical balance** (not a freeze); corrections A-01 … A-11; A-04 state-trigger facility; A-12 audit with no stat effect edited. Evidence only for Q-02, Q-12, Q-27, Q-29. No status change |
| 2026-08-14 | **Part B compaction → v0.6.** Full register archived verbatim as `archive/decisions/DECISION_HISTORY.md`; this file rewritten to open/deferred questions in full plus a resolved index carrying every decision. **Every Q ID and recorded decision preserved; no question changed status; no gameplay, balance or content touched.** |
