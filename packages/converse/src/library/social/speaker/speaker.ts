import { Conversation } from '../conversation';
import { Desire } from '../desires/desire';
import { Goal } from '../memories/goal';
import { MemoryFormation } from '../memories/memoryFormation';
import { Belief } from '../memories/memoryService';
import { Obligations } from './obligations';
import { Personality } from '../personality';
import { Relationships } from './relationships';
import { Item } from './item';

/**
 * Interface representing a speaker in the system.
 */
export interface Speaker {
  id: string;
  name: string;
  type: string;

  attributes: Record<string, number>;

  relationships: Relationships;
  obligations: Obligations;
  memoryFormation: MemoryFormation;
  goal: Goal;
  conversation: Conversation | null;

  personality: Personality;

  /**
   * Provides a description of the speaker.
   * @returns {Belief} The belief representing the description.
   */
  description(): Belief;

  /**
   * Calculates the benefit of an item to the speaker.
   * @param {Item} item - The item to evaluate.
   * @param {number} quantity - The quantity of the item.
   * @returns {number} The calculated benefit.
   */
  benefitOf(item: Item, quantity: number): number;

  /**
   * Finds a random desire of the speaker.
   * @param {Speaker} knownBy - The speaker who knows the desire.
   * @param {Speaker} givenBy - The speaker who gives the desire.
   * @param {number} minimumValue - The minimum value of the desire.
   * @returns {Desire | undefined} The found desire or undefined.
   */
  findRandomDesire(
    knownBy: Speaker,
    givenBy: Speaker,
    minimumValue: number
  ): Desire | undefined;
}
