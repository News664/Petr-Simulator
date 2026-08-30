import type { VisibleStat } from '../engine/types.js';
import type { ContentBundle } from '../engine/content/load.js';
import type { Distribution, H2b1bArmSummary } from './h2b1bDiagnostic.js';

/**
 * H2B.1B Part A report and review bands.
 *
 * The bands come from `03_PART_A_DIAGNOSTIC_AND_ACCEPTANCE.md` and are
 * *review* bands: a REVIEW verdict asks a human to look, it does not authorise
 * tuning another event until the number turns green.
 *
 * Verdict rule, stated once so the table is readable without the handoff:
 *
 *  - PASS   — the measured value satisfies the band.
 *  - REVIEW — outside the band. Nothing here is auto-corrected.
 *  - FAIL   — a hard correctness requirement is non-zero, or the value moved
 *             away from its band relative to the recorded pre-patch baseline.
 *  - MEASURED — reported by the plan but explicitly not judged in Part A.
 */

export type Verdict = 'PASS' | 'REVIEW' | 'FAIL' | 'MEASURED';

export interface H2b1bArm {
  id: string;
  label: string;
  runs: number;
  /** Pre-species explicit allocation, for the targeted arms. */
  allocation: Record<VisibleStat, number> | null;
  summary: H2b1bArmSummary;
}

/**
 * The handful of pre-patch numbers a post-patch run compares itself against.
 * Extracted from an earlier payload so the comparison survives the fingerprint
 * change that makes the pre-patch run itself unreproducible.
 */
export interface BaselineReference {
  contentVersion: string;
  /** Reported, not banded: Part A owns no ending gate, but it moves what they read. */
  completionRate: number | null;
  medianEndingAge: number | null;
  endingShare35to44: number | null;
  endingShare65Plus: number | null;
  meanIntDriftAge18: number | null;
  meanChrDriftAge18: number | null;
  spr15At65Share: number | null;
  engagedThreePlusShare: number | null;
  medianGapYears: number | null;
  p90GapYears: number | null;
  contactRate: number | null;
  factionEndingShare: number | null;
}

export interface H2b1bDerived {
  intSpearman: number | null;
  chrSpearman: number | null;
  intMedianGap0to10: number | null;
  chrMedianGap0to10: number | null;
}

export interface H2b1bPayload {
  generatedAt: string;
  contentVersion: string;
  balanceVersion: string;
  baseSeed: string;
  sampling: Record<string, string | number | boolean>;
  arms: H2b1bArm[];
  derived: H2b1bDerived;
  baseline: BaselineReference | null;
}

export interface BandRow {
  id: string;
  group: 'stat' | 'faction' | 'correctness';
  description: string;
  measured: string;
  target: string;
  verdict: Verdict;
  note: string;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function num(value: number | null, digits = 2): string {
  return value === null ? '—' : value.toFixed(digits);
}

function pct(value: number | null, digits = 1): string {
  return value === null ? '—' : `${(value * 100).toFixed(digits)}%`;
}

function dist(d: Distribution, digits = 2): string {
  return `${num(d.mean, digits)} / ${num(d.median, digits)} / ${num(d.p10, digits)} / ${num(d.p90, digits)}`;
}

export function armById(payload: H2b1bPayload, id: string): H2b1bArm | undefined {
  return payload.arms.find((arm) => arm.id === id);
}

function statRow(arm: H2b1bArm | undefined, stat: VisibleStat) {
  return arm?.summary.stats.find((row) => row.stat === stat);
}

/**
 * A band whose direction can be checked against the baseline. `better` says
 * which way is an improvement; a value outside the band that moved the wrong
 * way is a FAIL rather than a REVIEW.
 */
function verdictFor(
  inBand: boolean,
  measured: number | null,
  baseline: number | null,
  better: 'lower' | 'higher',
): Verdict {
  if (inBand) return 'PASS';
  if (measured === null) return 'REVIEW';
  if (baseline === null) return 'REVIEW';
  const moved = better === 'lower' ? measured - baseline : baseline - measured;
  // `moved > 0` means the patch pushed the number the wrong way.
  return moved > 0 ? 'FAIL' : 'REVIEW';
}

// ---------------------------------------------------------------------------
// Review bands
// ---------------------------------------------------------------------------

export function evaluateBands(payload: H2b1bPayload): BandRow[] {
  const rows: BandRow[] = [];
  const general = armById(payload, 'general');
  const int0 = armById(payload, 'int-0');
  const int10 = armById(payload, 'int-10');
  const base = payload.baseline;

  // --- Stat ecology ---------------------------------------------------------
  const intDrift = statRow(general, 'INT')?.drift.mean ?? null;
  rows.push({
    id: 'S1',
    group: 'stat',
    description: 'mean INT drift entering age 18 (general arm)',
    measured: num(intDrift),
    target: '+3.0 to +4.5',
    verdict:
      intDrift === null
        ? 'REVIEW'
        : verdictFor(intDrift >= 3.0 && intDrift <= 4.5, intDrift, base?.meanIntDriftAge18 ?? null, 'lower'),
    note: base ? `pre-patch ${num(base.meanIntDriftAge18)}` : '',
  });

  const int0Median = statRow(int0, 'INT')?.age18.median ?? null;
  rows.push({
    id: 'S2',
    group: 'stat',
    description: 'allocation INT=0: median INT entering 18',
    measured: num(int0Median),
    target: '<= 4',
    verdict: int0Median === null ? 'REVIEW' : int0Median <= 4 ? 'PASS' : 'REVIEW',
    note: '',
  });

  const int0Ge8 = statRow(int0, 'INT')?.shareAge18AtLeast8 ?? null;
  rows.push({
    id: 'S3',
    group: 'stat',
    description: 'allocation INT=0: P(INT >= 8 entering 18)',
    measured: pct(int0Ge8),
    target: '< 5%',
    verdict: int0Ge8 === null ? 'REVIEW' : int0Ge8 < 0.05 ? 'PASS' : 'REVIEW',
    note: '',
  });

  const int0Ge10 = statRow(int0, 'INT')?.shareAge18AtLeast10 ?? null;
  rows.push({
    id: 'S4',
    group: 'stat',
    description: 'allocation INT=0: P(INT >= 10 entering 18)',
    measured: pct(int0Ge10),
    target: '< 1%',
    verdict: int0Ge10 === null ? 'REVIEW' : int0Ge10 < 0.01 ? 'PASS' : 'REVIEW',
    note: '',
  });

  rows.push({
    id: 'S5',
    group: 'stat',
    description: 'median age-18 INT gap, allocation 0 vs 10',
    measured: num(payload.derived.intMedianGap0to10),
    target: '>= 6',
    verdict:
      payload.derived.intMedianGap0to10 === null
        ? 'REVIEW'
        : payload.derived.intMedianGap0to10 >= 6
          ? 'PASS'
          : 'REVIEW',
    note: int0 && int10 ? `${num(statRow(int0, 'INT')?.age18.median ?? null)} -> ${num(statRow(int10, 'INT')?.age18.median ?? null)}` : '',
  });

  rows.push({
    id: 'S6',
    group: 'stat',
    description: 'Spearman rank correlation, allocated INT -> age-18 INT',
    measured: num(payload.derived.intSpearman, 3),
    target: '>= 0.75',
    verdict:
      payload.derived.intSpearman === null
        ? 'REVIEW'
        : payload.derived.intSpearman >= 0.75
          ? 'PASS'
          : 'REVIEW',
    note: 'combined 0/5/10 arms',
  });

  const chrDrift = statRow(general, 'CHR')?.drift.mean ?? null;
  rows.push({
    id: 'S7',
    group: 'stat',
    description: 'mean CHR drift entering age 18 (general arm)',
    measured: num(chrDrift),
    target: '+1.0 to +2.5',
    verdict:
      chrDrift === null
        ? 'REVIEW'
        : verdictFor(chrDrift >= 1.0 && chrDrift <= 2.5, chrDrift, base?.meanChrDriftAge18 ?? null, 'lower'),
    note: base ? `pre-patch ${num(base.meanChrDriftAge18)}` : '',
  });

  rows.push({
    id: 'S8',
    group: 'stat',
    description: 'median age-18 CHR gap, allocation 0 vs 10',
    measured: num(payload.derived.chrMedianGap0to10),
    target: '>= 6',
    verdict:
      payload.derived.chrMedianGap0to10 === null
        ? 'REVIEW'
        : payload.derived.chrMedianGap0to10 >= 6
          ? 'PASS'
          : 'REVIEW',
    note: '',
  });

  const spr65 = general?.summary.spr15At65.share ?? null;
  // "Materially downward from ~96%" is read as at least 15 percentage points
  // below the recorded pre-patch share.
  const sprTarget = base?.spr15At65Share ?? null;
  const sprInBand = spr65 !== null && sprTarget !== null && spr65 <= sprTarget - 0.15;
  rows.push({
    id: 'S9',
    group: 'stat',
    description: 'share of runs active entering 65 holding SPR >= 15',
    measured: pct(spr65),
    target: sprTarget === null ? 'materially below pre-patch' : `<= ${pct(sprTarget - 0.15)}`,
    verdict: sprTarget === null ? 'MEASURED' : verdictFor(sprInBand, spr65, sprTarget, 'lower'),
    note: base ? `pre-patch ${pct(base.spr15At65Share)}` : '',
  });

  const unlimited = (general?.summary.contributors?.repeatableOutliers ?? []).filter(
    (row) => row.stat === 'CHR' && row.repeatMaxCount === null,
  );
  rows.push({
    id: 'S10',
    group: 'stat',
    description: 'no unlimited-repeat late-CHR pathology',
    measured: unlimited.length === 0 ? 'none' : unlimited.map((r) => `${r.eventId}#${r.variantIndex}`).join(', '),
    target: 'no unlimited repeatable is a CHR outlier',
    verdict: unlimited.length === 0 ? 'PASS' : 'FAIL',
    note: '',
  });

  // --- Faction coherence ----------------------------------------------------
  const factions = general?.summary.factions ?? null;
  const contactRate = factions?.overall.anyContactRate ?? null;
  rows.push({
    id: 'F1',
    group: 'faction',
    description: 'overall personal faction contact incidence',
    measured: pct(contactRate),
    target: '25% – 40%',
    verdict:
      contactRate === null ? 'REVIEW' : contactRate >= 0.25 && contactRate <= 0.4 ? 'PASS' : 'REVIEW',
    note: base ? `pre-patch ${pct(base.contactRate)}` : '',
  });

  const threePlus = factions?.overall.engagedThreePlusShare ?? null;
  rows.push({
    id: 'F2',
    group: 'faction',
    description: 'ENGAGED runs reaching 3+ personalized touchpoints',
    measured: pct(threePlus),
    target: '>= 75%',
    verdict:
      threePlus === null
        ? 'REVIEW'
        : verdictFor(threePlus >= 0.75, threePlus, base?.engagedThreePlusShare ?? null, 'higher'),
    note: base ? `pre-patch ${pct(base.engagedThreePlusShare)}` : '',
  });

  const medianGap = factions?.overall.gapYears.median ?? null;
  rows.push({
    id: 'F3',
    group: 'faction',
    description: 'median gap between consecutive personalized faction events',
    measured: num(medianGap),
    target: '1 – 2 years',
    verdict:
      medianGap === null
        ? 'REVIEW'
        : verdictFor(medianGap >= 1 && medianGap <= 2, medianGap, base?.medianGapYears ?? null, 'lower'),
    note: base ? `pre-patch ${num(base.medianGapYears)}` : '',
  });

  const p90Gap = factions?.overall.gapYears.p90 ?? null;
  rows.push({
    id: 'F4',
    group: 'faction',
    description: 'p90 gap between consecutive personalized faction events',
    measured: num(p90Gap),
    target: '<= 3 years',
    verdict: p90Gap === null ? 'REVIEW' : verdictFor(p90Gap <= 3, p90Gap, base?.p90GapYears ?? null, 'lower'),
    note: base ? `pre-patch ${num(base.p90GapYears)}` : '',
  });

  const span = factions?.overall.contactToTerminalYears.median ?? null;
  rows.push({
    id: 'F5',
    group: 'faction',
    description: 'median contact -> commitment/terminal span',
    measured: num(span),
    target: '3 – 6 years',
    verdict: span === null ? 'REVIEW' : span >= 3 && span <= 6 ? 'PASS' : 'REVIEW',
    note: '',
  });

  const endingShare = factions?.overall.factionEndingShareOfCompleted ?? null;
  rows.push({
    id: 'F6',
    group: 'faction',
    description: 'faction endings as a share of completed runs',
    measured: pct(endingShare),
    target: '8% – 15%',
    verdict:
      endingShare === null ? 'REVIEW' : endingShare >= 0.08 && endingShare <= 0.15 ? 'PASS' : 'REVIEW',
    note: base ? `pre-patch ${pct(base.factionEndingShare)}` : '',
  });

  const exitRates = (factions?.byFaction ?? [])
    .map((row) => `${row.shortName} ${pct(row.firstDispositionExitRate)}`)
    .join(', ');
  rows.push({
    id: 'F7',
    group: 'faction',
    description: 'first-disposition exit rate by faction',
    measured: exitRates || '—',
    target: 'measured, not tuned in Part A',
    verdict: 'MEASURED',
    note: '',
  });

  // --- Correctness ----------------------------------------------------------
  const c = general?.summary.correctness;
  const hard: [string, string, number | undefined][] = [
    ['C1', 'endings before age 18', c?.endingsBefore18],
    ['C2', 'Material Commitments before age 18', c?.materialCommitmentsBefore18],
    ['C3', 'pre-25 content coverage defects', c?.coverageDefects],
    ['C4', 'pre-25 generic fallback years', c?.pre25FallbackYears],
    ['C5', 'years with more than one visible event', c?.multipleVisibleEventsInAYear],
    ['C6', 'illegal faction transitions', c?.illegalFactionTransitions],
    ['C7', 'faction lifecycle collisions', c?.lifecycleCollisions],
    ['C8', 'personalized faction events after a terminal exit', c?.personalEventsAfterTerminalExit],
    ['C9', 'runs holding two personally-active factions', c?.runsWithTwoActiveFactions],
    ['C10', 'contacts opened while another faction was active', c?.contactWhileAnotherActive],
    ['C11', 'compressed-chain schedule expiries', c?.compressedChainScheduleExpiries],
  ];
  for (const [id, description, value] of hard) {
    rows.push({
      id,
      group: 'correctness',
      description,
      measured: value === undefined ? '—' : String(value),
      target: '0',
      verdict: value === undefined ? 'REVIEW' : value === 0 ? 'PASS' : 'FAIL',
      note: '',
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export function renderH2b1bReport(content: ContentBundle, payload: H2b1bPayload): string {
  const out: string[] = [];
  const general = armById(payload, 'general');

  out.push('# SOLID STATE — H2B.1B Part A regression');
  out.push('');
  out.push('Generated output. Conclusions live in [`docs/H2B1B_A_FINDINGS.md`](../docs/H2B1B_A_FINDINGS.md).');
  out.push('');
  out.push(`- generated: \`${payload.generatedAt}\``);
  out.push(`- content fingerprint: \`${payload.contentVersion}\``);
  out.push(`- balance: \`${payload.balanceVersion}\``);
  out.push(`- base seed: \`${payload.baseSeed}\``);
  out.push(
    `- sampling: ${Object.entries(payload.sampling)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(', ')}`,
  );
  if (payload.baseline) {
    out.push(`- pre-patch baseline fingerprint: \`${payload.baseline.contentVersion}\``);
  }
  out.push('');

  // Review bands first: this is the thing the milestone is judged on.
  out.push('## Review bands');
  out.push('');
  out.push('PASS satisfies the band. REVIEW is outside it and asks for a human look — nothing');
  out.push('is auto-tuned toward a band. FAIL is a non-zero hard correctness counter, or a value');
  out.push('that moved away from its band relative to the recorded pre-patch baseline.');
  out.push('');
  out.push('| # | Band | Measured | Target | Verdict | Note |');
  out.push('|---|---|---|---|---|---|');
  for (const row of evaluateBands(payload)) {
    out.push(
      `| ${row.id} | ${row.description} | ${row.measured} | ${row.target} | **${row.verdict}** | ${row.note} |`,
    );
  }
  out.push('');

  // Stats, per arm.
  out.push('## Stat ecology');
  out.push('');
  for (const arm of payload.arms) {
    out.push(`### ${arm.label}`);
    out.push('');
    out.push(
      `${arm.runs} runs; ${arm.summary.runsReachingAge18} reached age 18; ${arm.summary.completedRuns} completed.`,
    );
    if (arm.allocation) {
      out.push('');
      out.push(
        `Explicit pre-species allocation: ${Object.entries(arm.allocation)
          .map(([stat, value]) => `${stat} ${value}`)
          .join(', ')}.`,
      );
    }
    out.push('');
    out.push('| Stat | allocated start (mean/med/p10/p90) | effective start | entering 18 | drift | >=5 | >=8 | >=10 | >=15 |');
    out.push('|---|---|---|---|---|---|---|---|---|');
    for (const row of arm.summary.stats) {
      out.push(
        `| ${row.stat} | ${dist(row.allocatedStart)} | ${dist(row.effectiveStart)} | ${dist(row.age18)} | ` +
          `${dist(row.drift)} | ${pct(row.shareAge18AtLeast5)} | ${pct(row.shareAge18AtLeast8)} | ` +
          `${pct(row.shareAge18AtLeast10)} | ${pct(row.shareAge18AtLeast15)} |`,
      );
    }
    out.push('');
  }

  if (general) {
    // Part A changes no ending gate, but it does move the stats those gates
    // read, so the resulting outcome shape is reported rather than assumed.
    out.push('## Run outcomes (general arm)');
    out.push('');
    const o = general.summary.outcomes;
    out.push(
      `Completed ${o.completedRuns} (${pct(o.completionRate)}), nonterminal ${o.nonterminalRuns}, ` +
        `coverage errors ${o.coverageErrorRuns}. Ending age: mean ${num(o.endingAge.mean, 1)}, ` +
        `median ${num(o.endingAge.median, 1)}, p10 ${num(o.endingAge.p10, 1)}, p90 ${num(o.endingAge.p90, 1)}.`,
    );
    out.push('');
    if (payload.baseline) {
      out.push('');
      out.push(
        `Pre-patch: completed ${pct(payload.baseline.completionRate)}, median ending age ` +
          `${num(payload.baseline.medianEndingAge, 1)}, 35-44 ${pct(payload.baseline.endingShare35to44)}, ` +
          `65+ ${pct(payload.baseline.endingShare65Plus)}. Part A changes no ending gate; this table is` +
          ' reported so the shift caused by the stat ecology is visible, not treated as a target.',
      );
    }
    out.push('');
    out.push('| Ending age band | Runs | Share of completed |');
    out.push('|---|---|---|');
    for (const [band, count] of Object.entries(o.endingAgeCountByBand)) {
      out.push(`| ${band} | ${count} | ${pct(o.endingAgeShareByBand[band] ?? 0)} |`);
    }
    out.push('');

    out.push('## Mean drift by snapshot (general arm)');
    out.push('');
    out.push('| Snapshot | active runs | INT drift | CHR drift | SPR drift | INT | CHR | SPR |');
    out.push('|---|---|---|---|---|---|---|---|');
    for (const snapshot of general.summary.driftSnapshots) {
      out.push(
        `| ${snapshot.label} | ${snapshot.activeRuns} | ${num(snapshot.meanDrift.INT ?? null)} | ` +
          `${num(snapshot.meanDrift.CHR ?? null)} | ${num(snapshot.meanDrift.SPR ?? null)} | ` +
          `${num(snapshot.meanValue.INT ?? null)} | ${num(snapshot.meanValue.CHR ?? null)} | ` +
          `${num(snapshot.meanValue.SPR ?? null)} |`,
      );
    }
    out.push('');
    out.push(
      `SPR >= 15 entering 65: ${general.summary.spr15At65.atLeast15} of ` +
        `${general.summary.spr15At65.activeRuns} still-active runs (${pct(general.summary.spr15At65.share)}).`,
    );
    out.push('');

    const audit = general.summary.contributors;
    if (audit) {
      out.push('## Contributor audit (authored INT / CHR / SPR deltas)');
      out.push('');
      out.push('Top five positive and negative contributors per stat and age band, ranked by');
      out.push('total magnitude. `R` marks a repeatable event; `!` marks one flagged as a severe');
      out.push('outlier for its band.');
      out.push('');
      out.push('| Stat | Band | Sign | Event | Variant | Delta | Occurrences | Total | |');
      out.push('|---|---|---|---|---|---|---|---|---|');
      for (const stat of Object.keys(audit.byStat)) {
        for (const band of audit.bands) {
          const cell = audit.byStat[stat]?.[band];
          if (!cell) continue;
          for (const [sign, list] of [
            ['+', cell.positive.slice(0, 5)],
            ['-', cell.negative.slice(0, 5)],
          ] as const) {
            for (const row of list) {
              const marks = `${row.repeatPolicy === 'repeatable' ? 'R' : ''}${row.repeatableOutlier ? '!' : ''}`;
              out.push(
                `| ${stat} | ${band} | ${sign} | ${row.eventId} | ${row.variantIndex} | ${row.delta} | ` +
                  `${row.occurrences} | ${row.totalMagnitude} | ${marks} |`,
              );
            }
          }
        }
      }
      out.push('');
      out.push('### Repeatable severe outliers');
      out.push('');
      if (audit.repeatableOutliers.length === 0) {
        out.push('None. No repeatable event dominates its stat/age band.');
      } else {
        out.push('| Stat | Band | Event | Variant | Delta | Occurrences | Total | repeatMaxCount |');
        out.push('|---|---|---|---|---|---|---|---|');
        for (const row of audit.repeatableOutliers) {
          out.push(
            `| ${row.stat} | ${row.band} | ${row.eventId} | ${row.variantIndex} | ${row.delta} | ` +
              `${row.occurrences} | ${row.totalMagnitude} | ${row.repeatMaxCount ?? 'unlimited'} |`,
          );
        }
      }
      out.push('');
    }

    const factions = general.summary.factions;
    if (factions) {
      out.push('## Faction coherence');
      out.push('');
      out.push('| Faction | contact | disposition | ENGAGED | COMMITTED | exits | endings | tp/contacted (med) | tp/ENGAGED (med) | 3+ | gap med/p90/max | span med/p90 | 1st-disp exit | expiries |');
      out.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
      for (const row of factions.byFaction) {
        out.push(
          `| ${row.shortName} | ${pct(row.contactRate)} | ${pct(row.dispositionRate)} | ` +
            `${pct(row.engagedRate)} | ${pct(row.committedRate)} | ${pct(row.exitRate)} | ` +
            `${row.endingRuns} (${pct(row.endingShareOfCompleted)}) | ${num(row.touchpointsPerContacted.median, 1)} | ` +
            `${num(row.touchpointsPerEngaged.median, 1)} | ${pct(row.engagedThreePlusShare)} | ` +
            `${num(row.gapYears.median, 1)}/${num(row.gapYears.p90, 1)}/${num(row.gapYears.max, 0)} | ` +
            `${num(row.contactToTerminalYears.median, 1)}/${num(row.contactToTerminalYears.p90, 1)} | ` +
            `${pct(row.firstDispositionExitRate)} | ${row.scheduleExpiries} |`,
        );
      }
      out.push('');
      const overall = factions.overall;
      out.push(
        `Overall: ${overall.anyContactRuns} runs with a contact (${pct(overall.anyContactRate)}); ` +
          `${overall.engagedRuns} reached ENGAGED, ${overall.engagedRunsWith3Plus} of those saw 3+ ` +
          `personalized touchpoints (${pct(overall.engagedThreePlusShare)}). Gaps: median ` +
          `${num(overall.gapYears.median, 1)}, p75 ${num(overall.gapYears.p75, 1)}, p90 ` +
          `${num(overall.gapYears.p90, 1)}, max ${num(overall.gapYears.max, 0)}. Contact -> ` +
          `commitment/terminal span: median ${num(overall.contactToTerminalYears.median, 1)}, p75 ` +
          `${num(overall.contactToTerminalYears.p75, 1)}, p90 ${num(overall.contactToTerminalYears.p90, 1)}. ` +
          `Maximum simultaneously active factions: ${overall.maxSimultaneouslyActive}.`,
      );
      out.push('');
    }

    out.push('## Correctness counters');
    out.push('');
    out.push('| Counter | Value |');
    out.push('|---|---|');
    const c = general.summary.correctness;
    out.push(`| endings before 18 | ${c.endingsBefore18} |`);
    out.push(`| Material Commitments before 18 | ${c.materialCommitmentsBefore18} |`);
    out.push(`| pre-25 coverage defects | ${c.coverageDefects} |`);
    out.push(`| pre-25 generic fallback years | ${c.pre25FallbackYears} |`);
    out.push(`| years with more than one visible event | ${c.multipleVisibleEventsInAYear} |`);
    out.push(`| illegal faction transitions | ${c.illegalFactionTransitions} |`);
    out.push(`| faction lifecycle collisions | ${c.lifecycleCollisions} |`);
    out.push(`| personalized faction events after terminal exit | ${c.personalEventsAfterTerminalExit} |`);
    out.push(`| runs with two personally-active factions | ${c.runsWithTwoActiveFactions} |`);
    out.push(`| contacts opened while another faction was active | ${c.contactWhileAnotherActive} |`);
    out.push(`| compressed-chain schedule expiries | ${c.compressedChainScheduleExpiries} |`);
    out.push('');
    const byEvent = Object.entries(c.compressedChainExpiriesByEvent);
    if (byEvent.length > 0) {
      out.push(`Compressed-chain expiries by event: ${byEvent.map(([id, n]) => `${id} ${n}`).join(', ')}.`);
      out.push('');
    }
  }

  out.push('## Derived');
  out.push('');
  out.push(`- Spearman allocated INT -> age-18 INT (combined 0/5/10 arms): ${num(payload.derived.intSpearman, 3)}`);
  out.push(`- Spearman allocated CHR -> age-18 CHR (combined 0/5/10 arms): ${num(payload.derived.chrSpearman, 3)}`);
  out.push(`- median age-18 INT gap, allocation 0 vs 10: ${num(payload.derived.intMedianGap0to10)}`);
  out.push(`- median age-18 CHR gap, allocation 0 vs 10: ${num(payload.derived.chrMedianGap0to10)}`);
  out.push('');
  out.push(`Corpus: ${content.events.length} events across ${content.batches.length} batches.`);
  out.push('');
  return out.join('\n');
}

/** Pulls the pre-patch reference numbers out of an earlier payload. */
export function baselineFrom(payload: H2b1bPayload): BaselineReference {
  const general = armById(payload, 'general');
  const factions = general?.summary.factions ?? null;
  const outcomes = general?.summary.outcomes;
  return {
    contentVersion: payload.contentVersion,
    completionRate: outcomes?.completionRate ?? null,
    medianEndingAge: outcomes?.endingAge.median ?? null,
    endingShare35to44: outcomes?.endingAgeShareByBand['35-44'] ?? null,
    endingShare65Plus: outcomes?.endingAgeShareByBand['65+'] ?? null,
    meanIntDriftAge18: general?.summary.stats.find((r) => r.stat === 'INT')?.drift.mean ?? null,
    meanChrDriftAge18: general?.summary.stats.find((r) => r.stat === 'CHR')?.drift.mean ?? null,
    spr15At65Share: general?.summary.spr15At65.share ?? null,
    engagedThreePlusShare: factions?.overall.engagedThreePlusShare ?? null,
    medianGapYears: factions?.overall.gapYears.median ?? null,
    p90GapYears: factions?.overall.gapYears.p90 ?? null,
    contactRate: factions?.overall.anyContactRate ?? null,
    factionEndingShare: factions?.overall.factionEndingShareOfCompleted ?? null,
  };
}
