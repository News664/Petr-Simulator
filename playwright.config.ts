import { defineConfig, devices } from '@playwright/test';

/**
 * Browser functional smoke tests.
 *
 * These run against the **production bundle** served by `vite preview`, not the
 * dev server, because the thing being protected is what GitHub Pages publishes:
 * relative asset paths, the generated content snapshot and the built React tree.
 *
 * Scope is deliberately small. Everything here is a non-judgment functional
 * check that a human should never have to repeat by hand; taste, tone, pacing
 * and content stay with the human playtest.
 */
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 90_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Chromium only, in two shapes. A wider browser matrix is not worth the CI
  // minutes for smoke coverage; real-device quirks stay in the human checklist.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  // `npm run e2e` builds first; in CI the Build step has already produced dist/.
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
