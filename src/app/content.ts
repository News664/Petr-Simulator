import { hydrateBrowserSnapshot, type BrowserContentSnapshot } from '../engine/content/browserSnapshot.js';
import type { ContentBundle } from '../engine/content/load.js';
import snapshot from './generated/content.snapshot.json';

/**
 * The browser's content bundle.
 *
 * Hydrated from the generated snapshot, which was produced by the canonical Node
 * loader. Browser code must never import `content/load.ts` — it reads the
 * filesystem — and a test asserts no `node:*` import reaches this path.
 */
export const browserContent: ContentBundle = hydrateBrowserSnapshot(
  snapshot as unknown as BrowserContentSnapshot,
);

export const CONTENT_VERSION = browserContent.contentVersion;
