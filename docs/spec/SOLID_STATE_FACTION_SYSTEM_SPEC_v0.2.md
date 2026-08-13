# SOLID STATE — Faction System Specification
## Version 0.2 — Phase 1.3

Factions are world actors, not deterministic ending routes.

They can matter at four levels:
1. world/lore presence — the protagonist hears news;
2. contact — paths cross;
3. personal relationship — client, subject, affiliate, debtor, case, target, member, etc.;
4. committed relationship — routine safe exit is no longer available.

A fifth outcome, `OPTED_OUT` or `CLOSED`, ends the personalized chain.

## Lifecycle

```text
NONE
  |
CONTACTED
  |----> OPTED_OUT
  |----> CLOSED
  |----> COMMITTED
  v
ENGAGED
  |----> OPTED_OUT
  |----> CLOSED
  v
COMMITTED
  |
  +----> CLOSED  (explicitly authored only)
```

`OPTED_OUT` means the protagonist safely exits before ordinary commitment.
`CLOSED` means the case/study/account/relationship ends for another authored reason.
Both block normal personalized events from that faction.

## Roles

Roles are not FSM states. They may coexist:
CASE, CLIENT, SUBJECT, AFFILIATE, MEMBER, DEBTOR, TARGETED, OBLIGATED.

Examples:
- CRI: ENGAGED + SUBJECT + AFFILIATE
- Black Ledger: ENGAGED + DEBTOR + TARGETED
- DMMS: COMMITTED + CASE + OBLIGATED

## Safe opt-out

After `OPTED_OUT`, ordinary recruitment, case, client, subject, obligation and climax
events from that faction must not resume.

News and lore remain possible because they are about the world, not the protagonist.

A future exceptional "you thought you got out" event must explicitly state why it can
override safe exit; that is never generic faction behavior.

## Sudden endings

Sudden faction endings remain valid but are a minority branch.

The standard route becomes:

`CONTACT -> DISPOSITION -> ENGAGED/EXIT -> ESCALATION -> COMMITTED/EXIT -> CLIMAX`

Only strongly conditioned disposition variants retain sudden 18–24 endings.
This preserves dystopian surprise while moving ordinary faction terminality toward 25–34.

## No morality/reputation subsystem

Faction identity is not alignment. The same faction can help, exploit, employ,
target, ignore, or merely appear in the news.

Do not add a numeric reputation, loyalty, hostility or morality meter in v1.

## News/lore

News does not create contact.

Most faction-news events are once-per-run and may form loose progressions via event
history. They should usually have no direct mechanical effect.

Each faction may have one rare repeatable `lore_fallback_only` bulletin for very late
empty years. Lore fallback is reported separately from generic quiet-year fallback.
