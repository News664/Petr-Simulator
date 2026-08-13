import { useState } from 'react';

import { useI18n } from '../i18n/index.js';

interface OpenRecordProps {
  reachedAge: number;
  devMode: boolean;
  seed: string;
  onNewLife: () => void;
  onReplay: () => void;
}

/**
 * Record Remains Open — the honest nonterminal screen.
 *
 * Current balance leaves roughly three of four lives without a Permanent Form
 * ending. Fabricating one here would hide the very finding the playtest needs to
 * surface, so the record simply stays open.
 */
export function OpenRecord({ reachedAge, devMode, seed, onNewLife, onReplay }: OpenRecordProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  return (
    <section>
      <p className="notice-strip">{t('nonterminal.heading')}</p>
      <p className="screen__lede">{t('nonterminal.body')}</p>
      {devMode ? <p className="record-line">{t('nonterminal.reachedAge', { age: reachedAge })}</p> : null}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onNewLife}>
          {t('ending.newLife')}
        </button>
        <button type="button" className="btn" onClick={onReplay}>
          {t('ending.replay')}
        </button>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            void navigator.clipboard?.writeText(seed).then(
              () => setCopied(true),
              () => setCopied(false),
            );
          }}
        >
          {t('ending.copySeed')}
        </button>
        {copied ? <span className="label" role="status">{t('ending.seedCopied')}</span> : null}
      </div>
    </section>
  );
}
