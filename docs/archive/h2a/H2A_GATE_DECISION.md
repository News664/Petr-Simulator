# SOLID STATE — H2A Gate Decision

## Phase 1.3 · 2026-08-13 · re-checked after Phase 1.3.1

> **Note (Part B, 2026-08-14):** the generated report this document was
> written from is no longer tracked in git — it measured an earlier corpus.
> The conclusions below are unchanged. See
> [`reports/REPORT_INDEX.md`](../../../reports/REPORT_INDEX.md) for what it measured and the command
> that regenerates it.

> **Phase 1.3.1 (2026-08-13):** the four condition-only Batch 007 edits changed no
> gate blocker. Re-measured over 2 500 runs at content fingerprint
> `a10919ca…`, all eleven blockers still PASS and every correctness counter is
> still zero. **H2A remains OPEN.** Two warnings below moved: 18–24 endings went
> 0.8% → 1.8% of completions (still far below target), and Order of the Last
> Posture now reaches COMMITTED — once in 180 contacts. See
> [`PHASE1_3_1_FINDINGS.md`](../phase1/PHASE1_3_1_FINDINGS.md).

Evaluated **only** against the hard correctness blockers in
[`docs/spec/SOLID_STATE_H2A_HUMAN_PLAYTEST_GATE_v0.1.md`](../../spec/SOLID_STATE_H2A_HUMAN_PLAYTEST_GATE_v0.1.md).
Per that gate and the Phase 1.3 instructions, **statistical balance misses are
warnings, not blockers**: imperfect ending-age percentages, provisional FIX
thresholds, an imperfect faction-ending share, achievements, Afterform and
`zh-TW` do not keep H2A closed.

| Field | Value |
|---|---|
| Content fingerprint | `8373c361da31db69a0e13468c0d68805c79f103770e209a920b2391fb5f79f18` |
| Corpus | 186 events · 7 batches · 38 route tags · 6 factions · 24 endings · 30 talents |
| Balance constants | Provisional v0.2, unmodified |
| Sanity diagnostic | `reports/phase1_3-sanity.md` — 5 000 runs, species-stratified, `ARCHETYPE_SET`, authored thresholds, strict pre-25 coverage |
| Test suite | 295 tests, 14 files, all passing |

---

## Hard blocker checklist

| # | Blocker | Verdict | Evidence |
|---|---|---|---|
| 1 | Canonical content loads and validates | **PASS** | `npm run validate` — 7 batches, 186 events, 6 species, 30 talents, 24 endings, 0 issues |
| 2 | No duplicate IDs | **PASS** | 186 events, 186 unique IDs, checked across the whole published corpus; asserted in `tests/phase1_3-acceptance.test.ts` |
| 3 | Deterministic/golden correctness tests pass after intentional regeneration | **PASS** | 39 golden assertions over 36 runs (6 seeds × 6 species); regenerated because the content fingerprint changed, diff reviewed — no ending before 18, every ending ID in the registry, nonterminal runs stop at the diagnostic maximum |
| 4 | Exactly one visible event per age | **PASS** | Asserted across 400 Phase-1.3 runs and the whole Acceptance D suite; ages are unique and strictly increasing |
| 5 | No ending or Material Commitment before age 18 | **PASS** | Acceptance E plus a Phase-1.3 assertion over 400 runs; schema rejects either on an under-18-capable event |
| 6 | No pre-25 coverage defect in the sanity corpus | **PASS** | 0 of 5 000 runs; 0 pre-25 generic fallback events; 0 pre-25 lore fallback events |
| 7 | Faction FSM never has two lifecycle states for one faction | **PASS** | 0 of 5 000 runs; guaranteed by construction — every lifecycle flag is dropped before the new one is added |
| 8 | Every transition is registered and legal | **PASS** | 0 illegal transitions across 5 000 runs and 5 012 applied transitions; every applied edge re-checked against the registry table in test |
| 9 | After OPTED_OUT/CLOSED, ordinary personalized events from that faction do not occur | **PASS** | 0 of 5 000 runs, and proven statically at load: any personalized/climax event whose `include` could survive a safe exit fails validation |
| 10 | News/lore may still occur after opt-out without reopening personal state | **PASS** | Asserted directly: after a DMMS opt-out, DMMS lore bulletins remain eligible and the personalized DMMS pool is empty; all 12 news events carry no effects, flags or transitions |
| 11 | No simulation crash or invalid ending/material state | **PASS** | 5 000 sanity runs plus 295 tests with no thrown error; every observed ending resolves to a registry ID and every committed material is a valid family code |

---

## Gate status

# **H2A: OPEN**

All eleven hard correctness blockers pass. Phase 1.3 is the final planned
headless-only content iteration, so the browser prototype may begin.

**This decision does not authorize implementation in this task.** Per the Phase
1.3 instructions, work stops here for design review; React/H2A implementation is
a separate task.

---

## Balance and design warnings for the human-playtest loop

None of these are blockers. They are what to watch for while humans play, and
what H2B regression should re-measure.

| Warning | Measurement | Why it matters in playtest |
|---|---|---|
| **Only 23.9% of runs reach an ending** | completion 60.2% → 23.9%; nonterminal 76.1% | Three of four playtest lives will run to the diagnostic maximum with no ending. Playtesters will notice this before they notice anything else — consider capping the playtest lifespan or seeding toward completing runs |
| **18–24 endings are nearly absent** | 31.5% → 0.8%; **1.8% after Phase 1.3.1** (4.4 per 1 000 runs) | A player will almost never see a young ending, so "sudden endings feel surprising but supported" is hard to evaluate as shipped |
| **25–34 did not improve** | 106 → 38 endings per 1 000 runs | The intended modal window is emptier than before the patch meant to fill it — [Q-27](../../OPEN_QUESTIONS.md#q-27) |
| **65+ dominates the shape** | 51.1% of completions | Most endings a playtester reaches will be late-life survivor endings |
| **Late-life years are half fallback** | at 65+: 24.6% generic + 29.6% lore = 54.2% of active years | Directly relevant to "which events feel repetitive"; lore fallback improved the texture without reducing the emptiness |
| **Faction terminality may now be too low** | 48.6% → 15.4% of endings | [Q-29](../../OPEN_QUESTIONS.md#q-29) has no frozen target. Relevant to "can faction involvement be felt without a faction dashboard?" |
| **Order of the Last Posture almost never terminates** | Phase 1.3: 0 of 380 contacts reach COMMITTED. **Phase 1.3.1: 1 of 180** — unblocked, but a second gate in `EVT-SPC-SECR-0024` still filters it | One of six factions has no terminal branch a player can reach. Worth fixing before it distorts faction feedback |
| **Faction news is near-universal** | 82.2–87.2% exposure per faction | May read as noise rather than world texture |
| **Material Commitment is rarer and more expensive** | 60.7% → 36.9%; mean FIX at commitment 28.4 → 42.9 | Affects "is transformation pressure perceptible without FIX?" |
| **7 endings still unobserved** | 17/24 coverage; academic, corporate, museum, legal, finance ladders | Those routes cannot be playtested at all yet |
| Provisional FIX thresholds unfrozen | LOW/MID/HIGH never selected | Explicitly not an H2A blocker |
| T1027 start-FIX unfrozen | [Q-14](../../OPEN_QUESTIONS.md#q-14) deferred | Explicitly not an H2A blocker |
| Achievements / Afterform / `zh-TW` absent | by design | Explicitly not an H2A blocker |

Retained for H2B, unrun in Phase 1.3 and unchanged: the LOW/MID/HIGH threshold
sweep, the uniform vs `sum_of_event_weights` family A/B, the three-way allocation
comparison, the T1027 sensitivity sweep, the T1023 SPC comparison and the
neutral-Human manifestation diagnostic.
