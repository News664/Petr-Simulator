import { useState } from 'react';

import { useI18n } from '../i18n/index.js';

interface CopyTestSummaryProps {
  /** Built lazily, so nothing is computed unless a tester actually asks. */
  summary: () => string;
}

/**
 * Developer-only playtest note helper.
 *
 * Rendered by `App` as a slot on the outcome screens, so neither outcome screen
 * needs to know about developer mode or hold a reference to the run. The text it
 * copies is player-visible information only — see `buildTestSummary`.
 */
export function CopyTestSummary({ summary }: CopyTestSummaryProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => {
          void navigator.clipboard?.writeText(summary()).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
      >
        {t('dev.copyTestSummary')}
      </button>
      {copied ? (
        <span className="label" role="status">
          {t('dev.testSummaryCopied')}
        </span>
      ) : null}
    </>
  );
}
