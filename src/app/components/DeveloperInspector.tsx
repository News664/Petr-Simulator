import { useRef, useState } from 'react';

import type { PlaybackFrame } from '../../engine/playback.js';
import { useI18n } from '../i18n/index.js';
import { parseReproductionRecord, ReproductionMismatchError, type H2AReproductionRecord } from '../reproduction.js';

interface DeveloperInspectorProps {
  open: boolean;
  seed: string | null;
  contentVersion: string;
  frame: PlaybackFrame | null;
  /** Only set once the ending frame has actually been revealed. */
  endingSourceEventId: string | null;
  canStep: boolean;
  notice: string | null;
  onClose: () => void;
  onStep: () => void;
  onExport: () => H2AReproductionRecord | null;
  onImport: (record: H2AReproductionRecord) => void;
  onNotice: (notice: string | null) => void;
}

function list(values: readonly string[], empty: string): string {
  return values.length === 0 ? empty : values.join(', ');
}

/**
 * Developer inspector.
 *
 * Reads the **currently revealed frame** and nothing else — so it cannot leak the
 * unrevealed future into a paused view, which is the whole reason the frames are
 * captured immutably. It offers no gameplay choices; the single-frame step is a
 * reveal control, not a decision.
 */
export function DeveloperInspector({
  open,
  seed,
  contentVersion,
  frame,
  endingSourceEventId,
  canStep,
  notice,
  onClose,
  onStep,
  onExport,
  onImport,
  onNotice,
}: DeveloperInspectorProps) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exported, setExported] = useState<string | null>(null);

  if (!open) return null;
  const none = t('dev.none');
  const dev = frame?.dev ?? null;

  const factionSummary = dev
    ? Object.entries(dev.factionStates)
        .filter(([, state]) => state !== 'NONE')
        .map(([name, state]) => {
          const roles = dev.factionRoles[name] ?? [];
          return roles.length > 0 ? `${name}: ${state} (${roles.join('+')})` : `${name}: ${state}`;
        })
    : [];

  return (
    <aside className="inspector" aria-label={t('dev.title')}>
      <div className="inspector__head">
        <strong className="label">{t('dev.title')}</strong>
        <button type="button" className="btn btn--quiet" onClick={onClose}>
          {t('dev.close')}
        </button>
      </div>

      <dl className="definition">
        <dt>{t('dev.seed')}</dt>
        <dd>{seed ?? none}</dd>
        <dt>{t('dev.fingerprint')}</dt>
        <dd>{contentVersion}</dd>
        <dt>{t('dev.event')}</dt>
        <dd>{frame ? frame.occurrence.eventId : none}</dd>
        <dt>{t('dev.variant')}</dt>
        <dd>
          {frame
            ? `${frame.occurrence.variantIndex} · ${frame.occurrence.channel}/${frame.occurrence.family} · ${frame.occurrence.source}`
            : none}
        </dd>
        <dt>{t('dev.fix')}</dt>
        <dd>{dev ? dev.fix : none}</dd>
        <dt>{t('dev.material')}</dt>
        <dd>{frame ? frame.materialAfter : none}</dd>
        <dt>{t('dev.priorMaterials')}</dt>
        <dd>{dev ? list(dev.priorMaterials, none) : none}</dd>
        <dt>{t('dev.registeredSpecies')}</dt>
        <dd>{dev ? dev.registeredSpecies : none}</dd>
        <dt>{t('dev.routeFlags')}</dt>
        <dd>{dev ? list(dev.routeFlags, none) : none}</dd>
        <dt>{t('dev.factions')}</dt>
        <dd>{list(factionSummary, none)}</dd>
        <dt>{t('dev.schedules')}</dt>
        <dd>
          {dev && dev.schedules.length > 0
            ? dev.schedules
                .map((s) => `${s.eventId} [${s.earliestAge}-${s.latestAge}] ${s.priority}/${s.priorityOrder}`)
                .join(' · ')
            : none}
        </dd>
        <dt>{t('dev.flags')}</dt>
        <dd>{dev ? list(dev.flags, none) : none}</dd>
        <dt>{t('dev.endingSource')}</dt>
        <dd>{endingSourceEventId ?? none}</dd>
      </dl>

      <div className="actions">
        <button type="button" className="btn" disabled={!canStep} onClick={onStep}>
          {t('dev.stepFrame')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const record = onExport();
            setExported(record ? JSON.stringify(record, null, 2) : null);
          }}
        >
          {t('dev.export')}
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          {t('dev.import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          aria-label={t('dev.import')}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void file.text().then((raw) => {
              try {
                onImport(parseReproductionRecord(raw, contentVersion));
                onNotice(t('dev.importOk'));
              } catch (error) {
                onNotice(
                  error instanceof ReproductionMismatchError
                    ? t('dev.importMismatch')
                    : `Refused: ${(error as Error).message}`,
                );
              }
            });
          }}
        />
      </div>

      {notice ? <p className="notice" role="status">{notice}</p> : null}
      {exported ? (
        <textarea
          className="record-line"
          readOnly
          rows={10}
          style={{ width: '100%', marginTop: 'var(--space-4)', background: 'var(--bg)', color: 'var(--text-muted)' }}
          value={exported}
          aria-label={t('dev.export')}
        />
      ) : null}
    </aside>
  );
}
