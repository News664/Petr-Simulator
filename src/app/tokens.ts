import tokens from '../../content/ui/SOLID_STATE_H2A_UI_TOKENS_v0.2.json';

/**
 * Runtime access to the canonical H2A UI tokens.
 *
 * The token JSON is the authority for playback cadence, so the runtime *reads*
 * it rather than restating the numbers. Changing the cadence is then a content
 * edit, and a test asserts the two never drift apart.
 */
export interface PlaybackTokens {
  oneXIntervalMs: number;
  twoXIntervalMs: number;
}

export const UI_TOKENS_VERSION: string = tokens.version;
export const PLAYBACK_TOKENS: PlaybackTokens = tokens.playback;

/** Reveal interval per speed, straight from the canonical tokens. */
export const INTERVAL_MS: Record<1 | 2, number> = {
  1: PLAYBACK_TOKENS.oneXIntervalMs,
  2: PLAYBACK_TOKENS.twoXIntervalMs,
};
