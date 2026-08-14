# SOLID STATE — Single Active Faction Rule
## Version 0.1

This is a small engine eligibility rule, not a new faction meter.

Define a faction as **personally active** when its lifecycle is CONTACTED, ENGAGED or COMMITTED.

When evaluating a candidate event with `factionInteraction: "contact"`:
- if no faction is personally active, evaluate normally;
- if another faction is personally active, the contact event is ineligible;
- news and lore_fallback are unaffected;
- scheduled/personal/climax events for the already-active faction remain eligible.

Entering OPTED_OUT or CLOSED frees the personal-faction slot starting with the next annual draft. The same faction remains terminal under the existing FSM.

Required tests:
1. never two factions in CONTACTED/ENGAGED/COMMITTED simultaneously;
2. news from other factions may occur during an active relationship;
3. second faction contact becomes possible after first reaches OPTED_OUT/CLOSED;
4. safe-exit rules remain unchanged;
5. one-visible-event-per-year remains unchanged.

Do not add FSTATE syntax, loyalty, reputation or a visible active-faction UI.
