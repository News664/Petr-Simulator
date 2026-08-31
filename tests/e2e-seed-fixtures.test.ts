import { describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { runSimulation } from '../src/engine/simulation.js';
import type { SetupPolicy } from '../src/engine/setup.js';
import { STAT_ORDER } from '../src/app/presentation.js';

/**
 * Browser fixture seeds, checked in the fast suite.
 *
 * A run is `contentVersion + seed + setup policy`, so every canonical content
 * change re-rolls every life and a seed chosen for its *outcome* can silently
 * stop having that outcome. When that happens the browser suite fails two
 * minutes into a Playwright run with an assertion about a missing heading,
 * which says nothing about the real cause.
 *
 * These tests reproduce what the Playwright helpers drive — the landing seed
 * field, the first three compatible irregularities, and the assessment stepper
 * clicked top-down — and fail in `npm run verify` instead, naming the seed and
 * what it is supposed to do.
 */

const content = loadDefaultContent();

/**
 * `e2e/helpers.ts` clicks the first enabled `Increase` control repeatedly, and
 * `InitialAssessment` renders the steppers in `STAT_ORDER`, so the browser fills
 * greedily by that priority. An archetype policy of one priority order is
 * exactly that fill.
 */
const BROWSER_POLICY: SetupPolicy = {
  species: { kind: 'seeded_random' },
  talents: { kind: 'seeded_random_compatible' },
  allocation: { kind: 'archetype', archetypes: [[...STAT_ORDER]] },
};

function play(seed: string) {
  const result = runSimulation(seed, content, BROWSER_POLICY);
  return { outcome: result.outcome.kind, years: result.state.history.length };
}

describe('E2E fixture seeds still have the outcome they were chosen for', () => {
  it('`ending-fixture` reaches a Permanent Form', () => {
    // Drives the ending screen and final-assessment tests.
    const run = play('ending-fixture');
    expect(
      run.outcome,
      'e2e/visibility.spec.ts and playback.spec.ts need this seed to end; re-pick it',
    ).toBe('ended');
  });

  it('`open-record-fixture` reaches the horizon without an ending', () => {
    // Drives the open-record tests, which assert "RECORD REMAINS OPEN".
    const run = play('open-record-fixture');
    expect(
      run.outcome,
      'e2e/visibility.spec.ts and playback.spec.ts need this seed to stay open; re-pick it',
    ).toBe('nonterminal');
  });

  it('`visibility-fixture` plays back long enough for the HUD tests', () => {
    // The HUD tests reveal up to four annual entries; the outcome is irrelevant.
    const run = play('visibility-fixture');
    expect(run.years, 'e2e/visibility.spec.ts reveals four entries on this seed').toBeGreaterThan(5);
  });
});
