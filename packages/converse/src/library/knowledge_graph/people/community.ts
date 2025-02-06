import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Graphable } from './graphable';
import { Region } from './region';

/**
 * Represents a community in the knowledge graph.
 */
export class Community implements Graphable {
  id: string;
  name: string;
  description: string;
  region: Region;
  lore?: string[];
  noun: Noun;

  /**
   * Constructs a new community object.
   *
   * @param id - the unique identifier of the community
   * @param name - the name of the community
   * @param description - a description of the community
   * @param region - the region in which the community is located
   * @param lore - a list of interesting stories or facts about the community.
   * @throws Error if the region is not provided.
   */
  constructor(
    id: string,
    name: string,
    description: string,
    region: Region,
    lore?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.region = region;
    this.lore = lore;
    this.noun = { id: id, name: this.name, type: 'community' };

    if (!region) {
      throw new Error(`Item ${name} must have a region`);
    }
  }

  /**
   * Gets the desires of this community.
   *
   * Returns an empty array, because a community does not have desires.
   * @returns An empty array.
   */
  getDesires(): Desire[] {
    return [];
  }

  /**
   * Returns the noun representing the community.
   *
   * @returns The noun representing the community.
   */
  getNoun(): Noun {
    return this.noun;
  }

  /**
   * Retrieves an array of beliefs associated with the community.
   *
   * This function returns beliefs that describe the community's description and
   * its association with a region. Throws an error if the lore is not provided.
   *
   * @throws Error if the community does not have lore.
   * @returns An array of Belief objects representing the community's attributes,
   *          including its description and regional association.
   */
  getBeliefs(): Belief[] {
    if (!this.lore) {
      throw new Error('Community must have a description and region');
    }
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
        concept: 'region',
        description: `${this.name} is in ${this.region.name}`,
        related_to: this.region.getNoun(),
        trust: 0
      }
    ];
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
  /*
    build(): KnowledgeGraph {


        for (const lore of this.lore) {
            connections.push({ "source": `community_${this.id}`, "target": lore });
        }

        return { "facts": facts, "connections": connections };
    }*/
}
