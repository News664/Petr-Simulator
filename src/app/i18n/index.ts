import { createContext, useContext } from 'react';

import { en } from './en.js';
import type { Locale, MessageKey, Messages } from './types.js';

export * from './types.js';

const BUNDLES: Partial<Record<Locale, Messages>> = { en };

/**
 * Message lookup with `{placeholder}` interpolation.
 *
 * A missing locale falls back to English rather than showing a key, because a
 * partially translated build must stay readable. Nothing here machine-fills a
 * translation: `zh-TW` simply has no bundle yet.
 */
export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
  const bundle = BUNDLES[locale] ?? en;
  const template = bundle[key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

export interface I18n {
  locale: Locale;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18n>({
  locale: 'en',
  t: (key, params) => translate('en', key, params),
});

export function useI18n(): I18n {
  return useContext(I18nContext);
}

/**
 * Canonical content prose, which is authored per-locale in the content bundle.
 *
 * Falls back to English when a locale's string is empty — `zh-TW` is reserved
 * empty across the whole corpus, and inventing text here would create a second
 * creative source of truth.
 */
export function localizedText(text: { en: string; 'zh-TW'?: string }, locale: Locale): string {
  if (locale === 'zh-TW') {
    const translated = text['zh-TW'];
    if (translated && translated.trim() !== '') return translated;
  }
  return text.en;
}
