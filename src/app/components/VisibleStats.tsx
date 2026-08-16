import type { VisibleStat } from '../../engine/types.js';
import { useI18n } from '../i18n/index.js';
import { STAT_ORDER } from '../presentation.js';

/**
 * The five visible attributes, rendered once and reused everywhere.
 *
 * CHR / INT / STR / MNY / SPR are ordinary player information — the same numbers
 * the player allocated at the initial assessment — so they follow the player
 * through playback and into every outcome screen. This is the single place they
 * are laid out; five copies of the same loop is how they went missing from the
 * result screens in the first place.
 *
 * The boundary this component does *not* cross: it renders exactly what it is
 * given. FIX, flags, route state, faction lifecycle and schedules are not
 * visible attributes and never arrive here.
 */

export type StatReadoutLayout =
  /** Always the compact single row. Used on outcome screens at every width. */
  | 'row'
  /** Labelled grid on wide layouts, compact row on narrow ones. */
  | 'responsive';

interface VisibleStatsProps {
  stats: Record<VisibleStat, number>;
  layout: StatReadoutLayout;
  /** Accessible name for the group. Defaults to the generic attributes label. */
  label?: string;
}

/**
 * Values are printed verbatim.
 *
 * Visible stats are deliberately unclamped (Q-12), so negatives and values well
 * past ten are legitimate and must stay readable rather than being hidden behind
 * a bar or a capped meter.
 */
function formatValue(value: number): string {
  // Unicode minus, matching the delta chips on the event cards.
  return value < 0 ? `−${Math.abs(value)}` : String(value);
}

export function VisibleStats({ stats, layout, label }: VisibleStatsProps) {
  const { t } = useI18n();

  return (
    <dl className={`stat-readout stat-readout--${layout}`} aria-label={label ?? t('status.attributes')}>
      {STAT_ORDER.map((stat) => {
        const value = stats[stat];
        return (
          <div className="stat-readout__item" key={stat}>
            <dt className="stat-readout__term">
              {/* Both labels are present; the layout decides which one is shown
                  and which one is left for assistive technology only, so a
                  screen reader always gets the full attribute name. */}
              <span className="stat-readout__name">{t(`stat.${stat}`)}</span>
              <span className="stat-readout__code">{stat}</span>
            </dt>
            <dd className={`stat-readout__value${value < 0 ? ' stat-readout__value--negative' : ''}`}>
              {formatValue(value)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

interface AssessmentPanelProps {
  heading: string;
  stats: Record<VisibleStat, number>;
  /** Optional facts shown above the attributes, e.g. age and material status. */
  facts?: readonly [label: string, value: string][];
}

/**
 * The outcome-screen wrapper: a heading, optional record facts, then the
 * attributes.
 *
 * Deliberately *outside* the paper certificate. Certificate fields are legal and
 * material status; attributes are game assessment information, and keeping them
 * apart leaves a later certificate redesign free of game-stat fields.
 */
export function AssessmentPanel({ heading, stats, facts }: AssessmentPanelProps) {
  return (
    <section className="assessment" aria-label={heading}>
      <p className="assessment__heading">{heading}</p>
      {facts && facts.length > 0 ? (
        <dl className="assessment__facts">
          {facts.map(([factLabel, value]) => (
            <div className="assessment__fact" key={factLabel}>
              <dt>{factLabel}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <VisibleStats stats={stats} layout="row" />
    </section>
  );
}
