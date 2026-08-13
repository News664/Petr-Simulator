import type { SpeciesDef, VisibleStat } from '../../engine/types.js';
import { STARTING_ALLOCATION_RANGE } from '../../engine/setup.js';
import type { ContentBundle } from '../../engine/content/load.js';
import { useI18n } from '../i18n/index.js';
import { formatDelta, STAT_ORDER, talentName } from '../presentation.js';

interface InitialAssessmentProps {
  content: ContentBundle;
  species: SpeciesDef;
  allocation: Record<VisibleStat, number>;
  remaining: number;
  chosenTalents: readonly string[];
  onAdjust: (stat: VisibleStat, delta: number) => void;
  onReset: () => void;
  onReview: () => void;
  onBack: () => void;
}

/**
 * Initial Assessment — manual allocation of the species' free points.
 *
 * Allocation is pre-modifier and each base stat stays inside 0–10; the projected
 * post-species value is shown so the player can see the consequence without the
 * UI silently applying it. There is no auto-build button: how a human spends
 * these points is part of what the playtest is for. FIX is never shown.
 */
export function InitialAssessment({
  content,
  species,
  allocation,
  remaining,
  chosenTalents,
  onAdjust,
  onReset,
  onReview,
  onBack,
}: InitialAssessmentProps) {
  const { t } = useI18n();

  return (
    <section>
      <h2 className="screen__heading">{t('alloc.heading')}</h2>
      <p className="counter" aria-live="polite">
        {t('alloc.remaining', { remaining })}
      </p>

      <div className="panel" style={{ marginTop: 'var(--space-4)' }}>
        {STAT_ORDER.map((stat) => {
          const base = allocation[stat];
          const modifier = species.modifiers[stat] ?? 0;
          const statLabel = t(`stat.${stat}`);
          return (
            <div className="alloc-row" key={stat}>
              <div>
                <div>
                  {statLabel} <span className="label">{stat}</span>
                </div>
                <div className="alloc-row__math">
                  {t('alloc.base')} {base}
                  {modifier !== 0 ? ` · ${formatDelta(modifier)} ${t('alloc.speciesModifier')}` : ''} ·{' '}
                  {t('alloc.projected')} {base + modifier}
                </div>
              </div>
              <div className="alloc-row__controls">
                <button
                  type="button"
                  className="stepper"
                  aria-label={t('alloc.decrease', { stat: statLabel })}
                  disabled={base <= STARTING_ALLOCATION_RANGE.min}
                  onClick={() => onAdjust(stat, -1)}
                >
                  −
                </button>
                <span className="alloc-row__value">{base}</span>
                <button
                  type="button"
                  className="stepper"
                  aria-label={t('alloc.increase', { stat: statLabel })}
                  disabled={base >= STARTING_ALLOCATION_RANGE.max || remaining <= 0}
                  onClick={() => onAdjust(stat, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-4)' }}>
        <p className="label">{t('alloc.selectedTalents')}</p>
        <p style={{ margin: 'var(--space-2) 0 0' }}>
          {chosenTalents.map((id) => talentName(content, id)).join(' · ')}
        </p>
      </div>

      <div className="actions">
        <button type="button" className="btn btn--primary" disabled={remaining !== 0} onClick={onReview}>
          {t('alloc.review')}
        </button>
        <button type="button" className="btn" onClick={onReset}>
          {t('alloc.reset')}
        </button>
        <button type="button" className="btn btn--quiet" onClick={onBack}>
          {t('talents.back')}
        </button>
      </div>
    </section>
  );
}
