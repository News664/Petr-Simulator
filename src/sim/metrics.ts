import type { ContentBundle } from '../engine/content/load.js';
import { allFactionFlags } from '../engine/factions.js';
import type { RunResult } from '../engine/simulation.js';
import { CHANNELS, SPECIES_IDS, type Channel, type SpeciesId } from '../engine/types.js';

/**
 * Monte Carlo aggregation.
 *
 * Covers every metric required by Phase-1 Acceptance section P and Core Contract
 * section 32. Metrics only measure; nothing here tunes content or balance.
 */

export interface AgeBand {
  label: string;
  minAge: number;
  maxAge: number | null;
}

export function bandsFromBalance(content: ContentBundle): AgeBand[] {
  return content.balance.ageChannelWeights.map((band) => ({
    label: band.maxAge === null ? `${band.minAge}+` : `${band.minAge}-${band.maxAge}`,
    minAge: band.minAge,
    maxAge: band.maxAge,
  }));
}

function bandFor(bands: AgeBand[], age: number): AgeBand | undefined {
  return bands.find((band) => age >= band.minAge && (band.maxAge === null || age <= band.maxAge));
}

function increment(map: Record<string, number>, key: string, by = 1): void {
  map[key] = (map[key] ?? 0) + by;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[index]!;
}

/** Shannon entropy in bits over a count map. */
export function entropyBits(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let h = 0;
  for (const count of Object.values(counts)) {
    if (count <= 0) continue;
    const p = count / total;
    h -= p * Math.log2(p);
  }
  return h;
}

export interface GuardrailFinding {
  id: string;
  severity: 'warning' | 'failure';
  message: string;
}

export interface MetricsSummary {
  runs: number;
  completed: number;
  nonterminal: number;
  coverageErrors: number;
  completedRate: number;
  nonterminalRate: number;
  coverageErrorRate: number;

  averageRunLengthYears: number | null;
  averageEndingAge: number | null;
  medianEndingAge: number | null;
  endingAgeP10: number | null;
  endingAgeP90: number | null;
  endingAgeHistogram: Record<string, number>;
  endingAgeShareByTargetBucket: {
    band: string;
    observedShare: number;
    targetMin: number;
    targetMax: number;
    withinTarget: boolean;
  }[];

  channelCountsByAgeBand: Record<string, Record<Channel, number>>;
  familyCountsByAgeBand: Record<string, Record<string, number>>;

  totalEventYears: number;
  /** Phase 1.1: SPC channel and mandatory-event usage. */
  spcEventYears: number;
  spcShare: number;
  mandatoryEventYears: number;
  mandatoryUsageRate: number;
  /** Phase 1.1: share of completed runs ending at 65 or later. */
  endingShare65Plus: number;

  /** Phase 1.2 faction layer. */
  factionContactRate: Record<string, number>;
  factionClimaxRate: Record<string, number>;
  endingCountsByFaction: Record<string, number>;
  endingCountsByRouteFamily: Record<string, number>;
  /** When each route family's endings actually land. Explains band shortfalls. */
  endingAgeByRouteFamily: Record<string, { mean: number | null; median: number | null; runs: number }>;
  scheduleExpiryByRouteFamily: Record<string, number>;
  mandatoryIncidenceByRouteFamily: Record<string, number>;
  /**
   * Fallback share per age band, conditional on the run still being active in
   * that band. A run that ended at 30 contributes nothing to the 45-54 band.
   */
  fallbackShareByAgeBandActive: Record<string, { fallbackYears: number; activeYears: number; share: number }>;
  /**
   * Phase 1.3: the lore-fallback tier, reported separately from generic
   * fallback. `combined` is the substitution view — how often a year was filled
   * by *some* fallback — and deliberately keeps the two categories visible,
   * because lore fallback is world texture, not evidence that the quiet-year
   * problem is solved (Q-23/Q-30).
   */
  loreFallbackShareByAgeBandActive: Record<
    string,
    {
      loreFallbackYears: number;
      genericFallbackYears: number;
      activeYears: number;
      loreShare: number;
      genericShare: number;
      combinedShare: number;
    }
  >;
  loreFallbackYears: number;
  loreFallbackShare: number;
  /** Mean FIX at Material Commitment and at the ending. */
  meanFixAtCommitment: number | null;
  meanFixAtEnding: number | null;
  fallbackYears: number;
  fallbackUseRate: number;
  fallbackYearsAge25Plus: number;
  fallbackShareAge25Plus: number;
  pre25FallbackYears: number;
  pre25CoverageDefectRate: number;
  pre25CoverageDefectAges: Record<string, number>;
  pre25EmergencyReuseYears: number;

  routeEntryRate: number;
  routeEntryCountsByRoute: Record<string, number>;
  routeClimaxRate: number;
  routeClimaxCountsByEvent: Record<string, number>;
  routeAbandonmentRate: number;
  expiredScheduleCount: number;
  expiredSchedulesByEvent: Record<string, number>;

  priorityCollisionRate: number;
  priorityCollisionYears: number;
  scheduleDisplacementCount: number;
  scheduleDisplacementPerRun: number;

  finalMaterialDistribution: Record<string, number>;
  finalMaterialBySpecies: Record<string, Record<string, number>>;
  materialCommitmentRate: number;
  materialEntropyBitsOverall: number;
  materialEntropyBitsBySpecies: Record<string, number>;

  pFinalGivenHint: Record<string, { hintRuns: number; sameMaterial: number; probability: number }>;
  pFinalGivenFirstManifestation: Record<
    string,
    { manifestationRuns: number; sameMaterial: number; probability: number }
  >;
  /** Phase 1.1 Q-22: first-manifestation family distribution and timing. */
  firstManifestationFamilyCounts: Record<string, number>;
  firstManifestationFamilyShare: Record<string, number>;
  firstManifestationAgeByFamily: Record<string, { mean: number | null; median: number | null; runs: number }>;
  noManifestationRate: number;
  multipleManifestationBeforeCommitmentRate: number;
  averageHintAge: number | null;
  averageFirstManifestationAge: number | null;
  averageCommitmentAge: number | null;

  talentActivationRate: Record<string, number>;
  talentActivationAverageAge: Record<string, number | null>;

  endingDistribution: Record<string, number>;
  distinctEndingsObserved: number;
  distinctEndingsInRegistry: number;
  endingCoverageShare: number;
  hiddenEndingRate: number;
  rareEndingRate: number;

  finalStatMeans: Record<string, number | null>;
  finalFixPercentiles: { p50: number | null; p90: number | null; p99: number | null; max: number | null };

  guardrails: GuardrailFinding[];
}

export function aggregate(content: ContentBundle, results: RunResult[]): MetricsSummary {
  const bands = bandsFromBalance(content);
  const runs = results.length;

  let completed = 0;
  let nonterminal = 0;
  let coverageErrors = 0;

  const runLengths: number[] = [];
  const endingAges: number[] = [];
  const endingAgeHistogram: Record<string, number> = {};
  const channelCountsByAgeBand: Record<string, Record<Channel, number>> = {};
  const familyCountsByAgeBand: Record<string, Record<string, number>> = {};
  for (const band of bands) {
    channelCountsByAgeBand[band.label] = { ORD: 0, INS: 0, TRN: 0, SPC: 0 };
    familyCountsByAgeBand[band.label] = {};
  }

  let totalEventYears = 0;
  let spcEventYears = 0;
  let mandatoryEventYears = 0;
  let runsUsingMandatory = 0;
  let fallbackYears = 0;
  const factionContact: Record<string, number> = {};
  const factionClimax: Record<string, number> = {};
  const endingCountsByFaction: Record<string, number> = {};
  const endingCountsByRouteFamily: Record<string, number> = {};
  const endingAgesByRouteFamily: Record<string, number[]> = {};
  const scheduleExpiryByRouteFamily: Record<string, number> = {};
  const mandatoryIncidenceByRouteFamily: Record<string, number> = {};
  const bandFallback: Record<string, { fallbackYears: number; loreFallbackYears: number; activeYears: number }> =
    {};
  for (const band of bands) bandFallback[band.label] = { fallbackYears: 0, loreFallbackYears: 0, activeYears: 0 };
  let loreFallbackYears = 0;
  const fixAtCommitment: number[] = [];
  const fixAtEnding: number[] = [];

  // Faction flag -> faction short name, for attribution.
  const factionByFlag = new Map<string, string>();
  const factionTagToName = new Map<string, string>();
  for (const faction of content.factions.values()) {
    for (const flag of allFactionFlags(faction)) factionByFlag.set(flag, faction.shortName);
    factionTagToName.set(faction.routeTag, faction.shortName);
  }
  /** Attributes an event to a faction (if any) or otherwise to its channel/family. */
  const routeFamilyOf = (eventId: string): string => {
    const gameEvent = content.eventsById.get(eventId);
    if (!gameEvent) return 'unknown';
    for (const tag of gameEvent.routeTags) {
      const name = factionTagToName.get(tag);
      if (name) return `faction:${name}`;
    }
    return `${gameEvent.channel}/${gameEvent.family}`;
  };
  let fallbackYearsAge25Plus = 0;
  let pre25FallbackYears = 0;
  let eventYearsAge25Plus = 0;
  let pre25EmergencyReuseYears = 0;
  const pre25CoverageDefectAges: Record<string, number> = {};

  let runsWithRouteEntry = 0;
  const routeEntryCountsByRoute: Record<string, number> = {};
  let runsWithRouteClimax = 0;
  const routeClimaxCountsByEvent: Record<string, number> = {};
  let runsWithExpiredSchedule = 0;
  let expiredScheduleCount = 0;
  const expiredSchedulesByEvent: Record<string, number> = {};

  let priorityCollisionYears = 0;
  let runsWithCollision = 0;
  let scheduleDisplacementCount = 0;

  const finalMaterialDistribution: Record<string, number> = {};
  const finalMaterialBySpecies: Record<string, Record<string, number>> = {};
  for (const species of SPECIES_IDS) finalMaterialBySpecies[species] = {};
  let committedRuns = 0;

  const hintStats: Record<string, { hintRuns: number; sameMaterial: number }> = {};
  const manifestStats: Record<string, { manifestationRuns: number; sameMaterial: number }> = {};
  let multiManifestRuns = 0;
  const hintAges: number[] = [];
  const firstManifestAges: number[] = [];
  const commitmentAges: number[] = [];
  const firstManifestationFamilyCounts: Record<string, number> = {};
  const firstManifestAgesByFamily: Record<string, number[]> = {};
  let runsWithoutManifestation = 0;

  const talentRunCounts: Record<string, number> = {};
  const talentActivationCounts: Record<string, number> = {};
  const talentActivationAges: Record<string, number[]> = {};

  const endingDistribution: Record<string, number> = {};
  let hiddenEndings = 0;
  let rareEndings = 0;

  const finalStats: Record<string, number[]> = { CHR: [], INT: [], STR: [], MNY: [], SPR: [], FIX: [] };

  for (const result of results) {
    const state = result.state;
    const diagnostics = state.diagnostics;

    runLengths.push(state.history.length);
    totalEventYears += state.history.length;

    let usedMandatory = false;
    const mandatoryFamilies = new Set<string>();
    for (const occurrence of state.history) {
      const activeBand = bandFor(bands, occurrence.age);
      if (activeBand) {
        bandFallback[activeBand.label]!.activeYears += 1;
        if (occurrence.source === 'fallback') bandFallback[activeBand.label]!.fallbackYears += 1;
        if (occurrence.source === 'lore_fallback') bandFallback[activeBand.label]!.loreFallbackYears += 1;
      }
      if (occurrence.source === 'lore_fallback') loreFallbackYears += 1;
      if (occurrence.selectionMode === 'mandatory_only') mandatoryFamilies.add(routeFamilyOf(occurrence.eventId));
      if (occurrence.channel === 'SPC') spcEventYears += 1;
      if (occurrence.selectionMode === 'mandatory_only') {
        mandatoryEventYears += 1;
        usedMandatory = true;
      }
      const band = bandFor(bands, occurrence.age);
      if (band) {
        channelCountsByAgeBand[band.label]![occurrence.channel] += 1;
        increment(familyCountsByAgeBand[band.label]!, `${occurrence.channel}/${occurrence.family}`);
      }
      if (occurrence.age >= 25) eventYearsAge25Plus += 1;
      if (occurrence.source === 'fallback') {
        fallbackYears += 1;
        if (occurrence.age >= 25) fallbackYearsAge25Plus += 1;
        else pre25FallbackYears += 1;
      }
    }

    if (usedMandatory) runsUsingMandatory += 1;
    for (const family of mandatoryFamilies) increment(mandatoryIncidenceByRouteFamily, family);

    // Faction contact and climax attribution.
    const contacted = new Set<string>();
    for (const flag of state.flags) {
      const name = factionByFlag.get(flag);
      if (name) contacted.add(name);
    }
    for (const name of contacted) increment(factionContact, name);

    for (const expired of diagnostics.expiredSchedules) {
      increment(scheduleExpiryByRouteFamily, routeFamilyOf(expired.eventId));
    }

    if (diagnostics.fixAtCommitment !== null) fixAtCommitment.push(diagnostics.fixAtCommitment);
    pre25EmergencyReuseYears += diagnostics.emergencyReuseAges.length;

    if (diagnostics.routeEntries.length > 0) runsWithRouteEntry += 1;
    for (const route of diagnostics.routeEntries) increment(routeEntryCountsByRoute, route);
    if (diagnostics.routeClimaxes.length > 0) runsWithRouteClimax += 1;
    for (const climax of diagnostics.routeClimaxes) increment(routeClimaxCountsByEvent, climax);

    if (diagnostics.expiredSchedules.length > 0) runsWithExpiredSchedule += 1;
    expiredScheduleCount += diagnostics.expiredSchedules.length;
    for (const expired of diagnostics.expiredSchedules) increment(expiredSchedulesByEvent, expired.eventId);

    priorityCollisionYears += diagnostics.priorityCollisionAges.length;
    if (diagnostics.priorityCollisionAges.length > 0) runsWithCollision += 1;
    scheduleDisplacementCount += diagnostics.displacementCount;

    for (const talentId of state.talents) increment(talentRunCounts, talentId);
    for (const activation of diagnostics.talentActivations) {
      increment(talentActivationCounts, activation.talentId);
      (talentActivationAges[activation.talentId] ??= []).push(activation.age);
    }

    for (const [key, values] of Object.entries(finalStats)) {
      values.push(state.stats[key as keyof typeof state.stats]);
    }

    // Material outcome bookkeeping uses the final committed material.
    const finalMaterial = state.material;
    increment(finalMaterialDistribution, finalMaterial);
    increment(finalMaterialBySpecies[state.species]!, finalMaterial);
    if (finalMaterial !== 'NONE') {
      committedRuns += 1;
      if (diagnostics.commitmentAge !== null) commitmentAges.push(diagnostics.commitmentAge);
    }

    if (diagnostics.firstHintFamily) {
      const family = diagnostics.firstHintFamily;
      (hintStats[family] ??= { hintRuns: 0, sameMaterial: 0 }).hintRuns += 1;
      if (finalMaterial === family) hintStats[family]!.sameMaterial += 1;
      if (diagnostics.firstHintAge !== null) hintAges.push(diagnostics.firstHintAge);
    }
    if (diagnostics.firstManifestationFamily) {
      const family = diagnostics.firstManifestationFamily;
      (manifestStats[family] ??= { manifestationRuns: 0, sameMaterial: 0 }).manifestationRuns += 1;
      if (finalMaterial === family) manifestStats[family]!.sameMaterial += 1;
      increment(firstManifestationFamilyCounts, family);
      if (diagnostics.firstManifestationAge !== null) {
        firstManifestAges.push(diagnostics.firstManifestationAge);
        (firstManifestAgesByFamily[family] ??= []).push(diagnostics.firstManifestationAge);
      }
    } else {
      runsWithoutManifestation += 1;
    }
    if (diagnostics.manifestationFamilies.length > 1) multiManifestRuns += 1;

    switch (result.outcome.kind) {
      case 'ended': {
        completed += 1;
        const ending = result.outcome.ending;
        fixAtEnding.push(state.stats.FIX);
        const family = routeFamilyOf(ending.sourceEventId);
        increment(endingCountsByRouteFamily, family);
        (endingAgesByRouteFamily[family] ??= []).push(ending.endingAge);
        if (family.startsWith('faction:')) {
          const name = family.slice('faction:'.length);
          increment(endingCountsByFaction, name);
          increment(factionClimax, name);
        }
        endingAges.push(ending.endingAge);
        const band = bandFor(bands, ending.endingAge);
        if (band) increment(endingAgeHistogram, band.label);
        increment(endingDistribution, ending.endingId);
        const def = content.endings.get(ending.endingId);
        if (def?.hidden) hiddenEndings += 1;
        if (def?.discoveryClass === 'rare' || def?.discoveryClass === 'hidden') rareEndings += 1;
        break;
      }
      case 'nonterminal':
        nonterminal += 1;
        break;
      case 'coverage_error':
        coverageErrors += 1;
        increment(pre25CoverageDefectAges, String(result.outcome.age));
        break;
    }
  }

  const rate = (n: number): number => (runs === 0 ? 0 : n / runs);

  const endingAgeShareByTargetBucket = content.balance.targetEndingAgeShare.map((target) => {
    const label = target.maxAge === null ? `${target.minAge}+` : `${target.minAge}-${target.maxAge}`;
    const inBucket = endingAges.filter(
      (age) => age >= target.minAge && (target.maxAge === null || age <= target.maxAge),
    ).length;
    const observedShare = completed === 0 ? 0 : inBucket / completed;
    return {
      band: label,
      observedShare,
      targetMin: target.minShare,
      targetMax: target.maxShare,
      withinTarget: observedShare >= target.minShare && observedShare <= target.maxShare,
    };
  });

  const pFinalGivenHint: MetricsSummary['pFinalGivenHint'] = {};
  for (const [family, stats] of Object.entries(hintStats)) {
    pFinalGivenHint[family] = {
      hintRuns: stats.hintRuns,
      sameMaterial: stats.sameMaterial,
      probability: stats.hintRuns === 0 ? 0 : stats.sameMaterial / stats.hintRuns,
    };
  }
  const pFinalGivenFirstManifestation: MetricsSummary['pFinalGivenFirstManifestation'] = {};
  for (const [family, stats] of Object.entries(manifestStats)) {
    pFinalGivenFirstManifestation[family] = {
      manifestationRuns: stats.manifestationRuns,
      sameMaterial: stats.sameMaterial,
      probability: stats.manifestationRuns === 0 ? 0 : stats.sameMaterial / stats.manifestationRuns,
    };
  }

  const talentActivationRate: Record<string, number> = {};
  const talentActivationAverageAge: Record<string, number | null> = {};
  for (const [talentId, held] of Object.entries(talentRunCounts)) {
    const activations = talentActivationCounts[talentId] ?? 0;
    talentActivationRate[talentId] = held === 0 ? 0 : activations / held;
    talentActivationAverageAge[talentId] = mean(talentActivationAges[talentId] ?? []);
  }

  const firstManifestationTotal = Object.values(firstManifestationFamilyCounts).reduce((a, b) => a + b, 0);
  const firstManifestationFamilyShare: Record<string, number> = {};
  for (const [family, count] of Object.entries(firstManifestationFamilyCounts)) {
    firstManifestationFamilyShare[family] = firstManifestationTotal === 0 ? 0 : count / firstManifestationTotal;
  }
  const firstManifestationAgeByFamily: MetricsSummary['firstManifestationAgeByFamily'] = {};
  for (const [family, ages] of Object.entries(firstManifestAgesByFamily)) {
    firstManifestationAgeByFamily[family] = { mean: mean(ages), median: median(ages), runs: ages.length };
  }

  const materialEntropyBitsBySpecies: Record<string, number> = {};
  for (const [species, counts] of Object.entries(finalMaterialBySpecies)) {
    materialEntropyBitsBySpecies[species] = entropyBits(counts);
  }

  const guardrails: GuardrailFinding[] = [];

  if (pre25FallbackYears > 0) {
    guardrails.push({
      id: 'pre25-fallback',
      severity: 'failure',
      message: `${pre25FallbackYears} fallback_only event(s) were emitted before age 25; the taxonomy forbids this.`,
    });
  }
  if (coverageErrors > 0) {
    guardrails.push({
      id: 'pre25-coverage-defect',
      severity: 'failure',
      message: `${coverageErrors}/${runs} runs (${(rate(coverageErrors) * 100).toFixed(1)}%) hit an empty pre-25 event pool. Ages: ${Object.keys(pre25CoverageDefectAges).sort((a, b) => Number(a) - Number(b)).join(', ')}.`,
    });
  }
  const fallbackShareAge25Plus = eventYearsAge25Plus === 0 ? 0 : fallbackYearsAge25Plus / eventYearsAge25Plus;
  if (fallbackShareAge25Plus > content.balance.fallbackGuardrails.warningIfAbove) {
    guardrails.push({
      id: 'fallback-share',
      severity: 'warning',
      message: `Age-25+ fallback share ${(fallbackShareAge25Plus * 100).toFixed(1)}% exceeds the warning threshold ${(content.balance.fallbackGuardrails.warningIfAbove * 100).toFixed(1)}% (target ${(content.balance.fallbackGuardrails.targetFallbackShareAge25Plus * 100).toFixed(1)}%).`,
    });
  }
  for (const bucket of endingAgeShareByTargetBucket) {
    if (!bucket.withinTarget) {
      guardrails.push({
        id: `ending-age-share-${bucket.band}`,
        severity: 'warning',
        message: `Ending age band ${bucket.band}: observed ${(bucket.observedShare * 100).toFixed(1)}% vs target ${(bucket.targetMin * 100).toFixed(0)}-${(bucket.targetMax * 100).toFixed(0)}%.`,
      });
    }
  }
  const hintCap = content.balance.materialDeterminismGuardrails.maxSameMaterialShareGivenOnlyMatchingHint;
  for (const [family, stats] of Object.entries(pFinalGivenHint)) {
    if (stats.hintRuns >= 30 && stats.probability > hintCap) {
      guardrails.push({
        id: `hint-determinism-${family}`,
        severity: 'warning',
        message: `P(final ${family} | hint ${family}) = ${(stats.probability * 100).toFixed(1)}% exceeds ${(hintCap * 100).toFixed(0)}%.`,
      });
    }
  }
  const manifestCap = content.balance.materialDeterminismGuardrails.maxSameMaterialShareGivenFirstManifestation;
  for (const [family, stats] of Object.entries(pFinalGivenFirstManifestation)) {
    if (stats.manifestationRuns >= 30 && stats.probability > manifestCap) {
      guardrails.push({
        id: `manifestation-determinism-${family}`,
        severity: 'warning',
        message: `P(final ${family} | first manifestation ${family}) = ${(stats.probability * 100).toFixed(1)}% exceeds ${(manifestCap * 100).toFixed(0)}%.`,
      });
    }
  }
  const woodShare = firstManifestationFamilyShare['WOOD'] ?? 0;
  if (firstManifestationTotal >= 100 && woodShare > 0.5) {
    guardrails.push({
      id: 'first-manifestation-wood-dominance',
      severity: 'failure',
      message: `WOOD is the first manifestation in ${(woodShare * 100).toFixed(1)}% of runs with a manifestation; the Phase-1.1 addendum treats >50% as a failure of opportunity balance (Q-22).`,
    });
  }
  if (nonterminal > 0) {
    guardrails.push({
      id: 'nonterminal-rate',
      severity: nonterminal / Math.max(runs, 1) > 0.5 ? 'failure' : 'warning',
      message: `${nonterminal}/${runs} runs (${(rate(nonterminal) * 100).toFixed(1)}%) reached the diagnostic maximum age without an ending.`,
    });
  }

  const distinctEndingsInRegistry = content.endings.size;
  const distinctEndingsObserved = Object.keys(endingDistribution).length;

  return {
    runs,
    completed,
    nonterminal,
    coverageErrors,
    completedRate: rate(completed),
    nonterminalRate: rate(nonterminal),
    coverageErrorRate: rate(coverageErrors),

    averageRunLengthYears: mean(runLengths),
    averageEndingAge: mean(endingAges),
    medianEndingAge: median(endingAges),
    endingAgeP10: percentile(endingAges, 10),
    endingAgeP90: percentile(endingAges, 90),
    endingAgeHistogram,
    endingAgeShareByTargetBucket,

    channelCountsByAgeBand,
    familyCountsByAgeBand,

    totalEventYears,
    spcEventYears,
    spcShare: totalEventYears === 0 ? 0 : spcEventYears / totalEventYears,
    mandatoryEventYears,
    mandatoryUsageRate: rate(runsUsingMandatory),
    endingShare65Plus: completed === 0 ? 0 : endingAges.filter((age) => age >= 65).length / completed,

    factionContactRate: Object.fromEntries(
      [...content.factions.values()].map((f) => [f.shortName, rate(factionContact[f.shortName] ?? 0)]),
    ),
    factionClimaxRate: Object.fromEntries(
      [...content.factions.values()].map((f) => [f.shortName, rate(factionClimax[f.shortName] ?? 0)]),
    ),
    endingCountsByFaction,
    endingCountsByRouteFamily,
    endingAgeByRouteFamily: Object.fromEntries(
      Object.entries(endingAgesByRouteFamily).map(([family, ages]) => [
        family,
        { mean: mean(ages), median: median(ages), runs: ages.length },
      ]),
    ),
    scheduleExpiryByRouteFamily,
    mandatoryIncidenceByRouteFamily,
    fallbackShareByAgeBandActive: Object.fromEntries(
      Object.entries(bandFallback).map(([label, counts]) => [
        label,
        {
          fallbackYears: counts.fallbackYears,
          activeYears: counts.activeYears,
          share: counts.activeYears === 0 ? 0 : counts.fallbackYears / counts.activeYears,
        },
      ]),
    ),
    loreFallbackShareByAgeBandActive: Object.fromEntries(
      Object.entries(bandFallback).map(([label, counts]) => [
        label,
        {
          loreFallbackYears: counts.loreFallbackYears,
          genericFallbackYears: counts.fallbackYears,
          activeYears: counts.activeYears,
          loreShare: counts.activeYears === 0 ? 0 : counts.loreFallbackYears / counts.activeYears,
          genericShare: counts.activeYears === 0 ? 0 : counts.fallbackYears / counts.activeYears,
          combinedShare:
            counts.activeYears === 0 ? 0 : (counts.loreFallbackYears + counts.fallbackYears) / counts.activeYears,
        },
      ]),
    ),
    loreFallbackYears,
    loreFallbackShare: totalEventYears === 0 ? 0 : loreFallbackYears / totalEventYears,
    meanFixAtCommitment: mean(fixAtCommitment),
    meanFixAtEnding: mean(fixAtEnding),
    fallbackYears,
    fallbackUseRate: totalEventYears === 0 ? 0 : fallbackYears / totalEventYears,
    fallbackYearsAge25Plus,
    fallbackShareAge25Plus,
    pre25FallbackYears,
    pre25CoverageDefectRate: rate(coverageErrors),
    pre25CoverageDefectAges,
    pre25EmergencyReuseYears,

    routeEntryRate: rate(runsWithRouteEntry),
    routeEntryCountsByRoute,
    routeClimaxRate: rate(runsWithRouteClimax),
    routeClimaxCountsByEvent,
    routeAbandonmentRate: rate(runsWithExpiredSchedule),
    expiredScheduleCount,
    expiredSchedulesByEvent,

    priorityCollisionRate: rate(runsWithCollision),
    priorityCollisionYears,
    scheduleDisplacementCount,
    scheduleDisplacementPerRun: runs === 0 ? 0 : scheduleDisplacementCount / runs,

    finalMaterialDistribution,
    finalMaterialBySpecies,
    materialCommitmentRate: rate(committedRuns),
    materialEntropyBitsOverall: entropyBits(finalMaterialDistribution),
    materialEntropyBitsBySpecies,

    pFinalGivenHint,
    pFinalGivenFirstManifestation,
    firstManifestationFamilyCounts,
    firstManifestationFamilyShare,
    firstManifestationAgeByFamily,
    noManifestationRate: rate(runsWithoutManifestation),
    multipleManifestationBeforeCommitmentRate: rate(multiManifestRuns),
    averageHintAge: mean(hintAges),
    averageFirstManifestationAge: mean(firstManifestAges),
    averageCommitmentAge: mean(commitmentAges),

    talentActivationRate,
    talentActivationAverageAge,

    endingDistribution,
    distinctEndingsObserved,
    distinctEndingsInRegistry,
    endingCoverageShare: distinctEndingsInRegistry === 0 ? 0 : distinctEndingsObserved / distinctEndingsInRegistry,
    hiddenEndingRate: completed === 0 ? 0 : hiddenEndings / completed,
    rareEndingRate: completed === 0 ? 0 : rareEndings / completed,

    finalStatMeans: Object.fromEntries(Object.entries(finalStats).map(([k, v]) => [k, mean(v)])),
    finalFixPercentiles: {
      p50: percentile(finalStats['FIX']!, 50),
      p90: percentile(finalStats['FIX']!, 90),
      p99: percentile(finalStats['FIX']!, 99),
      max: finalStats['FIX']!.length === 0 ? null : Math.max(...finalStats['FIX']!),
    },

    guardrails,
  };
}

export { CHANNELS };
export type { SpeciesId };
