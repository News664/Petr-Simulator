# SOLID STATE — Phase 1.2 Design Resolutions
## Version 0.1

Merge these decisions into `docs/OPEN_QUESTIONS.md`; do not create a competing permanent register.

## Q-27 — How should the ending-age distribution be shaped?

**Status: RESOLVED FOR PHASE 1.2 CONTENT SHAPE; numeric balance remains open.**

Decision:
- The missing 18–34 endings are primarily a content-shape problem, not a global FIX-threshold problem.
- Introduce short/sudden young-adult paths driven by bureaucracy, insurance/finance, commercial preservation, experiments, underground finance/crime-adjacent activity, and cult/religious activity.
- Faction contact may begin in late school (age 16+) where age-appropriate, but no canonical Permanent Form ending may occur before 18.
- Some paths may permanently transform a protagonist at relatively low FIX because the conversion is externally imposed/induced rather than spontaneous biological culmination.
- Other paths use repeated faction follow-ups to raise FIX visibly over several years and may mature in 25–34 if they do not climax earlier.
- 25–34 remains the intended modal Permanent Form window.
- Late-life endings remain a small survivor wave and should require meaningful prior route/history; they must not act as the universal cheapest catch-all.
- Do not use passive age-based FIX drift.

Files supplied: Batch 006; Batch 005 delta; Faction Registry; Route Tag Registry delta.

## Q-02 — FIX thresholds

**Status: RESOLVED IN PRINCIPLE / NUMBERS STILL EXPERIMENTAL.**

Do not select LOW/MID/HIGH and do not globally change existing climax thresholds in this patch. First measure the new event-driven FIX economy and new 18–34 content. Route-specific low gates authored in Batch 006 are intentional where external institutions can cause conversion without high spontaneous FIX. Reconsider older global gates only after the compact Phase 1.2 diagnostic.

## Q-14 — T1027 Hairline Fracture

**Status: OPEN / DEFER.**

No T1027 sweep in Phase 1.2. Do not freeze a starting FIX bonus. When the baseline economy stabilizes, rerun T1027 in isolation rather than bundling it with T1028/T1030.

## Q-23 — adult fallback

**Status: OPEN / UNACCEPTABLE / MONITOR.**

24–30% is not acceptable. Do not bulk-author generic filler. Batch 006 faction follow-ups intentionally add meaningful adult density. Next report must break fallback down by age band (25–34, 35–44, 45–54, 55–64, 65+) and report conditional fallback among runs still active in each band.

## Q-24 — Late Bloomer

**Status: RESOLVED FOR NEXT TEST.**

Change only the age floor: `AGE>=25 & CHR<=5`. Keep CHR threshold and +4 effect unchanged. This isolates whether the old age floor was the main bottleneck. If activation remains implausibly late after the ending economy improves, revisit CHR threshold later.

## Q-19 follow-up — SPC reachability

SPC remains canonical. Batch 006 adds six broadly reachable `SPC/SECR` faction seeds. Run a dedicated T1023 diagnostic, but do not create a large standalone SPC filler batch.

## Q-22 follow-up — manifestations

No content change. Structural Wood dominance is considered fixed. Add only the inexpensive neutral-Human age-18–20 manifestation diagnostic.

## Q-10 — family weighting

Close the current decision: retain `channel -> uniform eligible family -> weighted event`. Do not rerun `sum_of_event_weights` A/B for this small patch. The A/B tool remains available for future large content additions or drafting-rule changes.

## Retained regression / experiment tools

The following tests are **not retired**. They are intentionally skipped for this compact patch because their underlying questions are unchanged:
- LOW/MID/HIGH FIX threshold sweep;
- uniform vs `sum_of_event_weights` family A/B;
- balanced/min-max/archetype allocation comparison;
- T1027 sensitivity sweep.

Re-run them when a future patch materially changes the corresponding balance dimension, and include them in larger pre-H2 / balance-freeze regression passes.
