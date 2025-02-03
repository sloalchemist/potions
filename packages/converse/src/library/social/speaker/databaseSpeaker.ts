import { DB } from '../../database';
import { Conversation } from '../conversation';
import { Desire } from '../desires/desire';
import { Goal } from '../memories/goal';
import { MemoryFormation } from '../memories/memoryFormation';
import { Belief, memoryService } from '../memories/memoryService';
import { Obligations } from './obligations';
import { Personality } from '../personality';
import { Relationships } from './relationships';
import { Item } from './item';
import { Speaker } from './speaker';

/**
 * Represents a speaker that interacts with the database.
 */
export class DatabaseSpeaker implements Speaker {
  id: string;
  name: string;
  type: string;
  attributes: Record<string, number>;
  lastRefreshedChat: number;
  relationships: Relationships;
  memoryFormation: MemoryFormation;
  conversation: Conversation | null;
  personality: Personality;
  goal: Goal;
  obligations: Obligations;

  /**
   * Creates an instance of DatabaseSpeaker.
   *
   * @param id - The unique identifier for the speaker.
   * @param name - The name of the speaker.
   * @param type - The type/category of the speaker.
   */
  constructor(id: string, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.attributes = {};
    this.lastRefreshedChat = 0;
    this.relationships = new Relationships(this);
    this.conversation = null;
    this.personality = new Personality(this);
    this.goal = new Goal(this);
    this.memoryFormation = new MemoryFormation(this);
    this.obligations = new Obligations(this);
  }

  /**
   * Retrieves the description belief about the speaker.
   *
   * @returns The belief about the speaker's description.
   */
  description(): Belief {
    return memoryService.getBeliefAbout(this.id, 'description');
  }

  /**
   * Calculates the benefit of a given item in a specified quantity for the speaker.
   *
   * @param item - The item to evaluate.
   * @param quantity - The quantity of the item.
   * @returns The calculated benefit of the item.
   */
  benefitOf(item: Item, quantity: number): number {
    const benefit = DB.prepare(
      `
        SELECT 
        benefit
        FROM desires
        WHERE desirer_id = :mob_id and desired_id = :item_id
      `
    ).get({ mob_id: this.id, item_id: item.id }) as { benefit: number };
    if (benefit) {
      return benefit.benefit * quantity;
    }
    return 0;
  }

  /**
   * Finds a random desire for the speaker that meets the minimum value and is not already obligated.
   *
   * @param knownBy - The speaker who knows about the desire.
   * @param givenBy - The speaker who would give the desired item.
   * @param minimumValue - The minimum benefit value for the desire.
   * @returns The found desire or undefined if no desire meets the criteria.
   */
  findRandomDesire(
    knownBy: Speaker,
    givenBy: Speaker,
    minimumValue: number
  ): Desire | undefined {
    const desire = DB.prepare(
      `
        SELECT 
            desired_id,
            nouns.name AS desired_name,
            benefit
        FROM desires
        JOIN nouns ON desires.desired_id = nouns.id
        WHERE desirer_id = :mob_id and benefit > :minimumValue
        AND NOT exists (SELECT 1 
                        FROM obligations 
                        WHERE owed_id = desirer_id AND owing_id = :given_by_id AND item_id = desired_id)
        ORDER BY random()
        LIMIT 1`
    ).get({ mob_id: this.id, given_by_id: givenBy.id, minimumValue }) as {
      desired_id: string;
      desired_name: string;
      benefit: number;
    };

    if (desire) {
      return {
        benefit: desire.benefit,
        desired: { id: desire.desired_id, name: desire.desired_name },
        desiree: this
      } as Desire;
    } else {
      return undefined;
    }
  }

  /**
   * Loads a DatabaseSpeaker instance by name.
   *
   * @param name - The name of the speaker to load.
   * @returns The loaded DatabaseSpeaker instance.
   * @throws Will throw an error if no speaker with the given name is found.
   */
  static loadByName(name: string): DatabaseSpeaker {
    const retrieveMob = DB.prepare(
      `
        SELECT 
            id, 
            name,
            CASE 
                WHEN EXISTS (SELECT 1 FROM players WHERE players.noun_id = nouns.id) THEN 'player'
                ELSE 'npc'
            END AS type
        FROM nouns
        WHERE type = 'person' AND name = :name;`
    ).get({ name }) as { id: string; name: string; type: string };

    // Handle the case where no mob is found
    if (!retrieveMob) {
      throw new Error(`Mob with name "${name}" not found`);
    }

    // Create and return the DatabaseSpeaker instance
    return new DatabaseSpeaker(
      retrieveMob.id,
      retrieveMob.name,
      retrieveMob.type
    );
  }

  /**
   * Loads or creates a DatabaseSpeaker instance by ID.
   *
   * @param id - The ID of the speaker to load or create.
   * @param name - The name of the speaker to create if not found.
   * @returns The loaded or created DatabaseSpeaker instance.
   */
  static loadOrCreate(id: string, name: string): DatabaseSpeaker {
    // Query the database to retrieve the mob
    const retrieveMob = DB.prepare(
      `
        SELECT 
            id, 
            name,
            CASE 
                WHEN EXISTS (SELECT 1 FROM players WHERE players.noun_id = nouns.id) THEN 'player'
                ELSE 'npc'
            END AS type
        FROM nouns
        WHERE type = 'person' AND id = :id;`
    ).get({ id }) as { id: string; name: string; type: string };

    // Handle the case where no mob is found
    if (!retrieveMob) {
      DB.prepare(
        `
        INSERT INTO nouns
        (id, name, type)
        VALUES (:id, :name, 'person')
        `
      ).run({ id, name });
    }

    // Create and return the DatabaseSpeaker instance
    return new DatabaseSpeaker(id, name, 'npc');
  }

  /**
   * Loads a DatabaseSpeaker instance by ID.
   *
   * @param id - The ID of the speaker to load.
   * @returns The loaded DatabaseSpeaker instance.
   * @throws Will throw an error if no speaker with the given ID is found.
   */
  static load(id: string): DatabaseSpeaker {
    // Query the database to retrieve the mob
    const retrieveMob = DB.prepare(
      `
        SELECT 
            id, 
            name,
            CASE 
                WHEN EXISTS (SELECT 1 FROM players WHERE players.noun_id = nouns.id) THEN 'player'
                ELSE 'npc'
            END AS type
        FROM nouns
        WHERE type = 'person' AND id = :id;`
    ).get({ id }) as { id: string; name: string; type: string };

    // Handle the case where no mob is found
    if (!retrieveMob) {
      throw new Error(`Mob with id "${id}" not found`);
    }

    // Create and return the DatabaseSpeaker instance
    return new DatabaseSpeaker(
      retrieveMob.id,
      retrieveMob.name,
      retrieveMob.type
    );
  }
}
