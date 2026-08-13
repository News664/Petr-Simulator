import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ContentValidationError,
  CONTENT_ROOT,
  REPO_ROOT,
  defaultContentPaths,
  loadContent,
  loadDefaultContent,
  type ContentPaths,
} from '../src/engine/content/load.js';
import { renderBatchMarkdown, type RawBatch } from '../src/engine/content/mirror.js';
import { eventBatchSchema } from '../src/engine/content/schema.js';

/**
 * Acceptance A — Content loading.
 */
describe('A. Content loading', () => {
  const content = loadDefaultContent();

  it('loads all current event JSON batches', () => {
    expect(content.batches.length).toBe(6);
    expect(content.events.length).toBe(156);
    const ids = content.batches.map((b) => b.batchId).sort();
    expect(ids).toEqual([
      'EVENT_BATCH_001',
      'EVENT_BATCH_002',
      'EVENT_BATCH_003',
      'EVENT_BATCH_004',
      'EVENT_BATCH_005',
      'EVENT_BATCH_006',
    ]);
  });

  it('loads the Phase 1.1 / 1.2 registries', () => {
    // 31 Phase-1.1 tags + 6 Phase-1.2 faction tags.
    expect(content.routeTags.size).toBe(37);
    expect(content.factions.size).toBe(6);
    expect(content.refinementTags.size).toBeGreaterThan(0);
    expect(content.balance.version).toBe('0.2');
    // Q-26: no passive FIX drift is authorized.
    expect(content.balance.fixAnnualDrift).toBeNull();
    expect(content.balance.familyWeightMode).toBe('uniform');
  });

  it('loads the Species Registry', () => {
    expect(content.species.size).toBe(6);
    expect(content.species.get('HUMAN')?.allocation_points).toBe(21);
    for (const id of ['ELF', 'DWARF', 'WINGED_KIN', 'DEMONKIN', 'DRAGONKIN'] as const) {
      expect(content.species.get(id)?.allocation_points).toBe(20);
    }
  });

  it('loads the Talent Registry with structured effects', () => {
    expect(content.talents.size).toBe(30);
    expect(content.talents.get('T1005')?.effects).toEqual({ STR: 3, INT: -1 });
    expect(content.talents.get('T1002')?.effects).toEqual({ MNY: 2 });
    expect(content.talents.get('T1002')?.condition).toBe('INT>=5');
    expect(content.talents.get('T1004')?.effects).toEqual({});
  });

  it('loads the Ending Registry', () => {
    expect(content.endings.size).toBe(24);
    expect(content.endings.get('END-ACA-001')?.title_en).toBe('Tenure');
    expect(content.endings.get('END-ANO-001')?.hidden).toBe(true);
    expect(content.endings.get('END-COR-001')?.hidden).toBe(false);
  });

  /**
   * Builds a throwaway content root containing the full canonical corpus with
   * `replacements` substituted by batchId. The corpus must stay complete:
   * route-tag flag-namespace validation is a whole-corpus property, so a
   * single-batch root would fail for reasons unrelated to the test.
   */
  function contentRootWith(replacements: RawBatch[]): ContentPaths {
    const root = mkdtempSync(path.join(tmpdir(), 'solid-state-content-'));
    mkdirSync(path.join(root, 'events'));
    mkdirSync(path.join(root, 'registries'));
    mkdirSync(path.join(root, 'balance'));
    const replaced = new Map(replacements.map((b) => [b.batchId, b]));
    for (const name of readdirSync(path.join(CONTENT_ROOT, 'events'))) {
      if (!name.endsWith('.json')) continue;
      const original = JSON.parse(readFileSync(path.join(CONTENT_ROOT, 'events', name), 'utf8')) as RawBatch;
      const batch = replaced.get(original.batchId) ?? original;
      writeFileSync(path.join(root, 'events', name), JSON.stringify(batch), 'utf8');
    }
    for (const sub of ['registries', 'balance'] as const) {
      for (const name of readdirSync(path.join(CONTENT_ROOT, sub))) {
        copyFileSync(path.join(CONTENT_ROOT, sub, name), path.join(root, sub, name));
      }
    }
    return defaultContentPaths(root);
  }

  const canonicalBatch = (): RawBatch =>
    JSON.parse(
      readFileSync(path.join(CONTENT_ROOT, 'events', 'SOLID_STATE_EVENT_BATCH_001_v0.3.json'), 'utf8'),
    ) as RawBatch;

  it('loads the full corpus through the throwaway-root harness unchanged', () => {
    expect(() => loadContent(contentRootWith([]))).not.toThrow();
  });

  it('accepts an unmodified canonical batch through the throwaway-root harness', () => {
    expect(() => loadContent(contentRootWith([canonicalBatch()]))).not.toThrow();
  });

  it('rejects duplicate event IDs', () => {
    const batch = canonicalBatch();
    const duplicated: RawBatch = { ...batch, events: [batch.events[0]!, structuredClone(batch.events[0]!)] };
    expect(() => loadContent(contentRootWith([duplicated]))).toThrow(ContentValidationError);
    try {
      loadContent(contentRootWith([duplicated]));
    } catch (error) {
      expect((error as ContentValidationError).issues.join('\n')).toContain('duplicate event id');
    }
  });

  it('rejects an unknown ending reference', () => {
    const batch = canonicalBatch();
    // Use an adult-capable event so the childhood-safety rule is not what fires.
    const adult = structuredClone(batch.events.find((e) => e.age.min >= 18)!);
    adult.variants[adult.variants.length - 1]!.endingId = 'END-NOPE-999';
    const broken: RawBatch = { ...batch, events: [...batch.events.filter((e) => e.id !== adult.id), adult] };
    try {
      loadContent(contentRootWith([broken]));
      expect.unreachable('should have rejected the unknown ending');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues.join('\n')).toContain('unknown ending END-NOPE-999');
    }
  });

  it('rejects an unknown scheduled event reference', () => {
    const batch = canonicalBatch();
    const adult = structuredClone(batch.events.find((e) => e.age.min >= 18)!);
    adult.variants[adult.variants.length - 1]!.schedules = [
      {
        eventId: 'EVT-ORD-GEN-9999',
        offsetYears: 2,
        windowYears: 4,
        priority: 'scheduled',
        validityCondition: 'TRUE',
      },
    ];
    const broken: RawBatch = { ...batch, events: [...batch.events.filter((e) => e.id !== adult.id), adult] };
    try {
      loadContent(contentRootWith([broken]));
      expect.unreachable('should have rejected the unknown scheduled event');
    } catch (error) {
      expect((error as ContentValidationError).issues.join('\n')).toContain('EVT-ORD-GEN-9999');
    }
  });

  it('rejects a canonical ending on an under-18-capable event', () => {
    const batch = canonicalBatch();
    const child = structuredClone(batch.events.find((e) => e.age.min < 18)!);
    child.variants[child.variants.length - 1]!.endingId = 'END-COR-001';
    const broken: RawBatch = { ...batch, events: [...batch.events.filter((e) => e.id !== child.id), child] };
    try {
      loadContent(contentRootWith([broken]));
      expect.unreachable('should have rejected the childhood ending');
    } catch (error) {
      expect((error as ContentValidationError).issues.join('\n')).toContain(
        'canonical ending forbidden on an under-18-capable event',
      );
    }
  });

  it('rejects a malformed event id', () => {
    const parsed = eventBatchSchema.safeParse({
      batchId: 'X',
      version: '1',
      events: [
        {
          id: 'NOT-AN-EVENT-ID',
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
          include: 'TRUE',
          exclude: 'FALSE',
          variants: [{ when: 'TRUE', text: { en: 'x', 'zh-TW': '' }, effects: {}, addFlags: [], removeFlags: [], schedules: [] }],
          designerNotes: '',
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it('keeps generated Markdown byte-for-byte identical to a fresh render', () => {
    const dir = path.join(CONTENT_ROOT, 'events');
    const batches = readdirSync(dir).filter((n) => n.endsWith('.json')).sort();
    expect(batches.length).toBe(6);
    for (const name of batches) {
      const json = JSON.parse(readFileSync(path.join(dir, name), 'utf8')) as RawBatch;
      const expected = readFileSync(path.join(dir, name.replace(/\.json$/, '.md')), 'utf8');
      expect(renderBatchMarkdown(json), `${name} mirror`).toBe(expected);
    }
  });

  it('agrees with the canonical Python content tool', () => {
    const dir = path.join(CONTENT_ROOT, 'events');
    const tool = path.join(REPO_ROOT, 'tools', 'SOLID_STATE_CONTENT_TOOL_v0.2.py');
    for (const name of readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
      const json = path.join(dir, name);
      const md = path.join(dir, name.replace(/\.json$/, '.md'));
      let output: string;
      try {
        output = execFileSync('python3', [tool, 'check', json, md], { encoding: 'utf8' });
      } catch (error) {
        throw new Error(`python content tool rejected ${name}: ${(error as Error).message}`);
      }
      expect(output).toContain('exactly matches canonical JSON');
    }
  });

  it('never loads generated event Markdown as runtime content', () => {
    const engineDir = path.join(REPO_ROOT, 'src', 'engine');
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith('.ts')) continue;
        const source = readFileSync(full, 'utf8');
        // The mirror renderer produces Markdown; nothing may read it back in.
        if (/readFileSync\([^)]*\.md['"`]/.test(source) || /\.md['"`]\s*,\s*['"]utf8/.test(source)) {
          offenders.push(path.relative(REPO_ROOT, full));
        }
      }
    };
    walk(engineDir);
    expect(offenders).toEqual([]);
  });

  it('exposes a stable content fingerprint', () => {
    const again = loadContent();
    expect(again.contentVersion).toBe(content.contentVersion);
    expect(content.contentVersion).toMatch(/^[0-9a-f]{64}$/);
  });
});
