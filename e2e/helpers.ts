import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared drive-the-app helpers.
 *
 * Selectors go through roles and the authored English copy rather than test IDs
 * wherever the real UI offers one, so a rename that would confuse a player also
 * fails a test. The one exception is the playback present-anchor, which has no
 * accessible name because it is a zero-height layout marker.
 */

/** Storage key from `src/app/storage.ts`; kept in sync by `stale contentVersion` coverage. */
export const SESSION_KEY = 'solid-state:h2a:v1:session';

/** Open the app in developer mode, where an explicit seed can be supplied. */
export async function openDevMode(page: Page): Promise<void> {
  await page.goto('/?dev=1');
  await expect(page.getByRole('button', { name: 'BEGIN NEW LIFE' })).toBeVisible();
}

/** Landing → birth registration, on an explicit seed. */
export async function beginWithSeed(page: Page, seed: string): Promise<void> {
  await openDevMode(page);
  await page.getByLabel('Developer seed').fill(seed);
  await page.getByRole('button', { name: 'BEGIN NEW LIFE' }).click();
  await expect(page.getByRole('heading', { name: 'BIRTH REGISTRATION' })).toBeVisible();
}

/** The classification a seed rolled — the visible proof that a seed is deterministic. */
export async function registeredClassification(page: Page): Promise<string> {
  const value = page
    .locator('p.label', { hasText: 'REGISTERED BIOLOGICAL CLASSIFICATION' })
    .locator('xpath=following-sibling::p[1]');
  return (await value.innerText()).trim();
}

/** The ten drafted irregularities, in draft order. */
export async function draftedTalentNames(page: Page): Promise<string[]> {
  const names = await page.locator('.talent-card__name').allInnerTexts();
  return names.map((name) => name.trim());
}

function selectableTalents(page: Page): Locator {
  return page.locator('button.talent-card[aria-pressed="false"]:not([disabled])');
}

/** Choose the first three compatible irregularities and continue. */
export async function chooseThreeTalents(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'PERSONAL IRREGULARITIES' })).toBeVisible();
  for (let picked = 0; picked < 3; picked++) {
    await selectableTalents(page).first().click();
  }
  await expect(page.locator('.counter')).toHaveText('3 / 3 SELECTED');
  await page.getByRole('button', { name: 'CONTINUE TO ASSESSMENT' }).click();
}

/** Spend every assessment point, then move on to the record summary. */
export async function spendAllPoints(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'INITIAL ASSESSMENT' })).toBeVisible();
  const increase = page.locator('button.stepper[aria-label^="Increase"]:not([disabled])');
  // Bounded: the assessment budget is small and every click consumes one point.
  for (let guard = 0; guard < 60; guard++) {
    if ((await increase.count()) === 0) break;
    await increase.first().click();
  }
  await expect(page.locator('.counter')).toHaveText('0 POINTS REMAINING');
  await page.getByRole('button', { name: 'REVIEW RECORD' }).click();
  await expect(page.getByRole('heading', { name: 'RECORD SUMMARY' })).toBeVisible();
}

/** Landing → playback, on an explicit seed. */
export async function playToPlayback(page: Page, seed: string): Promise<void> {
  await beginWithSeed(page, seed);
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  await chooseThreeTalents(page);
  await spendAllPoints(page);
  await page.getByRole('button', { name: 'BEGIN LIFE' }).click();
  await expect(eventCards(page).first()).toBeVisible();
}

export function eventCards(page: Page): Locator {
  return page.locator('.event-card');
}

export function presentAnchor(page: Page): Locator {
  return page.getByTestId('playback-present-anchor');
}

/** Wait until at least `count` annual entries have been revealed. */
export async function waitForEntries(page: Page, count: number): Promise<void> {
  await expect
    .poll(async () => eventCards(page).count(), { timeout: 30_000 })
    .toBeGreaterThanOrEqual(count);
}

/**
 * Advance the run to its outcome using the developer single-frame step, which is
 * a reveal control and touches no RNG. Stepping keeps the test bounded in
 * seconds instead of the minutes real playback cadence would take.
 */
export async function stepToOutcome(page: Page, maxSteps = 160): Promise<void> {
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Inspector', exact: true }).click();
  const step = page.getByRole('button', { name: 'Reveal one frame' });

  for (let taken = 0; taken < maxSteps; taken++) {
    if (!(await step.isEnabled())) break;
    await step.click();
  }
  // The inspector is a full-height overlay; close it before touching the
  // playback controls underneath.
  await page.getByRole('button', { name: 'Close inspector' }).click();
  // Paused means paused, including on the final year: the outcome screen is
  // reached by letting the reveal loop run out, not by the last step itself.
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(outcomeNotice(page)).toBeVisible();
}

/**
 * The banner that ends a run: a Permanent Form notice, or the record staying
 * open at the simulation horizon. `RECORD SUSPENDED` is deliberately *not*
 * matched — that is a content defect, and a run reaching it fails the test.
 */
export function outcomeNotice(page: Page): Locator {
  return page.locator('.notice-strip', {
    hasText: /NOTICE OF PERMANENT STATUS|RECORD REMAINS OPEN/,
  });
}

/** A run must never end in the coverage-defect screen. */
export async function expectNoRecordDefect(page: Page): Promise<void> {
  await expect(page.locator('.notice-strip', { hasText: 'RECORD SUSPENDED' })).toHaveCount(0);
}

/** No horizontal overflow anywhere on the page. */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}
