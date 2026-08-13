import type { ContentBundle } from './content/load.js';
import { Rng } from './rng.js';
import { draftTalents, SetupError, TALENT_CHOICE_SIZE } from './setup.js';
import { SPECIES_IDS, type SpeciesId } from './types.js';

/**
 * Setup preview for an interactive player.
 *
 * The UI has to show the rolled species and the drafted ten *before* the player
 * picks anything, but `createRun` does the whole setup in one pass. This repeats
 * only the first three deterministic steps of Core Contract section 5 — seed,
 * species roll, ten-talent draft — in exactly the same order and off exactly the
 * same RNG stream, then stops.
 *
 * That ordering is what makes the preview honest: when the player commits,
 * `createRun` re-derives the same seed, rolls the same species and draws the same
 * draft before it ever looks at the player's fixed choices, so preview and final
 * setup agree by construction rather than by copying values around. A test pins
 * this for many seeds.
 *
 * It deliberately does *not* apply talents, allocation, species modifiers or
 * threshold talents: those depend on choices the player has not made yet.
 */
export interface PlayerSetupPreview {
  seed: string;
  /** The content fingerprint the preview was derived under. */
  contentVersion: string;
  species: SpeciesId;
  /** The 10 drafted talent IDs, in draft order. */
  draftedTalents: string[];
  /** Free points the player distributes across the five visible stats. */
  allocationPoints: number;
  /** How many of the draft the player must choose. */
  talentChoiceSize: number;
}

export function previewPlayerSetup(seed: string, content: ContentBundle): PlayerSetupPreview {
  // Step 1: run seed — identical derivation to createRun.
  const rng = Rng.fromSeed(`${content.contentVersion}:${seed}`);
  // Step 2: roll one species, off the canonical SPECIES_IDS order that
  // `setup.ts::rollSpecies` uses. A different order here would consume the same
  // RNG draw but return a different species.
  const species = rng.pick(SPECIES_IDS);
  const speciesDef = content.species.get(species);
  if (!speciesDef) throw new SetupError(`unknown species ${species}`);
  // Step 3: draft 10 distinct talents.
  const draftedTalents = draftTalents(rng, content);

  return {
    seed,
    contentVersion: content.contentVersion,
    species,
    draftedTalents,
    allocationPoints: speciesDef.allocation_points,
    talentChoiceSize: TALENT_CHOICE_SIZE,
  };
}
