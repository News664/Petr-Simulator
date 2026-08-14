import { useEffect, useRef } from 'react';

import type { ContentBundle } from '../../engine/content/load.js';
import type { PlaybackFrame } from '../../engine/playback.js';
import { useI18n } from '../i18n/index.js';
import { formatDelta, STAT_ORDER, talentName } from '../presentation.js';

interface LifeReviewProps {
  content: ContentBundle;
  frames: readonly PlaybackFrame[];
  onBackToOutcome: () => void;
}

/**
 * Review Life — the whole record, static.
 *
 * After an outcome the player's question is "what happened?", not "show me the
 * animation again", so this renders every already-computed frame at once: no
 * timer, no reveal animation, no pause or speed controls, and no recomputation —
 * the frames are exactly the ones captured at BEGIN LIFE.
 *
 * It opens near the final year, because that is what prompted the question, and
 * scrolls freely back to birth. The hidden-state boundary is unchanged: this is
 * still normal mode, so no IDs, route flags, schedules, faction state or FIX.
 */
export function LifeReview({ content, frames, onBackToOutcome }: LifeReviewProps) {
  const { t } = useI18n();
  const finalRef = useRef<HTMLLIElement>(null);

  // Open near the end of the record rather than at birth.
  useEffect(() => {
    finalRef.current?.scrollIntoView?.({ block: 'center', behavior: 'auto' });
  }, []);

  return (
    <section>
      <div className="review-head">
        <h2 className="screen__heading">{t('lifeReview.heading')}</h2>
        <button type="button" className="btn" onClick={onBackToOutcome}>
          {t('lifeReview.backToOutcome')}
        </button>
      </div>
      <p className="screen__lede">{t('lifeReview.lede', { years: frames.length })}</p>

      <ul className="timeline" aria-label={t('playback.timeline')}>
        {frames.map((frame, index) => {
          const isFinal = index === frames.length - 1;
          return (
            <li key={frame.age} ref={isFinal ? finalRef : undefined}>
              <article className={`event-card${isFinal ? ' event-card--final' : ''}`}>
                <p className="event-card__age">
                  {t('playback.age', { age: frame.age })}
                  {isFinal ? <span className="event-card__final-tag"> · {t('lifeReview.finalEvent')}</span> : null}
                </p>
                <p className="event-card__text">{frame.occurrence.textEn}</p>
                {Object.keys(frame.statDelta).length > 0 || frame.triggeredTalentIdsThisAge.length > 0 ? (
                  <div className="chips">
                    {STAT_ORDER.filter((stat) => frame.statDelta[stat] !== undefined).map((stat) => {
                      const value = frame.statDelta[stat] ?? 0;
                      return (
                        <span key={stat} className={`chip ${value > 0 ? 'chip--up' : 'chip--down'}`}>
                          {stat} {formatDelta(value)}
                        </span>
                      );
                    })}
                    {frame.triggeredTalentIdsThisAge.map((id) => (
                      <span key={id} className="chip chip--talent">
                        {t('playback.talentActivated', { name: talentName(content, id) })}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onBackToOutcome}>
          {t('lifeReview.backToOutcome')}
        </button>
      </div>
    </section>
  );
}
