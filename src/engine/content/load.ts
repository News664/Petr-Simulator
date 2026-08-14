import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCondition } from '../conditions/parser.js';
import { satisfiableAfterExit } from '../factions.js';
import {
  AWARENESS_STATES,
  CHANNELS,
  MATERIALS,
  TRANSFORMATION_FAMILIES,
  type AwarenessState,
  type DraftingTarget,
  type EndingDef,
  type EventBatch,
  type FactionDef,
  type FactionLifecycleState,
  type FactionRules,
  type GameEvent,
  type Material,
  type RefinementTagDef,
  type RouteTagDef,
  type SpeciesDef,
  type SpeciesId,
  type TalentDef,
  type TalentTrigger,
} from '../types.js';
import {
  balanceAdaptersSchema,
  balanceConstantsSchema,
  normalizeAdapters,
  type BalanceAdapters,
  type BalanceConstants,
} from './balance.js';
import { parseCsvRecords } from './csv.js';
import {
  eventBatchSchema,
  factionRegistrySchema,
  routeTagRegistrySchema,
  speciesRegistrySchema,
  TALENT_ID_RE,
} from './schema.js';
import { normalizeTalentCondition, parseTalentEffects } from './talentEffects.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
export const CONTENT_ROOT = path.join(REPO_ROOT, 'content');

export interface ContentPaths {
  eventsDir: string;
  speciesRegistry: string;
  talentRegistry: string;
  endingRegistry: string;
  routeTagRegistry: string;
  factionRegistry: string;
  balanceConstants: string;
  balanceAdapters: string;
}

/** Phase 1.1 canonical paths. Superseded registries live in content/superseded/. */
export function defaultContentPaths(root: string = CONTENT_ROOT): ContentPaths {
  return {
    eventsDir: path.join(root, 'events'),
    speciesRegistry: path.join(root, 'registries', 'SOLID_STATE_SPECIES_REGISTRY_v1.2.json'),
    talentRegistry: path.join(root, 'registries', 'SOLID_STATE_TALENT_REGISTRY_v1.2.csv'),
    endingRegistry: path.join(root, 'registries', 'SOLID_STATE_ENDING_REGISTRY_v1.2.csv'),
    routeTagRegistry: path.join(root, 'registries', 'SOLID_STATE_ROUTE_TAG_REGISTRY_v1.2.json'),
    factionRegistry: path.join(root, 'registries', 'SOLID_STATE_FACTION_REGISTRY_v0.2.json'),
    balanceConstants: path.join(root, 'balance', 'SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.2.json'),
    balanceAdapters: path.join(root, 'balance', 'SOLID_STATE_BALANCE_ADAPTERS_PROVISIONAL_v0.1.json'),
  };
}

export class ContentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`content validation failed with ${issues.length} issue(s):\n  - ${issues.join('\n  - ')}`);
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

export interface SpeciesTendencies {
  primary: Set<string>;
  secondary: Set<string>;
  uncommon: Set<string>;
}

export interface ContentBundle {
  batches: EventBatch[];
  events: GameEvent[];
  eventsById: Map<string, GameEvent>;
  species: Map<SpeciesId, SpeciesDef>;
  /** Broad family tendencies as sets, for the family-selection layer. */
  speciesFamilyTendencies: Map<SpeciesId, SpeciesTendencies>;
  /** Species Registry v1.2 refinement tag catalogue. */
  refinementTags: Map<string, RefinementTagDef>;
  /** Route Tag Registry v1.2. */
  routeTags: Map<string, RouteTagDef>;
  /** Faction Registry v0.2. Flag-backed lifecycle FSM plus orthogonal roles. */
  factions: Map<string, FactionDef>;
  /** Faction Registry v0.2 `rules`: the FSM shape, as data. */
  factionRules: FactionRules;
  talents: Map<string, TalentDef>;
  endings: Map<string, EndingDef>;
  balance: BalanceConstants;
  adapters: BalanceAdapters;
  /** Content fingerprint: identical content + seed must produce identical runs. */
  contentVersion: string;
  sourceFiles: { path: string; sha256: string }[];
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Individual loaders
// ---------------------------------------------------------------------------

function loadEventBatches(dir: string, issues: string[], files: { path: string; sha256: string }[]): EventBatch[] {
  const names = readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .sort();
  if (names.length === 0) issues.push(`no event batch JSON found in ${dir}`);
  const batches: EventBatch[] = [];
  for (const name of names) {
    const full = path.join(dir, name);
    const text = readFileSync(full, 'utf8');
    files.push({ path: path.relative(REPO_ROOT, full), sha256: sha256(text) });
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (error) {
      issues.push(`${name}: invalid JSON — ${(error as Error).message}`);
      continue;
    }
    const parsed = eventBatchSchema.safeParse(json);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push(`${name}: ${issue.path.join('.')} ${issue.message}`);
      }
      continue;
    }
    const batch: EventBatch = {
      batchId: parsed.data.batchId,
      version: parsed.data.version,
      languageStatus: parsed.data.languageStatus,
      notes: parsed.data.notes,
      events: parsed.data.events.map(
        (event) =>
          ({
            ...event,
            refinementTags: event.refinementTags ?? [],
            factionIds: event.factionIds ?? [],
            sourceBatchId: parsed.data.batchId,
          }) as GameEvent,
      ),
    };
    batches.push(batch);
  }
  return batches;
}

function loadSpecies(
  file: string,
  issues: string[],
  files: { path: string; sha256: string }[],
): Map<SpeciesId, SpeciesDef> {
  const text = readFileSync(file, 'utf8');
  files.push({ path: path.relative(REPO_ROOT, file), sha256: sha256(text) });
  const parsed = speciesRegistrySchema.safeParse(JSON.parse(text));
  const map = new Map<SpeciesId, SpeciesDef>();
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push(`species registry: ${issue.path.join('.')} ${issue.message}`);
    }
    return map;
  }
  const knownRefinementTags = new Set(Object.keys(parsed.data.refinement_tags));
  for (const entry of parsed.data.species) {
    if (map.has(entry.id)) issues.push(`species registry: duplicate species id ${entry.id}`);
    // Family tendencies must be transformation family codes (Species Registry v1.2).
    for (const [tier, families] of Object.entries(entry.family_tendencies)) {
      for (const family of families) {
        if (!TRANSFORMATION_FAMILY_SET.has(family)) {
          issues.push(`species ${entry.id}: ${tier} family tendency ${family} is not a transformation family code`);
        }
      }
    }
    for (const hook of entry.refinement_hooks) {
      if (!knownRefinementTags.has(hook.tag)) {
        issues.push(`species ${entry.id}: refinement hook ${hook.tag} is not in refinement_tags`);
      }
    }
    map.set(entry.id, {
      id: entry.id,
      name_en: entry.name_en,
      name_zh_tw: entry.name_zh_tw,
      colloquial_en: entry.colloquial_en,
      colloquial_zh_tw: entry.colloquial_zh_tw,
      allocation_points: entry.allocation_points,
      modifiers: entry.modifiers,
      familyTendencies: entry.family_tendencies,
      refinementHooks: entry.refinement_hooks,
      notes: entry.notes,
    });
  }
  return map;
}

/** Species Registry v1.2 `refinement_tags`. */
function loadRefinementTags(
  file: string,
  issues: string[],
): Map<string, RefinementTagDef> {
  const parsed = speciesRegistrySchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
  const map = new Map<string, RefinementTagDef>();
  if (!parsed.success) return map;
  for (const [tag, def] of Object.entries(parsed.data.refinement_tags)) {
    if (def.family !== null && !TRANSFORMATION_FAMILY_SET.has(def.family)) {
      issues.push(`refinement tag ${tag}: family ${def.family} is not a transformation family code`);
    }
    map.set(tag, { tag, family: def.family, description: def.description });
  }
  return map;
}

/** Faction Registry v0.2: flag-backed lifecycle FSM plus orthogonal role flags. */
function loadFactions(
  file: string,
  issues: string[],
  files: { path: string; sha256: string }[],
): { factions: Map<string, FactionDef>; rules: FactionRules | null } {
  const text = readFileSync(file, 'utf8');
  files.push({ path: path.relative(REPO_ROOT, file), sha256: sha256(text) });
  const parsed = factionRegistrySchema.safeParse(JSON.parse(text));
  const map = new Map<string, FactionDef>();
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push(`faction registry: ${issue.path.join('.')} ${issue.message}`);
    }
    return { factions: map, rules: null };
  }
  const raw = parsed.data.rules;
  const rules: FactionRules = {
    lifecycleStates: raw.lifecycleStates,
    initialState: raw.initialState,
    legalTransitions: raw.legalTransitions as Record<string, string[]>,
    activeContextStates: raw.activeContextStates,
    personalTerminalStates: raw.personalTerminalStates,
  };

  const seenPrefix = new Set<string>();
  const seenTag = new Set<string>();
  const flagOwner = new Map<string, string>();
  for (const entry of parsed.data.factions) {
    if (map.has(entry.id)) {
      issues.push(`faction registry: duplicate faction id ${entry.id}`);
      continue;
    }
    if (seenPrefix.has(entry.flagPrefix)) {
      issues.push(`faction registry: flag prefix ${entry.flagPrefix} is claimed by more than one faction`);
    }
    seenPrefix.add(entry.flagPrefix);
    if (seenTag.has(entry.routeTag)) {
      issues.push(`faction registry: routeTag ${entry.routeTag} is claimed by more than one faction`);
    }
    seenTag.add(entry.routeTag);

    // Every registered flag must be inside this faction's own namespace and
    // must not be claimed by another faction.
    const own = [...entry.historyFlags, ...Object.values(entry.lifecycleFlags), ...Object.values(entry.roleFlags)];
    for (const flag of own) {
      if (!flag.startsWith(entry.flagPrefix)) {
        issues.push(`faction ${entry.id}: flag ${flag} does not start with its own prefix ${entry.flagPrefix}`);
      }
      const owner = flagOwner.get(flag);
      if (owner) issues.push(`faction flag ${flag} is registered by both ${owner} and ${entry.id}`);
      flagOwner.set(flag, entry.id);
    }
    // A lifecycle flag must exist for every non-NONE state the rules declare.
    for (const state of rules.lifecycleStates) {
      if (state === 'NONE') continue;
      if (!entry.lifecycleFlags[state as Exclude<FactionLifecycleState, 'NONE'>]) {
        issues.push(`faction ${entry.id}: no registered flag for lifecycle state ${state}`);
      }
    }
    // Roles and their flags must agree in both directions.
    for (const role of entry.allowedRoles) {
      if (!entry.roleFlags[role]) issues.push(`faction ${entry.id}: allowed role ${role} has no registered flag`);
    }
    for (const role of Object.keys(entry.roleFlags)) {
      if (!entry.allowedRoles.includes(role)) {
        issues.push(`faction ${entry.id}: roleFlags declares ${role}, which is not in allowedRoles`);
      }
    }
    // A lifecycle flag must never double as a role flag.
    const lifecycle = new Set(Object.values(entry.lifecycleFlags));
    for (const flag of Object.values(entry.roleFlags)) {
      if (lifecycle.has(flag)) issues.push(`faction ${entry.id}: ${flag} is both a lifecycle and a role flag`);
    }
    for (const flag of entry.historyFlags) {
      if (lifecycle.has(flag)) issues.push(`faction ${entry.id}: history flag ${flag} is also a lifecycle flag`);
    }

    map.set(entry.id, entry as FactionDef);
  }
  return { factions: map, rules };
}

/** Route Tag Registry v1.0 / v1.1. */
function loadRouteTags(
  file: string,
  issues: string[],
  files: { path: string; sha256: string }[],
): Map<string, RouteTagDef> {
  const text = readFileSync(file, 'utf8');
  files.push({ path: path.relative(REPO_ROOT, file), sha256: sha256(text) });
  const parsed = routeTagRegistrySchema.safeParse(JSON.parse(text));
  const map = new Map<string, RouteTagDef>();
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push(`route tag registry: ${issue.path.join('.')} ${issue.message}`);
    }
    return map;
  }
  for (const entry of parsed.data.tags) {
    if (map.has(entry.tag)) {
      issues.push(`route tag registry: duplicate registered tag ${entry.tag}`);
      continue;
    }
    // Shape only here; the namespace check needs the event flag set and runs in
    // validateCrossReferences. A prefix may be a complete flag name.
    for (const prefix of entry.flagPrefixes) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(prefix)) {
        issues.push(`route tag ${entry.tag}: malformed flag prefix ${JSON.stringify(prefix)}`);
      }
    }
    map.set(entry.tag, entry);
  }
  return map;
}

const TALENT_TRIGGERS = new Set<TalentTrigger>(['start', 'start_hidden', 'threshold_once', 'passive']);

function loadTalents(
  file: string,
  issues: string[],
  files: { path: string; sha256: string }[],
): Map<string, TalentDef> {
  const text = readFileSync(file, 'utf8');
  files.push({ path: path.relative(REPO_ROOT, file), sha256: sha256(text) });
  const map = new Map<string, TalentDef>();
  for (const record of parseCsvRecords(text)) {
    const id = record['id'] ?? '';
    if (id === '') continue;
    if (!TALENT_ID_RE.test(id)) {
      issues.push(`talent registry: malformed talent id ${JSON.stringify(id)}`);
      continue;
    }
    if (map.has(id)) {
      issues.push(`talent registry: duplicate talent id ${id}`);
      continue;
    }
    const trigger = (record['trigger_type'] ?? '') as TalentTrigger;
    if (!TALENT_TRIGGERS.has(trigger)) {
      issues.push(`talent ${id}: unknown trigger_type ${JSON.stringify(record['trigger_type'])}`);
      continue;
    }
    const visible = record['visible_effects'] ?? '';
    let effects: TalentDef['effects'];
    try {
      effects = parseTalentEffects(id, 'visible_effects', visible);
    } catch (error) {
      issues.push((error as Error).message);
      continue;
    }
    const condition = normalizeTalentCondition(record['condition'] ?? '');
    if (trigger === 'threshold_once' && condition === '') {
      issues.push(`talent ${id}: threshold_once requires a condition`);
    }
    if (condition !== '') {
      try {
        parseCondition(condition);
      } catch (error) {
        issues.push(`talent ${id}: ${(error as Error).message}`);
      }
    }
    const incompatible = (record['incompatible_with'] ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s !== '' && s !== '-');

    // Talent Registry v1.1 typed drafting operations. Only these change weights.
    const parseTargets = (column: string): DraftingTarget[] => {
      const raw = record[column] ?? '';
      const targets: DraftingTarget[] = [];
      for (const piece of raw.split(';').map((v) => v.trim()).filter((v) => v !== '')) {
        const match = /^(family|channel):([A-Z0-9]+)$/.exec(piece);
        if (!match) {
          issues.push(`talent ${id}: malformed ${column} target ${JSON.stringify(piece)} (expected family:CODE or channel:CODE)`);
          continue;
        }
        const kind = match[1] as 'family' | 'channel';
        const code = match[2]!;
        if (kind === 'channel' && !CHANNEL_SET.has(code)) {
          issues.push(`talent ${id}: ${column} references unknown channel ${code}`);
          continue;
        }
        targets.push({ kind, code });
      }
      return targets;
    };
    const splitTags = (column: string): string[] =>
      (record[column] ?? '').split(';').map((v) => v.trim()).filter((v) => v !== '');

    const rspRaw = (record['registered_species_rule'] ?? '').trim();
    let registeredSpeciesRule: TalentDef['registeredSpeciesRule'] = null;
    if (rspRaw !== '') {
      if (rspRaw === 'UNREGISTERED' || rspRaw === 'SEEDED_OTHER_SPECIES') {
        registeredSpeciesRule = rspRaw;
      } else {
        issues.push(`talent ${id}: unknown registered_species_rule ${JSON.stringify(rspRaw)}`);
      }
    }

    const fixRaw = (record['start_fix_bonus'] ?? '').trim();
    let startFixBonus: number | null = null;
    if (fixRaw !== '') {
      const parsedFix = Number.parseInt(fixRaw, 10);
      if (!Number.isInteger(parsedFix)) {
        issues.push(`talent ${id}: start_fix_bonus must be an integer, got ${JSON.stringify(fixRaw)}`);
      } else {
        startFixBonus = parsedFix;
      }
    }

    map.set(id, {
      draftingFavor: parseTargets('drafting_favor'),
      draftingStronglyFavor: parseTargets('drafting_strongly_favor'),
      draftingSuppress: parseTargets('drafting_suppress'),
      unlockTags: splitTags('unlock_tags'),
      redirectTags: splitTags('redirect_tags'),
      narrativeTags: splitTags('narrative_tags'),
      registeredSpeciesRule,
      startFixBonus,
      id,
      rarity: record['rarity'] ?? '',
      name_en: record['name_en'] ?? '',
      description_en: record['description_en'] ?? '',
      trigger_type: trigger,
      condition,
      effects,
      raw: {
        visible_effects: visible,
        hidden_effects: record['hidden_effects'] ?? '',
        channel_hooks: record['channel_hooks'] ?? '',
        family_hooks: record['family_hooks'] ?? '',
        designer_notes: record['designer_notes'] ?? '',
      },
      incompatibleWith: incompatible,
    });
  }
  // Incompatibility must be symmetric and must reference known talents.
  for (const talent of map.values()) {
    for (const other of talent.incompatibleWith) {
      const partner = map.get(other);
      if (!partner) {
        issues.push(`talent ${talent.id}: incompatible_with references unknown talent ${other}`);
        continue;
      }
      if (!partner.incompatibleWith.includes(talent.id)) {
        issues.push(`talent ${talent.id}/${other}: incompatibility is not symmetric`);
      }
    }
  }
  return map;
}

function splitList(value: string): string[] {
  return value
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

function loadEndings(
  file: string,
  issues: string[],
  files: { path: string; sha256: string }[],
): Map<string, EndingDef> {
  const text = readFileSync(file, 'utf8');
  files.push({ path: path.relative(REPO_ROOT, file), sha256: sha256(text) });
  const map = new Map<string, EndingDef>();
  for (const record of parseCsvRecords(text)) {
    const id = record['id'] ?? '';
    if (id === '') continue;
    if (map.has(id)) {
      issues.push(`ending registry: duplicate ending id ${id}`);
      continue;
    }
    const hiddenRaw = (record['hidden'] ?? '').toLowerCase();
    if (hiddenRaw !== 'true' && hiddenRaw !== 'false') {
      issues.push(`ending ${id}: hidden must be true/false, got ${JSON.stringify(record['hidden'])}`);
    }
    const awareness = (column: string, required: boolean): AwarenessState | null => {
      const value = (record[column] ?? '').trim();
      if (value === '') {
        if (required) issues.push(`ending ${id}: ${column} is required`);
        return null;
      }
      if (!AWARENESS_SET.has(value)) {
        issues.push(`ending ${id}: ${column} has unknown awareness state ${JSON.stringify(value)}`);
        return null;
      }
      return value as AwarenessState;
    };
    const awarenessList = (column: string): AwarenessState[] => {
      const out: AwarenessState[] = [];
      for (const value of splitList(record[column] ?? '')) {
        if (!AWARENESS_SET.has(value)) {
          issues.push(`ending ${id}: ${column} has unknown awareness state ${JSON.stringify(value)}`);
          continue;
        }
        out.push(value as AwarenessState);
      }
      return out;
    };

    map.set(id, {
      id,
      primaryFamily: record['primary_family'] ?? '',
      title_en: record['title_en'] ?? '',
      description_en: record['description_en'] ?? '',
      coreRoutes: splitList(record['core_routes'] ?? ''),
      allowedMaterials: record['allowed_materials'] ?? '',
      typicalForms: splitList(record['typical_forms'] ?? ''),
      defaultAwareness: awareness('default_awareness', true) ?? 'Unconscious',
      awarenessIfTemporal: awareness('awareness_if_temporal', false),
      allowedAwarenessStates: awarenessList('allowed_awareness_states'),
      authorizationRequiredStates: awarenessList('authorization_required_states'),
      authorizingTalents: splitList(record['authorizing_talents'] ?? ''),
      legalStatus: record['legal_status'] ?? '',
      ownership: record['ownership'] ?? '',
      autonomy: record['autonomy'] ?? '',
      conversionConsent: record['conversion_consent'] ?? '',
      typicalLocation: record['typical_location'] ?? '',
      socialMeaning: record['social_meaning'] ?? '',
      discoveryClass: record['discovery_class'] ?? '',
      hidden: hiddenRaw === 'true',
      designerNotes: record['designer_notes'] ?? '',
    });
  }
  return map;
}

function loadJsonWithSchema<T>(
  file: string,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } } },
  label: string,
  issues: string[],
  files: { path: string; sha256: string }[],
): T | null {
  const text = readFileSync(file, 'utf8');
  files.push({ path: path.relative(REPO_ROOT, file), sha256: sha256(text) });
  const parsed = schema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    for (const issue of parsed.error.issues) issues.push(`${label}: ${issue.path.join('.')} ${issue.message}`);
    return null;
  }
  return parsed.data;
}

// ---------------------------------------------------------------------------
// Cross-reference validation
// ---------------------------------------------------------------------------

const MATERIAL_SET = new Set<string>(MATERIALS);
const TRANSFORMATION_FAMILY_SET = new Set<string>(TRANSFORMATION_FAMILIES);
const CHANNEL_SET = new Set<string>(CHANNELS);
const AWARENESS_SET = new Set<string>(AWARENESS_STATES);

/** Interactions that address the protagonist personally, rather than the world. */
const PERSONALIZED_INTERACTIONS = new Set(['personal', 'climax']);

/**
 * Content Schema v0.4 faction validation.
 *
 * Checks that every structured transition names a real faction, a legal edge and
 * registered roles, and — the safe-exit guarantee — that no ordinary
 * personalized faction event is still reachable once the protagonist has
 * OPTED_OUT or CLOSED with that faction.
 *
 * The reachability check is a three-valued analysis over the event's own
 * `include`: it pins the faction's lifecycle and role flags to their
 * post-exit values and leaves everything else free, so it proves unreachability
 * rather than sampling for it.
 */
function validateFactionContent(
  bundle: Omit<ContentBundle, 'contentVersion' | 'sourceFiles'>,
  issues: string[],
): void {
  const { events, factions, factionRules } = bundle;

  for (const event of events) {
    for (const factionId of event.factionIds) {
      if (!factions.has(factionId)) {
        issues.push(`${event.id}: factionIds references unknown faction ${factionId}`);
      }
    }
    if (event.factionInteraction && event.factionIds.length === 0) {
      issues.push(`${event.id}: factionInteraction ${event.factionInteraction} without any factionIds`);
    }

    event.variants.forEach((variant, index) => {
      const where = `${event.id} variant ${index + 1}`;
      const touched = new Set<string>();
      for (const transition of variant.factionTransitions ?? []) {
        const faction = factions.get(transition.factionId);
        if (!faction) {
          issues.push(`${where}: factionTransitions references unknown faction ${transition.factionId}`);
          continue;
        }
        if (!event.factionIds.includes(transition.factionId)) {
          issues.push(`${where}: transitions ${transition.factionId}, which is not in the event's factionIds`);
        }
        // One variant may not move the same faction twice: the second edge would
        // silently read the state the first one just wrote.
        if (touched.has(transition.factionId)) {
          issues.push(`${where}: transitions ${transition.factionId} more than once`);
        }
        touched.add(transition.factionId);
        // The target must be a state the FSM can ever enter.
        const reachable = Object.values(factionRules.legalTransitions).some((targets) =>
          targets.includes(transition.to),
        );
        if (!reachable) {
          issues.push(`${where}: ${transition.to} is not the target of any legal transition`);
        }
        for (const role of [...(transition.addRoles ?? []), ...(transition.removeRoles ?? [])]) {
          if (!faction.allowedRoles.includes(role)) {
            issues.push(`${where}: role ${role} is not registered for faction ${faction.id}`);
          }
        }
        if (
          factionRules.personalTerminalStates.includes(transition.to) &&
          (transition.addRoles ?? []).length > 0
        ) {
          issues.push(`${where}: cannot add roles while entering the terminal state ${transition.to}`);
        }
      }
    });

    // Safe-exit guarantee. A `contact` event is exempt: re-contact after a safe
    // exit is blocked by the FSM itself (OPTED_OUT/CLOSED have no outgoing
    // edges), so the transition would be refused even if the event were drafted.
    if (!event.factionInteraction || !PERSONALIZED_INTERACTIONS.has(event.factionInteraction)) continue;
    for (const factionId of event.factionIds) {
      const faction = factions.get(factionId);
      if (!faction) continue;
      let include;
      try {
        include = parseCondition(event.include);
      } catch {
        continue; // Already reported by the condition-parse pass.
      }
      for (const terminal of factionRules.personalTerminalStates) {
        if (satisfiableAfterExit(include, faction, factionRules, terminal)) {
          issues.push(
            `${event.id}: personalized faction event is still reachable after ${factionId} reaches ${terminal}; ` +
              'gate it on an active lifecycle flag or declare an explicit exceptional rule',
          );
        }
      }
    }
  }
}

function validateCrossReferences(
  bundle: Omit<ContentBundle, 'contentVersion' | 'sourceFiles'>,
  issues: string[],
): void {
  const { events, eventsById, endings, talents, adapters, routeTags, refinementTags, factions, factionRules } =
    bundle;

  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.id)) issues.push(`duplicate event id ${event.id}`);
    seen.add(event.id);
  }

  for (const event of events) {
    // Conditions must parse.
    const conditions: [string, string][] = [
      ['include', event.include],
      ['exclude', event.exclude],
    ];
    event.variants.forEach((variant, index) => {
      conditions.push([`variants[${index}].when`, variant.when]);
      variant.schedules.forEach((schedule, si) => {
        conditions.push([`variants[${index}].schedules[${si}].validityCondition`, schedule.validityCondition]);
      });
    });
    for (const [label, source] of conditions) {
      try {
        parseCondition(source);
      } catch (error) {
        issues.push(`${event.id}.${label}: ${(error as Error).message}`);
      }
    }

    // Transformation channel events must use a known material family.
    if (event.channel === 'TRN' && !TRANSFORMATION_FAMILY_SET.has(event.family)) {
      issues.push(`${event.id}: TRN family ${event.family} is not a material family code`);
    }

    event.variants.forEach((variant, index) => {
      const where = `${event.id} variant ${index + 1}`;
      if (variant.setMaterialCommitment && !MATERIAL_SET.has(variant.setMaterialCommitment)) {
        issues.push(`${where}: unknown material ${variant.setMaterialCommitment}`);
      }
      if (variant.setMaterialCommitment === 'NONE') {
        issues.push(`${where}: setMaterialCommitment cannot be NONE`);
      }
      if (variant.endingId && !endings.has(variant.endingId)) {
        issues.push(`${where}: unknown ending ${variant.endingId}`);
      }
      if (variant.endingOverrides && !variant.endingId) {
        issues.push(`${where}: endingOverrides without endingId`);
      }
      for (const schedule of variant.schedules) {
        const target = eventsById.get(schedule.eventId);
        if (!target) {
          issues.push(`${where}: schedules unknown event ${schedule.eventId}`);
          continue;
        }
        if (target.selectionMode === 'fallback_only' || target.selectionMode === 'lore_fallback_only') {
          issues.push(`${where}: cannot schedule a ${target.selectionMode} event (${schedule.eventId})`);
        }
        // A schedule that can never fire inside its own window is a content defect.
        if (target.age.max !== null && event.age.min + schedule.offsetYears > target.age.max) {
          issues.push(
            `${where}: schedule of ${schedule.eventId} can never fire — earliest ${event.age.min + schedule.offsetYears} exceeds target age.max ${target.age.max}`,
          );
        }
      }
    });
  }

  // Every event referenced only by schedule must actually be schedulable.
  for (const event of events) {
    if (event.selectionMode === 'scheduled_only' || event.selectionMode === 'mandatory_only' || event.selectionMode === 'climax') {
      const referenced = events.some((other) =>
        other.variants.some((variant) => variant.schedules.some((s) => s.eventId === event.id)),
      );
      if (!referenced) {
        issues.push(`${event.id}: selectionMode ${event.selectionMode} but no event schedules it — unreachable`);
      }
    }
  }

  // Route Tag Registry v1.0 integrity (Acceptance Addendum section 2).
  for (const event of events) {
    for (const tag of event.routeTags) {
      if (!routeTags.has(tag)) {
        issues.push(`${event.id}: routeTag ${JSON.stringify(tag)} is not registered in the Route Tag Registry`);
      }
    }
    // Species refinement integrity (Acceptance Addendum section 3).
    for (const tag of event.refinementTags) {
      if (!refinementTags.has(tag)) {
        issues.push(`${event.id}: refinementTag ${JSON.stringify(tag)} is not registered in the Species Registry`);
      }
    }
  }

  // Route Tag Registry validationRule: every non-empty flag prefix must match a
  // real flag namespace (route flags, or an approved non-route state prefix such
  // as MAT_MANIFEST_TEMP for the `temporal` tag).
  const authoredFlags = new Set<string>();
  for (const event of events) {
    for (const variant of event.variants) {
      for (const flag of variant.addFlags) authoredFlags.add(flag);
      for (const flag of variant.removeFlags) authoredFlags.add(flag);
      // Content Schema v0.4: lifecycle and role flags are produced by structured
      // transitions rather than addFlags, but they are just as authored.
      for (const transition of variant.factionTransitions ?? []) {
        const faction = factions.get(transition.factionId);
        if (!faction) continue;
        const lifecycle = faction.lifecycleFlags[transition.to];
        if (lifecycle) authoredFlags.add(lifecycle);
        for (const role of [...(transition.addRoles ?? []), ...(transition.removeRoles ?? [])]) {
          const flag = faction.roleFlags[role];
          if (flag) authoredFlags.add(flag);
        }
      }
    }
  }
  for (const def of routeTags.values()) {
    for (const prefix of def.flagPrefixes) {
      const matches = [...authoredFlags].some((flag) => flag.startsWith(prefix));
      if (!matches) {
        issues.push(
          `route tag ${def.tag}: flag prefix ${JSON.stringify(prefix)} matches no authored flag namespace`,
        );
      }
    }
  }

  // Faction Registry v0.2 integrity (Content Schema v0.4 §Validation additions).
  const factionFlags = new Map<string, string>();
  for (const faction of factions.values()) {
    // Route Tag Registry patch v1.2: a faction's route context is active for
    // exactly its CONTACTED/ENGAGED/COMMITTED flags. Historical `FAC_*_CONTACT`
    // markers and the terminal states must never grant favor.
    const tag = routeTags.get(faction.routeTag);
    if (!tag) {
      issues.push(`faction ${faction.id}: routeTag ${faction.routeTag} is not in the Route Tag Registry`);
    } else {
      const expected = factionRules.activeContextStates.map(
        (state) => faction.lifecycleFlags[state as Exclude<FactionLifecycleState, 'NONE'>],
      );
      for (const flag of expected) {
        if (flag && !tag.flagPrefixes.includes(flag)) {
          issues.push(`faction ${faction.id}: routeTag ${faction.routeTag} does not carry active flag ${flag}`);
        }
      }
      const forbidden = [
        ...faction.historyFlags,
        ...factionRules.personalTerminalStates.map(
          (state) => faction.lifecycleFlags[state as Exclude<FactionLifecycleState, 'NONE'>],
        ),
      ].filter((flag): flag is string => Boolean(flag));
      for (const flag of forbidden) {
        if (tag.flagPrefixes.some((prefix) => flag.startsWith(prefix))) {
          issues.push(
            `route tag ${faction.routeTag}: ${flag} must not activate faction route context ` +
              '(historical contact and safe exits grant no favor)',
          );
        }
      }
    }
    for (const flag of [
      ...faction.historyFlags,
      ...Object.values(faction.lifecycleFlags),
      ...Object.values(faction.roleFlags),
    ]) {
      factionFlags.set(flag, faction.id);
    }
  }
  // Every FAC_* flag used by canonical content must belong to exactly one faction.
  for (const event of events) {
    for (const variant of event.variants) {
      for (const flag of [...variant.addFlags, ...variant.removeFlags]) {
        if (!flag.startsWith('FAC_')) continue;
        if (!factionFlags.has(flag)) {
          issues.push(`${event.id}: faction flag ${flag} is not registered by any faction`);
        }
      }
    }
  }
  // Faction context must never bias a material family
  // (Faction Registry rule `automaticMaterialBiasFromFaction: false`).
  const factionTags = new Set([...factions.values()].map((f) => f.routeTag));
  for (const tag of factionTags) {
    const def = routeTags.get(tag);
    if (def?.allowTransformationEventFavor) {
      issues.push(`route tag ${tag}: faction tags must not allow Transformation event favor`);
    }
  }
  validateFactionContent(bundle, issues);

  // Ending Registry v1.1 awareness integrity (Acceptance Addendum section 5).
  for (const ending of endings.values()) {
    for (const state of ending.authorizationRequiredStates) {
      if (ending.authorizingTalents.length === 0) {
        issues.push(`ending ${ending.id}: ${state} requires authorization but no authorizing_talents are listed`);
      }
    }
    for (const talentId of ending.authorizingTalents) {
      if (!talents.has(talentId)) {
        issues.push(`ending ${ending.id}: unknown authorizing talent ${talentId}`);
      }
    }
    if (
      ending.allowedAwarenessStates.length > 0 &&
      !ending.allowedAwarenessStates.includes(ending.defaultAwareness)
    ) {
      issues.push(
        `ending ${ending.id}: default_awareness ${ending.defaultAwareness} is not in allowed_awareness_states`,
      );
    }
    if (
      ending.awarenessIfTemporal &&
      ending.allowedAwarenessStates.length > 0 &&
      !ending.allowedAwarenessStates.includes(ending.awarenessIfTemporal)
    ) {
      issues.push(
        `ending ${ending.id}: awareness_if_temporal ${ending.awarenessIfTemporal} is not in allowed_awareness_states`,
      );
    }
  }

  // Talent Registry v1.1 typed drafting targets must name real families/channels.
  const knownFamilies = new Set(events.map((event) => event.family));
  for (const talent of talents.values()) {
    for (const target of [...talent.draftingFavor, ...talent.draftingStronglyFavor, ...talent.draftingSuppress]) {
      if (target.kind === 'family' && !knownFamilies.has(target.code)) {
        issues.push(`talent ${talent.id}: drafting target family ${target.code} matches no authored event family`);
      }
    }
  }

  // Remaining adapter references (the adapter is now diagnostics-only).
  for (const talentId of Object.keys(adapters.talentDiagnostics)) {
    if (!talents.has(talentId)) issues.push(`balance adapters: unknown talent ${talentId}`);
  }
}

/** Species Registry v1.2 states family tendencies directly; no collapsing needed. */
function speciesFamilyTendencies(species: Map<SpeciesId, SpeciesDef>): Map<SpeciesId, SpeciesTendencies> {
  const out = new Map<SpeciesId, SpeciesTendencies>();
  for (const def of species.values()) {
    out.set(def.id, {
      primary: new Set(def.familyTendencies.primary),
      secondary: new Set(def.familyTendencies.secondary),
      uncommon: new Set(def.familyTendencies.uncommon),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function loadContent(paths: ContentPaths = defaultContentPaths()): ContentBundle {
  const issues: string[] = [];
  const sourceFiles: { path: string; sha256: string }[] = [];

  const batches = loadEventBatches(paths.eventsDir, issues, sourceFiles);
  const species = loadSpecies(paths.speciesRegistry, issues, sourceFiles);
  const refinementTags = loadRefinementTags(paths.speciesRegistry, issues);
  const routeTags = loadRouteTags(paths.routeTagRegistry, issues, sourceFiles);
  const { factions, rules: factionRules } = loadFactions(paths.factionRegistry, issues, sourceFiles);
  const talents = loadTalents(paths.talentRegistry, issues, sourceFiles);
  const endings = loadEndings(paths.endingRegistry, issues, sourceFiles);
  const balance = loadJsonWithSchema(paths.balanceConstants, balanceConstantsSchema, 'balance constants', issues, sourceFiles);
  const adaptersRaw = loadJsonWithSchema(paths.balanceAdapters, balanceAdaptersSchema, 'balance adapters', issues, sourceFiles);

  if (issues.length > 0 || !balance || !adaptersRaw || !factionRules) throw new ContentValidationError(issues);

  const adapters = normalizeAdapters(adaptersRaw);
  const events = batches.flatMap((b) => b.events);
  const eventsById = new Map(events.map((e) => [e.id, e]));

  const partial = {
    batches,
    events,
    eventsById,
    species,
    speciesFamilyTendencies: speciesFamilyTendencies(species),
    refinementTags,
    routeTags,
    factions,
    factionRules,
    talents,
    endings,
    balance,
    adapters,
  };
  validateCrossReferences(partial, issues);
  if (issues.length > 0) throw new ContentValidationError(issues);

  const fingerprint = sha256(
    sourceFiles
      .slice()
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((f) => `${f.path}:${f.sha256}`)
      .join('\n'),
  );

  return { ...partial, contentVersion: fingerprint, sourceFiles };
}

let cached: ContentBundle | null = null;

/** Cached default-content loader for tests and the CLI. */
export function loadDefaultContent(): ContentBundle {
  if (!cached) cached = loadContent();
  return cached;
}

export function materialFromFamily(family: string): Material | null {
  return MATERIAL_SET.has(family) && family !== 'NONE' ? (family as Material) : null;
}
