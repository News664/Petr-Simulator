// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { computePlayback } from '../src/engine/playback.js';
import { previewPlayerSetup } from '../src/engine/preview.js';
import { App } from '../src/app/App.js';
import { SESSION_KEY, loadSession, saveSession } from '../src/app/storage.js';
import {
  initialState,
  isPlaybackComplete,
  reducer,
  remainingPoints,
  revealedFrames,
  type AppState,
} from '../src/app/state/reducer.js';
import { VISIBLE_STATS, type VisibleStat } from '../src/engine/types.js';

/**
 * H2A UI behaviour.
 *
 * The reducer tests pin the setup rules; the App tests drive the real component
 * tree with fake timers so reveal cadence, pause and speed can be checked
 * without waiting a real second per year.
 */
const content = loadDefaultContent();
const SEED = 'ui-test-seed';
const preview = previewPlayerSetup(SEED, content);

function setupState(): AppState {
  const base = initialState(content.contentVersion, false);
  return reducer(base, { type: 'begin-setup', seed: SEED, preview });
}

function spread(points: number): Record<VisibleStat, number> {
  const allocation = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) allocation[stat] = 0;
  let remaining = points;
  while (remaining > 0) {
    const before = remaining;
    for (const stat of VISIBLE_STATS) {
      if (remaining === 0) break;
      if (allocation[stat] >= 10) continue;
      allocation[stat] += 1;
      remaining -= 1;
    }
    if (remaining === before) break;
  }
  return allocation;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

describe('H2A — setup rules', () => {
  it('requires exactly three talents before continuing', () => {
    let state = setupState();
    state = reducer(state, { type: 'acknowledge-birth' });
    expect(reducer(state, { type: 'continue-to-allocation' }).phase).toBe('talents');

    for (const id of preview.draftedTalents.slice(0, 2)) {
      state = reducer(state, { type: 'toggle-talent', talentId: id, content });
    }
    expect(reducer(state, { type: 'continue-to-allocation' }).phase).toBe('talents');
  });

  it('blocks a fourth talent and allows swapping after deselection', () => {
    let state = reducer(setupState(), { type: 'acknowledge-birth' });
    // Pick three mutually compatible talents from the draft.
    const chosen: string[] = [];
    for (const id of preview.draftedTalents) {
      if (chosen.length === 3) break;
      const talent = content.talents.get(id)!;
      if (talent.incompatibleWith.some((other) => chosen.includes(other))) continue;
      chosen.push(id);
      state = reducer(state, { type: 'toggle-talent', talentId: id, content });
    }
    expect(state.chosenTalents).toEqual(chosen);

    const extra = preview.draftedTalents.find((id) => !chosen.includes(id))!;
    expect(reducer(state, { type: 'toggle-talent', talentId: extra, content }).chosenTalents).toEqual(chosen);

    state = reducer(state, { type: 'toggle-talent', talentId: chosen[2]!, content });
    expect(state.chosenTalents).toHaveLength(2);
    expect(reducer(state, { type: 'continue-to-allocation' }).phase).toBe('talents');
  });

  it('refuses an incompatible pair', () => {
    // Build a draft that definitely contains a conflicting pair.
    const conflicting = [...content.talents.values()].find((talent) => talent.incompatibleWith.length > 0)!;
    const partner = conflicting.incompatibleWith[0]!;
    const base = initialState(content.contentVersion, false);
    const state = reducer(base, {
      type: 'begin-setup',
      seed: SEED,
      preview: { ...preview, draftedTalents: [conflicting.id, partner, ...preview.draftedTalents].slice(0, 10) },
    });
    const withFirst = reducer(state, { type: 'toggle-talent', talentId: conflicting.id, content });
    const withBoth = reducer(withFirst, { type: 'toggle-talent', talentId: partner, content });
    expect(withBoth.chosenTalents).toEqual([conflicting.id]);
  });

  it('takes the point budget from the species registry and requires spending it exactly', () => {
    const points = content.species.get(preview.species)!.allocation_points;
    expect(preview.allocationPoints).toBe(points);

    let state = reducer(setupState(), { type: 'acknowledge-birth' });
    state = { ...state, phase: 'allocation', chosenTalents: preview.draftedTalents.slice(0, 3) };
    expect(remainingPoints(state)).toBe(points);
    expect(reducer(state, { type: 'continue-to-review' }).phase).toBe('allocation');

    state = { ...state, allocation: spread(points) };
    expect(remainingPoints(state)).toBe(0);
    expect(reducer(state, { type: 'continue-to-review' }).phase).toBe('review');
  });

  it('keeps every base stat inside 0-10 and never overspends', () => {
    let state: AppState = { ...setupState(), phase: 'allocation' };
    for (let i = 0; i < 12; i++) state = reducer(state, { type: 'adjust-stat', stat: 'CHR', delta: 1 });
    expect(state.allocation.CHR).toBe(10);
    expect(reducer(state, { type: 'adjust-stat', stat: 'CHR', delta: -1 }).allocation.CHR).toBe(9);

    let spent: AppState = { ...setupState(), phase: 'allocation', allocation: spread(preview.allocationPoints) };
    spent = reducer(spent, { type: 'adjust-stat', stat: 'SPR', delta: 1 });
    expect(remainingPoints(spent)).toBe(0);
  });
});

describe('H2A — playback reveal semantics', () => {
  const life = computePlayback(SEED, content, {
    species: { kind: 'seeded_random' },
    talents: { kind: 'fixed', talents: preview.draftedTalents.slice(0, 3) },
    allocation: { kind: 'explicit', allocation: spread(preview.allocationPoints) },
  });

  it('reveals one frame at a time and never leaks the future', () => {
    let state: AppState = { ...setupState(), phase: 'playback' };
    state = reducer(state, { type: 'begin-life', life });
    expect(revealedFrames(state)).toEqual([]);

    state = reducer(state, { type: 'reveal-next' });
    expect(revealedFrames(state)).toHaveLength(1);
    expect(revealedFrames(state)[0]!.age).toBe(life.frames[0]!.age);

    state = reducer(state, { type: 'reveal-next' });
    expect(revealedFrames(state)).toHaveLength(2);
    // The unrevealed remainder is simply not in the array the UI receives.
    expect(revealedFrames(state).some((frame) => frame.age > life.frames[1]!.age)).toBe(false);
  });

  it('refuses to show the ending before the last frame is revealed', () => {
    let state: AppState = { ...setupState(), phase: 'playback' };
    state = reducer(state, { type: 'begin-life', life });
    state = reducer(state, { type: 'reveal-next' });
    expect(reducer(state, { type: 'finish-playback' }).phase).toBe('playback');

    while (!isPlaybackComplete(state)) state = reducer(state, { type: 'reveal-next' });
    expect(reducer(state, { type: 'finish-playback' }).phase).toBe('result');
  });

  it('does not fabricate an ending for a nonterminal life', () => {
    if (life.outcome.kind === 'ended') {
      expect(life.frames[life.frames.length - 1]!.endingAfter).not.toBeNull();
    } else {
      expect(life.frames.every((frame) => frame.endingAfter === null)).toBe(true);
    }
  });

  it('captures immutable frames rather than references to live state', () => {
    // Early frames must not carry late flags; a shared Set would fail this.
    const first = life.frames[0]!;
    const last = life.frames[life.frames.length - 1]!;
    expect(first.dev.flags.length).toBeLessThanOrEqual(last.dev.flags.length);
    if (last.dev.flags.length > first.dev.flags.length) {
      expect(first.dev.flags).not.toEqual(last.dev.flags);
    }
  });
});

describe('H2A — persistence', () => {
  it('resumes a record filed under the same content', () => {
    saveSession({
      storageVersion: 1,
      contentVersion: content.contentVersion,
      seed: SEED,
      phase: 'review',
      chosenTalents: preview.draftedTalents.slice(0, 3),
      allocation: spread(preview.allocationPoints),
      revealedFrameIndex: -1,
      speed: 1,
      paused: false,
      locale: 'en',
    });
    const loaded = loadSession(content.contentVersion);
    expect(loaded.kind).toBe('ok');
    if (loaded.kind === 'ok') expect(loaded.session.seed).toBe(SEED);
  });

  it('refuses to resume a record filed under different content', () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        storageVersion: 1,
        contentVersion: 'some-other-fingerprint',
        seed: SEED,
        phase: 'review',
        chosenTalents: [],
        allocation: null,
        revealedFrameIndex: -1,
        speed: 1,
        paused: false,
        locale: 'en',
      }),
    );
    const loaded = loadSession(content.contentVersion);
    expect(loaded.kind).toBe('incompatible');
  });
});

describe('H2A — application flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  /** Advances fake timers inside `act` so React commits the reveal it schedules. */
  async function advance(ms: number): Promise<void> {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  const revealedAges = (): HTMLElement[] => screen.queryAllByText(/^AGE \d+$/);

  /**
   * Advances one reveal interval at a time.
   *
   * React commits the reveal in a task, so the next timeout is only scheduled
   * after the current one has run. Stepping interval-by-interval keeps the test
   * independent of how the scheduler interleaves them.
   */
  async function revealTicks(count: number, intervalMs: number): Promise<void> {
    for (let i = 0; i < count; i++) await advance(intervalMs + 20);
  }

  async function playThroughSetup() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByRole('button', { name: /BEGIN NEW LIFE/i }));
    await user.click(screen.getByRole('button', { name: /ACKNOWLEDGE RECORD/i }));

    // Choose the first three mutually compatible cards by keyboard-accessible role.
    const cards = screen.getAllByRole('button', { pressed: false }).filter((node) =>
      node.classList.contains('talent-card'),
    );
    const chosen: string[] = [];
    for (const card of cards) {
      if (chosen.length === 3) break;
      if ((card as HTMLButtonElement).disabled) continue;
      await user.click(card);
      chosen.push(card.textContent ?? '');
    }
    await user.click(screen.getByRole('button', { name: /CONTINUE TO ASSESSMENT/i }));

    // Spend every point through the visible steppers, one enabled control at a
    // time, until the review button unlocks. Driving it by the button's own
    // disabled state keeps the walkthrough independent of click timing.
    const review = () => screen.getByRole('button', { name: /REVIEW RECORD/i }) as HTMLButtonElement;
    for (let attempt = 0; attempt < preview.allocationPoints * 3 && review().disabled; attempt++) {
      const increases = screen
        .getAllByRole('button')
        .filter(
          (node) =>
            /^Increase /.test(node.getAttribute('aria-label') ?? '') && !(node as HTMLButtonElement).disabled,
        );
      if (increases.length === 0) break;
      await user.click(increases[attempt % increases.length]!);
    }
    expect(review().disabled).toBe(false);
    await user.click(review());
    return user;
  }

  it('walks landing → birth → talents → allocation → review → playback', async () => {
    const user = await playThroughSetup();
    expect(screen.getByText(/RECORD SUMMARY/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /BEGIN LIFE/i }));

    // The first frame is revealed by the timer, not synchronously.
    expect(revealedAges()).toHaveLength(0);
    await advance(1100);
    await waitFor(() => expect(revealedAges().length).toBeGreaterThan(0));
  });

  it('freezes the reveal index while paused and speeds up at 2x', async () => {
    const user = await playThroughSetup();
    await user.click(screen.getByRole('button', { name: /BEGIN LIFE/i }));

    await revealTicks(3, 1000);
    const afterFirst = revealedAges().length;
    expect(afterFirst).toBeGreaterThanOrEqual(3);

    await user.click(screen.getByRole('button', { name: /^Pause$/ }));
    await revealTicks(5, 1000);
    // Five whole intervals of paused time reveal nothing.
    expect(revealedAges()).toHaveLength(afterFirst);

    await user.click(screen.getByRole('button', { name: /^Resume$/ }));
    await user.click(screen.getByRole('button', { name: '2×' }));
    // At 2x, ticks of 500 ms reveal; the same count of shorter ticks advances
    // the timeline by the same number of years for half the elapsed time.
    await revealTicks(4, 500);
    expect(revealedAges().length).toBeGreaterThanOrEqual(afterFirst + 4);
  });

  it('hides internal state from the normal-mode DOM', async () => {
    const user = await playThroughSetup();
    await user.click(screen.getByRole('button', { name: /BEGIN LIFE/i }));
    await revealTicks(6, 1000);
    expect(revealedAges().length).toBeGreaterThan(2);

    const html = document.body.innerHTML;
    expect(html).not.toMatch(/EVT-[A-Z]{3}-/);
    expect(html).not.toMatch(/ROUTE_[A-Z]/);
    expect(html).not.toMatch(/FAC_[A-Z]/);
    expect(html).not.toMatch(/\bFIX\b/);
    expect(html).not.toMatch(/MAT_(HINT|MANIFEST)_/);
    expect(html).not.toMatch(/STATE_(CONTACTED|ENGAGED|COMMITTED|OPTED_OUT|CLOSED)/);
    expect(screen.queryByLabelText(/DEVELOPER INSPECTOR/i)).toBeNull();
  });

  it('exposes an accessible live region for the newest annual event only', async () => {
    const user = await playThroughSetup();
    await user.click(screen.getByRole('button', { name: /BEGIN LIFE/i }));
    await revealTicks(3, 1000);
    expect(revealedAges().length).toBeGreaterThan(1);

    const timeline = screen.getByRole('region', { name: /Annual record/i });
    expect(within(timeline).getAllByText(/^AGE \d+$/).length).toBeGreaterThan(1);
    // Exactly one card announces itself, regardless of how many are visible.
    const live = [...document.querySelectorAll('[aria-live="polite"]')].filter((node) =>
      node.classList.contains('event-card'),
    );
    expect(live).toHaveLength(1);
  });
});
