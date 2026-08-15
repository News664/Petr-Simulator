import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Playback viewport follow.
 *
 * The job is narrow: while follow is on, the newest revealed entry must never be
 * left below the fold, no matter how fast reveals arrive. Reveal cadence is
 * canonical UI-token data and is **not** a lever here — this module only moves
 * the viewport, never the clock.
 *
 * Three properties do the work, and each replaces something that measurably
 * failed on a real phone:
 *
 *  1. **The anchor is the reference, not the document.** On narrow layouts the
 *     status rail stacks *below* the timeline, so the end of the timeline is not
 *     the end of the document. The old near-bottom test measured the document,
 *     concluded "not at the bottom" immediately after every successful
 *     auto-scroll, and switched follow off — which is why the phone needed
 *     manual scrolling while the desktop looked fine.
 *  2. **Movement is instant and forward-only.** Correction happens in a layout
 *     effect, in the same frame the entry is added, so nothing can queue up
 *     behind a smooth animation and fall progressively further behind at 2x.
 *     Forward-only also means a programmatic scroll can never be mistaken for
 *     the player scrolling up, which removes the need to special-case our own
 *     scrolling at all.
 *  3. **Only a real upward scroll turns follow off.** Reading back is never
 *     interrupted, and scrolling down to the present resumes following.
 *
 * Every DOM API used here is optional: a missing `scrollBy`, `ResizeObserver` or
 * `getBoundingClientRect` degrades to "no auto-follow", never to a crash.
 */

/**
 * How far above the fold the newest entry may sit and still count as "at the
 * present" when deciding whether a manual scroll has caught up.
 */
export const FOLLOW_SLACK_PX = 64;

/**
 * Upward movement smaller than this is layout jitter — scroll anchoring, mobile
 * URL-bar resize — rather than a player deciding to re-read something.
 */
export const USER_SCROLL_EPSILON_PX = 8;

export interface PresentFollow {
  /** Attach to a zero-height element rendered after the newest entry. */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /** True while the viewport is following new reveals. */
  following: boolean;
  /** Catch up to the newest entry and resume following. */
  returnToPresent: () => void;
}

function viewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight || 0;
}

function currentScrollY(): number {
  if (typeof window === 'undefined') return 0;
  return window.scrollY || window.pageYOffset || 0;
}

/**
 * Follow one revealed timeline.
 *
 * @param revealCount number of revealed entries; a change is one reveal.
 */
export function usePresentFollow(revealCount: number): PresentFollow {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [following, setFollowing] = useState(true);
  // Listeners read the live value without being re-subscribed on every change.
  const followingRef = useRef(true);
  const lastScrollYRef = useRef(0);

  const setFollow = useCallback((next: boolean): void => {
    followingRef.current = next;
    setFollowing(next);
  }, []);

  /**
   * Pixels the anchor sits *below* the bottom of the viewport. Negative means it
   * is already on screen. `null` when the position cannot be measured, which is
   * the signal to do nothing rather than to guess.
   */
  const distanceBelowFold = useCallback((): number | null => {
    const anchor = anchorRef.current;
    if (!anchor || typeof anchor.getBoundingClientRect !== 'function') return null;
    const rect = anchor.getBoundingClientRect();
    if (!rect) return null;
    return rect.bottom - viewportHeight();
  }, []);

  /**
   * Move the viewport just far enough that the anchor is back at the bottom.
   * Never scrolls backwards, so a player who has scrolled *down* past the newest
   * entry — the status rail lives there on narrow layouts — is not yanked back.
   */
  const catchUp = useCallback((): void => {
    const delta = distanceBelowFold();
    if (delta === null || delta <= 0) return;
    if (typeof window === 'undefined') return;
    if (typeof window.scrollBy === 'function') {
      window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
    } else if (typeof window.scrollTo === 'function') {
      window.scrollTo(0, currentScrollY() + delta);
    } else {
      return;
    }
    lastScrollYRef.current = currentScrollY();
  }, [distanceBelowFold]);

  // Correct in the same commit as the new entry, before paint. This is what
  // makes 2x behave exactly like 1x: the work per reveal is one measurement and
  // one instant jump, so it cannot accumulate a backlog.
  useLayoutEffect(() => {
    if (!followingRef.current) return;
    catchUp();
  }, [revealCount, catchUp]);

  // Late layout changes — font swap, wrapping, the sticky rail settling, the
  // mobile URL bar collapsing — move the anchor after the reveal has committed.
  useEffect(() => {
    if (typeof ResizeObserver !== 'function') return;
    const anchor = anchorRef.current;
    const observed = anchor?.parentElement ?? anchor;
    if (!observed) return;
    const observer = new ResizeObserver(() => {
      if (followingRef.current) catchUp();
    });
    observer.observe(observed);
    return () => observer.disconnect();
  }, [catchUp]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    lastScrollYRef.current = currentScrollY();

    const onScroll = (): void => {
      const y = currentScrollY();
      const previous = lastScrollYRef.current;
      lastScrollYRef.current = y;
      if (y < previous - USER_SCROLL_EPSILON_PX) {
        // Deliberate scroll up: the player is re-reading. Stop following.
        setFollow(false);
        return;
      }
      if (!followingRef.current) {
        const delta = distanceBelowFold();
        if (delta !== null && delta <= FOLLOW_SLACK_PX) setFollow(true);
      }
    };

    const onResize = (): void => {
      lastScrollYRef.current = currentScrollY();
      if (followingRef.current) catchUp();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [catchUp, distanceBelowFold, setFollow]);

  // Explicit catch-up is instant, not smooth: the requirement is that the player
  // is at the present immediately, and a queued smooth scroll would still be
  // animating when the next entry lands. Instant also means nothing to suppress
  // under prefers-reduced-motion.
  const returnToPresent = useCallback((): void => {
    setFollow(true);
    catchUp();
  }, [catchUp, setFollow]);

  return { anchorRef, following, returnToPresent };
}
