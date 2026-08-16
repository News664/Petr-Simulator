import type { ContentBundle } from '../engine/content/load.js';
import type { PlaybackLife } from '../engine/playback.js';
import { materialLabel, STAT_ORDER, talentName } from './presentation.js';

/**
 * Developer playtest summary.
 *
 * A few lines a tester can paste straight into a note next to "this life felt
 * absurdly intelligent". It is a **player-visible** summary, deliberately not a
 * diagnostic dump: seed, content revision, setup and outcome, plus the same five
 * attributes the player could already read on screen.
 *
 * What it must never contain: FIX, flags, route state, faction lifecycle,
 * schedules or event IDs. The reproduction record export remains the deeper tool
 * and is the right place for anything behind the curtain — this exists so a
 * qualitative note can be checked against the numbers without opening it.
 */
export function buildTestSummary(life: PlaybackLife, content: ContentBundle, mobileMaterialLabel: string): string {
  const last = life.frames[life.frames.length - 1] ?? null;
  const lines: string[] = [];

  lines.push('SOLID STATE — test summary');
  lines.push(`seed: ${life.seed}`);
  lines.push(`content: ${life.contentVersion}`);
  lines.push(`species: ${life.species}`);
  lines.push(
    `talents: ${life.chosenTalents.map((id) => `${talentName(content, id)} (${id})`).join(', ') || '—'}`,
  );
  lines.push(`allocation: ${STAT_ORDER.map((stat) => `${stat} ${life.allocation[stat]}`).join(' · ')}`);

  if (life.outcome.kind === 'ended') {
    const ending = life.outcome.ending;
    lines.push(`outcome: ended — ${ending.title_en} (${ending.endingId}) at age ${ending.endingAge}`);
  } else if (life.outcome.kind === 'nonterminal') {
    lines.push(`outcome: record open at age ${life.outcome.reachedAge}`);
  } else {
    lines.push(`outcome: record suspended at age ${life.outcome.age}`);
  }

  if (last) {
    lines.push(`material: ${materialLabel(last.materialAfter, mobileMaterialLabel)}`);
    lines.push(`final: ${STAT_ORDER.map((stat) => `${stat} ${last.statsAfter[stat]}`).join(' · ')}`);
  }

  return `${lines.join('\n')}\n`;
}
