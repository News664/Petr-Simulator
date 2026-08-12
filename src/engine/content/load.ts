import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCondition } from '../conditions/parser.js';
import {
  MATERIALS,
  TRANSFORMATION_FAMILIES,
  type EndingDef,
  type EventBatch,
  type GameEvent,
  type Material,
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
import { eventBatchSchema, speciesRegistrySchema, TALENT_ID_RE } from './schema.js';
import { normalizeTalentCondition, parseTalentEffects } from './talentEffects.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
export const CONTENT_ROOT = path.join(REPO_ROOT, 'content');

export interface ContentPaths {
  eventsDir: string;
  speciesRegistry: string;
  talentRegistry: string;
  endingRegistry: string;
  balanceConstants: string;
  balanceAdapters: string;
}

export function defaultContentPaths(root: string = CONTENT_ROOT): ContentPaths {
  return {
    eventsDir: path.join(root, 'events'),
    speciesRegistry: path.join(root, 'registries', 'SOLID_STATE_SPECIES_REGISTRY_v1.1.json'),
    talentRegistry: path.join(root, 'registries', 'SOLID_STATE_TALENT_REGISTRY_v1.0.csv'),
    endingRegistry: path.join(root, 'registries', 'SOLID_STATE_ENDING_REGISTRY_v1.0.csv'),
    balanceConstants: path.join(root, 'balance', 'SOLID_STATE_BALANCE_CONSTANTS_PROVISIONAL_v0.1.json'),
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
  /** Species tendencies collapsed onto transformation family codes. */
  speciesFamilyTendencies: Map<SpeciesId, SpeciesTendencies>;
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
      events: parsed.data.events.map((event) => ({ ...event, sourceBatchId: parsed.data.batchId }) as GameEvent),
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
  for (const entry of parsed.data.species) {
    if (map.has(entry.id)) issues.push(`species registry: duplicate species id ${entry.id}`);
    map.set(entry.id, entry as SpeciesDef);
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
    map.set(id, {
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
    map.set(id, {
      id,
      primaryFamily: record['primary_family'] ?? '',
      title_en: record['title_en'] ?? '',
      description_en: record['description_en'] ?? '',
      coreRoutes: splitList(record['core_routes'] ?? ''),
      allowedMaterials: record['allowed_materials'] ?? '',
      typicalForms: splitList(record['typical_forms'] ?? ''),
      defaultAwarenessRaw: record['default_awareness'] ?? '',
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

function validateCrossReferences(
  bundle: Omit<ContentBundle, 'contentVersion' | 'sourceFiles'>,
  issues: string[],
): void {
  const { events, eventsById, endings, talents, adapters } = bundle;

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
        if (target.selectionMode === 'fallback_only') {
          issues.push(`${where}: cannot schedule a fallback_only event (${schedule.eventId})`);
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

  // Adapter references.
  for (const talentId of Object.keys(adapters.talentAdapters)) {
    if (!talents.has(talentId)) issues.push(`balance adapters: unknown talent ${talentId}`);
  }
  for (const endingId of Object.keys(adapters.endingAwarenessAuthorizingTalents)) {
    if (!endings.has(endingId)) issues.push(`balance adapters: unknown ending ${endingId}`);
    for (const talentId of adapters.endingAwarenessAuthorizingTalents[endingId] ?? []) {
      if (!talents.has(talentId)) issues.push(`balance adapters: unknown authorizing talent ${talentId}`);
    }
  }
  for (const [label, family] of Object.entries(adapters.speciesTendencyFamilyMap)) {
    if (!TRANSFORMATION_FAMILY_SET.has(family)) {
      issues.push(`balance adapters: speciesTendencyFamilyMap[${label}] -> unknown family ${family}`);
    }
  }
  // Every awareness string in the registry must have a resolution rule.
  for (const ending of endings.values()) {
    if (ending.defaultAwarenessRaw !== '' && !adapters.endingAwarenessRules[ending.defaultAwarenessRaw]) {
      issues.push(
        `balance adapters: no endingAwarenessRules entry for ${JSON.stringify(ending.defaultAwarenessRaw)} (used by ${ending.id})`,
      );
    }
  }
  // Every species tendency label must be mapped or explicitly unmapped.
  const unmapped = new Set(Object.keys(adapters.speciesTendencyUnmapped ?? {}));
  for (const species of bundle.species.values()) {
    for (const label of [...species.primary, ...species.secondary, ...species.uncommon]) {
      if (!adapters.speciesTendencyFamilyMap[label] && !unmapped.has(label)) {
        issues.push(`balance adapters: species ${species.id} tendency ${label} is neither mapped nor declared unmapped`);
      }
    }
  }
}

function collapseSpeciesTendencies(
  species: Map<SpeciesId, SpeciesDef>,
  adapters: BalanceAdapters,
): Map<SpeciesId, SpeciesTendencies> {
  const out = new Map<SpeciesId, SpeciesTendencies>();
  for (const def of species.values()) {
    const tendencies: SpeciesTendencies = { primary: new Set(), secondary: new Set(), uncommon: new Set() };
    const tiers: [keyof SpeciesTendencies, string[]][] = [
      ['primary', def.primary],
      ['secondary', def.secondary],
      ['uncommon', def.uncommon],
    ];
    for (const [tier, labels] of tiers) {
      for (const label of labels) {
        const family = adapters.speciesTendencyFamilyMap[label];
        if (!family) continue;
        tendencies[tier].add(family);
      }
    }
    // Strongest tier wins when refinement labels collapse onto one family.
    for (const family of tendencies.primary) {
      tendencies.secondary.delete(family);
      tendencies.uncommon.delete(family);
    }
    for (const family of tendencies.secondary) tendencies.uncommon.delete(family);
    out.set(def.id, tendencies);
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
  const talents = loadTalents(paths.talentRegistry, issues, sourceFiles);
  const endings = loadEndings(paths.endingRegistry, issues, sourceFiles);
  const balance = loadJsonWithSchema(paths.balanceConstants, balanceConstantsSchema, 'balance constants', issues, sourceFiles);
  const adaptersRaw = loadJsonWithSchema(paths.balanceAdapters, balanceAdaptersSchema, 'balance adapters', issues, sourceFiles);

  if (issues.length > 0 || !balance || !adaptersRaw) throw new ContentValidationError(issues);

  const adapters = normalizeAdapters(adaptersRaw);
  const events = batches.flatMap((b) => b.events);
  const eventsById = new Map(events.map((e) => [e.id, e]));

  const partial = {
    batches,
    events,
    eventsById,
    species,
    speciesFamilyTendencies: collapseSpeciesTendencies(species, adapters),
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
