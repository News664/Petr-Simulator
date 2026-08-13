# SOLID STATE — H2A AGENTS Addendum
## Version 0.1

| Task | Authority |
|---|---|
| Player-visible flow / visual behavior | `SOLID_STATE_H2A_UI_PRODUCT_SPEC_v0.1.md` |
| Browser/engine integration | `SOLID_STATE_H2A_BROWSER_TECHNICAL_CONTRACT_v0.1.md` |
| Visual tokens | `content/ui/SOLID_STATE_H2A_UI_TOKENS_v0.1.json` |
| Human feedback loop | `SOLID_STATE_H2A_PLAYTEST_PROTOCOL_v0.1.md` |
| H2A correctness gate | existing H2A gate spec |
| Game content | canonical `content/` |
| Open design/balance | `docs/OPEN_QUESTIONS.md` |

Coding agent may implement UI/components from these specs but must not invent new
event/ending/faction prose or balance targets.

Game rules stay in `src/engine`, not React.
