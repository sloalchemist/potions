import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Community } from './community';
import { Graphable } from './graphable';
import { Person } from './person';

/**
 * Represents an Eventy in the knowledge graph.
 */
export class Eventy implements Graphable {
  public readonly name: string;
  public readonly type: string;
  public readonly time: string;
  public readonly description: string;
  public readonly community: Community;
  public readonly peopleInvolved: Person[];
  private readonly noun: Noun;

  /**
   * Construct an Eventy. An Eventy is an event that is connected to a Community and may have people involved.
   * @param {string} name The name of the event.
   * @param {string} type The type of the event.
   * @param {string} time The time of the event.
   * @param {string} description The description of the event.
   * @param {Community} community The community that the event is connected to.
   * @param {Person[]} peopleInvolved The people that are involved in the event.
   */
  constructor(
    name: string,
    type: string,
    time: string,
    description: string,
    community: Community,
    peopleInvolved: Person[]
  ) {
    this.name = name;
    this.type = type;
    this.time = time;
    this.description = description;
    this.community = community;
    this.peopleInvolved = peopleInvolved;
    this.noun = { name: this.name, type: 'event' };
  }

  /**
   * Get the desires of this event.
   *
   * Returns an empty array, because an event does not have desires.
   * @returns {Desire[]} An empty array.
   */
  getDesires(): Desire[] {
    return [];
  }

  /**
   * Gets the noun for this event.
   *
   * @returns {Noun} The noun for this event.
   */
  getNoun(): Noun {
    return this.noun;
  }

  /**
   * Retrieves an array of beliefs associated with the event.
   *
   * This function returns beliefs that describe the event's description
   * and its association with a community.
   *
   * @returns {Belief[]} An array of Belief objects representing the
   *          event's attributes, including its description and community
   *          association.
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
        name: `${this.name}'s community`,
        concept: 'community',
        description: `${this.name} is in ${this.community.name}`,
        trust: 0
      }
    ];
  }
}
