import { DB } from '../../database';
import { Speaker } from '../speaker/speaker';
import { v4 as uuidv4 } from 'uuid';

class PotentialMemory {
  private key: string;
  private name: string;
  private description: string;
  private connections: string[] = [];

  /**
   * Constructs a new instance of PotentialMemory with the provided key, name, and description.
   * @param key Unique identifier for the potential memory.
   * @param name Display name for the potential memory.
   * @param description Description for the potential memory.
   */
  constructor(key: string, name: string, description: string) {
    this.key = key;
    this.name = name;
    this.description = description;
  }

  /**
   * Add a connection to this potential memory.
   *
   * @param key The key of the concept to add a connection to.
   */
  addConnection(key: string) {
    this.connections.push(key);
  }
}

class MemoryChoice {
  private choices: PotentialMemory[];

  /**
   * Constructs a new instance of MemoryChoice with the provided potential memories.
   *
   * @param choices - An array of PotentialMemory instances to initialize the MemoryChoice with.
   */
  constructor(choices: PotentialMemory[]) {
    this.choices = choices;
  }
}

export class MemoryFormation {
  private mob: Speaker;

  /**
   * Creates a new MemoryFormation instance for the given mob.
   *
   * @param mob - The mob to create the memory formation for.
   */
  constructor(mob: Speaker) {
    this.mob = mob;
  }

  // const feelingConcepts = [
  //     { "id": "happy", "name": "happy", "as_question": "is <subject> feeling happy?", "parent_concept": topLevelConcept },
  //     { "id": "sad", "name": "sad", "as_question": "is <subject> feeling sad?", "parent_concept": topLevelConcept },
  //     { "id": "angry", "name": "angry", "as_question": "is <subject> feeling angry?", "parent_concept": topLevelConcept },
  //     { "id": "excited", "name": "excited", "as_question": "is <subject> feeling excited?", "parent_concept": topLevelConcept },
  //     { "id": "scared", "name": "scared", "as_question": "is <subject> feeling scared?", "parent_concept": topLevelConcept },
  //     { "id": "love", "name": "love", "as_question": "is <subject> feeling love?", "parent_concept": topLevelConcept },
  //     { "id": "hate", "name": "hate", "as_question": "is <subject> feeling hate?", "parent_concept": topLevelConcept },
  //     { "id": "fear", "name": "fear", "as_question": "is <subject> feeling fear?", "parent_concept": topLevelConcept }
  // ];

  /**
   * Creates memories for the given mob based on their relationships.
   *
   * @returns an empty array of MemoryChoice (for now)
   */
  formMemoriesFromRelationships(): MemoryChoice[] {
    DB.prepare(
      `
            DELETE FROM beliefs
            WHERE subject_id = :me_id and concept_id = 'feeling'
        `
    ).run({ me_id: this.mob.id });

    const affinityScores = DB.prepare(
      `
            SELECT affinity, with_noun_id, nouns.name as with_noun_name
            FROM computed_relationships
            JOIN nouns ON with_noun_id = nouns.id
            WHERE noun_id = :me_id
        `
    ).all({ me_id: this.mob.id }) as {
      affinity: number;
      with_noun_id: string;
      with_noun_name: string;
    }[];

    for (const affinityScore of affinityScores) {
      let descriptionOfFeelings = '';
      const random = Math.random();
      if (affinityScore.affinity < -0.5 && random < 0.5) {
        descriptionOfFeelings = 'hates';
      } else if (affinityScore.affinity > 0.5 && random < 0.5) {
        descriptionOfFeelings = 'loves';
      } else if (random > 0.9) {
        descriptionOfFeelings = 'angry';
      } else if (random > 0.8) {
        descriptionOfFeelings = 'excited';
      } else if (random > 0.7) {
        descriptionOfFeelings = 'scared';
      } else if (random > 0.5) {
        descriptionOfFeelings = 'happy';
      } else if (random > 0.4) {
        descriptionOfFeelings = 'sad';
      } else {
        descriptionOfFeelings = 'fear';
      }

      if (descriptionOfFeelings !== '') {
        const belief_id = uuidv4();
        DB.prepare(
          `
                    INSERT INTO beliefs (id, subject_id, concept_id, related_to_id, name, description, trust)
                    VALUES (:id, :me_id, 'feeling', :with_noun_id, :name, :description, -1)
                `
        ).run({
          id: belief_id,
          me_id: this.mob.id,
          with_noun_id: affinityScore.with_noun_id,
          name: `${this.mob.name} feeling towards ${affinityScore.with_noun_name}`,
          description: `${this.mob.name} ${descriptionOfFeelings} ${affinityScore.with_noun_name}`
        });
        DB.prepare(
          `
                    INSERT INTO knowledge (belief_id, noun_id)
                    VALUES(:belief_id, :noun_id)
                `
        ).run({ belief_id, noun_id: this.mob.id });
      }
    }
    // If affinity > 50 then form memories to friend or love.

    // If love/love then marry

    // What relationships a person has
    // What happened that day

    // If positive feelings, form memories to like, friend, love, etc.
    // If negative feelings, form memories to dislike, enemy, rival, hate, etc.

    // If didn't talk to them that day and positive then they will miss the person.

    // If had bad encounter with someone then fear
    return [];
  }

  formMemoriesFromCalendar(): MemoryChoice[] {
    // export const MINUTES_IN_HOUR = 4*12;
    // export const HOURS_IN_DAY = 12;
    // export const DAYS_IN_MONTH = 12; // Holidays in last two days of every month
    // export const MONTHS_IN_YEAR = 4;

    // each mob needs a birth day. marriage day, death day (if applicable), and other significant days

    // what events are upcoming on the calendar
    // Calendar tied to ... community?
    // adjust timing of events and association with time. adjust in place the relationships and description. Don't change knowledge of.
    // How to get mobs to talk about event again when very near or day of?
    // potentially form excitement or dread for upcoming events

    // Possibly add reminiscing about past events
    return [];
  }

  formMemoriesFromTodaysEvents(): MemoryChoice[] {
    // what events happened today
    // what relationships were involved
    return [];
  }

  formMemoriesFromGoals(): MemoryChoice[] {
    // what goals are in progress
    // what relationships are involved
    return [];
  }

  /**
   * Aggregates potential memory choices for the mob by combining memories
   * formed from various sources such as relationships, calendar events,
   * today's events, and goals.
   *
   * @returns An array of MemoryChoice objects representing the collective
   *          potential memories for the mob.
   */
  gatherPotentialMemoryChoices(): MemoryChoice[] {
    const memoryChoices = [];
    memoryChoices.push(...this.formMemoriesFromRelationships());
    memoryChoices.push(...this.formMemoriesFromCalendar());
    memoryChoices.push(...this.formMemoriesFromTodaysEvents());
    memoryChoices.push(...this.formMemoriesFromGoals());

    return memoryChoices;
  }
}

// Why a specific potion is good
// Influence gossip.

//
