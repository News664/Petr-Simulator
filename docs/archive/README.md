# SOLID STATE — Documentation Archive

Superseded historical documents, kept because they are the project's evidence
trail. **Nothing here is authoritative and nothing here should be edited.** Read
[`docs/CURRENT_STATE.md`](../CURRENT_STATE.md) for where the project actually is,
and [`docs/OPEN_QUESTIONS.md`](../OPEN_QUESTIONS.md) for what is still undecided.

Relative links inside these files were rewritten when they moved. Reports they
cite may no longer be tracked; see
[`reports/REPORT_INDEX.md`](../../reports/REPORT_INDEX.md).

## Reference map

| Archived file | What it was | Superseded by |
|---|---|---|
| [`decisions/DECISION_HISTORY.md`](decisions/DECISION_HISTORY.md) | The full Open Questions Register, Q-01 … Q-30, frozen at H2B.1A: every question with its evidence, options, engine behaviour, resolution block and per-milestone outcome lines | [`docs/OPEN_QUESTIONS.md`](../OPEN_QUESTIONS.md) v0.6 — open questions in full, resolved questions indexed with their decisions |
| [`decisions/PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md`](decisions/PHASE1_1_DESIGN_RESOLUTIONS_v0.1.md) | Phase 1.1 design resolution input | Merged into the register's Resolution blocks |
| [`decisions/PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md`](decisions/PHASE1_2_DESIGN_RESOLUTIONS_v0.1.md) | Phase 1.2 design resolution input | Merged into the register's Resolution blocks |
| [`decisions/PHASE1_3_DESIGN_RESOLUTIONS_v0.1.md`](decisions/PHASE1_3_DESIGN_RESOLUTIONS_v0.1.md) | Phase 1.3 design resolution input (added Q-28 … Q-30) | Merged into the register's Resolution blocks |
| [`decisions/PHASE1_3_1_DESIGN_RESOLUTIONS_v0.1.md`](decisions/PHASE1_3_1_DESIGN_RESOLUTIONS_v0.1.md) | Phase 1.3.1 micro-calibration resolution input | Merged into the register's Resolution blocks |
| [`phase1/PHASE1_1_FINDINGS.md`](phase1/PHASE1_1_FINDINGS.md) | Phase 1.1 measured results | Later milestone findings, ending at [`docs/H2B1A_FINDINGS.md`](../H2B1A_FINDINGS.md) |
| [`phase1/PHASE1_3_1_FINDINGS.md`](phase1/PHASE1_3_1_FINDINGS.md) | Phase 1.3.1 micro-calibration results | Same |
| [`h2a/H2A_GATE_DECISION.md`](h2a/H2A_GATE_DECISION.md) | The H2A blocker checklist | Gate passed; H2A is open and the project is at H2B.1A |
| [`h2a/H2A_THRESHOLD_CALIBRATION_FINDINGS.md`](h2a/H2A_THRESHOLD_CALIBRATION_FINDINGS.md) | The four-arm LOW/MID/HIGH calibration and the argument for LOW | LOW adopted as the **working** balance in [`docs/H2B1A_FINDINGS.md`](../H2B1A_FINDINGS.md) §2 |
| [`h2a/H2A_UI_FOUNDATION_REPORT.md`](h2a/H2A_UI_FOUNDATION_REPORT.md) | The first browser-playable build report | [`docs/CURRENT_STATE.md`](../CURRENT_STATE.md) for status; [`docs/ui/SOLID_STATE_H2A_BROWSER_TECHNICAL_CONTRACT_v0.1.md`](../ui/SOLID_STATE_H2A_BROWSER_TECHNICAL_CONTRACT_v0.1.md) for the enforced contract |
| [`h2a/SOLID_STATE_H2A_MANUAL_PLAYTEST_ROUND1_v0.1.md`](h2a/SOLID_STATE_H2A_MANUAL_PLAYTEST_ROUND1_v0.1.md) | Human Playtest Round 1 record, 5 lives — qualitative evidence, never a population estimate | Round 2, gated on [`docs/playtest/GITHUB_PAGES_SMOKE_CHECK.md`](../playtest/GITHUB_PAGES_SMOKE_CHECK.md) |

## What was deliberately *not* archived

Kept in `docs/` because they are current, or because they are the cited evidence
for a question that is still open:

- `PHASE1_CONFLICTS.md` — carries the live **H2B1A-C1 … C4** and **H2B-C1 … C4**
  observations.
- `PHASE1_ASSUMPTIONS.md` — cited evidence for **Q-14**.
- `PHASE1_FINDINGS.md` — cited evidence for **Q-02** and **Q-23**.
- `PHASE1_2_FINDINGS.md` — cited evidence for **Q-27**.
- `PHASE1_3_FINDINGS.md` — cited evidence for **Q-29**.
- `ENGINE_CHANGES.md` — the standing record of what the engine does and why.
- `H2B_BATCH008_FINDINGS.md` — the reference run H2B.1A is measured against.
- `docs/spec/`, `docs/design/`, `docs/ui/`, `docs/balance/`, `docs/validation/`,
  `docs/patches/` — authoritative contracts, registries and creative source
  material, including superseded *versions* that remain provenance for the
  canonical files.
