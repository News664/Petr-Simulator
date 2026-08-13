# SOLID STATE — Content Schema Patch
## Target Version 0.4 — Faction lifecycle + lore fallback

Apply this as a delta to Content Schema v0.3.

## New event metadata

Optional on `GameEvent`:

```text
factionIds?: string[]
factionInteraction?: contact | personal | climax | news | lore_fallback
```

`factionIds` is metadata/validation scope only. It does not itself change drafting weights.

## Structured faction transition action

Optional on an event variant:

```text
factionTransitions?:
  - factionId: string
    to: CONTACTED | ENGAGED | COMMITTED | OPTED_OUT | CLOSED
    addRoles?: string[]
    removeRoles?: string[]
```

Resolution:
1. Read current lifecycle state from registered faction lifecycle flags. No state flag = `NONE`.
2. Validate `current -> to` against Faction Registry `legalTransitions`.
3. Remove the current lifecycle flag, if any.
4. Add the registered lifecycle flag for `to`.
5. Apply `removeRoles`, then `addRoles`, using only roles registered for that faction.
6. If `to` is `OPTED_OUT` or `CLOSED`, remove all current role flags for the faction.
7. Historical `FAC_*_CONTACT` flags are never removed by lifecycle transition.
8. The transition is internal to the current annual event.

Variant effect order:

```text
stat effects
-> ordinary removeFlags/addFlags
-> factionTransitions
-> Material Commitment
-> schedules
-> ending
-> threshold talents
```

Conditions remain unchanged: use ordinary `FLAG[...]`. Do not add `FSTATE[...]` in v1.

## FSM invariants

- At most one lifecycle state flag per faction.
- Roles are orthogonal and multiple roles may coexist.
- `OPTED_OUT` and `CLOSED` are terminal for ordinary personalized faction content.
- `COMMITTED -> OPTED_OUT` is illegal.
- `NONE -> ENGAGED` is illegal.
- An explicitly authored sudden ending may transition CONTACTED -> COMMITTED and end in the same event.
- World news does not need lifecycle state.

## New selection mode: `lore_fallback_only`

Add `lore_fallback_only` to selection modes.

At AGE >= fallback minimum, fallback resolution becomes:
1. scheduled/priority event;
2. normal hierarchical draft;
3. if normal pool is empty, eligible `lore_fallback_only`;
4. if none, generic `fallback_only`.

`lore_fallback_only`:
- excluded from normal hierarchical drafting;
- repeatable;
- age.min >= 25;
- no ending;
- no Material Commitment;
- no CHR/INT/STR/MNY/SPR/FIX effects;
- no ordinary flag changes;
- no faction transition;
- no schedules;
- seeded selection weighted only by `weightClass`;
- no route/talent/species drafting modifiers.

Diagnostics must distinguish `loreFallbackYears` from generic `fallbackYears`.

## Route-context favor

Faction route tags are active only for CONTACTED, ENGAGED and COMMITTED lifecycle flags.
Historical `FAC_*_CONTACT`, OPTED_OUT and CLOSED do not grant faction route-context Favor.

## Validation additions

Reject:
- unknown faction IDs;
- unknown lifecycle states or roles;
- illegal FSM transitions;
- multiple lifecycle states for one faction;
- unknown `FAC_*` flags;
- faction routeTags missing from Route Tag Registry;
- personalized faction events that remain reachable from OPTED_OUT/CLOSED without an explicit exceptional rule;
- any lore-fallback mechanical side effect;
- cross-batch duplicate Event IDs.

Patch-side ID checking must compare against the whole published corpus.
