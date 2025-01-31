import { Graphable } from './graphable';
import { Belief } from '../belief';
import { Noun } from '../noun';
import { Desire } from '../desire';

/**
 * Represents a region in the knowledge graph.
 */
export class Region implements Graphable {
  id: string;
  name: string;
  description?: string;
  parent_region?: Region | null;
  lore?: string[];
  noun: Noun;

  /**
   * Creates a new region object.
   *
   * @param id - the unique identifier of the region
   * @param name - the name of the region
   * @param description - a description of the region
   * @param parent_region - the parent region of the region
   * @param lore - a list of interesting stories or facts about the region
   */
  constructor(
    id: string,
    name: string,
    description?: string,
    parent_region?: Region | null,
    lore?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parent_region = parent_region;
    this.lore = lore;
    this.noun = { id: this.id, name: this.name, type: 'region' };
  }

  /**
   * Retrieves an array of desires associated with the region.
   *
   * Returns an empty array, as a region does not have desires.
   * @returns An empty array.
   */
  getDesires(): Desire[] {
    return [];
  }

  /**
   * Returns the noun associated with this region.
   *
   * @returns The noun associated with the region.
   */
  getNoun(): Noun {
    return this.noun;
  }

  /**
   * Retrieves an array of beliefs associated with the region.
   *
   * This function returns beliefs that describe the region's description and
   * its association with a parent region. Throws an error if the region does not
   * have a description or lore.
   *
   * @throws Error if the region does not have a description or lore.
   * @returns An array of Belief objects representing the region's attributes,
   *          including its description and parent region.
   */
  getBeliefs(): Belief[] {
    if (!this.description || !this.lore) {
      throw new Error('Region must have a description and lore');
    }
    const beliefs: Belief[] = [
      {
        subject: this.noun,
        name: `${this.name}'s description`,
        concept: 'description',
        description: this.description,
        trust: 0
      }
    ];

    if (this.parent_region) {
      beliefs.push({
        subject: this.noun,
        name: `${this.name}'s parent region`,
        concept: 'region',
        description: `${this.name} is a part of ${this.parent_region.name}`,
        trust: 0,
        related_to: this.parent_region.getNoun()
      });
    }
    return beliefs;
  }
}
