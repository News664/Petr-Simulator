import { expect, test } from '@playwright/test';

import {
  eventCards,
  expectNoHorizontalOverflow,
  outcomeNotice,
  playToPlayback,
  statCodes,
  STAT_CODES,
  statReadout,
  statValues,
  stepToOutcome,
  waitForEntries,
} from './helpers.js';

/**
 * H2A.1 — the five visible attributes stay reachable.
 *
 * CHR / INT / STR / MNY / SPR are ordinary player information. The regression
 * these tests guard is a responsive one: on a narrow viewport the status rail
 * used to stack below the whole timeline, so a phone player could not see their
 * own attributes or the playback controls without scrolling past the entire
 * life. The mobile project is where that is actually observable.
 */

function isMobile(projectName: string): boolean {
  return projectName === 'mobile';
}

test('playback shows the current attributes', async ({ page }) => {
  await playToPlayback(page, 'visibility-fixture');
  await waitForEntries(page, 2);

  await expect(statReadout(page)).toHaveCount(1);
  expect(await statCodes(page)).toEqual([...STAT_CODES]);

  const values = await statValues(page);
  expect(values).toHaveLength(5);
  for (const value of values) expect(value).toMatch(/^−?\d+$/);
});

test('the status HUD and controls are on screen during playback', async ({ page }, testInfo) => {
  await playToPlayback(page, 'visibility-fixture');
  await waitForEntries(page, 4);

  // The point of the patch: no scrolling to the end of the life to read your
  // own attributes. Every value, and the label the player actually sees in this
  // layout, must be in the viewport as it stands. The other label is present for
  // assistive technology and is deliberately clipped.
  const visibleLabel = isMobile(testInfo.project.name) ? '.stat-readout__code' : '.stat-readout__name';
  for (let index = 0; index < STAT_CODES.length; index++) {
    await expect(page.locator('.stat-readout__value').nth(index)).toBeInViewport();
    await expect(page.locator(visibleLabel).nth(index)).toBeInViewport();
  }

  await expect(page.getByRole('button', { name: 'Pause' })).toBeInViewport();
  await expect(page.getByRole('button', { name: '1×' })).toBeInViewport();
  await expect(page.getByRole('button', { name: '2×' })).toBeInViewport();

  await expectNoHorizontalOverflow(page);

  if (isMobile(testInfo.project.name)) {
    // On a phone the HUD is pinned; on desktop the rail simply stays in view.
    const box = await page.locator('.rail').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(200);
  }
});

test('attribute values track the run as years are revealed', async ({ page }) => {
  await playToPlayback(page, 'visibility-fixture');
  await page.getByRole('button', { name: '2×' }).click();
  await waitForEntries(page, 3);
  const early = await statValues(page);

  await waitForEntries(page, 12);
  const later = await statValues(page);

  expect(later).toHaveLength(5);
  // Twelve years of authored effects must move something; a frozen readout
  // would mean the HUD is showing a stale frame.
  expect(later).not.toEqual(early);
});

test('the HUD does not break B.1 follow or hide the newest entry', async ({ page }) => {
  await playToPlayback(page, 'visibility-fixture');
  await page.getByRole('button', { name: '2×' }).click();
  await waitForEntries(page, 8);

  const overhang = await page.evaluate(() => {
    const cards = document.querySelectorAll('.event-card');
    const newest = cards[cards.length - 1];
    if (!newest) return Number.NaN;
    return newest.getBoundingClientRect().bottom - window.innerHeight;
  });
  expect(overhang).toBeLessThanOrEqual(8);

  // And the sticky HUD must not sit on top of the newest entry.
  const clear = await page.evaluate(() => {
    const cards = document.querySelectorAll('.event-card');
    const newest = cards[cards.length - 1];
    const rail = document.querySelector('.rail');
    if (!newest || !rail) return Number.NaN;
    return newest.getBoundingClientRect().top - rail.getBoundingClientRect().bottom;
  });
  expect(clear).toBeGreaterThanOrEqual(0);

  await expect(page.getByRole('button', { name: 'RETURN TO PRESENT' })).toHaveCount(0);
});

test('a Permanent Form ending shows the final assessment', async ({ page }) => {
  await playToPlayback(page, 'smoke-002');
  await stepToOutcome(page);
  await expect(outcomeNotice(page)).toBeVisible();

  await expect(page.getByText('FINAL ASSESSMENT')).toBeVisible();
  expect(await statCodes(page)).toEqual([...STAT_CODES]);
  expect(await statValues(page)).toHaveLength(5);

  // Attributes belong beside the certificate, not inside it.
  await expect(page.locator('.certificate .stat-readout')).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test('the final assessment is normal-mode information, not a developer view', async ({ page }) => {
  await playToPlayback(page, 'smoke-002');
  await stepToOutcome(page);
  await expect(outcomeNotice(page)).toBeVisible();

  // Reopen the same finished record without ?dev=1: the outcome screen is
  // restored from the stored session, this time in plain player mode.
  await page.goto('/');
  await page.getByRole('button', { name: 'CONTINUE RECORD' }).click();
  await expect(outcomeNotice(page)).toBeVisible();

  await expect(page.getByText('FINAL ASSESSMENT')).toBeVisible();
  expect(await statCodes(page)).toEqual([...STAT_CODES]);

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('FIX');
  expect(body).not.toContain('DEVELOPER INSPECTOR');
  await expect(page.getByRole('button', { name: 'COPY TEST SUMMARY' })).toHaveCount(0);
});

test('an open record shows reached age, material and current attributes', async ({ page }, testInfo) => {
  // A full-length life is ~120 single-frame steps; the screen is identical on
  // both viewports, so it is paid for once.
  test.skip(isMobile(testInfo.project.name), 'covered once on desktop; identical on mobile');
  test.slow();

  await playToPlayback(page, 'smoke-001');
  await stepToOutcome(page);

  await expect(page.getByText('RECORD REMAINS OPEN')).toBeVisible();
  await expect(page.getByText(/Record open at age \d+/)).toBeVisible();
  await expect(page.getByText('CURRENT ASSESSMENT')).toBeVisible();
  await expect(page.locator('.assessment__fact dt', { hasText: 'MATERIAL STATUS' })).toBeVisible();
  expect(await statCodes(page)).toEqual([...STAT_CODES]);
  expect(await statValues(page)).toHaveLength(5);

  // No Permanent Form is invented for a life that did not reach one.
  await expect(page.getByText('CERTIFICATE OF PERMANENT STATUS')).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test('the full record opens with the final assessment', async ({ page }) => {
  await playToPlayback(page, 'smoke-002');
  await stepToOutcome(page);

  await page.getByRole('button', { name: 'REVIEW LIFE' }).click();
  await expect(page.getByRole('heading', { name: 'FULL RECORD' })).toBeVisible();

  await expect(page.getByText(/FINAL ASSESSMENT|LATEST ASSESSMENT/)).toBeVisible();
  expect(await statCodes(page)).toEqual([...STAT_CODES]);
  await expect(page.locator('.assessment__fact dt', { hasText: 'MATERIAL STATUS' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('the developer test summary copies player-visible information only', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-write', 'clipboard-read']);
  await playToPlayback(page, 'smoke-002');
  await stepToOutcome(page);

  const copy = page.getByRole('button', { name: 'COPY TEST SUMMARY' });
  await expect(copy).toBeVisible();
  await copy.click();
  await expect(page.getByText('Test summary copied')).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('seed: smoke-002');
  expect(clipboard).toContain('outcome:');
  for (const code of STAT_CODES) expect(clipboard).toContain(code);
  // The reproduction export stays the deeper tool; this is a player-visible note.
  expect(clipboard).not.toMatch(/\bFIX\b/);
  expect(clipboard).not.toMatch(/ROUTE_[A-Z]/);
  expect(clipboard).not.toMatch(/FAC_[A-Z]/);
});
