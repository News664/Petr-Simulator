# SOLID STATE - Route Rules v1.0

Machine-facing summary of the frozen Route Bible.

## Authoritative cadence
- Start age: 0.
- Exactly one visible event per chronological year.
- No same-year visible chains.
- Internal branches/effects/scheduling are not additional visible events.
- 0.5-year/two-events-per-year cadence is a future fallback only and MUST NOT be implemented in v1.

## Annual priority
1. Ending / committed hidden-route climax
2. Mandatory committed-route continuation
3. Scheduled priority event
4. Normal age/state drafting

## Normal drafting
`age/state channel profile -> channel -> eligible family -> eligible event`

Empty families/channels are removed and remaining weights renormalized.

## Neutral channel weights
| Age | Ordinary | Institutional | Transformation | Route/Special |
|---|---:|---:|---:|---:|
| 0-5 | 82 | 15 | 3 | 0 |
| 6-11 | 72 | 22 | 6 | 0 |
| 12-17 | 62 | 25 | 11 | 2 |
| 18-24 | 49 | 23 | 22 | 6 |
| 25-34 | 37 | 22 | 31 | 10 |
| 35-44 | 38 | 21 | 29 | 12 |
| 45-54 | 41 | 20 | 27 | 12 |
| 55-64 | 39 | 19 | 30 | 12 |
| 65+ | 35 | 18 | 34 | 13 |

## Childhood
- Ages 0-17 may include minor/temporary symptoms, FIX changes, screening, material hints.
- They should not normally create irreversible Material Commitment or canonical Permanent Form endings.
- Education is a major ordinary/institutional content family.

## Permanent Form age targets
- 0-17: ~0%
- 18-24: 18-22%
- 25-34: 35-40%
- 35-44: 20-25%
- 45-54: 8-12%
- 55-64: 4-7%
- 65+: 2-5%

These are simulation targets, not hard-coded ending probabilities.

## Fixation
- Modifies transformation pressure and event eligibility.
- Does not directly end a run.

## Material Commitment
- Nullable discrete state, not a meter.
- Before commitment: transformation families compete.
- After commitment: ordinary Transformation drafting stays in committed material.
- Changing material requires an explicit transition/mixed-material event.
- Mixed materials are authored outcomes, not accidental route accumulation.

## Route/material distinction
- Routes are social/narrative context.
- Material is physical trajectory.
- Multiple social routes may coexist.
- Primary material trajectory normally does not compete after commitment.

## Scheduling
Scheduled event fields should include:
- earliestAge
- latestAge
- priority
- validityCondition

Expired/invalid scheduled events are discarded.

## Hidden routes
- Use existing flags/events/talents/AEVT/achievements/priority/scheduling.
- May reserve future years after commitment.
- No alternate UI, real-time system, map, or new hidden numeric meter.

## Threshold talents
- Check after annual event resolution.
- Fire once permanently.
- Cascade until stable.
- Cannot retroactively alter the event that triggered them.

## Content targets
- At least 45% of random events modify one or more visible attributes.
- At least 15% modify two or more visible attributes.
- Event text normally 1-2 short sentences.
