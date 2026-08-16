import { useState, type ReactNode } from 'react';

import type { Material, VisibleStat } from '../../engine/types.js';
import { AssessmentPanel } from '../components/VisibleStats.js';
import { useI18n } from '../i18n/index.js';
import { materialLabel } from '../presentation.js';

interface OpenRecordProps {
  reachedAge: number;
  /** Material status as it stood on the final frame. */
  material: Material;
  /** Visible attributes on the final frame. Never FIX. */
  currentStats: Record<VisibleStat, number> | null;
  seed: string;
  /** Developer-only extra action, supplied by `App`. Absent in normal mode. */
  devAction?: ReactNode;
  onNewLife: () => void;
  onReviewLife: () => void;
}

/**
 * Record Remains Open — the honest nonterminal screen.
 *
 * Current balance leaves a large share of lives without a Permanent Form ending.
 * Fabricating one here would hide the very finding the playtest needs to
 * surface, so the record simply stays open — but "no ending" is not a reason to
 * withhold ordinary player information. Reached age, material status and the
 * five visible attributes are shown in normal mode, because a player who just
 * watched a hundred years deserves to know where the person ended up.
 */
export function OpenRecord({
  reachedAge,
  material,
  currentStats,
  seed,
  devAction,
  onNewLife,
  onReviewLife,
}: OpenRecordProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  return (
    <section>
      <p className="notice-strip">{t('nonterminal.heading')}</p>
      <p className="screen__lede">{t('nonterminal.body')}</p>
      <p className="record-line">{t('nonterminal.reachedAge', { age: reachedAge })}</p>

      {currentStats ? (
        <AssessmentPanel
          heading={t('status.currentAssessment')}
          stats={currentStats}
          facts={[
            [t('status.age'), String(reachedAge)],
            [t('playback.material'), materialLabel(material, t('playback.materialMobile'))],
          ]}
        />
      ) : null}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onNewLife}>
          {t('ending.newLife')}
        </button>
        <button type="button" className="btn" onClick={onReviewLife}>
          {t('ending.review')}
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
        {devAction}
      </div>
    </section>
  );
}
