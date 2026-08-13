import { useState } from 'react';

import { useI18n } from '../i18n/index.js';

interface LandingProps {
  devMode: boolean;
  canResume: boolean;
  incompatibleSave: string | null;
  onBegin: (seed: string | null) => void;
  onResume: () => void;
}

/**
 * Landing — the record system's front desk.
 *
 * `CONTINUE RECORD` appears only when a compatible save exists. A save filed
 * under different content is reported as an incompatibility rather than replayed,
 * because the same seed would now produce a different life.
 */
export function Landing({ devMode, canResume, incompatibleSave, onBegin, onResume }: LandingProps) {
  const { t } = useI18n();
  const [seedInput, setSeedInput] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <section className="landing">
      <h1 className="landing__title">{t('app.title')}</h1>
      <p className="landing__subline">{t('app.subtitle')}</p>
      <p className="header__system">{t('app.system')}</p>

      {incompatibleSave ? <p className="notice">{t('landing.incompatible')}</p> : null}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={() => onBegin(seedInput.trim() || null)}>
          {t('landing.begin')}
        </button>
        {canResume ? (
          <button type="button" className="btn" onClick={onResume}>
            {t('landing.continue')}
          </button>
        ) : null}
        <button type="button" className="btn btn--quiet" onClick={() => setAboutOpen((open) => !open)}>
          {t('landing.about')}
        </button>
      </div>

      {aboutOpen ? <p className="notice" style={{ marginTop: 'var(--space-5)' }}>{t('landing.aboutBody')}</p> : null}

      {devMode ? (
        <div className="landing__dev panel">
          <div className="field">
            <label className="label" htmlFor="dev-seed">
              {t('landing.devSeedLabel')}
            </label>
            <input
              id="dev-seed"
              value={seedInput}
              placeholder={t('landing.devSeedPlaceholder')}
              onChange={(event) => setSeedInput(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
