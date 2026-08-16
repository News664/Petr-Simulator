import { expect, test } from '@playwright/test';

import {
  eventCards,
  expectNoHorizontalOverflow,
  expectNoRecordDefect,
  outcomeNotice,
  playToPlayback,
  presentAnchor,
  stepToOutcome,
  waitForEntries,
} from './helpers.js';

/**
 * Playback: reaching an outcome, and keeping the newest entry in view.
 *
 * The follow tests are the reason this suite exists on a mobile viewport. jsdom
 * has no layout, so "the newest entry is actually visible on a phone-sized
 * screen" can only be asserted in a real browser.
 */

/**
 * Seed fixtures are bound to the content fingerprint: the run seed is
 * `contentVersion:seed`, so any canonical content edit re-rolls every life and a
 * seed chosen for its outcome has to be re-picked. `open-a` currently reaches
 * the horizon without an ending; `smoke-002` currently ends.
 */

/** How far below the fold the newest entry may sit before follow has failed. */
const FOLLOW_TOLERANCE_PX = 8;

async function newestEntryOverhang(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const cards = document.querySelectorAll('.event-card');
    const newest = cards[cards.length - 1];
    if (!newest) return Number.NaN;
    return newest.getBoundingClientRect().bottom - window.innerHeight;
  });
}

test('a deterministic run reaches its outcome and can be reviewed', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await playToPlayback(page, 'smoke-002');
  await stepToOutcome(page);

  await expect(outcomeNotice(page)).toBeVisible();
  await expectNoRecordDefect(page);
  expect(errors).toEqual([]);

  await page.getByRole('button', { name: 'REVIEW LIFE' }).click();
  await expect(page.getByRole('heading', { name: 'FULL RECORD' })).toBeVisible();
  await expect(page.locator('.event-card__final-tag')).toBeVisible();

  // The review offers the same control at the top and bottom of a long record.
  await page.getByRole('button', { name: 'BACK TO OUTCOME' }).first().click();
  await expect(outcomeNotice(page)).toBeVisible();
});

test('a run that reaches the horizon reports an open record, not an error', async ({ page }, testInfo) => {
  // A full-length life is ~120 single-frame steps. The code path is identical on
  // both viewports, so it is paid for once rather than twice per CI run.
  test.skip(testInfo.project.name !== 'desktop', 'covered once; identical on mobile');
  test.slow();
  await playToPlayback(page, 'open-a');
  await stepToOutcome(page);

  await expect(page.getByText('RECORD REMAINS OPEN')).toBeVisible();
  await expectNoRecordDefect(page);
});

test('follow keeps the newest entry on screen through consecutive reveals', async ({ page }) => {
  await playToPlayback(page, 'follow-fixture');
  await page.getByRole('button', { name: '2×' }).click();

  // Several reveals in a row at the faster cadence is exactly the case that used
  // to fall behind on a phone.
  for (const target of [3, 5, 7, 9]) {
    await waitForEntries(page, target);
    expect(await newestEntryOverhang(page)).toBeLessThanOrEqual(FOLLOW_TOLERANCE_PX);
  }

  await expect(page.getByRole('button', { name: 'RETURN TO PRESENT' })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test('scrolling up stops the follow and RETURN TO PRESENT catches back up', async ({ page }) => {
  await playToPlayback(page, 'follow-fixture');
  await page.getByRole('button', { name: '2×' }).click();
  await waitForEntries(page, 6);

  await page.mouse.wheel(0, -600);

  const returnButton = page.getByRole('button', { name: 'RETURN TO PRESENT' });
  await expect(returnButton).toBeVisible();

  // Re-reading is not interrupted: the viewport must stay where the player put
  // it while further entries arrive.
  const parked = await page.evaluate(() => window.scrollY);
  await waitForEntries(page, 8);
  expect(await page.evaluate(() => window.scrollY)).toBe(parked);

  await returnButton.click();
  await expect(returnButton).toHaveCount(0);
  expect(await newestEntryOverhang(page)).toBeLessThanOrEqual(FOLLOW_TOLERANCE_PX);

  // Following really resumed, rather than the button just disappearing.
  const caughtUp = await eventCards(page).count();
  await waitForEntries(page, caughtUp + 2);
  expect(await newestEntryOverhang(page)).toBeLessThanOrEqual(FOLLOW_TOLERANCE_PX);
});

test('the present anchor stays reachable while paused', async ({ page }) => {
  await playToPlayback(page, 'follow-fixture');
  await waitForEntries(page, 3);
  await page.getByRole('button', { name: 'Pause' }).click();

  // Paused, nothing moves the viewport, and the anchor is still in the document
  // for the next reveal to align against.
  await expect(presentAnchor(page)).toBeAttached();
  const parked = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(1_500);
  expect(await page.evaluate(() => window.scrollY)).toBe(parked);
});
