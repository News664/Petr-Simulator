# SOLID STATE — Report Index

`reports/` holds **generated** simulation output. Nothing here is authored by
hand and nothing here is canonical: every file is reproducible from the
committed corpus with the command listed below. The conclusions drawn from each
run live in a findings document, which is the thing to read and the thing to
cite.

Only the reports that are current evidence for the working balance are tracked
in git. Everything else regenerates on demand and is ignored by `.gitignore`.

## Tracked (current evidence)

| File | What it is | Conclusions in |
|---|---|---|
| `h2b1a-regression.md` / `.json` | H2B.1A focused regression — 3 000 runs, seed `h2b1a_timing`, species-stratified, `uniform-three`, `ARCHETYPE_SET`, uniform family weighting, max age 120. The measurement the current working balance rests on. | [`docs/H2B1A_FINDINGS.md`](../docs/H2B1A_FINDINGS.md) |
| `h2b-batch008-diagnostic.md` | H2B Batch 008 diagnostic — the identically-sampled reference run H2B.1A is compared against. The bulky `.json` companion was dropped; regenerate it if machine-readable form is needed. | [`docs/H2B_BATCH008_FINDINGS.md`](../docs/H2B_BATCH008_FINDINGS.md) |
| `h2b-content-lint.md` | Content lint output for the current corpus. | [`docs/validation/SOLID_STATE_H2B_CONTENT_LINT_SPEC_v0.1.md`](../docs/validation/SOLID_STATE_H2B_CONTENT_LINT_SPEC_v0.1.md) |

Regenerate:

```bash
npm run h2b1a                 # h2b1a-regression.{json,md}
npm run h2b:diagnostic        # h2b-batch008-diagnostic.{json,md}
npm run lint:content          # h2b-content-lint.md
```

## Not tracked (superseded, regenerable)

These runs were taken against **earlier corpora**. Their numbers are not
comparable with the current fingerprint
`8638e2e1ebd977878d09c28c1d554d7b85e2174f24fcf7aa568df018541d214e`, and a fresh
run against today's content will *not* reproduce the historical figures — that
is the point of retiring them. Their conclusions are preserved in the findings
documents named here; the harnesses are all still wired up and tested.

| Retired file | Milestone / corpus | Command that regenerates the equivalent run | Conclusions preserved in |
|---|---|---|---|
| `monte-carlo.{json,md}` | Phase 1.1 Monte Carlo, pre-1.2 corpus | `npm run simulate -- --runs 10000 --scenario all --species-stratified` | [`docs/PHASE1_FINDINGS.md`](../docs/PHASE1_FINDINGS.md) |
| `phase1_1-experiments.{json,md}` | Phase 1.1 experiment matrix (threshold sweep, family-weight A/B, allocation policies, T1027 sweep, manifestation probe), pre-1.2 corpus | `npm run experiment -- --runs 4000` | [`docs/archive/phase1/PHASE1_1_FINDINGS.md`](../docs/archive/phase1/PHASE1_1_FINDINGS.md) |
| `phase1_2-diagnostic.{json,md}` | Phase 1.2 compact diagnostic, pre-1.3 corpus | `npm run diagnostic` | [`docs/PHASE1_2_FINDINGS.md`](../docs/PHASE1_2_FINDINGS.md) |
| `phase1_3-sanity.{json,md}` | Phase 1.3 sanity plan, 5 000 runs, pre-1.3.1 corpus | `npm run sanity` | [`docs/PHASE1_3_FINDINGS.md`](../docs/PHASE1_3_FINDINGS.md) |
| `phase1_3_1-targeted-sanity.{json,md}` | Phase 1.3.1 targeted sanity, pre-H2A corpus | `npm run sanity -- --plan SOLID_STATE_PHASE1_3_1_TARGETED_SANITY_v0.1.json` | [`docs/archive/phase1/PHASE1_3_1_FINDINGS.md`](../docs/archive/phase1/PHASE1_3_1_FINDINGS.md) |
| `h2a-threshold-calibration.{json,md}` | H2A four-arm calibration (`CURRENT_AUTHORED` / LOW / MID / HIGH, 3 000 runs each), pre-Batch-008 corpus | `npm run h2a:threshold` | [`docs/archive/h2a/H2A_THRESHOLD_CALIBRATION_FINDINGS.md`](../docs/archive/h2a/H2A_THRESHOLD_CALIBRATION_FINDINGS.md) |
| `h2b-batch008-diagnostic.json` | Machine-readable companion to the retained Batch 008 Markdown report | `npm run h2b:diagnostic` | [`docs/H2B_BATCH008_FINDINGS.md`](../docs/H2B_BATCH008_FINDINGS.md) |

Retiring these files retires **data, not decisions**. No experiment harness was
deleted: `applyThresholdProfile`, the LOW/MID/HIGH rewrite, the family-weight
A/B, the allocation comparison, the T1027 sweep, the T1023 SPC comparison and
the neutral-Human manifestation probe are all unchanged, still reachable through
`npm run experiment`, and a test asserts each one is still constructible.

## Rules

- Reports are outputs. If a report and a findings document disagree, the report
  is stale — regenerate it or read the findings.
- Do not hand-edit a file in this directory.
- A run against a different corpus is a different measurement. Always record the
  content fingerprint alongside any number quoted from here.
