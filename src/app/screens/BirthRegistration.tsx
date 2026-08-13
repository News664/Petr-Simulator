import type { SpeciesDef } from '../../engine/types.js';
import { useI18n } from '../i18n/index.js';
import { formatDelta, speciesColloquial, speciesDisplayName, STAT_ORDER } from '../presentation.js';

interface BirthRegistrationProps {
  species: SpeciesDef;
  allocationPoints: number;
  onAcknowledge: () => void;
}

/**
 * Birth Registration — the species reveal.
 *
 * The player cannot choose or reroll the classification; it was rolled from the
 * run seed. Material tendencies are deliberately not shown numerically in H2A.
 */
export function BirthRegistration({ species, allocationPoints, onAcknowledge }: BirthRegistrationProps) {
  const { t } = useI18n();
  const colloquial = speciesColloquial(species);
  const modifiers = STAT_ORDER.filter((stat) => (species.modifiers[stat] ?? 0) !== 0);

  return (
    <section>
      <h2 className="screen__heading">{t('birth.heading')}</h2>
      <div className="panel stack">
        <div>
          <p className="label">{t('birth.classification')}</p>
          <p style={{ fontSize: '1.4rem', margin: 'var(--space-1) 0 0' }}>{speciesDisplayName(species)}</p>
          {colloquial ? (
            <p className="screen__lede" style={{ margin: 'var(--space-1) 0 0' }}>
              {t('birth.colloquial')}: {colloquial}
            </p>
          ) : null}
        </div>

        <div>
          <p className="label">{t('birth.modifiers')}</p>
          {modifiers.length === 0 ? (
            <p className="screen__lede" style={{ margin: 0 }}>{t('birth.noModifiers')}</p>
          ) : (
            <ul className="chips" style={{ listStyle: 'none', padding: 0 }}>
              {modifiers.map((stat) => (
                <li key={stat} className={`chip ${(species.modifiers[stat] ?? 0) > 0 ? 'chip--up' : 'chip--down'}`}>
                  {t(`stat.${stat}`)} {formatDelta(species.modifiers[stat] ?? 0)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="label">{t('birth.points')}</p>
          <p className="record-line" style={{ margin: 0 }}>{allocationPoints}</p>
        </div>

        {species.notes ? <p className="screen__lede" style={{ margin: 0 }}>{species.notes}</p> : null}
      </div>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onAcknowledge}>
          {t('birth.acknowledge')}
        </button>
      </div>
    </section>
  );
}
