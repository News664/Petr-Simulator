import { useState } from 'react';

import type { ContentBundle } from '../../engine/content/load.js';
import type { SpeciesDef, VisibleStat } from '../../engine/types.js';
import { useI18n } from '../i18n/index.js';
import { formatDelta, speciesDisplayName, STAT_ORDER, talentName } from '../presentation.js';

interface RecordSummaryProps {
  content: ContentBundle;
  species: SpeciesDef;
  chosenTalents: readonly string[];
  allocation: Record<VisibleStat, number>;
  seed: string;
  onBegin: () => void;
  onBack: () => void;
}

/** Record Summary — the last decision point before observation-only playback. */
export function RecordSummary({
  content,
  species,
  chosenTalents,
  allocation,
  seed,
  onBegin,
  onBack,
}: RecordSummaryProps) {
  const { t } = useI18n();
  const [seedOpen, setSeedOpen] = useState(false);

  return (
    <section>
      <h2 className="screen__heading">{t('review.heading')}</h2>
      <div className="panel">
        <dl className="definition">
          <dt>{t('review.species')}</dt>
          <dd>{speciesDisplayName(species)}</dd>

          <dt>{t('review.talents')}</dt>
          <dd>{chosenTalents.map((id) => talentName(content, id)).join(' · ')}</dd>

          <dt>{t('review.allocation')}</dt>
          <dd>
            {STAT_ORDER.map((stat) => {
              const modifier = species.modifiers[stat] ?? 0;
              return (
                <div key={stat} className="alloc-row__math">
                  {t(`stat.${stat}`)} {allocation[stat]}
                  {modifier !== 0 ? ` ${formatDelta(modifier)} ${t('alloc.speciesModifier')}` : ''} ={' '}
                  {allocation[stat] + modifier}
                </div>
              );
            })}
          </dd>
        </dl>

        <button
          type="button"
          className="btn btn--quiet"
          style={{ marginTop: 'var(--space-4)' }}
          aria-expanded={seedOpen}
          onClick={() => setSeedOpen((open) => !open)}
        >
          {t('review.seed')}
        </button>
        {seedOpen ? <p className="record-line">{seed}</p> : null}
      </div>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onBegin}>
          {t('review.begin')}
        </button>
        <button type="button" className="btn btn--quiet" onClick={onBack}>
          {t('review.back')}
        </button>
      </div>
    </section>
  );
}
