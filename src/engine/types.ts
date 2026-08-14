/**
 * Core engine types.
 *
 * Sources of truth:
 *  - docs/spec/SOLID_STATE_CORE_IMPLEMENTATION_CONTRACT_v0.1.md
 *  - docs/spec/SOLID_STATE_CONTENT_SCHEMA_v0.2.md
 *  - docs/spec/SOLID_STATE_EVENT_TAXONOMY_v0.2.md
 *
 * Nothing in this file encodes balance numbers. Balance lives in
 * content/balance/*.json and is injected as data.
 */

export const VISIBLE_STATS = ['CHR', 'INT', 'STR', 'MNY', 'SPR'] as const;
export type VisibleStat = (typeof VISIBLE_STATS)[number];

export const ALL_STATS = ['CHR', 'INT', 'STR', 'MNY', 'SPR', 'FIX'] as const;
export type StatKey = (typeof ALL_STATS)[number];

export const CHANNELS = ['ORD', 'INS', 'TRN', 'SPC'] as const;
export type Channel = (typeof CHANNELS)[number];

/** Material Commitment states. Contract section 17. */
export const MATERIALS = [
  'NONE',
  'STON',
  'METL',
  'CRYS',
  'WOOD',
  'GLAS',
  'CERA',
  'SYNT',
  'TEMP',
  'MIXD',
  'ANOM',
] as const;
export type Material = (typeof MATERIALS)[number];

/** Transformation family codes. Taxonomy v0.2. Equal to the non-NONE materials. */
export const TRANSFORMATION_FAMILIES = MATERIALS.filter((m) => m !== 'NONE') as readonly Exclude<
  Material,
  'NONE'
>[];

export const SPECIES_IDS = [
  'HUMAN',
  'ELF',
  'DWARF',
  'WINGED_KIN',
  'DEMONKIN',
  'DRAGONKIN',
] as const;
export type SpeciesId = (typeof SPECIES_IDS)[number];

export const SELECTION_MODES = [
  'random',
  'scheduled_only',
  'mandatory_only',
  'climax',
  'fallback_only',
  // Content Schema v0.4. Its own fallback tier, ahead of generic fallback.
  'lore_fallback_only',
] as const;
export type SelectionMode = (typeof SELECTION_MODES)[number];

/**
 * Faction lifecycle. Faction System Spec v0.2 / Content Schema v0.4.
 *
 * A small flag-backed FSM. `NONE` is the absence of any lifecycle flag, never a
 * stored one. There is no numeric reputation, loyalty, hostility or alignment
 * value anywhere in the engine, and the condition grammar has no faction syntax.
 */
export const FACTION_LIFECYCLE_STATES = [
  'NONE',
  'CONTACTED',
  'ENGAGED',
  'COMMITTED',
  'OPTED_OUT',
  'CLOSED',
] as const;
export type FactionLifecycleState = (typeof FACTION_LIFECYCLE_STATES)[number];

/** Lifecycle states an event variant may transition *to*. `NONE` is initial only. */
export const FACTION_TRANSITION_TARGETS = [
  'CONTACTED',
  'ENGAGED',
  'COMMITTED',
  'OPTED_OUT',
  'CLOSED',
] as const satisfies readonly Exclude<FactionLifecycleState, 'NONE'>[];
export type FactionTransitionTarget = (typeof FACTION_TRANSITION_TARGETS)[number];

/** How an event relates to its factions. Metadata and validation scope only. */
export const FACTION_INTERACTIONS = ['contact', 'personal', 'climax', 'news', 'lore_fallback'] as const;
export type FactionInteraction = (typeof FACTION_INTERACTIONS)[number];

export const WEIGHT_CLASSES = ['VERY_LOW', 'LOW', 'NORMAL', 'HIGH', 'VERY_HIGH'] as const;
export type WeightClass = (typeof WEIGHT_CLASSES)[number];

export const REPEAT_POLICIES = ['once_per_run', 'repeatable'] as const;
export type RepeatPolicy = (typeof REPEAT_POLICIES)[number];

export const SCHEDULE_PRIORITIES = ['scheduled', 'mandatory', 'climax'] as const;
export type SchedulePriority = (typeof SCHEDULE_PRIORITIES)[number];

export const AWARENESS_STATES = [
  'Unconscious',
  'Suspended',
  'Intermittent',
  'Continuous',
  'Displaced',
  'Uncertain',
] as const;
export type AwarenessState = (typeof AWARENESS_STATES)[number];

/** Awareness states that require explicit authored authorization. Contract section 23. */
export const AUTHORIZATION_REQUIRED_AWARENESS: readonly AwarenessState[] = [
  'Continuous',
  'Intermittent',
  'Displaced',
];

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface LocalizedText {
  en: string;
  'zh-TW': string;
}

export interface ScheduleSpec {
  eventId: string;
  offsetYears: number;
  windowYears: number;
  priority: SchedulePriority;
  /** Content Schema v0.3. Default 0; larger wins inside a priority class. */
  priorityOrder?: number;
  validityCondition: string;
}

/**
 * Content Schema v0.4 structured faction action.
 *
 * Roles are orthogonal flags, not states, and only roles registered for the
 * faction may be added. Entering a personal-terminal state clears them all.
 */
export interface FactionTransition {
  factionId: string;
  to: Exclude<FactionLifecycleState, 'NONE'>;
  addRoles?: string[];
  removeRoles?: string[];
}

export interface EventVariant {
  when: string;
  text: LocalizedText;
  effects: Partial<Record<StatKey, number>>;
  addFlags: string[];
  removeFlags: string[];
  /** Content Schema v0.4. Applied after ordinary flags, before Material Commitment. */
  factionTransitions?: FactionTransition[];
  schedules: ScheduleSpec[];
  setMaterialCommitment?: Material;
  endingId?: string;
  endingOverrides?: Record<string, string>;
}

export interface GameEvent {
  id: string;
  channel: Channel;
  family: string;
  age: { min: number; max: number | null };
  selectionMode: SelectionMode;
  weightClass: WeightClass;
  repeatPolicy: RepeatPolicy;
  repeatCooldownYears: number;
  repeatMaxCount: number | null;
  routeTags: string[];
  materialTags: string[];
  /** Content Schema v0.3. Optional local event metadata; never a drafting layer. */
  refinementTags: string[];
  /** Content Schema v0.4. Validation/reporting scope. Never changes drafting weights. */
  factionIds: string[];
  factionInteraction?: FactionInteraction;
  include: string;
  exclude: string;
  variants: EventVariant[];
  designerNotes: string;
  /** Batch this event was loaded from. Diagnostic only. */
  sourceBatchId: string;
}

/**
 * A data-driven state trigger. H2B.1A.
 *
 * Observes ordinary run state at the end of a year and enqueues an authored
 * future event. It stores nothing and accumulates nothing — see
 * `src/engine/triggers.ts`.
 */
export interface StateTrigger {
  id: string;
  /** Condition on ordinary run state. No new grammar. */
  when: string;
  /** Optional condition that keeps the trigger quiet while it holds. */
  suppressWhile?: string;
  schedule: ScheduleSpec;
  notes?: string;
}

export interface EventBatch {
  batchId: string;
  version: string;
  languageStatus?: Record<string, string>;
  notes?: string;
  events: GameEvent[];
}

/** Species Registry v1.2 refinement hook operations. */
export type RefinementOperation = 'favor' | 'strongly_favor' | 'suppress' | 'unlock';

export interface RefinementHook {
  tag: string;
  operation: RefinementOperation;
}

export interface SpeciesDef {
  id: SpeciesId;
  name_en: string;
  name_zh_tw: string;
  colloquial_en: string;
  colloquial_zh_tw: string;
  allocation_points: number;
  modifiers: Partial<Record<VisibleStat, number>>;
  /** Broad family tendencies. Apply at the family-selection layer only. */
  familyTendencies: { primary: string[]; secondary: string[]; uncommon: string[] };
  /** Optional local event modifiers. Apply at the event-selection layer only. */
  refinementHooks: RefinementHook[];
  notes: string;
}

/** Species Registry v1.2 `refinement_tags` entry. `family` is null for MAGICAL_SEAL. */
export interface RefinementTagDef {
  tag: string;
  family: string | null;
  description: string;
}

/** Route Tag Registry v1.0 entry. */
export interface RouteTagDef {
  tag: string;
  kind: string;
  flagPrefixes: string[];
  activeEventFavor: boolean;
  allowTransformationEventFavor: boolean;
}

/**
 * Faction Registry v0.2 entry.
 *
 * Lifecycle is stored as at most one registered flag per faction; roles are
 * separate, orthogonal flags. `historyFlags` hold the legacy `FAC_*_CONTACT`
 * ever-contacted markers, which are never lifecycle state and never activate
 * route-context favor on their own.
 */
export interface FactionDef {
  id: string;
  name_en: string;
  shortName: string;
  kind: string;
  /** The Route Tag Registry tag that carries this faction's context favor. */
  routeTag: string;
  flagPrefix: string;
  historyFlags: string[];
  /** Registered flag for each lifecycle state except `NONE`. */
  lifecycleFlags: Record<Exclude<FactionLifecycleState, 'NONE'>, string>;
  /** Registered flag per allowed role. Roles may coexist. */
  roleFlags: Record<string, string>;
  allowedRoles: string[];
  intent: string;
}

/** Faction Registry v0.2 `rules`. The FSM shape is data, not code. */
export interface FactionRules {
  lifecycleStates: FactionLifecycleState[];
  initialState: FactionLifecycleState;
  /** `from -> allowed to`. Absent/empty means terminal. */
  legalTransitions: Record<string, string[]>;
  /** States for which faction route-context favor is active. */
  activeContextStates: FactionLifecycleState[];
  /** States that end ordinary personalized faction content. */
  personalTerminalStates: FactionLifecycleState[];
}

/** Talent Registry v1.1 typed drafting target, e.g. `family:COR` / `channel:SPC`. */
export interface DraftingTarget {
  kind: 'family' | 'channel';
  code: string;
}

export type TalentTrigger = 'start' | 'start_hidden' | 'threshold_once' | 'passive';

export interface TalentDef {
  id: string;
  rarity: string;
  name_en: string;
  description_en: string;
  trigger_type: TalentTrigger;
  /** Condition string for threshold_once talents; empty for others. */
  condition: string;
  /** Structured effects parsed from the registry's prose effect column. */
  effects: Partial<Record<StatKey, number>>;
  /** Talent Registry v1.1 typed drafting operations. Only these change weights. */
  draftingFavor: DraftingTarget[];
  draftingStronglyFavor: DraftingTarget[];
  draftingSuppress: DraftingTarget[];
  /** Structured semantics, never automatic multipliers. */
  unlockTags: string[];
  redirectTags: string[];
  narrativeTags: string[];
  /** Q-15: canonical registered-species rule. */
  registeredSpeciesRule: 'UNREGISTERED' | 'SEEDED_OTHER_SPECIES' | null;
  /** Q-14 remains open: blank in canonical data, supplied by diagnostics only. */
  startFixBonus: number | null;
  /** Raw registry columns, retained verbatim for traceability. */
  raw: {
    visible_effects: string;
    hidden_effects: string;
    channel_hooks: string;
    family_hooks: string;
    designer_notes: string;
  };
  incompatibleWith: string[];
}

export interface EndingDef {
  id: string;
  primaryFamily: string;
  title_en: string;
  description_en: string;
  coreRoutes: string[];
  allowedMaterials: string;
  typicalForms: string[];
  /** Ending Registry v1.1 structured awareness fields. No prose parsing. */
  defaultAwareness: AwarenessState;
  awarenessIfTemporal: AwarenessState | null;
  allowedAwarenessStates: AwarenessState[];
  authorizationRequiredStates: AwarenessState[];
  authorizingTalents: string[];
  legalStatus: string;
  ownership: string;
  autonomy: string;
  conversionConsent: string;
  typicalLocation: string;
  socialMeaning: string;
  discoveryClass: string;
  hidden: boolean;
  designerNotes: string;
}

// ---------------------------------------------------------------------------
// Run state
// ---------------------------------------------------------------------------

export interface EventOccurrence {
  /** Age at which the event was resolved. */
  age: number;
  eventId: string;
  variantIndex: number;
  channel: Channel;
  family: string;
  selectionMode: SelectionMode;
  /** How this event won the year. */
  source: 'normal' | 'fallback' | 'lore_fallback' | SchedulePriority;
  textEn: string;
}

export interface PendingSchedule {
  /** Monotonic creation sequence, used as the authored-order tiebreak. */
  seq: number;
  eventId: string;
  earliestAge: number;
  latestAge: number;
  priority: SchedulePriority;
  /** Content Schema v0.3. Larger wins inside a priority class. */
  priorityOrder: number;
  validityCondition: string;
  createdAtAge: number;
  createdByEventId: string;
}

export interface RepeatRecord {
  count: number;
  lastAge: number;
}

export interface EndingRecord {
  endingId: string;
  title_en: string;
  endingAge: number;
  species: SpeciesId;
  registeredSpecies: string;
  primaryMaterial: Material;
  priorMaterials: Material[];
  form: string;
  awareness: AwarenessState;
  awarenessAuthorized: boolean;
  integrity: string;
  legalStatus: string;
  ownership: string;
  autonomy: string;
  conversionConsent: string;
  location: string;
  socialMeaning: string;
  /** Event that produced the ending. */
  sourceEventId: string;
  sourceVariantIndex: number;
}

export interface RunSetup {
  seed: string;
  species: SpeciesId;
  /** The 10 drafted talent IDs, in draft order. */
  draftedTalents: string[];
  /** The 3 chosen talent IDs. */
  chosenTalents: string[];
  /** Pre-modifier visible attribute allocation. */
  allocation: Record<VisibleStat, number>;
  /** Completed prior-run event IDs visible to AEVT. */
  priorRunEventIds: string[];
  /** Number of completed prior runs; exposed to conditions as TMS. */
  reincarnationCount: number;
  /** Achievement IDs unlocked before this run; exposed as ACH[id]. */
  achievements: string[];
}

export interface RunState {
  age: number;
  stats: Record<StatKey, number>;
  species: SpeciesId;
  registeredSpecies: string;
  material: Material;
  priorMaterials: Material[];
  flags: Set<string>;
  talents: Set<string>;
  /** threshold_once talents that have fired. */
  triggeredTalents: Set<string>;
  /** threshold_once talents still dormant. */
  dormantTalents: Set<string>;
  history: EventOccurrence[];
  eventIdsThisRun: Set<string>;
  priorRunEventIds: Set<string>;
  achievements: Set<string>;
  reincarnationCount: number;
  repeats: Map<string, RepeatRecord>;
  schedules: PendingSchedule[];
  scheduleSeq: number;
  ending: EndingRecord | null;
  /** Diagnostic counters, not gameplay state. */
  diagnostics: RunDiagnostics;
}

/** One applied faction lifecycle transition, for diagnostics and tracing. */
export interface FactionTransitionRecord {
  age: number;
  factionId: string;
  from: FactionLifecycleState;
  to: FactionLifecycleState;
  addedRoles: string[];
  removedRoles: string[];
  eventId: string;
}

export interface RunDiagnostics {
  fallbackYears: number[];
  /**
   * Years resolved by a `lore_fallback_only` bulletin. Reported separately from
   * `fallbackYears`: lore fallback is world texture, not a claim that the
   * generic quiet-year problem is solved (Q-23/Q-30).
   */
  loreFallbackYears: number[];
  factionTransitions: FactionTransitionRecord[];
  /**
   * Transitions content asked for that the registry forbids. Must stay empty:
   * the engine refuses them rather than applying them.
   */
  illegalFactionTransitions: { age: number; factionId: string; from: string; to: string; eventId: string }[];
  /**
   * Ordinary personalized faction events that fired while that faction was
   * already OPTED_OUT or CLOSED. Must stay empty — a safe exit is meant to hold.
   */
  personalEventsAfterExit: { age: number; factionId: string; state: string; eventId: string }[];
  /** Ages where more than one priority candidate was available. */
  priorityCollisionAges: number[];
  /** Schedules that lost a year to a higher-ranked candidate. */
  displacementCount: number;
  /** Schedules dropped because their window closed. */
  expiredSchedules: { eventId: string; age: number; reason: 'window_closed' }[];
  /** Ages where the normal pool was empty before age 25 (content coverage defect). */
  coverageDefectAges: number[];
  /** Ages rescued by the diagnostic pre-25 baseline reuse policy, if enabled. */
  emergencyReuseAges: number[];
  talentActivations: { talentId: string; age: number }[];
  /** Schedules created by a data-driven state trigger rather than by an event. */
  stateTriggerFirings: { triggerId: string; age: number; eventId: string }[];
  firstManifestationFamily: string | null;
  firstManifestationAge: number | null;
  manifestationFamilies: string[];
  firstHintFamily: string | null;
  firstHintAge: number | null;
  hintFamilies: string[];
  commitmentAge: number | null;
  /** FIX immediately after the committing event resolved. */
  fixAtCommitment: number | null;
  routeEntries: string[];
  routeClimaxes: string[];
}

export type RunOutcome =
  | { kind: 'ended'; state: RunState; ending: EndingRecord }
  | { kind: 'nonterminal'; state: RunState; reachedAge: number }
  | { kind: 'coverage_error'; state: RunState; age: number; message: string };
