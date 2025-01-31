import { Belief } from '../belief';
import { ExistingKnowledge } from './existingKnowledge';

/**
 * Represents known lore in the knowledge graph.
 */
export class KnownLore implements ExistingKnowledge {
  /**
   * @returns The concept ID associated with knowledge of lore (e.g. "concept_lore").
   */
  getConcept(): string {
    return 'concept_lore';
  }

  /*
export interface Belief {
    subject: Noun,
    related_to: Noun,
    concept: Concept,
    name: string,
    description: string,
    trust: number
}
    */

  /**
   * Returns an array of {@link Belief} objects representing the concepts of lore that are present in this world.
   * The `fact` property being set to `true` indicates that the lore is known to be true.
   *
   * @returns An array of {@link Belief} objects.
   */
  getKnowledge(): Belief[] {
    return [];
    /*
                { "id": "concept_god_of_creation", "name": "God of Creation", "type": "lore", fact: true, "description": "The god responsible for creating Elyndra and its golden-souled inhabitants." },
                { "id": "concept_creation_spark", "name": "Creation Spark", "type": "lore", fact: true, "description": "The divine force used to create life in Elyndra." },
                { "id": "concept_souls", "name": "Souls", "type": "lore", fact: true, "description": "Souls are the essence of life in Elyndra, embodying the will and nature of their bearers." },
                { "id": "concept_golden_souls", "name": "Golden Souls", "type": "lore", fact: true, "description": "Souls crafted directly by the god, reflecting divine will and purity." },
                { "id": "concept_silver_souls", "name": "Silver Souls", "type": "lore", fact: true, "description": "Souls that emerged from the world's complexity, embodying freedom and chaos." },
                { "id": "concept_silverclaw_tribes_from_silver_souls", "name": "Silverclaw Tribes", "type": "lore", fact: true, "description": "Tribes descended from the silver-souled, known for their resilience and defiance." },
                { "id": "concept_divine_wrath", "name": "Divine Wrath", "type": "lore", fact: true, "description": "The god's anger at the emergence of silver souls, leading to the world's shattering." },
                { "id": "concept_shattered_expanse", "name": "Shattered Expanse", "type": "lore", fact: true, "description": "A chaotic land created by the god's fury to purge the silver souls." },
                { "id": "concept_tests_of_survival", "name": "Tests of Survival", "type": "lore", fact: true, "description": "Challenges in the Shattered Expanse seen as trials for the Silverclaw." },
                { "id": "concept_freedom_through_silver", "name": "Freedom Through Silver", "type": "lore", fact: true, "description": "The belief that silver souls allow freedom from divine chains." },
                { "id": "concept_path_of_strife", "name": "Path of Strife", "type": "lore", fact: true, "description": "The eternal conflict between creation and destruction in Elyndra." },
                { "id": "concept_wilds_of_elyndra", "name": "Wilds of Elyndra", "type": "lore", fact: true, "description": "Untamed lands filled with danger, mystery, and remnants of the past." },
                { "id": "concept_treasures_and_secrets", "name": "Treasures and Secrets", "type": "lore", fact: true, "description": "Lost artifacts and knowledge hidden in the ruins of Elyndra." },
                { "id": "concept_golems", "name": "Golems", "type": "lore", fact: true, "description": "Living constructs created by ancient civilizations to mimic divine power." },
                { "id": "concept_primal_colors", "name": "Primal Colors", "type": "lore", fact: true, "description": "The alchemical forces of red, green, blue, and dark representing health, nature, magic, and shadow." },
                { "id": "concept_red_potions", "name": "Red Potions", "type": "lore", fact: true, "description": "Potions tied to vitality, healing, and life energy." },
                { "id": "concept_green_potions", "name": "Green Potions", "type": "lore", fact: true, "description": "Potions tied to growth, nature, and balance." },
                { "id": "concept_blue_potions", "name": "Blue Potions", "type": "lore", fact: true, "description": "Potions tied to magic, knowledge, and the arcane." },
                { "id": "concept_dark_potions", "name": "Dark Potions", "type": "lore", fact: true, "description": "Potions tied to stealth, shadows, and forbidden power." },
                { "id": "concept_elyndra_as_battleground", "name": "Elyndra as Battleground", "type": "lore", fact: true, "description": "In the wide and untamed lands of Elyndra, it is said that the world itself is a battleground between forces far older than the stars." },
                { "id": "concept_elyndra", "name": "Elyndra", "type": "lore", "global": true, fact: true, "description": "Elyndra is the world in which we all live." }*/
  }
}
