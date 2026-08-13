import type { PlaybackLife } from '../engine/playback.js';
import type { SpeciesId, VisibleStat } from '../engine/types.js';

/**
 * Developer reproduction record.
 *
 * Enough to reproduce a run exactly, and nothing that could not be re-derived:
 * the timeline is included so an import can be checked against a fresh
 * simulation rather than trusted.
 */
export const REPRODUCTION_FORMAT_VERSION = 1 as const;

export interface H2AReproductionRecord {
  formatVersion: typeof REPRODUCTION_FORMAT_VERSION;
  contentVersion: string;
  seed: string;
  species: SpeciesId;
  draftedTalents: string[];
  chosenTalents: string[];
  allocation: Record<VisibleStat, number>;
  timeline: { age: number; eventId: string; variantIndex: number; source: string }[];
  outcome:
    | { kind: 'ended'; endingId: string; endingAge: number }
    | { kind: 'nonterminal'; reachedAge: number }
    | { kind: 'coverage_error'; age: number };
}

export function toReproductionRecord(life: PlaybackLife): H2AReproductionRecord {
  const outcome: H2AReproductionRecord['outcome'] =
    life.outcome.kind === 'ended'
      ? { kind: 'ended', endingId: life.outcome.ending.endingId, endingAge: life.outcome.ending.endingAge }
      : life.outcome.kind === 'nonterminal'
        ? { kind: 'nonterminal', reachedAge: life.outcome.reachedAge }
        : { kind: 'coverage_error', age: life.outcome.age };

  return {
    formatVersion: REPRODUCTION_FORMAT_VERSION,
    contentVersion: life.contentVersion,
    seed: life.seed,
    species: life.species,
    draftedTalents: life.draftedTalents,
    chosenTalents: life.chosenTalents,
    allocation: life.allocation,
    timeline: life.frames.map((frame) => ({
      age: frame.age,
      eventId: frame.occurrence.eventId,
      variantIndex: frame.occurrence.variantIndex,
      source: frame.occurrence.source,
    })),
    outcome,
  };
}

export class ReproductionMismatchError extends Error {
  constructor(expected: string, found: string) {
    super(`reproduction record was filed under content ${found}, current content is ${expected}`);
    this.name = 'ReproductionMismatchError';
  }
}

/**
 * Parses an imported record and refuses one filed under different content.
 *
 * A mismatched fingerprint means the same seed would now produce a different
 * life, so replaying it would be a silent lie rather than a reproduction.
 */
export function parseReproductionRecord(raw: string, contentVersion: string): H2AReproductionRecord {
  const parsed = JSON.parse(raw) as H2AReproductionRecord;
  if (parsed.formatVersion !== REPRODUCTION_FORMAT_VERSION) {
    throw new Error(`unsupported reproduction format version ${parsed.formatVersion}`);
  }
  if (parsed.contentVersion !== contentVersion) {
    throw new ReproductionMismatchError(contentVersion, parsed.contentVersion);
  }
  return parsed;
}
