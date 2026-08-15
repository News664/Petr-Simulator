// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { computePlayback } from '../src/engine/playback.js';
import { Playback } from '../src/app/screens/Playback.js';
import { FOLLOW_SLACK_PX } from '../src/app/usePresentFollow.js';

/**
 * Playback viewport follow.
 *
 * jsdom has no layout, so these tests supply one: a virtual viewport with a
 * scroll offset and an anchor whose position moves when content is added or the
 * page is scrolled. That is enough to pin the behaviour that actually failed on
 * a phone — the anchor being left below the fold, and follow switching itself
 * off after a successful auto-scroll — without pretending jsdom can measure a
 * real layout. The real browser is covered by the Playwright mobile spec.
 */
const content = loadDefaultContent();
const life = computePlayback('follow-test-seed', content, {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'even' },
});

const VIEWPORT_HEIGHT = 800;
const CARD_HEIGHT = 220;

/**
 * A virtual layout.
 *
 * `anchorBottom` is the anchor's position in viewport coordinates, exactly what
 * `getBoundingClientRect().bottom` reports: adding an entry pushes it down,
 * scrolling down pulls it up.
 */
interface Layout {
  anchorBottom: number;
  scrollY: number;
  scrollCalls: number;
}

let layout: Layout;

function installLayout(initialAnchorBottom = VIEWPORT_HEIGHT): void {
  layout = { anchorBottom: initialAnchorBottom, scrollY: 0, scrollCalls: 0 };

  Object.defineProperty(window, 'innerHeight', { value: VIEWPORT_HEIGHT, configurable: true, writable: true });
  Object.defineProperty(window, 'scrollY', {
    get: () => layout.scrollY,
    configurable: true,
  });

  window.scrollBy = vi.fn((options?: ScrollToOptions | number) => {
    const top = typeof options === 'number' ? options : (options?.top ?? 0);
    layout.scrollCalls += 1;
    layout.scrollY += top;
    layout.anchorBottom -= top;
    window.dispatchEvent(new Event('scroll'));
  }) as typeof window.scrollBy;

  // Every element reports the anchor's virtual position; only the anchor's
  // measurement is read by the hook.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ bottom: layout.anchorBottom, top: layout.anchorBottom, height: 0, width: 0, left: 0, right: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect,
  );
}

/** Scroll the page as a player would, and let the listener see it. */
function userScroll(delta: number): void {
  act(() => {
    layout.scrollY += delta;
    layout.anchorBottom -= delta;
    window.dispatchEvent(new Event('scroll'));
  });
}

function renderRevealed(count: number) {
  return render(<Playback {...props(count)} />);
}

function props(count: number) {
  return {
    content,
    species: content.species.get(life.species)!,
    frames: life.frames.slice(0, count),
    paused: false,
    speed: 1 as const,
    onTogglePause: () => {},
    onSetSpeed: () => {},
  };
}

/** One reveal: the timeline grows by a card, then React commits the new frame. */
function reveal(rerender: (ui: React.ReactElement) => void, count: number): void {
  layout.anchorBottom += CARD_HEIGHT;
  rerender(<Playback {...props(count)} />);
}

function anchorOffscreenBy(): number {
  return layout.anchorBottom - VIEWPORT_HEIGHT;
}

beforeEach(() => {
  installLayout();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('playback follow — keeping up with reveals', () => {
  it('leaves the newest entry at the fold after every reveal', () => {
    const { rerender } = renderRevealed(1);

    for (let count = 2; count <= 8; count++) {
      reveal(rerender, count);
      // The anchor must be back on screen before the next reveal is allowed to
      // happen — no backlog is permitted to accumulate.
      expect(anchorOffscreenBy()).toBeLessThanOrEqual(0);
    }
  });

  it('does the same amount of work per reveal at 2x as at 1x', () => {
    const { rerender, unmount } = renderRevealed(1);
    for (let count = 2; count <= 6; count++) reveal(rerender, count);
    const atOneX = layout.scrollCalls;
    const driftOneX = anchorOffscreenBy();
    unmount();

    installLayout();
    const second = render(<Playback {...props(1)} speed={2} />);
    for (let count = 2; count <= 6; count++) {
      layout.anchorBottom += CARD_HEIGHT;
      second.rerender(<Playback {...props(count)} speed={2} />);
    }

    // Cadence is presentation-only and follow is per-reveal, so the two speeds
    // must be indistinguishable here. A backlog would show up as fewer
    // corrections, or as drift, on the faster arm.
    expect(layout.scrollCalls).toBe(atOneX);
    expect(anchorOffscreenBy()).toBe(driftOneX);
    expect(anchorOffscreenBy()).toBeLessThanOrEqual(0);
  });

  it('never scrolls backwards when the anchor is already on screen', () => {
    renderRevealed(3);
    layout.anchorBottom = VIEWPORT_HEIGHT - 300;
    const before = layout.scrollCalls;
    window.dispatchEvent(new Event('resize'));
    expect(layout.scrollCalls).toBe(before);
  });
});

describe('playback follow — the player is in charge', () => {
  it('stops following once the player scrolls up, and offers a way back', async () => {
    const { rerender } = renderRevealed(2);
    expect(screen.queryByRole('button', { name: /RETURN TO PRESENT/i })).toBeNull();

    userScroll(-400);

    expect(await screen.findByRole('button', { name: /RETURN TO PRESENT/i })).toBeTruthy();

    // Re-reading is not interrupted: further reveals must not move the viewport.
    const scrollsAfterOptOut = layout.scrollCalls;
    const positionAfterOptOut = layout.scrollY;
    for (let count = 3; count <= 6; count++) reveal(rerender, count);
    expect(layout.scrollCalls).toBe(scrollsAfterOptOut);
    expect(layout.scrollY).toBe(positionAfterOptOut);
  });

  it('ignores layout jitter that is smaller than a deliberate scroll', () => {
    renderRevealed(2);
    userScroll(-(FOLLOW_SLACK_PX / 16));
    expect(screen.queryByRole('button', { name: /RETURN TO PRESENT/i })).toBeNull();
  });

  it('catches up and resumes following when RETURN TO PRESENT is pressed', async () => {
    const user = userEvent.setup();
    const { rerender } = renderRevealed(2);

    userScroll(-500);
    const button = await screen.findByRole('button', { name: /RETURN TO PRESENT/i });

    await user.click(button);

    expect(anchorOffscreenBy()).toBeLessThanOrEqual(0);
    expect(screen.queryByRole('button', { name: /RETURN TO PRESENT/i })).toBeNull();

    // And following is genuinely back on, not just visually reset.
    reveal(rerender, 3);
    expect(anchorOffscreenBy()).toBeLessThanOrEqual(0);
  });

  it('resumes following when the player scrolls back down to the present', async () => {
    renderRevealed(2);
    userScroll(-500);
    expect(await screen.findByRole('button', { name: /RETURN TO PRESENT/i })).toBeTruthy();

    userScroll(500 - FOLLOW_SLACK_PX / 2);

    expect(screen.queryByRole('button', { name: /RETURN TO PRESENT/i })).toBeNull();
  });
});

describe('playback follow — degrading safely', () => {
  it('reveals normally when the browser exposes no scrolling APIs', () => {
    const original = window.scrollBy;
    // @ts-expect-error deliberately removing the API the hook prefers
    delete window.scrollBy;
    // @ts-expect-error and its fallback
    delete window.scrollTo;

    const { rerender } = renderRevealed(1);
    expect(() => {
      for (let count = 2; count <= 4; count++) reveal(rerender, count);
    }).not.toThrow();
    expect(screen.getAllByText(/AGE /).length).toBeGreaterThan(0);

    window.scrollBy = original;
  });

  it('reveals normally when the anchor cannot be measured', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () => undefined as unknown as DOMRect,
    );
    const { rerender } = renderRevealed(1);
    expect(() => reveal(rerender, 2)).not.toThrow();
  });

  it('reveals normally without ResizeObserver', () => {
    const original = globalThis.ResizeObserver;
    // @ts-expect-error jsdom may or may not provide it; the hook must not require it
    delete globalThis.ResizeObserver;
    expect(() => renderRevealed(3)).not.toThrow();
    globalThis.ResizeObserver = original;
  });
});
