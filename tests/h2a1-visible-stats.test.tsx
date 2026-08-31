// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { loadDefaultContent } from '../src/engine/content/load.js';
import { computePlayback } from '../src/engine/playback.js';
import type { EndingRecord, VisibleStat } from '../src/engine/types.js';
import { AssessmentPanel, VisibleStats } from '../src/app/components/VisibleStats.js';
import { EndingScreen } from '../src/app/screens/EndingScreen.js';
import { LifeReview } from '../src/app/screens/LifeReview.js';
import { OpenRecord } from '../src/app/screens/OpenRecord.js';
import { Playback } from '../src/app/screens/Playback.js';
import { STAT_ORDER } from '../src/app/presentation.js';
import { buildTestSummary } from '../src/app/testSummary.js';

/**
 * H2A.1 — the five visible attributes stay visible.
 *
 * CHR / INT / STR / MNY / SPR are ordinary player information. These tests pin
 * that they appear in canonical order, survive negative and multi-digit values,
 * reach every outcome screen, and that making them more visible did not drag
 * anything hidden along with them.
 */
const content = loadDefaultContent();

function statsOf(values: readonly number[]): Record<VisibleStat, number> {
  const out = {} as Record<VisibleStat, number>;
  STAT_ORDER.forEach((stat, index) => {
    out[stat] = values[index] ?? 0;
  });
  return out;
}

/** Rendered attribute values, in document order. */
function readoutValues(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.stat-readout__value')).map((node) =>
    (node.textContent ?? '').trim(),
  );
}

function readoutCodes(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.stat-readout__code')).map((node) =>
    (node.textContent ?? '').trim(),
  );
}

/**
 * How a value is expected to read on screen.
 *
 * Negatives use a Unicode minus, matching the delta chips on the event cards —
 * `String(-4)` would produce an ASCII hyphen and quietly disagree.
 */
function expectedValue(value: number): string {
  return value < 0 ? `−${Math.abs(value)}` : String(value);
}

afterEach(cleanup);

describe('visible stat readout', () => {
  it('renders every stat in canonical order', () => {
    const { container } = render(<VisibleStats stats={statsOf([1, 2, 3, 4, 5])} layout="row" />);

    expect(readoutCodes(container)).toEqual([...STAT_ORDER]);
    expect(readoutValues(container)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('shows negative and multi-digit values without clamping them', () => {
    // Visible stats are deliberately unclamped (Q-26/Q-12), so the readout has
    // to survive whatever the run produced rather than pinning to a 0-10 bar.
    const { container } = render(<VisibleStats stats={statsOf([-4, 137, 0, -12, 25])} layout="row" />);

    expect(readoutValues(container)).toEqual(['−4', '137', '0', '−12', '25']);
    expect(container.querySelectorAll('.stat-readout__value--negative')).toHaveLength(2);
  });

  it('carries both a code and a full accessible name for every stat', () => {
    const { container } = render(<VisibleStats stats={statsOf([1, 1, 1, 1, 1])} layout="responsive" />);

    // One layout shows the code, the other the name; both are always in the DOM
    // so assistive technology gets the full attribute name either way.
    expect(readoutCodes(container)).toEqual([...STAT_ORDER]);
    const names = Array.from(container.querySelectorAll('.stat-readout__name')).map((n) => n.textContent);
    expect(names).toEqual(['Appearance', 'Intelligence', 'Constitution', 'Wealth', 'Spirit']);
  });

  it('gives the group an accessible name', () => {
    render(<VisibleStats stats={statsOf([1, 2, 3, 4, 5])} layout="row" label="Final attributes" />);
    expect(screen.getByLabelText('Final attributes')).toBeTruthy();
  });

  it('renders optional record facts above the attributes', () => {
    const { container } = render(
      <AssessmentPanel
        heading="FINAL ASSESSMENT"
        stats={statsOf([1, 2, 3, 4, 5])}
        facts={[
          ['Age', '61'],
          ['MATERIAL STATUS', 'STONE TRAJECTORY'],
        ]}
      />,
    );

    expect(screen.getByText('FINAL ASSESSMENT')).toBeTruthy();
    expect(within(container).getByText('61')).toBeTruthy();
    expect(within(container).getByText('STONE TRAJECTORY')).toBeTruthy();
    expect(readoutValues(container)).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('playback status', () => {
  const life = computePlayback('h2a1-playback', content, {
    species: { kind: 'seeded_random' },
    talents: { kind: 'seeded_random_compatible' },
    allocation: { kind: 'even' },
  });

  it('shows the current attributes alongside age and material', () => {
    const frames = life.frames.slice(0, 6);
    const current = frames[frames.length - 1]!;
    const { container } = render(
      <Playback
        content={content}
        species={content.species.get(life.species)!}
        frames={frames}
        paused={false}
        speed={1}
        onTogglePause={() => {}}
        onSetSpeed={() => {}}
      />,
    );

    expect(readoutCodes(container)).toEqual([...STAT_ORDER]);
    expect(readoutValues(container)).toEqual(STAT_ORDER.map((stat) => expectedValue(current.statsAfter[stat])));
    // Scoped to the status grid: an unscoped text query collides whenever an
    // attribute happens to hold the same number as the age.
    const status = container.querySelector('.status-grid') as HTMLElement;
    expect(within(status).getByText(String(current.age))).toBeTruthy();
  });

  it('puts the status source before the timeline so a narrow layout can pin it', () => {
    const { container } = render(
      <Playback
        content={content}
        species={content.species.get(life.species)!}
        frames={life.frames.slice(0, 4)}
        paused={false}
        speed={1}
        onTogglePause={() => {}}
        onSetSpeed={() => {}}
      />,
    );

    const children = Array.from(container.querySelector('.playback')!.children);
    expect(children[0]?.classList.contains('rail')).toBe(true);
    expect(children[1]?.classList.contains('playback__timeline')).toBe(true);
    // One status source, not one per layout — a second copy would read the
    // record out twice to a screen reader.
    expect(container.querySelectorAll('.rail')).toHaveLength(1);
    expect(container.querySelectorAll('.stat-readout')).toHaveLength(1);
  });

  it('keeps the playback controls in the same region as the status', () => {
    render(
      <Playback
        content={content}
        species={content.species.get(life.species)!}
        frames={life.frames.slice(0, 4)}
        paused={false}
        speed={2}
        onTogglePause={() => {}}
        onSetSpeed={() => {}}
      />,
    );

    const status = screen.getByLabelText('Record status and playback controls');
    expect(within(status).getByRole('button', { name: 'Pause' })).toBeTruthy();
    expect(within(status).getByRole('button', { name: '1×' })).toBeTruthy();
    expect(within(status).getByRole('button', { name: '2×' })).toBeTruthy();
  });
});

describe('outcome screens', () => {
  const ending: EndingRecord = {
    endingId: 'END-TEST-001',
    title_en: 'Test Permanent Form',
    endingAge: 61,
    species: 'HUMAN',
    registeredSpecies: 'HUMAN',
    primaryMaterial: 'STON',
    form: 'Statue',
    awareness: 'Unconscious',
    integrity: 'Intact',
    legalStatus: 'Property',
    ownership: 'Municipal',
    autonomy: 'None',
    conversionConsent: 'Implied',
    location: 'Civic square',
    socialMeaning: 'Commemorative',
  } as EndingRecord;

  it('shows a final assessment outside the certificate on a Permanent Form ending', () => {
    const { container } = render(
      <EndingScreen
        content={content}
        ending={ending}
        finalStats={statsOf([7, 14, -2, 3, 19])}
        seed="h2a1-ending"
        contentVersion="fingerprint"
        onNewLife={() => {}}
        onReviewLife={() => {}}
      />,
    );

    expect(screen.getByText('FINAL ASSESSMENT')).toBeTruthy();
    expect(readoutValues(container)).toEqual(['7', '14', '−2', '3', '19']);
    // The certificate stays a legal/material document; attributes live outside
    // it so a later certificate redesign inherits no game-stat fields.
    expect(container.querySelector('.certificate .stat-readout')).toBeNull();
  });

  it('shows reached age, material and current attributes on an open record', () => {
    const { container } = render(
      <OpenRecord
        reachedAge={120}
        material="CRYS"
        currentStats={statsOf([4, 9, 11, 0, 22])}
        seed="h2a1-open"
        onNewLife={() => {}}
        onReviewLife={() => {}}
      />,
    );

    // Reached age used to be developer-only; it is ordinary information.
    expect(screen.getByText('Record open at age 120')).toBeTruthy();
    expect(screen.getByText('CURRENT ASSESSMENT')).toBeTruthy();
    expect(screen.getByText('CRYSTAL TRAJECTORY')).toBeTruthy();
    expect(readoutValues(container)).toEqual(['4', '9', '11', '0', '22']);
  });

  it('does not invent a Permanent Form for an open record', () => {
    render(
      <OpenRecord
        reachedAge={120}
        material="NONE"
        currentStats={statsOf([1, 1, 1, 1, 1])}
        seed="h2a1-open"
        onNewLife={() => {}}
        onReviewLife={() => {}}
      />,
    );

    expect(screen.getByText('RECORD REMAINS OPEN')).toBeTruthy();
    expect(screen.queryByText('CERTIFICATE OF PERMANENT STATUS')).toBeNull();
    expect(screen.queryByText('FINAL ASSESSMENT')).toBeNull();
    expect(screen.getByText('MOBILE')).toBeTruthy();
  });

  it('summarises the final state at the top of the full record', () => {
    const ended = computePlayback('smoke-002', content, {
      species: { kind: 'seeded_random' },
      talents: { kind: 'seeded_random_compatible' },
      allocation: { kind: 'even' },
    });
    const last = ended.frames[ended.frames.length - 1]!;

    const { container } = render(
      <LifeReview content={content} frames={ended.frames} onBackToOutcome={() => {}} />,
    );

    const heading = last.endingAfter ? 'FINAL ASSESSMENT' : 'LATEST ASSESSMENT';
    expect(screen.getByText(heading)).toBeTruthy();
    expect(readoutValues(container)).toEqual(STAT_ORDER.map((stat) => expectedValue(last.statsAfter[stat])));
    expect(within(container).getAllByText(String(last.age)).length).toBeGreaterThan(0);
  });
});

describe('the hidden-state boundary still holds', () => {
  const life = computePlayback('h2a1-hidden', content, {
    species: { kind: 'seeded_random' },
    talents: { kind: 'seeded_random_compatible' },
    allocation: { kind: 'even' },
  });

  it('exposes no FIX or internal state through the playback status', () => {
    const { container } = render(
      <Playback
        content={content}
        species={content.species.get(life.species)!}
        frames={life.frames.slice(0, 12)}
        paused={false}
        speed={1}
        onTogglePause={() => {}}
        onSetSpeed={() => {}}
      />,
    );

    const text = container.textContent ?? '';
    expect(text).not.toContain('FIX');
    expect(text).not.toMatch(/ROUTE_[A-Z]/);
    expect(text).not.toMatch(/FAC_[A-Z]/);
    expect(text).not.toMatch(/EVT-[A-Z]/);
    expect(text).not.toContain('CONTACTED');
    expect(text).not.toContain('COMMITTED');
  });

  it('exposes no FIX through the outcome screens', () => {
    const { container } = render(
      <OpenRecord
        reachedAge={120}
        material="SYNT"
        currentStats={statsOf([3, 3, 3, 3, 3])}
        seed="h2a1-open"
        onNewLife={() => {}}
        onReviewLife={() => {}}
      />,
    );

    const text = container.textContent ?? '';
    expect(text).not.toContain('FIX');
    expect(text).not.toMatch(/ROUTE_[A-Z]/);
  });
});

describe('developer test summary', () => {
  const life = computePlayback('smoke-002', content, {
    species: { kind: 'seeded_random' },
    talents: { kind: 'seeded_random_compatible' },
    allocation: { kind: 'even' },
  });

  it('carries setup, outcome and the visible attributes', () => {
    const summary = buildTestSummary(life, content, 'MOBILE');

    expect(summary).toContain(`seed: ${life.seed}`);
    expect(summary).toContain(`content: ${life.contentVersion}`);
    expect(summary).toContain(`species: ${life.species}`);
    expect(summary).toContain('allocation:');
    expect(summary).toContain('outcome:');
    for (const stat of STAT_ORDER) {
      expect(summary).toContain(`${stat} ${life.frames[life.frames.length - 1]!.statsAfter[stat]}`);
    }
  });

  it('carries nothing from behind the curtain', () => {
    const summary = buildTestSummary(life, content, 'MOBILE');

    // The reproduction export stays the deeper tool; this one is a note a
    // player could have written from the screen.
    expect(summary).not.toMatch(/\bFIX\b/);
    expect(summary).not.toMatch(/ROUTE_[A-Z]/);
    expect(summary).not.toMatch(/FAC_[A-Z]/);
    expect(summary).not.toMatch(/EVT-[A-Z]/);
    expect(summary).not.toContain('CONTACTED');
    expect(summary).not.toContain('schedule');
  });
});
