import type { ContentBundle } from '../../engine/content/load.js';
import type { PlaybackLife } from '../../engine/playback.js';
import type { PlayerSetupPreview } from '../../engine/preview.js';
import { STARTING_ALLOCATION_RANGE } from '../../engine/setup.js';
import { VISIBLE_STATS, type VisibleStat } from '../../engine/types.js';
import type { Locale } from '../i18n/index.js';

/**
 * The whole app is one reducer.
 *
 * Two rules keep the UI honest:
 *  1. the reducer never runs the simulation — `computePlayback` is called once,
 *     outside, and its frames arrive as a payload;
 *  2. `revealedFrameIndex` is the only thing the playback timer may move, so
 *     pause and 1x/2x cannot reach the RNG or change a result.
 */

export type Phase =
  | 'landing'
  | 'birth'
  | 'talents'
  | 'allocation'
  | 'review'
  | 'playback'
  | 'result'
  /** Static, complete-life review. No timer, no reveal, no recomputation. */
  | 'life-review';

export type Speed = 1 | 2;

export interface AppState {
  phase: Phase;
  locale: Locale;
  devMode: boolean;
  devInspectorOpen: boolean;
  contentVersion: string;
  seed: string | null;
  preview: PlayerSetupPreview | null;
  chosenTalents: string[];
  allocation: Record<VisibleStat, number>;
  life: PlaybackLife | null;
  /** -1 means nothing revealed yet. */
  revealedFrameIndex: number;
  speed: Speed;
  paused: boolean;
  /** Set when a stored record was filed under different content. */
  incompatibleSave: string | null;
  /** Present when a compatible save exists and has not been resumed or discarded. */
  resumableSeed: string | null;
  devNotice: string | null;
}

export const emptyAllocation = (): Record<VisibleStat, number> => {
  const out = {} as Record<VisibleStat, number>;
  for (const stat of VISIBLE_STATS) out[stat] = 0;
  return out;
};

export function initialState(contentVersion: string, devMode: boolean, locale: Locale = 'en'): AppState {
  return {
    phase: 'landing',
    locale,
    devMode,
    devInspectorOpen: false,
    contentVersion,
    seed: null,
    preview: null,
    chosenTalents: [],
    allocation: emptyAllocation(),
    life: null,
    revealedFrameIndex: -1,
    speed: 1,
    paused: false,
    incompatibleSave: null,
    resumableSeed: null,
    devNotice: null,
  };
}

export type Action =
  | { type: 'begin-setup'; seed: string; preview: PlayerSetupPreview }
  | { type: 'acknowledge-birth' }
  | { type: 'toggle-talent'; talentId: string; content: ContentBundle }
  | { type: 'continue-to-allocation' }
  | { type: 'adjust-stat'; stat: VisibleStat; delta: number }
  | { type: 'reset-allocation' }
  | { type: 'continue-to-review' }
  | { type: 'back' }
  | { type: 'begin-life'; life: PlaybackLife }
  | { type: 'reveal-next' }
  | { type: 'set-paused'; paused: boolean }
  | { type: 'set-speed'; speed: Speed }
  | { type: 'finish-playback' }
  | { type: 'open-life-review' }
  | { type: 'back-to-outcome' }
  | { type: 'new-life' }
  | { type: 'set-incompatible-save'; storedContentVersion: string | null }
  | { type: 'set-resumable'; seed: string | null }
  | { type: 'restore'; state: AppState }
  | { type: 'toggle-inspector' }
  | { type: 'set-dev-notice'; notice: string | null };

/** Points already spent across the five visible stats. */
export function spentPoints(allocation: Record<VisibleStat, number>): number {
  return VISIBLE_STATS.reduce((sum, stat) => sum + allocation[stat], 0);
}

export function remainingPoints(state: AppState): number {
  return (state.preview?.allocationPoints ?? 0) - spentPoints(state.allocation);
}

/**
 * Talents in the draft that cannot be added right now.
 *
 * A talent is blocked when it is incompatible with something already chosen, or
 * when three are already recorded. The distinction matters to the UI: the first
 * needs an explanation naming the conflict, the second does not.
 */
export function blockedBy(
  content: ContentBundle,
  chosen: readonly string[],
  talentId: string,
): string[] {
  const talent = content.talents.get(talentId);
  if (!talent) return [];
  return chosen.filter((other) => talent.incompatibleWith.includes(other));
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'begin-setup':
      return {
        ...state,
        phase: 'birth',
        seed: action.seed,
        preview: action.preview,
        chosenTalents: [],
        allocation: emptyAllocation(),
        life: null,
        revealedFrameIndex: -1,
        speed: 1,
        paused: false,
        incompatibleSave: null,
        resumableSeed: null,
      };

    case 'acknowledge-birth':
      return { ...state, phase: 'talents' };

    case 'toggle-talent': {
      if (state.chosenTalents.includes(action.talentId)) {
        return { ...state, chosenTalents: state.chosenTalents.filter((id) => id !== action.talentId) };
      }
      const limit = state.preview?.talentChoiceSize ?? 3;
      if (state.chosenTalents.length >= limit) return state;
      if (blockedBy(action.content, state.chosenTalents, action.talentId).length > 0) return state;
      return { ...state, chosenTalents: [...state.chosenTalents, action.talentId] };
    }

    case 'continue-to-allocation': {
      const limit = state.preview?.talentChoiceSize ?? 3;
      if (state.chosenTalents.length !== limit) return state;
      return { ...state, phase: 'allocation' };
    }

    case 'adjust-stat': {
      const current = state.allocation[action.stat];
      const next = current + action.delta;
      if (next < STARTING_ALLOCATION_RANGE.min || next > STARTING_ALLOCATION_RANGE.max) return state;
      if (action.delta > 0 && remainingPoints(state) <= 0) return state;
      return { ...state, allocation: { ...state.allocation, [action.stat]: next } };
    }

    case 'reset-allocation':
      return { ...state, allocation: emptyAllocation() };

    case 'continue-to-review':
      if (remainingPoints(state) !== 0) return state;
      return { ...state, phase: 'review' };

    case 'back':
      switch (state.phase) {
        case 'talents':
          return { ...state, phase: 'birth' };
        case 'allocation':
          return { ...state, phase: 'talents' };
        case 'review':
          return { ...state, phase: 'allocation' };
        default:
          return state;
      }

    case 'begin-life':
      return {
        ...state,
        phase: 'playback',
        life: action.life,
        revealedFrameIndex: -1,
        paused: false,
      };

    case 'reveal-next': {
      const total = state.life?.frames.length ?? 0;
      if (state.revealedFrameIndex >= total - 1) return state;
      return { ...state, revealedFrameIndex: state.revealedFrameIndex + 1 };
    }

    case 'set-paused':
      return { ...state, paused: action.paused };

    case 'set-speed':
      return { ...state, speed: action.speed };

    case 'finish-playback': {
      const total = state.life?.frames.length ?? 0;
      // The ending screen may only follow a fully revealed timeline.
      if (state.revealedFrameIndex < total - 1) return state;
      return { ...state, phase: 'result' };
    }

    case 'open-life-review':
      // Review reuses the frames already computed at BEGIN LIFE. It never
      // re-enters playback, so no timer starts and the RNG is never touched.
      if (!state.life) return state;
      return { ...state, phase: 'life-review', paused: true };

    case 'back-to-outcome':
      if (state.phase !== 'life-review') return state;
      return { ...state, phase: 'result' };

    case 'new-life':
      return {
        ...initialState(state.contentVersion, state.devMode, state.locale),
        devInspectorOpen: state.devInspectorOpen,
      };

    case 'set-incompatible-save':
      return { ...state, incompatibleSave: action.storedContentVersion };

    case 'set-resumable':
      return { ...state, resumableSeed: action.seed };

    case 'restore':
      return action.state;

    case 'toggle-inspector':
      return { ...state, devInspectorOpen: !state.devInspectorOpen };

    case 'set-dev-notice':
      return { ...state, devNotice: action.notice };

    default:
      return state;
  }
}

/** The frame the player is currently looking at, or null before the first reveal. */
export function revealedFrame(state: AppState) {
  if (!state.life || state.revealedFrameIndex < 0) return null;
  return state.life.frames[state.revealedFrameIndex] ?? null;
}

/**
 * Frames the UI may render.
 *
 * During playback this is strictly the revealed prefix, so the component tree is
 * structurally incapable of showing the future. In `life-review` the life is
 * already over and every frame has been seen, so the whole timeline is available
 * at once — that is the difference between the two modes.
 */
export function revealedFrames(state: AppState) {
  if (!state.life) return [];
  if (state.phase === 'life-review') return state.life.frames;
  if (state.revealedFrameIndex < 0) return [];
  return state.life.frames.slice(0, state.revealedFrameIndex + 1);
}

export function isPlaybackComplete(state: AppState): boolean {
  const total = state.life?.frames.length ?? 0;
  return total > 0 && state.revealedFrameIndex >= total - 1;
}
