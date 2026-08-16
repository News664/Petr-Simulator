import { useState, type ReactNode } from 'react';

import type { ContentBundle } from '../../engine/content/load.js';
import type { EndingRecord, VisibleStat } from '../../engine/types.js';
import { AssessmentPanel } from '../components/VisibleStats.js';
import { useI18n } from '../i18n/index.js';
import { materialLabel } from '../presentation.js';

interface EndingScreenProps {
  content: ContentBundle;
  ending: EndingRecord;
  /** Visible attributes as they stood on the final frame. Never FIX. */
  finalStats: Record<VisibleStat, number> | null;
  seed: string;
  contentVersion: string;
  /** Developer-only extra action, supplied by `App`. Absent in normal mode. */
  devAction?: ReactNode;
  onNewLife: () => void;
  onReviewLife: () => void;
}

/**
 * Notice of Permanent Status, then the certificate.
 *
 * The certificate is deliberately off-white paper against the dark shell. There
 * is no GOOD/BAD label: the registry describes what the person became, and the
 * social meaning column is left to speak for itself.
 */
export function EndingScreen({
  content,
  ending,
  finalStats,
  seed,
  contentVersion,
  devAction,
  onNewLife,
  onReviewLife,
}: EndingScreenProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const def = content.endings.get(ending.endingId);

  const copySeed = (): void => {
    void navigator.clipboard?.writeText(seed).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  const fields: [string, string][] = [
    [t('ending.field.material'), materialLabel(ending.primaryMaterial, t('playback.materialMobile'))],
    [t('ending.field.form'), ending.form],
    [t('ending.field.awareness'), ending.awareness],
    [t('ending.field.integrity'), ending.integrity],
    [t('ending.field.legalStatus'), ending.legalStatus],
    [t('ending.field.ownership'), ending.ownership],
    [t('ending.field.autonomy'), ending.autonomy],
    [t('ending.field.consent'), ending.conversionConsent],
    [t('ending.field.location'), ending.location],
    [t('ending.field.socialMeaning'), ending.socialMeaning],
  ];

  return (
    <section>
      <p className="notice-strip">{t('ending.notice')}</p>
      <h2 className="screen__heading">{ending.title_en}</h2>
      <p className="label">{t('ending.age', { age: ending.endingAge })}</p>
      {def?.description_en ? <p className="screen__lede">{def.description_en}</p> : null}

      <div className="certificate">
        <p className="certificate__title">{t('ending.certificate')}</p>
        <dl className="definition">
          {fields
            .filter(([, value]) => value && value.trim() !== '')
            .map(([label, value]) => (
              <div key={label} style={{ display: 'contents' }}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
        <div className="certificate__footer">
          <div>
            {ending.species}
            {ending.registeredSpecies && ending.registeredSpecies !== ending.species
              ? ` · ${t('ending.registeredSpecies')} ${ending.registeredSpecies}`
              : ''}
          </div>
          <div>{seed}</div>
          <div>
            {t('ending.fingerprint')} {contentVersion.slice(0, 16)}…
          </div>
        </div>
      </div>

      {/* Outside the certificate on purpose: the certificate records legal and
          material status, these are the game's assessment of the person. */}
      {finalStats ? <AssessmentPanel heading={t('status.finalAssessment')} stats={finalStats} /> : null}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onNewLife}>
          {t('ending.newLife')}
        </button>
        <button type="button" className="btn" onClick={onReviewLife}>
          {t('ending.review')}
        </button>
        <button type="button" className="btn btn--quiet" onClick={copySeed}>
          {t('ending.copySeed')}
        </button>
        {copied ? <span className="label" role="status">{t('ending.seedCopied')}</span> : null}
        {devAction}
      </div>
    </section>
  );
}
