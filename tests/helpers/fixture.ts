import { normalizeAdapters, type BalanceAdapters, type BalanceConstants } from '../../src/engine/content/balance.js';
import { loadDefaultContent, type ContentBundle } from '../../src/engine/content/load.js';
import type { EventBatch, EventVariant, GameEvent } from '../../src/engine/types.js';

/**
 * Synthetic content fixtures.
 *
 * The canonical 106-event slice does not exercise every contract behaviour
 * (there are no `mandatory_only` events, no AEVT/ACH/TMS conditions, and no
 * isolated MIXD transition path). These helpers build a minimal in-memory
 * bundle so those rules can be tested without touching canonical content.
 */

export function variant(overrides: Partial<EventVariant> = {}): EventVariant {
  return {
    when: 'TRUE',
    text: { en: 'fixture text', 'zh-TW': '' },
    effects: {},
    addFlags: [],
    removeFlags: [],
    schedules: [],
    ...overrides,
  };
}

export function event(overrides: Partial<GameEvent> & Pick<GameEvent, 'id'>): GameEvent {
  return {
    channel: 'ORD',
    family: 'GEN',
    age: { min: 0, max: null },
    selectionMode: 'random',
    weightClass: 'NORMAL',
    repeatPolicy: 'repeatable',
    repeatCooldownYears: 0,
    repeatMaxCount: null,
    routeTags: [],
    materialTags: [],
    refinementTags: [],
    factionIds: [],
    include: 'TRUE',
    exclude: 'FALSE',
    variants: [variant()],
    designerNotes: 'fixture',
    sourceBatchId: 'FIXTURE',
    ...overrides,
  };
}

export interface FixtureOptions {
  events: GameEvent[];
  /** Deep-merged over the canonical balance constants. */
  balance?: Partial<BalanceConstants>;
  /** Deep-merged over the canonical adapters (diagnostics only in Phase 1.1). */
  adapters?: Partial<BalanceAdapters>;
}

/**
 * Builds a ContentBundle from synthetic events, reusing the real registries and
 * balance data so fixtures stay consistent with production behaviour.
 */
export function fixtureContent(options: FixtureOptions): ContentBundle {
  const base = loadDefaultContent();
  const events = options.events;
  const batch: EventBatch = {
    batchId: 'FIXTURE',
    version: '0',
    notes: 'synthetic test fixture',
    events,
  };

  const balance: BalanceConstants = { ...base.balance, ...options.balance };
  const adapters: BalanceAdapters = normalizeAdapters({
    ...base.adapters,
    ...options.adapters,
    talentDiagnostics: base.adapters.talentDiagnostics,
  } as never);

  return {
    ...base,
    batches: [batch],
    events,
    eventsById: new Map(events.map((e) => [e.id, e])),
    balance,
    adapters,
    contentVersion: `fixture:${events.map((e) => e.id).join(',')}`,
    sourceFiles: [],
  };
}

/** A one-event world: every year resolves the same repeatable filler event. */
export function fillerEvent(id = 'EVT-ORD-GEN-9000'): GameEvent {
  return event({ id, repeatPolicy: 'repeatable', repeatCooldownYears: 0, repeatMaxCount: null });
}
