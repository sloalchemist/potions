import { Belief } from '../belief';
import { ExistingKnowledge } from './existingKnowledge';

/**
 * Represents known regions in the knowledge graph.
 */
export class KnownRegions implements ExistingKnowledge {
  /**
   * @returns The concept ID associated with knowledge of regions (e.g. "concept_region").
   */
  getConcept(): string {
    return 'concept_region';
  }
  /*
export interface Belief {
    subject: Noun,
    related_to: Noun,
    concept: Concept,
    name: string,
    description: string,
    trust: number
}*/

  /**
   * @returns An array of {@link Belief} objects representing the knowledge this
   * character has of the world's regions.
   */
  getKnowledge(): Belief[] {
    return [];
    /*
    { "id": "region_claw_island", "name": "Claw Island", "type": "region", "description": "A relatively peaceful island in the Shattered Expanse full of blueberries and heartbeets." },
    { "id": "region_shattered_expanse", "name": "Shattered Expanse", "type": "region", "description": "A fractured wasteland of jagged cliffs and roaring storms, sacred to scattered tribes and a graveyard of ancient civilizations." },
    { "id": "region_gilded_isles", "name": "Gilded Isles", "type": "region", "description": "An isolated archipelago of golden sands and divine temples, where the god's favored golden-souled creations zealously guard their relics and secrets." },
    { "id": "region_forgotten_hollow", "name": "Forgotten Hollow", "type": "region", "description": "A mist-shrouded forest of ancient trees and silver light, revered as the cradle of all life and feared by outsiders for its haunting whispers." },
    { "id": "region_veil_of_ashes", "name": "Veil of Ashes", "type": "region", "description": "A volcanic wasteland of molten rivers and ash-born creatures, where only the strongest survive amidst relentless heat and fiery trials." },
    { "id": "region_skyfract_isles", "name": "Skyfract Isles", "type": "region", "description": "Floating shards of land in the heavens, each an isolated world of danger and wonder, guarded by skybeasts and imbued with the power of a shattered past." },
    { "id": "region_world_tree", "name": "World Tree", "type": "region", "description": "A colossal tree whose roots cradle the ruins of the great empire, its branches stretching to the heavens and its depths hiding the remnants of forgotten glory." }
        ]*/
  }
}
