# SOLID STATE — Event Drafting Rules
## Version 0.1 — Machine-Facing Balance Draft

This document defines the qualitative hierarchy to be implemented and simulation-tested before exact numeric balance constants are frozen.

## 1. Normal annual draft

When no priority/scheduled event wins:

`age/state channel profile -> channel -> eligible family -> eligible event`

Empty families are removed and weights renormalized. Empty channels are removed and weights renormalized.

## 2. Material evidence is directional, not deterministic

Before `MAT` is committed, the following are **soft evidence**:

- species material tendency;
- talent material tendency;
- childhood material hint flag (`MAT_HINT_*`);
- reversible manifestation flag (`MAT_MANIFEST_*`);
- route/institution context.

None of these alone hard-locks the material.

Only an authored event that sets `Material Commitment` hard-locks ordinary future material drafting.

## 3. Qualitative evidence strength

Initial qualitative intent:

- Matching species Secondary tendency: `Favor`
- Matching species Primary tendency: `Strongly Favor`
- Matching talent tendency: authored `Favor` / `Strongly Favor`
- Matching childhood hint: `Favor`
- Matching manifestation: `Strongly Favor`
- Matching active route context: normally `Favor`
- Contradictory evidence from another family remains valid and participates normally

Exact multipliers belong in `BALANCE_CONSTANTS` after Monte Carlo testing.

## 4. No single-evidence certainty rule

A single hint or a single manifestation must not make eventual same-material commitment nearly certain.

Balance guardrails, to be tested rather than hard-coded:

- Given only a childhood hint for material X, final material X should normally remain well below ~70%.
- Given a first manifestation for material X, final material X should normally remain below ~80%.
- If observed rates exceed those bounds in broad neutral simulations, evidence multipliers or commitment-event density are too strong.

## 5. Contesting manifestations are valid

Before Material Commitment, more than one manifestation family may appear in the same life.

Example:

`MAT_MANIFEST_WOOD` and `MAT_MANIFEST_CRYS`

may both be true.

This is not an error. It represents an unstable/uncertain pre-commitment physical trajectory.

When multiple manifestation flags exist:
- all matching families receive their soft tendency;
- ordinary drafting continues;
- the eventual committing event determines `MAT`.

## 6. Commitment event rule

A commitment event:
- requires appropriate authored physiological/route state;
- does not automatically receive extra family probability merely because it is a commitment event;
- should normally use `weightClass=NORMAL` unless there is a separate narrative reason for higher local weight;
- may require a manifestation plus sufficient FIX, or another explicitly authored path.

The family must first be selected through normal family drafting unless the event is scheduled/mandatory.

## 7. Sparse-content warning

During early content production, a material family may contain only one eligible commitment event after manifestation. This can make the family internally deterministic once selected.

That is acceptable temporarily for content prototyping but must not be mistaken for final balance. Before first-playable freeze, major material families should contain enough manifestation/progression/institutional variants that selecting the family does not always mean immediate commitment.

## 8. Route influence

A social route may bias a compatible material family but should rarely hard-select a material.

Examples:
- Museum may Favor crystal, wood, marble, glass depending current evidence.
- Architectural may Favor stone/metal.
- Medical may Favor synthetic/temporal where no material commitment exists.

If `MAT != NONE`, routes adapt to the committed material rather than competing to replace it.

## 9. Simulation metrics required

Monte Carlo reporting must include:
- P(final material X | hint X)
- P(final material X | first manifestation X)
- P(final material X | species Primary X)
- rate of multiple distinct manifestations before commitment
- average ages of hint, first manifestation, commitment, ending
- final material entropy by species and talent combination

Warn when:
- one hint predicts final material too strongly;
- first manifestation becomes a de facto hard lock;
- species Primary becomes near-certain;
- contradictory manifestations almost never occur;
- material commitment happens immediately after first manifestation in most runs.

## 10. Hard lock

After an event sets `MAT != NONE`:
- unrelated ordinary Transformation families are removed;
- only committed-family, explicit transition, mixed-material, or anomaly events remain eligible.

This is the only normal material hard lock.


# v0.2 — Academic route intersection rules

## Academic research is an intersection amplifier

The Academic route must not behave as a simple career ladder ending in tenure.

After `ROUTE_ACA_RESEARCH`, an authored specialization event establishes one of several discrete research directions:

- `ROUTE_ACA_MATERIALS`
- `ROUTE_ACA_CONTINUITY`
- `ROUTE_ACA_POLICY`

These are route flags, not numeric progress meters and not player choices.

### Comparative Materials

`ROUTE_ACA_MATERIALS`:
- unlocks research exposure to multiple material families;
- may mildly increase Transformation/Institutional research opportunities;
- **must not favor one specific final material merely because the route is active**;
- may intersect Museum, Medical, Restoration, Architectural, and mixed-material content.

The research route is explicitly useful for showing the protagonist several transformation systems without treating the first exposure as Material Commitment.

### Continuity

`ROUTE_ACA_CONTINUITY`:
- unlocks temporal, awareness, memory, identity, and anomalous-continuity research;
- may intersect Temporal Fixation and rare Anomalous talents;
- does not change the global rule that ordinary Permanent Forms default to Unconscious.

### Policy / Governance

`ROUTE_ACA_POLICY`:
- unlocks stronger Legal, Finance, Civic, Religious, and institutional-classification intersections;
- studies ownership/personhood/property/status rather than selecting a physical material.

### Tenure

Tenure is one possible career consequence of successful Academic research.

The Academic route may instead or additionally intersect:
- `END-MUS-003` Crystal Archivist;
- `END-TMP-001` Time Served;
- Legal/personhood outcomes;
- Museum/restoration outcomes;
- `END-ACA-002` Peer-Reviewed Permanence;
- future Anomalous/continuity endings.

Therefore "Academic route" and "Tenure route" are not synonyms.


# v0.3 — Phase 1.1 drafting clarifications

## Family weighting baseline

The Phase 1.1 design baseline is:

`channel -> uniform eligible family -> locally weighted eligible event`

Event count must not silently become family probability.

Adding more events to a family increases variety inside that family; it does not
increase the family's baseline chance of being selected.

Explicit family base weights may be introduced later if simulation shows uniform
families produce undesirable distributions.

For Phase 1.1 Monte Carlo, retain `sum_of_event_weights` only as an A/B diagnostic
comparison. It is not the design baseline.

## Route-tag influence under the uniform-family baseline

Route-tag matching uses the canonical Route Tag Registry.

By default, an active matching route context may apply at most one `routeFavor`
scalar to the **event selection inside the already-selected family**.

Route tags do not alter family choice unless a future canonical registry field
explicitly declares such a family-level tendency.

`academic` must never gain a Transformation event favor merely because a TRN
event is academically relevant. This preserves Comparative Materials as an
intersection route rather than a TEMP-material bias.

## Species refinement hooks

Species uses two simple layers:

1. broad family tendency at family selection;
2. optional refinement hook at local event selection.

There is no `channel -> family -> refinement -> event` extra hierarchy.

A refinement hook matters only if an eligible event/variant explicitly carries
the matching `refinementTag`.

`MAGICAL_SEAL` is a registered special/refinement hook with no broad material
family. It contributes no family scalar.

## FIX economy

FIX remains **event-driven**.

There is no passive annual FIX increment.

Age already changes transformation pressure through `ageChannelWeights`; adding
an additional hidden age-based FIX drift would duplicate the same time signal.

FIX rises through authored, perceivable causes such as:
- manifestations;
- occupational exposure;
- controlled-hardening treatment;
- research exposure;
- route-specific incidents;
- explicit transformation progression.

Multi-year routes may add FIX in consecutive annual events when the narrative
makes that progression visible.

Climax/commitment threshold numbers remain provisional balance parameters for
Phase 1.1 testing.
