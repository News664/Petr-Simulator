import { defineConfig } from 'vitest/config';

/**
 * `.tsx` is transformed by Vite's esbuild using the `jsx: react-jsx` setting in
 * tsconfig, so the React plugin is not needed here — and leaving it out keeps
 * Vitest's bundled Vite version independent of the app's.
 */
export default defineConfig({
  test: {
    // Engine/content suites stay in Node; UI suites opt into jsdom per file.
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
    setupFiles: ['tests/helpers/uiSetup.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
