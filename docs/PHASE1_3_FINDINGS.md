# SOLID STATE — Phase 1.3 Simulation Findings

## Version 0.1 — for design review and the H2A gate decision

> **Note (Part B, 2026-08-14):** the generated report this document was
> written from is no longer tracked in git — it measured an earlier corpus.
> The conclusions below are unchanged. See
> [`reports/REPORT_INDEX.md`](../reports/REPORT_INDEX.md) for what it measured and the command
> that regenerates it.

> **Decisions arising from this document are tracked in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md).** Resolve them there, not here.

Source data: `reports/phase1_3-sanity.md` / `.json`, produced by `npm run sanity`
from
[`content/balance/SOLID_STATE_PHASE1_3_SANITY_PLAN_v0.1.json`](../content/balance/SOLID_STATE_PHASE1_3_SANITY_PLAN_v0.1.json)
— 5 000 runs, species-stratified, uniform-three talents, `ARCHETYPE_SET`
allocation, uniform family weighting, **authored current thresholds**, strict
pre-25 coverage.

Content: Phase 1.3 patch v0.2 — **186 events across 7 batches**, 38 route tags,
Faction Registry v0.2, Content Schema v0.4. Content fingerprint
`8373c361da31db69a0e13468c0d68805c79f103770e209a920b2391fb5f79f18`.

Per the Phase 1.3 instructions the LOW/MID/HIGH threshold sweep, the
family-weight A/B, the three-way allocation comparison, the T1027 sensitivity
sweep, the T1023 SPC comparison and the neutral-Human manifestation diagnostic
were **not** run. Their harnesses (`src/sim/experiments.ts`,
`src/sim/phase1_2.ts`, `npm run experiment`, `npm run diagnostic`) are unchanged
and a test asserts each is still constructible. `reports/monte-carlo.*`,
`reports/phase1_1-experiments.*` and `reports/phase1_2-diagnostic.*` are earlier
artifacts against earlier corpora and were deliberately not regenerated.

---

## Headline

**The faction system now behaves exactly as specified, and the ending economy got
worse.** Both statements are supported by the same numbers, and they are the two
things design has to weigh against each other.

Every hard correctness counter is zero, so **H2A opens** on the gate's own terms.

| # | Finding | Change since Phase 1.2 | Severity |
|---|---|---|---|
| 1 | All five H2A correctness counters are zero | new | **H2A PASS** |
| 2 | Safe exit is now the normal outcome of faction contact: 90% of contacts end in OPTED_OUT/CLOSED | new | working as designed |
| 3 | Faction terminality fell hard — 48.6% → **15.4%** of endings | Q-29's direction, possibly overshot | needs review |
| 4 | Faction endings now land at 25–29, on the committed ladder, 94% of the time | 22–25 → **25.5–28.4** | **resolved as designed** |
| 5 | **Completion collapsed: 60.2% → 23.9%**; nonterminal 39.9% → 76.1% | regression | **blocking** |
| 6 | 18–24 endings all but vanished: 31.5% → **0.8%** (1.8 per 1 000 runs) | regression | **blocking** |
| 7 | 25–34 did **not** improve: 17.7% → 15.8%, and fell from 106 to **38** endings per 1 000 runs | the restructure's stated goal | **blocking** |
| 8 | 65+ still dominates the shape at 51.1% of completions, though absolute 65+ endings nearly halved | mixed | high |
| 9 | Lore fallback works and displaces roughly half the empty late-life years | new | informational |
| 10 | Generic adult fallback is still 0% through age 54 | unchanged | resolved for 25–54 |
| 11 | Material Commitment got rarer, later and much more expensive: 60.7% → 36.9%, FIX 28.4 → **42.9** | side effect of 5–7 | high |
| 12 | Ending coverage unchanged at 17/24, with a different tail | — | medium |

---

## 1. Correctness — the H2A blockers

| Counter | Value | Required |
|---|---:|---:|
| Illegal faction lifecycle transitions | **0** | 0 |
| Runs holding two lifecycle states for one faction | **0** | 0 |
| Personalized faction events after OPTED_OUT/CLOSED | **0** | 0 |
| Pre-25 content coverage defects | **0** | 0 |
| Pre-25 generic fallback events | **0** | 0 |

The safe-exit guarantee is proven twice over, not sampled:

- **Statically**, at content load. Every event whose `factionInteraction` is
  `personal` or `climax` has its `include` condition analysed three-valued with
  that faction's active lifecycle and role flags pinned false and a terminal flag
  pinned true. If the condition could still be satisfied, the corpus refuses to
  load. The analysis over-approximates satisfiability, so it can only be stricter
  than reality, never laxer.
- **At runtime**, as a counter. Every year, before the event resolves, a
  personalized faction event whose faction is already OPTED_OUT or CLOSED is
  recorded. Across 5 000 runs and 525 343 event-years the count is zero.

The check is not vacuous: `tests/phase1_3-acceptance.test.ts` asserts that an
event gated only on the historical `FAC_*_CONTACT` marker *is* still satisfiable
after opting out, which is precisely the shape Phase 1.2 used and Phase 1.3
replaced.

---

## 2. The faction lifecycle behaves as specified

34.9% of runs make faction contact. What happens next:

| Transition | Count | Share of the 1 988 contacts |
|---|---:|---:|
| `CONTACTED` | 1 988 | — |
| `ENGAGED` | 1 046 | 52.6% |
| `COMMITTED` | 184 | **9.3%** |
| `OPTED_OUT` | 949 | 47.7% |
| `CLOSED` | 845 | 42.5% |

**Safe exit is now the normal outcome**: 1 794 of 1 988 contacts (90%) end in
OPTED_OUT or CLOSED. That is the spec's intent — *"most contacts can opt out or
close without a faction ending"* — realised almost exactly.

Timing is also as designed. Contact happens at 16–24, disposition 1–2 years
later, escalation ~3 years after that, climax 1 year after commitment:

| Faction | Contact → ENGAGED | → COMMITTED | → OPTED_OUT | → CLOSED | → ending |
|---|---|---|---|---|---|
| Black Ledger | 1.0 | 4.3 | 3.3 | 4.0 | 5.3 |
| CRI | 2.0 | 4.7 | 2.0 | 5.0 | 5.7 |
| DMMS | 2.0 | 5.0 | — | 2.2 | 6.5 |
| Everlasting Mutual | 2.0 | 6.1 | 3.7 | 6.0 | 7.1 |
| Last Posture | 2.0 | — | 2.5 | — | — |
| Meridian | 2.0 | 4.8 | 2.1 | 5.1 | 6.5 |

And **finding 4 is a clean success**: faction endings moved out of the 1–3 year
fuse and onto the ladder.

| | Phase 1.2 | Phase 1.3 |
|---|---:|---:|
| Median age of faction endings | 22–25 | **25.5–28.4** |
| Committed-ladder share of faction endings | — | **94.0%** |
| Sudden share of faction endings | (all of them) | **6.0%** |

Sudden endings survive as the intended minority branch, at 11 of 184.

**One faction never terminates anything.** Order of the Last Posture reaches
COMMITTED in 0 runs and produces 0 endings: **all 380** of its contacts end in
OPTED_OUT, and only 68 of them ever reach ENGAGED, so most opt out at the
disposition stage. `EVT-SPC-SECR-0018` variant 1 opts out on
`TLT[T1010] | INT>=8`, and INT>=8 is common under `ARCHETYPE_SET` allocation, so
the cult route is filtered out before it can escalate. `END-REL-001` fell from
267 endings to 5 as a result. This is a content-shape observation for design,
not an engine defect; nothing was changed.

---

## 3. The ending economy regressed (blocking)

Shares alone understate this, because the completion rate itself moved. Endings
per 1 000 simulated runs is the like-for-like comparison:

| Age band | Phase 1.2 share | Phase 1.2 per 1 000 runs | Phase 1.3 share | Phase 1.3 per 1 000 runs | Target |
|---|---:|---:|---:|---:|---:|
| 18–24 | 31.5% | 189.5 | **0.8%** | **1.8** | 18–22% |
| 25–34 | 17.7% | 106.2 | 15.8% | **37.8** | 35–40% |
| 35–44 | 7.8% | 47.0 | 20.2% | 48.4 | 20–25% |
| 45–54 | 4.4% | 26.8 | 10.3% | 24.6 | 8–12% |
| 55–64 | 0.7% | 4.5 | 1.8% | 4.4 | 4–7% |
| 65+ | 37.8% | 227.5 | 51.1% | 122.4 | 2–5% |
| **completed** | 60.2% | 601.5 | **23.9%** | **239.4** | — |

Read down the per-1 000 columns: **35–44, 45–54 and 55–64 are unchanged.** The
entire movement is that 18–24 lost ~188 endings per 1 000 runs, 25–34 lost ~68,
and 65+ lost ~105. Nothing gained any.

**Cause.** In Phase 1.2 the faction layer supplied 1 169 of 2 406 endings. Phase
1.3 deliberately made that layer non-terminal for 90% of contacts and moved the
remaining climaxes behind `COMMITTED` and age 25. Only 184 endings came through.
The 985 endings the faction layer used to provide were not replaced, so they
became nonterminal runs: 76.1% of lives now reach age 120 without an ending.

This is a predictable consequence of the approved structural change rather than a
surprise — the design resolution explicitly said *"Existing faction climaxes
require `COMMITTED` and age min 25, so ordinary faction terminal paths should
populate 25–34 instead"*. They do populate 25–34; there are simply far fewer of
them, and the 18–24 supply they used to carry has no replacement at all.

**The 25–34 shortfall is now larger in absolute terms than it was before the
patch designed to fix it.** That is the single most important thing in this
report.

Side effect, finding 11: with the low-FIX faction climaxes gone, Material
Commitment is rarer (60.7% → 36.9%), later (age 32.1 → 35.6) and far more
expensive (mean FIX at commitment 28.4 → **42.9**). Route climax rate fell 60.2%
→ 23.7%.

---

## 4. Fallback: the lore tier works, and shows what it is covering

Generic fallback and lore fallback, conditional on the run still being active:

| Age band | Active years | Generic share | Lore share | Combined |
|---|---:|---:|---:|---:|
| 0–5 … 45–54 | 30 000 … 44 839 | **0.0%** | **0.0%** | **0.0%** |
| 55–64 | 44 223 | 0.0% | 12.6% | 12.6% |
| 65+ | 215 433 | 24.6% | 29.6% | **54.2%** |

Against Phase 1.2, where 55–64 was 21.3% generic and 65+ was 51.8% generic:

- 55–64: generic fallback **eliminated** (21.3% → 0.0%), replaced by 12.6% lore.
  The band is now less empty overall, because the tightened late-life entry
  conditions also removed some content that used to fire there.
- 65+: generic fallback nearly halved (51.8% → 24.6%), but combined emptiness is
  **unchanged** (51.8% → 54.2%). Lore fallback took over about half the empty
  years and added a little more, because runs now live longer.

Reported exactly as Q-23 and Q-30 require: the two categories are never merged,
and the combined view makes the honest point — **lore fallback made the late-life
years better to read, not fewer.** Generic adult fallback remains 0% for every
band through 45–54, so there is still no adult content-density problem before 55.

---

## 5. Faction prominence (Q-29)

| Metric | Phase 1.2 | Phase 1.3 |
|---|---:|---:|
| Runs with faction contact | 35.9% | 34.9% |
| Faction-caused endings | 48.6% of completions | **15.4%** |
| News exposure per faction | — | 82.2–87.2% of runs |

Presence stayed broad and terminality fell by two-thirds, which is the direction
Q-29 asked for. Whether 15.4% is now *too low* is a design question; no target
was frozen, so nothing was tuned toward one.

News exposure is near-universal — every faction reaches 82–87% of runs — because
the twelve news events are `random`, `VERY_LOW`, `include: TRUE` over wide adult
windows, and the average run is 105 years long inside a thinning pool. If faction
news is meant to feel occasional rather than inevitable, that is a content-shape
decision for design; the events themselves are correct and inert.

---

## 6. Ending coverage

17 of 24 endings observed (70.8%), the same count as Phase 1.2 but a different
tail. `END-COR-001` appeared for the first time (1 run). Still unobserved:
`END-ACA-001`, `END-ACA-002`, `END-COR-002`, `END-FIN-003`, `END-LEG-002`,
`END-MUS-003`, and now `END-REL-001` is nearly gone (267 → 5) for the Last
Posture reason in §2. The unobserved set remains the academic, corporate, museum,
legal and finance mid-life ladders.

---

## 7. What was deliberately not done

Per the Phase 1.3 instructions:

- No LOW/MID/HIGH sweep, no family-weight A/B, no allocation comparison, no T1027
  sweep, no T1023 comparison, no manifestation diagnostic. All harnesses retained.
- No `FSTATE[...]`, no faction reputation, alignment, loyalty or hostility value.
  The condition grammar is byte-for-byte the Phase 1.2 grammar.
- The two late-life `FIX>=40` climax gates are untouched.
- No passive FIX drift.
- No prose rewritten, no events, factions, roles or endings invented, no mid-life
  player choices added.
- No React or H2A implementation work.

Two required patch inputs were missing and are reported as
[`PHASE1_CONFLICTS.md` P13-C1](PHASE1_CONFLICTS.md): the content-tool requirements
document and the Route Tag Registry v1.2 patch file. Both requirements were fully
stated in the instruction text itself, so both were implemented mechanically from
those statements and flagged rather than invented.

---

## 8. Recommended next decisions

For design, in priority order. All are recorded in
[`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md); none were acted on here.

1. **Q-27 / findings 5–7 — where do 18–34 endings come from now?** The faction
   layer was the supply and is deliberately no longer it. Either the non-faction
   mid-life ladders (academic, corporate, museum, legal, finance — the same ones
   that are still unobserved) need to become reachable in 25–34, or a share of
   faction contacts larger than 9.3% needs to reach `COMMITTED`, or the sudden
   branch needs to be less strongly conditioned. This is a content decision and
   the engine will not make it.
2. **Q-27 / finding 8 — the 65+ concentration.** Absolute 65+ endings nearly
   halved, which is progress, but they are now 51.1% of all endings because
   everything else shrank faster. The two `FIX>=40` gates were left alone as
   instructed; whether they should require more prior route history is still open.
3. **Q-29 — is 15.4% faction terminality the intended level?** No target is
   frozen. 48.6% was judged too high; 15.4% may be too low.
4. **Last Posture** produces no endings at all under `ARCHETYPE_SET` allocation.
   Worth a look before H2A playtesting, since one of six factions currently has no
   terminal branch a player can reach.
5. **Faction news cadence** — 82–87% exposure per faction may be more than
   "occasional world texture" was meant to mean.
