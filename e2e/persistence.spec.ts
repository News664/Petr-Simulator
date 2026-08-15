import { expect, test } from '@playwright/test';

import {
  beginWithSeed,
  draftedTalentNames,
  eventCards,
  playToPlayback,
  registeredClassification,
  SESSION_KEY,
} from './helpers.js';

/**
 * Determinism and stored records.
 *
 * A run is fully determined by `contentVersion + seed + setup policy`. These
 * tests hold the browser to that contract: the same seed must produce the same
 * setup, a reload must recompute the same life rather than restore a snapshot of
 * it, and a record filed under different content must be refused rather than
 * replayed into a different life.
 */

test('an explicit seed is deterministic across sessions', async ({ page }) => {
  await beginWithSeed(page, 'determinism-fixture');
  const firstClassification = await registeredClassification(page);
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  const firstDraft = await draftedTalentNames(page);
  expect(firstDraft).toHaveLength(10);

  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());

  await beginWithSeed(page, 'determinism-fixture');
  expect(await registeredClassification(page)).toBe(firstClassification);
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  expect(await draftedTalentNames(page)).toEqual(firstDraft);
});

test('a different seed produces a different draft', async ({ page }) => {
  await beginWithSeed(page, 'determinism-fixture');
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();
  const first = await draftedTalentNames(page);

  await page.evaluate(() => localStorage.clear());
  await beginWithSeed(page, 'determinism-other');
  await page.getByRole('button', { name: 'ACKNOWLEDGE RECORD' }).click();

  expect(await draftedTalentNames(page)).not.toEqual(first);
});

test('a refresh mid-playback resumes the same life at the same position', async ({ page }) => {
  await playToPlayback(page, 'resume-fixture');
  await page.getByRole('button', { name: '2×' }).click();
  await expect.poll(async () => eventCards(page).count(), { timeout: 20_000 }).toBeGreaterThanOrEqual(4);

  await page.getByRole('button', { name: 'Pause' }).click();
  const before = await eventCards(page).allInnerTexts();

  await page.reload();

  // A reload returns to the front desk with the record on file — it does not
  // resume by itself. Reopening it is a deliberate act.
  await expect(page.getByRole('button', { name: 'CONTINUE RECORD' })).toBeVisible();
  await page.getByRole('button', { name: 'CONTINUE RECORD' }).click();

  // The stored record carries inputs only, so this is a recomputation from the
  // seed — the timeline must come back byte-identical, not merely similar.
  await expect(eventCards(page).first()).toBeVisible();
  await expect.poll(async () => eventCards(page).count()).toBeGreaterThanOrEqual(before.length);
  const after = await eventCards(page).allInnerTexts();
  expect(after.slice(0, before.length)).toEqual(before);
});

test('a closed tab can be resumed from the landing screen', async ({ page }) => {
  await playToPlayback(page, 'continue-fixture');
  await expect.poll(async () => eventCards(page).count(), { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: 'Pause' }).click();
  const revealed = await eventCards(page).count();

  await page.goto('/?dev=1');
  await page.getByRole('button', { name: 'CONTINUE RECORD' }).click();

  await expect(eventCards(page).first()).toBeVisible();
  await expect.poll(async () => eventCards(page).count()).toBeGreaterThanOrEqual(revealed);
});

test('a record filed under a different content revision is refused, not replayed', async ({ page }) => {
  await playToPlayback(page, 'stale-fixture');
  await expect.poll(async () => eventCards(page).count(), { timeout: 20_000 }).toBeGreaterThanOrEqual(2);

  await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error(`no stored session under ${key}`);
    const session = JSON.parse(raw) as { contentVersion: string };
    session.contentVersion = 'stale-e2e-revision';
    localStorage.setItem(key, JSON.stringify(session));
  }, SESSION_KEY);

  await page.goto('/?dev=1');

  await expect(page.getByText(/filed under a different content revision/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'CONTINUE RECORD' })).toHaveCount(0);

  // And the app is still usable afterwards rather than stuck on the notice.
  await page.getByRole('button', { name: 'BEGIN NEW LIFE' }).click();
  await expect(page.getByRole('heading', { name: 'BIRTH REGISTRATION' })).toBeVisible();
});
