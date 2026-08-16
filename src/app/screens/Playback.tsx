import type { ContentBundle } from '../../engine/content/load.js';
import type { PlaybackFrame } from '../../engine/playback.js';
import type { SpeciesDef, VisibleStat } from '../../engine/types.js';
import { VisibleStats } from '../components/VisibleStats.js';
import { useI18n } from '../i18n/index.js';
import { formatDelta, materialLabel, STAT_ORDER, talentName } from '../presentation.js';
import type { Speed } from '../state/reducer.js';
import { usePresentFollow } from '../usePresentFollow.js';

interface PlaybackProps {
  content: ContentBundle;
  species: SpeciesDef;
  frames: readonly PlaybackFrame[];
  paused: boolean;
  speed: Speed;
  onTogglePause: () => void;
  onSetSpeed: (speed: Speed) => void;
}

/**
 * Life playback — one card per year, newest emphasised.
 *
 * `frames` is only what has been revealed, so the component structurally cannot
 * render the future. Normal mode shows age, authored prose, visible stat deltas
 * and talent activations — never IDs, channel/family, route flags, schedules,
 * faction state or FIX.
 */
export function Playback({
  content,
  species,
  frames,
  paused,
  speed,
  onTogglePause,
  onSetSpeed,
}: PlaybackProps) {
  const { t } = useI18n();
  // Viewport following lives in its own hook so the reveal path here stays a
  // pure render of what has already been revealed. It moves the viewport only —
  // never the reveal clock.
  const { anchorRef, following, returnToPresent } = usePresentFollow(frames.length);
  const current = frames.length > 0 ? frames[frames.length - 1] : null;

  const stats: Record<VisibleStat, number> = current
    ? current.statsAfter
    : ({ CHR: 0, INT: 0, STR: 0, MNY: 0, SPR: 0 } as Record<VisibleStat, number>);

  return (
    <div className="playback">
      {/* One status source for both layouts. It is first in the document so a
          narrow viewport gets a sticky HUD above the timeline; on wide layouts
          CSS places it back in the right-hand column, so the desktop rail is
          visually unchanged. Rendering it twice would duplicate the live region
          and read the record out twice to a screen reader. */}
      <aside className="rail" aria-label={t('status.mobileSummary')}>
        <div className="panel rail__facts">
          <div className="status-grid" aria-label={t('playback.status')}>
            <span className="label">{t('status.age')}</span>
            <span className="status-grid__value">{current?.age ?? 0}</span>
            <span className="label rail__species">{t('review.species')}</span>
            <span className="status-grid__value rail__species">{species.name_en}</span>
            <span className="label">{t('playback.material')}</span>
            <span className="status-grid__value">
              {materialLabel(current?.materialAfter ?? 'NONE', t('playback.materialMobile'))}
            </span>
          </div>
        </div>

        <div className="panel rail__stats">
          <VisibleStats stats={stats} layout="responsive" />
        </div>

        <div className="controls">
          <button type="button" className="btn" onClick={onTogglePause}>
            {paused ? t('playback.resume') : t('playback.pause')}
          </button>
          <button type="button" className="btn" aria-pressed={speed === 1} onClick={() => onSetSpeed(1)}>
            {t('playback.speed1x')}
          </button>
          <button type="button" className="btn" aria-pressed={speed === 2} onClick={() => onSetSpeed(2)}>
            {t('playback.speed2x')}
          </button>
        </div>
      </aside>

      <section className="playback__timeline" aria-label={t('playback.timeline')}>
        <ul className="timeline">
          {frames.map((frame, index) => {
            const isCurrent = index === frames.length - 1;
            return (
              <li key={frame.age}>
                <article
                  className={`event-card${isCurrent ? ' event-card--current' : ''}`}
                  {...(isCurrent ? { 'aria-live': 'polite' as const } : {})}
                >
                  <p className="event-card__age">{t('playback.age', { age: frame.age })}</p>
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
        <div ref={anchorRef} data-testid="playback-present-anchor" />
        {!following ? (
          <button type="button" className="btn return-to-present" onClick={returnToPresent}>
            {t('playback.returnToPresent')}
          </button>
        ) : null}
      </section>
    </div>
  );
}
