/**
 * Seed creation.
 *
 * The engine never calls `Math.random`; the *UI* mints one opaque seed per run
 * and from then on the run is fully described by it. `crypto.getRandomValues` is
 * used where available so seeds do not collide across tabs.
 */
export function createSeed(): string {
  const bytes = new Uint8Array(8);
  const webCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(bytes);
  } else {
    // Deterministic-but-unique fallback for environments without WebCrypto.
    const now = BigInt(Date.now());
    for (let i = 0; i < bytes.length; i++) bytes[i] = Number((now >> BigInt(i * 8)) & 0xffn);
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
