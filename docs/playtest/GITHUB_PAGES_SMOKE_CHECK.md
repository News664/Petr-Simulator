# SOLID STATE — GitHub Pages Smoke Check

Run this once after each Pages deployment of `main`, **before** inviting anyone
into a playtest round. It checks that the deployed bundle is the build we
intended and that the browser app behaves the same on Pages as it does under
`npm run preview` — nothing here is a balance or content check.

**Target URL** `https://news664.github.io/Petr-Simulator/`

**When** after the `Deploy GitHub Pages` workflow reports success for a `main`
commit. Do not treat the site as live until that run is green *and* this
checklist passes.

**How to record a run** copy the table at the bottom, fill in the deployed
commit and the browser used, and mark each item `pass` / `fail` / `n/a` with a
note. A failure is a Pages/build defect: file it, do not tune content for it.

---

## 1. Root and assets load with no 404

1. Open the target URL in a fresh tab.
2. Open devtools → Network, then hard-reload (`Ctrl`/`Cmd` + `Shift` + `R`).

- [ ] The document itself returns 200, not the GitHub 404 page.
- [ ] Every request under `assets/` returns 200 — no request resolves to
      `https://news664.github.io/assets/...` (missing the `/Petr-Simulator/`
      path segment). Vite builds with `base: './'`, so all asset URLs must be
      relative to the project path.
- [ ] The console has no uncaught errors and no failed module fetches.
- [ ] The landing screen renders the `SOLID STATE` header, the subtitle and the
      `BEGIN NEW LIFE` control.

## 2. Setup flow

Click `BEGIN NEW LIFE` and walk the four setup screens.

- [ ] **Birth registration** shows a registered classification, its colloquial
      name, any starting adjustments, and the assessment points available.
- [ ] **Personal irregularities** requires exactly three selections; an
      incompatible pairing is blocked with the "Cannot be recorded alongside…"
      note rather than silently accepted.
- [ ] **Initial assessment** spends the point budget, `RESET ALLOCATION`
      restores it, and `REVIEW RECORD` is unavailable while points remain.
- [ ] **Record summary** lists classification, irregularities, allocation and
      the record reference (seed) that setup produced.
- [ ] `BACK` on each screen returns to the previous one with choices intact.

## 3. Playback

Press `BEGIN LIFE`.

- [ ] Years reveal one entry at a time, with exactly one visible event per age.
- [ ] Pause / resume works, and `1×` / `2×` change only the reveal rate — never
      the entries themselves.
- [ ] Scrolling back into the timeline shows earlier entries and
      `RETURN TO PRESENT` jumps back to the newest one.
- [ ] Material status and the visible stats update alongside the entries.
- [ ] A recorded trait activation appears as "Trait recorded — …".

## 4. Ending and non-terminal outcome

- [ ] A run that reaches an ending shows the `NOTICE OF PERMANENT STATUS` /
      `CERTIFICATE OF PERMANENT STATUS` screen with the ending fields
      (material, form, awareness, integrity, legal status, ownership, autonomy,
      consent, location, social meaning) and the recorded age.
- [ ] The content revision (fingerprint) is shown on the ending screen and
      matches the fingerprint in `docs/CURRENT_STATE.md` for the deployed
      commit.
- [ ] A run that reaches the horizon without an ending shows
      `RECORD REMAINS OPEN` with the reached age — **not** an error, and not a
      blank screen. Replay with new seeds until one of each outcome is seen, or
      use `?dev=1` with a known seed.

## 5. Review Life

- [ ] `REVIEW LIFE` opens the `FULL RECORD` screen.
- [ ] The entry count in the lede matches the number of years played.
- [ ] The final entry is marked `FINAL ENTRY`.
- [ ] `BACK TO OUTCOME` returns to the ending screen unchanged.

## 6. Refresh during setup

- [ ] Reload the page midway through birth registration, talent selection and
      the initial assessment in turn. Each reload returns to the same setup
      phase, with the same classification and the same drafted irregularities —
      the seed is what is stored, so the setup must not re-roll.

## 7. Refresh during playback

- [ ] Reload mid-playback. The life resumes at the same reveal position, with a
      byte-identical timeline up to that point — the run is recomputed from the
      stored seed and choices, not restored from a serialized state.
- [ ] Reload on the ending screen and on the `FULL RECORD` screen; each returns
      to that screen for the same life.

## 8. localStorage resume

- [ ] Close the tab entirely, reopen the target URL: the landing screen offers
      `CONTINUE RECORD`.
- [ ] `CONTINUE RECORD` reopens the stored life at its stored phase.
- [ ] `BEGIN NEW LIFE` from that landing screen starts a genuinely new life and
      replaces the stored record.
- [ ] With storage blocked (private window / site data blocked), the app is
      still fully playable — no crash, no stuck screen; only resume is absent.

## 9. Stale contentVersion handling

Simulate a content revision changing under a stored record:

```js
// devtools console, on the deployed page
const k = 'solid-state:h2a:v1:session';
const s = JSON.parse(localStorage.getItem(k));
s.contentVersion = 'stale-test';
localStorage.setItem(k, JSON.stringify(s));
```

- [ ] Reload: the landing screen reports that the stored record was filed under
      a different content revision and cannot be reopened, and offers a new
      life.
- [ ] `CONTINUE RECORD` is not offered for the stale record — the app must never
      replay a stored seed against a different corpus.
- [ ] `BEGIN NEW LIFE` clears the incompatible record and plays normally
      afterwards.

## 10. `?dev=1`

Open `https://news664.github.io/Petr-Simulator/?dev=1`.

- [ ] The `DEV` marker is visible.
- [ ] The developer seed field accepts an explicit seed, and the same seed
      replays an identical life (same classification, same timeline, same
      outcome).
- [ ] The developer inspector opens and reports run state without throwing.
- [ ] Without `?dev=1` neither the seed field nor the inspector is reachable.

## 11. Narrow / mobile viewport

Use a device emulator at 360×640 and a real phone if one is available.

- [ ] No horizontal page scroll on any screen.
- [ ] Setup controls, the talent grid and the assessment steppers are all
      reachable and tappable.
- [ ] Playback uses the compact material label (`MOBILE`) and the timeline stays
      readable.
- [ ] The ending screen's field list wraps rather than overflowing.

## 12. Copy seed

- [ ] `COPY SEED` on the ending screen shows the "Reference copied"
      confirmation.
- [ ] The clipboard contains the seed, and pasting it into the `?dev=1` seed
      field reproduces the same life.
- [ ] If the browser denies clipboard access, the app does not crash — the seed
      is still readable on screen.

## 13. Root URL reload

- [ ] Reload the bare project URL (`.../Petr-Simulator/`, with and without the
      trailing slash) several times. Each load serves the app, not a 404.
- [ ] Navigating away and pressing Back returns to the app in a usable state.
- [ ] Opening the URL in a second tab does not corrupt the first tab's record;
      the last write wins and neither tab errors.

---

## Deployment record

| Field | Value |
|---|---|
| Deployed commit | |
| Workflow run | |
| Date checked | |
| Browser / OS | |
| Result | |

| # | Check | Result | Note |
|---|---|---|---|
| 1 | Root and assets, no 404 | | |
| 2 | Setup flow | | |
| 3 | Playback | | |
| 4 | Ending / non-terminal | | |
| 5 | Review Life | | |
| 6 | Refresh during setup | | |
| 7 | Refresh during playback | | |
| 8 | localStorage resume | | |
| 9 | Stale contentVersion | | |
| 10 | `?dev=1` | | |
| 11 | Narrow / mobile viewport | | |
| 12 | Copy seed | | |
| 13 | Root URL reload | | |

Human Playtest Round 2 may begin once this checklist passes against a green
Pages deployment of `main`.
