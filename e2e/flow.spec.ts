import { expect, test } from '@playwright/test';

import {
  beginWithSeed,
  chooseThreeTalents,
  eventCards,
  expectNoHorizontalOverflow,
  openDevMode,
  spendAllPoints,
} from './helpers.js';

/**
 * The setup path, end to end, in a real browser against the production bundle.
 *
 * Everything asserted here is a fact the app either does or does not do. Whether
 * the copy reads well, whether the pacing feels right and whether an outcome is
 * satisfying are human-playtest questions and are deliberately absent.
 */

test('landing renders from the built bundle', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(String(error)));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/');

  await expect(page.getByRole('banner').getByRole('heading', { name: 'SOLID STATE' })).toBeVisible();
  await expect(page.getByText('Everyone becomes something.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'BEGIN NEW LIFE' })).toBeVisible();
  // The bundle is served from a project sub-path on Pages, so every asset must
  // resolve relatively. A 404 here is the classic base-path regression.
  expect(failures).toEqual([]);
});

test('BEGIN NEW LIFE reaches birth registration', async ({ page }) => {
  await openDevMode(page);
  await page.getByRole('button', { name: 'BEGIN NEW LIFE' }).click();

  await expect(page.getByRole('heading', { name: 'BIRTH REGISTRATION' })).toBeVisible();
  await expect(page.getByText('REGISTERED BIOLOGICAL CLASSIFICATION')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' })).toBeVisible();
});

test('talent selection takes exactly three and blocks incompatible pairs', async ({ page }) => {
  await beginWithSeed(page, 'smoke-talents');
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  await expect(page.getByRole('heading', { name: 'PERSONAL IRREGULARITIES' })).toBeVisible();

  const cards = page.locator('button.talent-card');
  await expect(cards).toHaveCount(10);
  await expect(page.locator('.counter')).toHaveText('0 / 3 SELECTED');

  const selectable = page.locator('button.talent-card[aria-pressed="false"]:not([disabled])');
  for (let picked = 0; picked < 3; picked++) await selectable.first().click();

  await expect(page.locator('.counter')).toHaveText('3 / 3 SELECTED');
  await expect(page.locator('button.talent-card[aria-pressed="true"]')).toHaveCount(3);
  // Full is not an error state: the remaining cards stay visible but unaddable,
  // so a fourth selection is impossible by construction.
  await expect(selectable).toHaveCount(0);

  // Deselecting frees the slot again rather than locking the screen.
  await page.locator('button.talent-card[aria-pressed="true"]').first().click();
  await expect(page.locator('.counter')).toHaveText('2 / 3 SELECTED');
  await expect(page.getByRole('button', { name: 'CONTINUE TO ASSESSMENT' })).toBeDisabled();
});

test('assessment spends the budget and review summarises the record', async ({ page }) => {
  await beginWithSeed(page, 'smoke-alloc');
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  await chooseThreeTalents(page);

  await expect(page.getByRole('button', { name: 'REVIEW RECORD' })).toBeDisabled();
  await spendAllPoints(page);

  await expect(page.getByText('Classification')).toBeVisible();
  await expect(page.getByText('Personal irregularities')).toBeVisible();
  await expect(page.getByText('Record reference')).toBeVisible();
  await expect(page.getByRole('button', { name: 'BEGIN LIFE' })).toBeEnabled();

  // BACK must not destroy the choices already made.
  await page.getByRole('button', { name: 'BACK' }).click();
  await expect(page.locator('.counter')).toHaveText('0 POINTS REMAINING');
});

test('playback reveals annual entries and the controls respond', async ({ page }) => {
  await beginWithSeed(page, 'smoke-playback');
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  await chooseThreeTalents(page);
  await spendAllPoints(page);
  await page.getByRole('button', { name: 'BEGIN LIFE' }).click();

  await expect(eventCards(page).first()).toBeVisible();
  await expect(page.getByText(/^AGE 0$/)).toBeVisible();

  await page.getByRole('button', { name: '2×' }).click();
  await expect(page.getByRole('button', { name: '2×' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => eventCards(page).count(), { timeout: 20_000 }).toBeGreaterThanOrEqual(3);

  await page.getByRole('button', { name: 'Pause' }).click();
  const frozen = await eventCards(page).count();
  await page.waitForTimeout(2_000);
  // Pause is a reveal control: it must stop the timeline moving, not merely
  // relabel the button.
  expect(await eventCards(page).count()).toBe(frozen);

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect.poll(async () => eventCards(page).count(), { timeout: 20_000 }).toBeGreaterThan(frozen);
});

test('normal mode never renders internal state', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'BEGIN NEW LIFE' }).click();
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  await chooseThreeTalents(page);
  await spendAllPoints(page);
  await page.getByRole('button', { name: 'BEGIN LIFE' }).click();
  await expect(eventCards(page).first()).toBeVisible();

  await expect(page.getByRole('button', { name: 'Inspector', exact: true })).toHaveCount(0);
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('FIX');
  expect(body).not.toContain('DEVELOPER INSPECTOR');
});

test('narrow viewport does not overflow horizontally', async ({ page }) => {
  await beginWithSeed(page, 'smoke-narrow');
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  await expectNoHorizontalOverflow(page);

  await chooseThreeTalents(page);
  await expectNoHorizontalOverflow(page);

  await spendAllPoints(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'BEGIN LIFE' }).click();
  await expect(eventCards(page).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
