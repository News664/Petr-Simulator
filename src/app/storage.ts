import type { Locale } from './i18n/index.js';
import type { VisibleStat } from '../engine/types.js';

/**
 * Versioned local persistence.
 *
 * Only JSON-serializable *inputs* are stored — never `RunState`, Sets, Maps or a
 * live RNG. On reload the life is recomputed deterministically from the seed and
 * the player's choices, and the reveal position is restored.
 *
 * A record filed under a different `contentVersion` is never silently replayed:
 * the same seed would produce a different life, so the UI reports the
 * incompatibility instead.
 */
export const STORAGE_NAMESPACE = 'solid-state:h2a:v1';
export const SESSION_KEY = `${STORAGE_NAMESPACE}:session`;

export type StoredPhase = 'birth' | 'talents' | 'allocation' | 'review' | 'playback' | 'result';

export interface StoredSession {
  storageVersion: 1;
  contentVersion: string;
  seed: string;
  phase: StoredPhase;
  chosenTalents: string[];
  allocation: Record<VisibleStat, number> | null;
  revealedFrameIndex: number;
  speed: 1 | 2;
  paused: boolean;
  locale: Locale;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    // Private-mode or blocked storage: the app must still be playable.
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Quota or serialization failure must never break playback.
  }
}

export function clearSession(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export type LoadedSession =
  | { kind: 'none' }
  | { kind: 'incompatible'; storedContentVersion: string }
  | { kind: 'ok'; session: StoredSession };

export function loadSession(contentVersion: string): LoadedSession {
  const store = storage();
  if (!store) return { kind: 'none' };
  let raw: string | null;
  try {
    raw = store.getItem(SESSION_KEY);
  } catch {
    return { kind: 'none' };
  }
  if (!raw) return { kind: 'none' };
  let parsed: StoredSession;
  try {
    parsed = JSON.parse(raw) as StoredSession;
  } catch {
    return { kind: 'none' };
  }
  if (parsed?.storageVersion !== 1 || typeof parsed.seed !== 'string') return { kind: 'none' };
  if (parsed.contentVersion !== contentVersion) {
    return { kind: 'incompatible', storedContentVersion: parsed.contentVersion };
  }
  return { kind: 'ok', session: parsed };
}
