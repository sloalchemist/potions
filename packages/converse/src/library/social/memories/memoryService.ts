import { DB } from '../../database';

export type Belief = {
  id: string;
  description: string;
  name: string;
  trust: number;
};
export interface DistanceRow {
  distance: number;
}
export interface Question {
  concept_id: string;
  as_question: string;
  noun_id: string;
  name: string;
}

export class MemoryService {
  observe(observer_id: string, observed_id: string) {
    const observeSQL = DB.prepare(`
            INSERT OR IGNORE INTO 
            knowledge (noun_id, belief_id) 
            SELECT :observer_id, beliefs.id 
            FROM beliefs WHERE beliefs.subject_id = :observed_id AND beliefs.concept_id = 'description'
        `);

    observeSQL.run({ observer_id: observer_id, observed_id: observed_id });
  }

  addKnowledge(noun_id: string, belief_ids: string[]) {
    const stmt = DB.prepare(`
            INSERT OR IGNORE INTO knowledge (noun_id, belief_id) VALUES (:noun_id, :belief_id)
        `);

    DB.transaction(() => {
      belief_ids.forEach((belief_id) => stmt.run({ noun_id, belief_id }));
    })();
  }

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

  getLastLearned(knower_id: string): Belief {
    const stmt = DB.prepare(`
            SELECT beliefs.id, beliefs.name, beliefs.description, beliefs.trust
            FROM beliefs
            JOIN knowledge ON beliefs.id = knowledge.belief_id AND knowledge.noun_id = :knower_id
            ORDER BY learned_at DESC
            LIMIT 1`);
    return stmt.get({ knower_id }) as Belief;
  }

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
