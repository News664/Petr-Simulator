import type { ContentBundle } from '../../engine/content/load.js';
import { useI18n } from '../i18n/index.js';
import { rarityStars, talentCard, talentName } from '../presentation.js';
import { blockedBy } from '../state/reducer.js';

interface TalentSelectionProps {
  content: ContentBundle;
  drafted: readonly string[];
  chosen: readonly string[];
  choiceSize: number;
  onToggle: (talentId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * Personal Irregularities — choose exactly three of the drafted ten.
 *
 * Cards show only what the player is allowed to know: name, rarity and authored
 * description. Drafting hooks, unlock tags, FIX effects and designer notes stay
 * behind the curtain — inferring cause without them is the thing being tested.
 */
export function TalentSelection({
  content,
  drafted,
  chosen,
  choiceSize,
  onToggle,
  onContinue,
  onBack,
}: TalentSelectionProps) {
  const { t } = useI18n();
  const complete = chosen.length === choiceSize;

  return (
    <section>
      <h2 className="screen__heading">{t('talents.heading')}</h2>
      <p className="screen__lede">{t('talents.instruction')}</p>
      <p className="counter" aria-live="polite">
        {t('talents.counter', { selected: chosen.length, total: choiceSize })}
      </p>

      <ul className="talent-grid" style={{ marginTop: 'var(--space-4)' }}>
        {drafted.map((id) => {
          const card = talentCard(content, id);
          if (!card) return null;
          const selected = chosen.includes(id);
          const conflicts = blockedBy(content, chosen, id);
          // Full is not an error state: the card stays visible, just not addable.
          const full = !selected && chosen.length >= choiceSize;
          const disabled = !selected && (conflicts.length > 0 || full);

          return (
            <li key={id}>
              <button
                type="button"
                className="talent-card"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onToggle(id)}
              >
                <span className="talent-card__head">
                  <span className="talent-card__name">{card.name}</span>
                  <span className="talent-card__rarity">
                    {'★'.repeat(rarityStars(card.rarity))} {card.rarity}
                  </span>
                </span>
                <p className="talent-card__desc">{card.description}</p>
                {selected ? <span className="talent-card__state">{t('talents.selected')}</span> : null}
                {conflicts.length > 0 ? (
                  <span className="talent-card__blocked">
                    {t('talents.incompatible', {
                      names: conflicts.map((other) => talentName(content, other)).join(', '),
                    })}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="actions">
        <button type="button" className="btn btn--primary" disabled={!complete} onClick={onContinue}>
          {t('talents.continue')}
        </button>
        <button type="button" className="btn btn--quiet" onClick={onBack}>
          {t('talents.back')}
        </button>
      </div>
    </section>
  );
}
