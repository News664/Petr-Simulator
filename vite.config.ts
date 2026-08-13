import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * H2A browser app.
 *
 * Root is `src/app` so the Node CLIs, engine and test suite keep their existing
 * layout untouched. Browser code imports the generated content snapshot; it must
 * never reach the Node-only canonical loader, which a test enforces.
 */
export default defineConfig({
  root: 'src/app',
  base: './',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
