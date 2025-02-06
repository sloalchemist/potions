import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Graphable } from './graphable';
import { Region } from './region';

/**
 * Represents an item in the knowledge graph.
 */
export class Item implements Graphable {
  private readonly noun: Noun;

  /**
   * Creates a new item.
   *
   * @param name - the name of the item
   * @param description - a description of the item
   * @param region - the region that the item is located in
   * @throws Error if `region` is not provided
   */
  constructor(
    public readonly name: string,
    public description: string,
    public readonly region: Region
  ) {
    this.name = name;
    this.description = description;
    this.region = region;
    this.noun = { name: this.name, type: 'item' };

    if (!region) {
      throw new Error(`Item ${name} must have a region`);
    }
  }

  /**
   * Gets the desires of this item.
   *
   * Returns an empty array, because an item does not have desires.
   * @returns An empty array.
   */
  getDesires(): Desire[] {
    return [];
  }

  /**
   * Retrieves the noun representation of this item.
   *
   * @returns {Noun} The noun associated with this item.
   */
  getNoun(): Noun {
    return this.noun;
  }

  /**
   * Retrieves an array of beliefs associated with the item.
   *
   * This function returns beliefs that describe the item's description and
   * its association with a region.
   *
   * @returns An array of Belief objects representing the item's attributes,
   *          including its description and regional association.
   */
  getBeliefs(): Belief[] {
    return [
      {
        subject: this.noun,
        name: `${this.name}'s description`,
        concept: 'description',
        description: this.description,
        trust: 0
      },
      {
        subject: this.noun,
        name: `${this.name}'s region`,
        related_to: this.region.getNoun(), // Use the noun of the region
        concept: 'region',
        description: `${this.name} is in ${this.region.name}`,
        trust: 0
      }
    ];
  }
}
