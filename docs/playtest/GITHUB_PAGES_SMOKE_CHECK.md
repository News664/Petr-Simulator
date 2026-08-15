# SOLID STATE — GitHub Pages Smoke Check

**Target URL** `https://news664.github.io/Petr-Simulator/` — live, published from
`main` by GitHub Actions.

Most of what this document used to ask a human to do is now automated. Routine
functional checks belong to CI; a person's time is better spent on the things a
test cannot judge.

| | |
|---|---|
| **Automated** | [`e2e/`](../../e2e), run by `verify-build-e2e` on every pull request into `main`, in Chromium on a desktop and an emulated mobile viewport, against the production bundle |
| **Manual** | §B below — real hardware, real browsers, and judgement |

Do not treat the site as newly published until the `Deploy GitHub Pages` run for
that commit is green.

---

## A. Automated — do not re-check by hand

These run on every pull request into `main` and again before any deploy. If one
of them regresses, CI fails and the change never reaches the published site, so
repeating them manually gains nothing.

| Check | Covered by |
|---|---|
| Landing renders from the built bundle; no 4xx on the document or `assets/`; no console errors | `e2e/flow.spec.ts` |
| `BEGIN NEW LIFE` reaches birth registration | `e2e/flow.spec.ts` |
| Talent selection takes exactly three; incompatible and over-limit cards are unaddable; deselect frees a slot | `e2e/flow.spec.ts` |
| Assessment spends the whole budget; `REVIEW RECORD` is gated until it does; `BACK` preserves choices | `e2e/flow.spec.ts` |
| Record summary lists classification, irregularities, allocation and seed | `e2e/flow.spec.ts` |
| Playback reveals annual entries; pause freezes the timeline; resume and 1×/2× work | `e2e/flow.spec.ts` |
| Normal mode renders no internal state — no FIX, no inspector | `e2e/flow.spec.ts` |
| No horizontal overflow on any setup or playback screen, desktop and mobile | `e2e/flow.spec.ts` |
| An explicit `?dev=1` seed is deterministic across sessions; a different seed differs | `e2e/persistence.spec.ts` |
| Reload mid-playback offers `CONTINUE RECORD` and recomputes a byte-identical timeline | `e2e/persistence.spec.ts` |
| A closed tab resumes from the landing screen | `e2e/persistence.spec.ts` |
| A record filed under a different `contentVersion` is refused, not replayed, and the app stays usable | `e2e/persistence.spec.ts` |
| A deterministic run reaches its outcome with no page error; Review Life and back work | `e2e/playback.spec.ts` |
| A horizon-length run reports an open record rather than an error | `e2e/playback.spec.ts` |
| Playback follow keeps the newest entry on screen through consecutive reveals at 2× | `e2e/playback.spec.ts` |
| Scrolling up stops follow, re-reading is not interrupted, `RETURN TO PRESENT` catches up and resumes | `e2e/playback.spec.ts` |

Run them locally with `npm run e2e`.

Follow behaviour is additionally unit-tested in
[`tests/h2a-playback-follow.test.tsx`](../../tests/h2a-playback-follow.test.tsx),
including degradation when scroll APIs or `ResizeObserver` are missing.

---

## B. Manual — real device, real judgement

Short by design. Everything here is either impossible to emulate honestly or is a
judgement call.

Run after a deployment that changes the UI, and before opening a playtest round.

### B1. Real phone, real browser

Emulated viewports get layout right and hardware wrong.

- [ ] The site loads on a real phone over a real network.
- [ ] **Playback follow keeps up on actual hardware** at 1× and at 2× — the
      newest entry stays at the bottom of the screen without manual scrolling.
      *This is the specific thing that was wrong before B.1; it is the check
      worth doing carefully.*
- [ ] Scrolling up to re-read is not yanked back, and `RETURN TO PRESENT` lands
      you at the newest entry.
- [ ] Tap targets are reachable one-handed; nothing important sits under the
      browser chrome or a home indicator.
- [ ] Rotating the device does not strand the viewport mid-timeline.

### B2. Clipboard

Clipboard permission behaviour is browser- and origin-specific and is not
automated.

- [ ] `COPY SEED` on the ending screen shows `Reference copied`.
- [ ] The clipboard really holds the seed — paste it into the `?dev=1` seed field
      and confirm the same life replays.
- [ ] If the browser denies clipboard access, nothing crashes and the seed is
      still readable on screen.

### B3. Other browsers

CI runs Chromium only. Cheap spot checks elsewhere:

- [ ] Safari (iOS) — playback, follow, ending screen.
- [ ] Firefox — playback, follow, ending screen.

### B4. Judgement

Not pass/fail; note what you notice and take it into the playtest round.

- [ ] Does the reveal cadence feel right at 1×? At 2×?
- [ ] Does the certificate/ending moment land?
- [ ] Is the institutional tone holding up over a whole life?
- [ ] Are long runs boring in a way that reads as a content-supply problem?

---

## Record

### 2026-08-14 — owner, pre-B.1

Recorded as fact, not as a pass of the list above.

- The owner opened the deployed site on a phone in **both normal and `?dev=1`
  mode**.
- The site was **generally functional**: setup, playback and the developer mode
  all worked.
- **Mobile playback auto-follow lagged.** Auto-scrolling happened, but the
  viewport moved more slowly than entries arrived, so manual scrolling was still
  needed. This is the defect B.1 fixes; the fix is verified by automated tests
  and by an emulated mobile viewport, and is **awaiting real-device
  confirmation**.
- No other checks in §B were performed at that time, and none are marked as
  passed here.

### Template for future runs

| Field | Value |
|---|---|
| Deployed commit | |
| Workflow run | |
| Date checked | |
| Device / browser / OS | |
| B1 real phone | |
| B2 clipboard | |
| B3 other browsers | |
| B4 notes | |

Human Playtest Round 2 focuses on UX, content, tone and pacing. Functional
regressions are CI's job now — if something in §A breaks, fix the test or the
code, do not re-add it to this list.
