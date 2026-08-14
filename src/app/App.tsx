import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactElement } from 'react';

import { computePlayback } from '../engine/playback.js';
import { previewPlayerSetup } from '../engine/preview.js';
import type { SetupPolicy } from '../engine/setup.js';
import { browserContent, CONTENT_VERSION } from './content.js';
import { DeveloperInspector } from './components/DeveloperInspector.js';
import { I18nContext, translate, type Locale } from './i18n/index.js';
import { toReproductionRecord, type H2AReproductionRecord } from './reproduction.js';
import { BirthRegistration } from './screens/BirthRegistration.js';
import { EndingScreen } from './screens/EndingScreen.js';
import { InitialAssessment } from './screens/InitialAssessment.js';
import { Landing } from './screens/Landing.js';
import { LifeReview } from './screens/LifeReview.js';
import { OpenRecord } from './screens/OpenRecord.js';
import { Playback } from './screens/Playback.js';
import { RecordSummary } from './screens/RecordSummary.js';
import { TalentSelection } from './screens/TalentSelection.js';
import { createSeed } from './seed.js';
import { INTERVAL_MS } from './tokens.js';
import {
  initialState,
  isPlaybackComplete,
  reducer,
  remainingPoints,
  revealedFrame,
  revealedFrames,
  type AppState,
  type Speed,
} from './state/reducer.js';
import { clearSession, loadSession, saveSession, type StoredPhase } from './storage.js';

function isDevMode(): boolean {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1') {
    return true;
  }
  return Boolean(import.meta.env?.DEV);
}

/** The setup policy a player run always uses. Headless policies are untouched. */
function playerPolicy(state: AppState): SetupPolicy {
  return {
    species: { kind: 'seeded_random' },
    talents: { kind: 'fixed', talents: state.chosenTalents },
    allocation: { kind: 'explicit', allocation: state.allocation },
  };
}

const PHASE_TO_STORED: Record<AppState['phase'], StoredPhase | null> = {
  landing: null,
  birth: 'birth',
  talents: 'talents',
  allocation: 'allocation',
  review: 'review',
  playback: 'playback',
  result: 'result',
  'life-review': 'life-review',
};

export function App() {
  const devMode = useMemo(isDevMode, []);
  const [state, dispatch] = useReducer(reducer, initialState(CONTENT_VERSION, devMode));
  const restored = useRef(false);

  const i18n = useMemo(
    () => ({
      locale: state.locale as Locale,
      t: (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
        translate(state.locale, key, params),
    }),
    [state.locale],
  );

  const beginLife = useCallback(
    (next: AppState, revealTo: number, paused: boolean, speed: Speed) => {
      if (!next.seed) return;
      const life = computePlayback(next.seed, browserContent, playerPolicy(next));
      dispatch({ type: 'begin-life', life });
      // Restoring a saved position replays reveals instantly; the frames were
      // already computed once, so this touches no RNG.
      for (let i = 0; i <= revealTo && i < life.frames.length; i++) dispatch({ type: 'reveal-next' });
      dispatch({ type: 'set-speed', speed });
      dispatch({ type: 'set-paused', paused });
    },
    [],
  );

  // --- restore a stored session once ---------------------------------------
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const loaded = loadSession(CONTENT_VERSION);
    if (loaded.kind === 'incompatible') {
      dispatch({ type: 'set-incompatible-save', storedContentVersion: loaded.storedContentVersion });
      clearSession();
      return;
    }
    if (loaded.kind === 'ok') dispatch({ type: 'set-resumable', seed: loaded.session.seed });
  }, []);

  const resume = useCallback(() => {
    const loaded = loadSession(CONTENT_VERSION);
    if (loaded.kind !== 'ok') return;
    const session = loaded.session;
    const preview = previewPlayerSetup(session.seed, browserContent);
    const next: AppState = {
      ...initialState(CONTENT_VERSION, devMode, session.locale),
      seed: session.seed,
      preview,
      chosenTalents: session.chosenTalents,
      allocation: session.allocation ?? initialState(CONTENT_VERSION, devMode).allocation,
      phase: session.phase === 'result' || session.phase === 'life-review' ? 'playback' : session.phase,
      speed: session.speed,
      paused: session.paused,
    };
    dispatch({ type: 'restore', state: next });
    if (session.phase === 'playback' || session.phase === 'result' || session.phase === 'life-review') {
      beginLife(next, session.revealedFrameIndex, session.paused, session.speed);
      // A saved review is restored as the static complete timeline, not as a
      // replayed animation.
      if (session.phase === 'result') dispatch({ type: 'finish-playback' });
      if (session.phase === 'life-review') dispatch({ type: 'open-life-review' });
    }
  }, [beginLife, devMode]);

  // --- persist ---------------------------------------------------------------
  useEffect(() => {
    const phase = PHASE_TO_STORED[state.phase];
    if (!phase || !state.seed) return;
    saveSession({
      storageVersion: 1,
      contentVersion: state.contentVersion,
      seed: state.seed,
      phase,
      chosenTalents: state.chosenTalents,
      allocation: state.allocation,
      revealedFrameIndex: state.revealedFrameIndex,
      speed: state.speed,
      paused: state.paused,
      locale: state.locale,
    });
  }, [state]);

  // --- reveal timer ----------------------------------------------------------
  useEffect(() => {
    if (state.phase !== 'playback' || state.paused || !state.life) return;
    if (isPlaybackComplete(state)) {
      dispatch({ type: 'finish-playback' });
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: 'reveal-next' }), INTERVAL_MS[state.speed]);
    return () => window.clearTimeout(timer);
  }, [state]);

  const frame = revealedFrame(state);
  const frames = revealedFrames(state);
  const speciesDef = state.preview ? browserContent.species.get(state.preview.species) ?? null : null;

  const exportRecord = useCallback((): H2AReproductionRecord | null => {
    return state.life ? toReproductionRecord(state.life) : null;
  }, [state.life]);

  const importRecord = useCallback(
    (record: H2AReproductionRecord) => {
      const preview = previewPlayerSetup(record.seed, browserContent);
      const next: AppState = {
        ...initialState(CONTENT_VERSION, devMode, state.locale),
        devInspectorOpen: true,
        seed: record.seed,
        preview,
        chosenTalents: record.chosenTalents,
        allocation: record.allocation,
        phase: 'playback',
      };
      dispatch({ type: 'restore', state: next });
      beginLife(next, -1, true, state.speed);
    },
    [beginLife, devMode, state.locale, state.speed],
  );

  const startSetup = useCallback((explicitSeed: string | null) => {
    const seed = explicitSeed && explicitSeed.length > 0 ? explicitSeed : createSeed();
    dispatch({ type: 'begin-setup', seed, preview: previewPlayerSetup(seed, browserContent) });
  }, []);

  // Review reuses the computed frames; it never re-enters the animated path.
  const reviewLife = useCallback(() => dispatch({ type: 'open-life-review' }), []);

  const newLife = useCallback(() => {
    clearSession();
    dispatch({ type: 'new-life' });
  }, []);

  let screen: ReactElement | null = null;
  if (state.phase === 'landing' || !state.preview || !speciesDef || !state.seed) {
    screen = (
      <Landing
        devMode={devMode}
        canResume={state.resumableSeed !== null}
        incompatibleSave={state.incompatibleSave}
        onBegin={startSetup}
        onResume={resume}
      />
    );
  } else if (state.phase === 'birth') {
    screen = (
      <BirthRegistration
        species={speciesDef}
        allocationPoints={state.preview.allocationPoints}
        onAcknowledge={() => dispatch({ type: 'acknowledge-birth' })}
      />
    );
  } else if (state.phase === 'talents') {
    screen = (
      <TalentSelection
        content={browserContent}
        drafted={state.preview.draftedTalents}
        chosen={state.chosenTalents}
        choiceSize={state.preview.talentChoiceSize}
        onToggle={(talentId) => dispatch({ type: 'toggle-talent', talentId, content: browserContent })}
        onContinue={() => dispatch({ type: 'continue-to-allocation' })}
        onBack={() => dispatch({ type: 'back' })}
      />
    );
  } else if (state.phase === 'allocation') {
    screen = (
      <InitialAssessment
        content={browserContent}
        species={speciesDef}
        allocation={state.allocation}
        remaining={remainingPoints(state)}
        chosenTalents={state.chosenTalents}
        onAdjust={(stat, delta) => dispatch({ type: 'adjust-stat', stat, delta })}
        onReset={() => dispatch({ type: 'reset-allocation' })}
        onReview={() => dispatch({ type: 'continue-to-review' })}
        onBack={() => dispatch({ type: 'back' })}
      />
    );
  } else if (state.phase === 'review') {
    screen = (
      <RecordSummary
        content={browserContent}
        species={speciesDef}
        chosenTalents={state.chosenTalents}
        allocation={state.allocation}
        seed={state.seed}
        onBegin={() => beginLife(state, -1, false, state.speed)}
        onBack={() => dispatch({ type: 'back' })}
      />
    );
  } else if (state.phase === 'playback') {
    screen = (
      <Playback
        content={browserContent}
        species={speciesDef}
        frames={frames}
        paused={state.paused}
        speed={state.speed}
        onTogglePause={() => dispatch({ type: 'set-paused', paused: !state.paused })}
        onSetSpeed={(speed) => dispatch({ type: 'set-speed', speed })}
      />
    );
  } else if (state.phase === 'life-review' && state.life) {
    screen = (
      <LifeReview
        content={browserContent}
        frames={frames}
        onBackToOutcome={() => dispatch({ type: 'back-to-outcome' })}
      />
    );
  } else if (state.phase === 'result' && state.life) {
    const outcome = state.life.outcome;
    screen =
      outcome.kind === 'ended' ? (
        <EndingScreen
          content={browserContent}
          ending={outcome.ending}
          seed={state.seed}
          contentVersion={state.contentVersion}
          onNewLife={newLife}
          onReviewLife={reviewLife}
        />
      ) : outcome.kind === 'nonterminal' ? (
        <OpenRecord
          reachedAge={outcome.reachedAge}
          devMode={devMode}
          seed={state.seed}
          onNewLife={newLife}
          onReviewLife={reviewLife}
        />
      ) : (
        <section>
          <p className="notice-strip">{i18n.t('coverage.heading')}</p>
          <p className="screen__lede">{i18n.t('coverage.body')}</p>
          <div className="actions">
            <button type="button" className="btn btn--primary" onClick={newLife}>
              {i18n.t('ending.newLife')}
            </button>
          </div>
        </section>
      );
  }

  // The inspector may only name the ending source once its frame is revealed.
  const endingSource = frame?.endingAfter?.sourceEventId ?? null;

  return (
    <I18nContext.Provider value={i18n}>
      <div className="app">
        <header className="header">
          <div className="header__inner">
            <h1 className="header__title">{i18n.t('app.title')}</h1>
            <span className="header__system">{i18n.t('app.system')}</span>
            <span className="header__spacer" />
            {devMode ? <span className="badge-dev">{i18n.t('app.dev')}</span> : null}
          </div>
        </header>

        <main className="main">{screen}</main>

        <footer className="footer">{i18n.t('app.footer')}</footer>

        {devMode ? (
          <>
            {!state.devInspectorOpen ? (
              <button
                type="button"
                className="btn inspector__toggle"
                onClick={() => dispatch({ type: 'toggle-inspector' })}
              >
                {i18n.t('dev.open')}
              </button>
            ) : null}
            <DeveloperInspector
              open={state.devInspectorOpen}
              seed={state.seed}
              contentVersion={state.contentVersion}
              frame={frame}
              endingSourceEventId={endingSource}
              canStep={state.paused && state.phase === 'playback' && !isPlaybackComplete(state)}
              notice={state.devNotice}
              onClose={() => dispatch({ type: 'toggle-inspector' })}
              onStep={() => dispatch({ type: 'reveal-next' })}
              onExport={exportRecord}
              onImport={importRecord}
              onNotice={(notice) => dispatch({ type: 'set-dev-notice', notice })}
            />
          </>
        ) : null}
      </div>
    </I18nContext.Provider>
  );
}
