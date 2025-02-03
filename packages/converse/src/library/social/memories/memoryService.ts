import { DB } from '../../database';

/**
 * Represents a belief in the system.
 */
export type Belief = {
  id: string;
  description: string;
  name: string;
  trust: number;
};

/**
 * Represents a row containing distance information.
 */
export interface DistanceRow {
  distance: number;
}

/**
 * Represents a question in the system.
 */
export interface Question {
  concept_id: string;
  as_question: string;
  noun_id: string;
  name: string;
}

/**
 * Represents a service for managing memories.
 */
export class MemoryService {
  /**
   * Creates a knowledge link from observer to observed for the description concept if it doesn't exist.
   *
   * @param observer_id The id of the observer.
   * @param observed_id The id of the observed.
   */
  observe(observer_id: string, observed_id: string) {
    const observeSQL = DB.prepare(`
            INSERT OR IGNORE INTO 
            knowledge (noun_id, belief_id) 
            SELECT :observer_id, beliefs.id 
            FROM beliefs WHERE beliefs.subject_id = :observed_id AND beliefs.concept_id = 'description'
        `);

    observeSQL.run({ observer_id: observer_id, observed_id: observed_id });
  }

  /**
   * Add multiple beliefs to a mob's knowledge.
   *
   * @param noun_id The id of the mob to have the beliefs.
   * @param belief_ids The ids of the beliefs to add.
   */
  addKnowledge(noun_id: string, belief_ids: string[]) {
    const stmt = DB.prepare(`
            INSERT OR IGNORE INTO knowledge (noun_id, belief_id) VALUES (:noun_id, :belief_id)
        `);

    DB.transaction(() => {
      belief_ids.forEach((belief_id) => stmt.run({ noun_id, belief_id }));
    })();
  }

  /**
   * Find the most recently learned fact about a mob.
   *
   * @param known_by_mob_key The id of the mob that knows the fact.
   * @param about_mob_key The id of the mob that the fact is about.
   *
   * @returns The most recently learned fact about the mob.
   */
  findFactAbout(known_by_mob_key: string, about_mob_key: string): Belief {
    const stmt = DB.prepare(`
            SELECT id, name, description, trust
            FROM beliefs
            JOIN knowledge k ON beliefs.id = k.belief_id and k.noun_id = :known_by_mob_key
            WHERE subject_id = :about_mob_key
            ORDER BY learned_at DESC
            LIMIT 1`);
    return stmt.get({ known_by_mob_key, about_mob_key }) as Belief;
  }

  /**
   * Get the most recently learned fact by the mob with the given id.
   *
   * @param knower_id The id of the mob that learned the fact.
   *
   * @returns The most recently learned fact by the mob.
   */
  getLastLearned(knower_id: string): Belief {
    const stmt = DB.prepare(`
            SELECT beliefs.id, beliefs.name, beliefs.description, beliefs.trust
            FROM beliefs
            JOIN knowledge ON beliefs.id = knowledge.belief_id AND knowledge.noun_id = :knower_id
            ORDER BY learned_at DESC
            LIMIT 1`);
    return stmt.get({ knower_id }) as Belief;
  }

  /**
   * Gets a random fact that is not known by the mob with the given id,
   * but is related to the given noun id, and is known by the mob with the given asked_of_id.
   *
   * @param knower_id The id of the mob that doesn't know the fact.
   * @param asked_of_id The id of the mob that knows the fact.
   * @param noun_id The id of the noun that the fact is related to.
   *
   * @returns The id of the fact, or undefined if no such fact exists.
   */
  getRandomUnknownFactRelatedTo(
    knower_id: string,
    asked_of_id: string,
    noun_id: string
  ): string | undefined {
    const stmt = DB.prepare(`
            SELECT id
            FROM beliefs
            LEFT JOIN knowledge AS asker_knowledge ON asker_knowledge.belief_id = beliefs.id AND asker_knowledge.noun_id = :asked_of_id
            WHERE 
            NOT EXISTS (SELECT 1 FROM knowledge WHERE knowledge.belief_id = beliefs.id AND knowledge.noun_id = :knower_id)
            AND EXISTS (SELECT 1 FROM noun_knowledge WHERE noun_knowledge.known_noun_id = beliefs.subject_id AND noun_knowledge.knower_id = :knower_id)
            AND subject_id = :noun_id
            ORDER BY (asker_knowledge.belief_id IS NOT NULL) DESC
            LIMIT 1;`);
    const result = stmt.get({ knower_id, asked_of_id, noun_id }) as {
      id: string;
    };

    if (!result) {
      return undefined;
    }

    return result.id;
  }

  /**
   * Gets a question about a fact that the mob with id `not_known_by_mob_id` does not know, but that is related to the mob with id `related_to_id`,
   * and that is asked of the mob with id `asked_of_id`. If the mob with id `asked_of_id` also knows some fact about the mob with id
   * `related_to_id`, then it should be preferred.
   *
   * @param not_known_by_mob_id The id of the mob that does not know the fact.
   * @param asked_of_id The id of the mob that the fact is being asked of.
   * @param related_to_id The id of the mob that the fact is about.
   *
   * @returns A question about the fact, or undefined if none could be found.
   */
  getQuestionAbout(
    not_known_by_mob_id: string,
    asked_of_id: string,
    related_to_id: string
  ): Question | undefined {
    const unknown_belief = this.getRandomUnknownFactRelatedTo(
      not_known_by_mob_id,
      asked_of_id,
      related_to_id
    );

    if (!unknown_belief) {
      return undefined;
    }

    const questionStmt = DB.prepare<{ unknown_belief: string }, Question>(`
            SELECT concepts.id as concept_id, as_question, nouns.id as noun_id, nouns.name
            FROM beliefs
            JOIN concepts ON concepts.id = beliefs.concept_id
            JOIN nouns ON nouns.id = beliefs.subject_id
            WHERE beliefs.id = :unknown_belief
        `);

    const question = questionStmt.get({
      unknown_belief: unknown_belief
    });

    return question;
  }

  /**
   * Get a random fact known by the mob with id `known_by_mob_id` under the concept with id `concept_id` that is not known by the mob with id `not_known_by_mob_id`.
   *
   * @param known_by_mob_id The id of the mob that knows the fact.
   * @param not_known_by_mob_id The id of the mob that does not know the fact.
   * @param concept_id The id of the concept that the fact is under.
   *
   * @returns A random fact that is known by `known_by_mob_id` under the concept with id `concept_id` that is not known by `not_known_by_mob_id`, or undefined if no such fact exists.
   */
  getRandomMemoryGap(
    known_by_mob_id: string,
    not_known_by_mob_id: string,
    concept_id: string
  ): Belief {
    const stmt = DB.prepare(`
            SELECT beliefs.id, beliefs.name, beliefs.description, beliefs.trust
        FROM beliefs
        JOIN knowledge ON beliefs.id = knowledge.belief_id AND knowledge.noun_id = :known_by_mob_id
          WHERE 
            concept_id = :concept_id
            AND NOT EXISTS (SELECT 1 
                            FROM knowledge 
                            WHERE beliefs.id = knowledge.belief_id AND 
                            knowledge.noun_id = :not_known_by_mob_id)
            ORDER BY learned_at DESC
            LIMIT 1`);
    return stmt.get({
      known_by_mob_id,
      not_known_by_mob_id,
      concept_id
    }) as Belief;
  }

  /**
   * Gets the most recently learned fact known by the mob with id `known_by_mob_id` under the concept
   * with id `concept_id` that is about the mob with id `known_by_mob_id`.
   *
   * @param known_by_mob_id The id of the mob that knows the fact.
   * @param concept_id The id of the concept that the fact is under.
   *
   * @returns The most recently learned fact that is known by `known_by_mob_id` under the concept with id `concept_id`
   * that is about `known_by_mob_id`, or undefined if no such fact exists.
   */
  getBeliefAbout(known_by_mob_id: string, concept_id: string): Belief {
    const stmt = DB.prepare(`
            SELECT beliefs.id, beliefs.name, beliefs.description, beliefs.trust
            FROM beliefs
            JOIN knowledge ON beliefs.id = knowledge.belief_id AND knowledge.noun_id = :known_by_mob_id
            WHERE concept_id = :concept_id and subject_id = :known_by_mob_id
            ORDER BY learned_at DESC
            LIMIT 1
        `);
    return stmt.get({ known_by_mob_id, concept_id }) as Belief;
  }

  /**
   * Gets the most recently learned fact known by the mob with id `known_by_mob_id` under the concept with id `concept_id` that
   * is about the mob with id `known_by_mob_id` and is related to the mob with id `related_to_id`.
   *
   * @param known_by_mob_id The id of the mob that knows the fact.
   * @param related_to_id The id of the mob that the fact is related to.
   * @param concept_id The id of the concept that the fact is under.
   *
   * @returns The most recently learned fact that is known by `known_by_mob_id` under the concept with id `concept_id` that is about
   * `known_by_mob_id` and is related to `related_to_id`, or undefined if no such fact exists.
   */
  getBeliefRelatedTo(
    known_by_mob_id: string,
    related_to_id: string,
    concept_id: string
  ): Belief {
    const stmt = DB.prepare(`
            SELECT beliefs.id, beliefs.name, beliefs.description, beliefs.trust
            FROM beliefs
            JOIN knowledge ON beliefs.id = knowledge.belief_id AND knowledge.noun_id = :known_by_mob_id
            WHERE concept_id = :concept_id and subject_id = :known_by_mob_id
            and related_to_id = :related_to_id
            ORDER BY learned_at DESC
            LIMIT 1
        `);
    return stmt.get({ known_by_mob_id, related_to_id, concept_id }) as Belief;
  }

  /**
   * Finds an answer to a question that is known by the mob with id `known_by_mob_id` but not known by the mob with id `not_known_by_mob_id`.
   *
   * @param known_by_mob_id The id of the mob that knows the fact.
   * @param not_known_by_mob_id The id of the mob that does not know the fact.
   * @param question The question that we want to find an answer to.
   *
   * @returns The answer to the question, or undefined if no such fact exists.
   */
  findAnswer(
    known_by_mob_id: string,
    not_known_by_mob_id: string,
    question: Question
  ): Belief {
    const stmt = DB.prepare(`
            SELECT beliefs.id, beliefs.name, beliefs.description, beliefs.trust
            FROM beliefs
            JOIN knowledge ON beliefs.id = knowledge.belief_id AND knowledge.noun_id = :known_by_mob_id
            WHERE 
            NOT EXISTS (SELECT 1 FROM knowledge WHERE beliefs.id = knowledge.belief_id AND knowledge.noun_id = :not_known_by_mob_id) AND
            subject_id = :subject_id AND
            concept_id = :concept_id
            ORDER BY learned_at DESC
            LIMIT 1
        `);
    return stmt.get({
      known_by_mob_id,
      not_known_by_mob_id,
      subject_id: question.noun_id,
      concept_id: question.concept_id
    }) as Belief;
  }

  /**
   * Finds a fact that is known by the mob with id `subject_id` that is related to the mob with id `related_to_id`.
   *
   * @param subject_id The id of the mob that knows the fact.
   * @param related_to_id The id of the mob that the fact is related to.
   *
   * @returns The fact that is known by `subject_id` that is related to `related_to_id`, or undefined if no such fact exists.
   */
  findConnectionBetweenNouns(
    subject_id: string,
    related_to_id: string
  ): Belief {
    const stmt = DB.prepare(`
        SELECT id, name, description, trust
        FROM beliefs
        WHERE subject_id = :subject_id AND related_to_id = :related_to_id
        `);

    return stmt.get({ subject_id, related_to_id }) as Belief;
  }

  /**
   * Finds a random noun that is related to the given fact.
   *
   * @param fact The id of the fact that we want to find a related noun to.
   *
   * @returns A random noun that is related to the given fact, or undefined if no such noun exists.
   */
  findRelatedNoun(fact: string): Belief {
    const stmt = DB.prepare(`
        SELECT key, name, description, fact, concept, noun
        FROM nodes
        WHERE noun AND
        EXISTS (SELECT 1 FROM connections WHERE target_key = :fact and source_key = nodes.key)
        ORDER BY RANDOM()
        LIMIT 1
        `);
    return stmt.get({ fact }) as Belief;
  }
}

export const memoryService = new MemoryService();
