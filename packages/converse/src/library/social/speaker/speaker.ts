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

  description(): Belief;

  benefitOf(item: Item, quantity: number): number;
  findRandomDesire(
    knownBy: Speaker,
    givenBy: Speaker,
    minimumValue: number
  ): Desire | undefined;
}
