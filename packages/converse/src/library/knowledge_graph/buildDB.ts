import { KnowledgeGraph } from './knowledgeGraph';
import { v4 as uuidv4 } from 'uuid';
import { DB } from '../database';
import { Concept, ConceptHierarchy } from './concepts/concept';
import { Professions } from './concepts/professions';
import { Feelings } from './concepts/feelings';
import { Regions } from './concepts/regions';
import { Relationships } from './concepts/relationships';
import { Communities } from './concepts/communities';
import { Lore } from './concepts/lore';
import { Desires } from './concepts/desires';
import { Events } from './concepts/events';
import { Time } from './concepts/time';
import { Personality } from './concepts/personality';
import { Description } from './concepts/description';

const schema = `
-- Create the main 'beliefs' table
CREATE TABLE beliefs (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    related_to_id TEXT,
    concept_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    trust REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES nouns (id),
    FOREIGN KEY (related_to_id) REFERENCES nouns (id),
    FOREIGN KEY (concept_id) REFERENCES concepts (id)
);

CREATE TABLE fantasy_date (
    date_description TEXT NOT NULL,
    tick INTEGER NOT NULL
);

INSERT INTO fantasy_date
(date_description, tick)
VALUES ('placeholder', 0);

CREATE TABLE obligations (
    id INTEGER PRIMARY KEY,
    owed_id TEXT NOT NULL,
    owing_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    by_tick INTEGER NOT NULL,
    UNIQUE (owed_id, owing_id, item_id)
);

CREATE TABLE nouns (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT
);

CREATE TABLE concepts (
    id TEXT PRIMARY KEY,
    name TEXT,
    as_question TEXT,
    parent_concept_id TEXT,
    FOREIGN KEY (parent_concept_id) REFERENCES concepts (id)
);

-- Create 'relationships' table (references nouns)
CREATE TABLE relationships (
    id INTEGER PRIMARY KEY,
    noun_id TEXT NOT NULL,
    with_noun_id TEXT NOT NULL,
    raw_affinity INTEGER NOT NULL DEFAULT 0,
    conversation_summary TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (noun_id) REFERENCES nouns (id),
    FOREIGN KEY (with_noun_id) REFERENCES nouns (id),
    UNIQUE (noun_id, with_noun_id)
);

CREATE VIEW computed_relationships AS
    SELECT (2.0 / (1.0 + exp(-0.05 * raw_affinity)) - 1.0) AS affinity, noun_id, with_noun_id
    FROM relationships;

-- Create 'players' table (references nouns)
CREATE TABLE players (
    noun_id TEXT PRIMARY KEY,
    FOREIGN KEY (noun_id) REFERENCES nouns (id),
    UNIQUE (noun_id)
);


CREATE TABLE desires (
    id INTEGER PRIMARY KEY,
    desirer_id TEXT NOT NULL,
    desired_id TEXT NOT NULL,
    benefit TEXT NOT NULL,  
    FOREIGN KEY (desirer_id) REFERENCES nouns (id),
    FOREIGN KEY (desired_id) REFERENCES nouns (id)
);

-- Create 'goals' table (references nouns)
CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    noun_id TEXT NOT NULL,
    interest_id TEXT NOT NULL,
    FOREIGN KEY (noun_id) REFERENCES nouns (id)
);

-- Create 'personality' table (references nouns)
CREATE TABLE personality (
    noun_id TEXT PRIMARY KEY,
    immaturity REAL NOT NULL,
    helpfulness REAL NOT NULL,
    curiosity REAL NOT NULL,
    chitChatter REAL NOT NULL,
    openness REAL NOT NULL,
    complimentary REAL NOT NULL,
    insulting REAL NOT NULL,
    funny REAL NOT NULL,
    generous REAL NOT NULL,
    demanding REAL NOT NULL,
    neutral REAL NOT NULL,
    extroversion REAL NOT NULL,
    negotiator REAL NOT NULL,
    FOREIGN KEY (noun_id) REFERENCES nouns (id)
);

-- Create 'knowledge' table (references beliefs and nouns)
CREATE TABLE knowledge (
    belief_id TEXT NOT NULL,
    noun_id TEXT NOT NULL,
    learned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (belief_id, noun_id),
    FOREIGN KEY (noun_id) REFERENCES nouns (id) ON DELETE CASCADE,
    FOREIGN KEY (belief_id) REFERENCES beliefs (id) ON DELETE CASCADE
);

CREATE VIEW noun_knowledge AS 
    SELECT DISTINCT noun_id as knower_id, subject_id AS known_noun_id
    FROM beliefs
    JOIN knowledge ON knowledge.belief_id = beliefs.id
    WHERE subject_id IS NOT NULL

    UNION

    SELECT DISTINCT noun_id as knower_id, related_to_id AS known_noun_id
    FROM beliefs
    JOIN knowledge ON knowledge.belief_id = beliefs.id
    WHERE related_to_id IS NOT NULL;
;

`;

/**
 * Creates the database schema, and inserts all the concept hierarchies from
 * the code into the database.
 */
function buildSQL(): void {
  // Execute the schema from the external file
  DB.exec(schema);

  const conceptHierarchies: ConceptHierarchy[] = [
    new Professions(),
    new Feelings(),
    new Regions(),
    new Relationships(),
    new Communities(),
    new Lore(),
    new Desires(),
    new Events(),
    new Time(),
    new Personality(),
    new Description()
  ];

  const concepts: Concept[] = [];

  for (const conceptHierarchy of conceptHierarchies) {
    concepts.push(...conceptHierarchy.getConcepts());
  }

  // Now proceed with inserting data
  const insertConcept = DB.prepare(`
        INSERT INTO concepts (id, name, as_question, parent_concept_id)
        VALUES (:id, :name, :as_question, :parent_concept_id)
    `);

  for (const concept of concepts) {
    insertConcept.run({
      ...concept,
      parent_concept_id: concept.parent_concept
        ? concept.parent_concept.id
        : null
    });
  }
}

/**
 * Add a knowledge graph to the database
 *
 * @param graph - the knowledge graph to add
 *
 * This function adds a knowledge graph to the database. It is a low-level
 * function that simply inserts into the database without any additional
 * processing. It does not perform any validation or error checking.
 *
 * @example
 * addGraph({
 *   concepts: [],
 *   nouns: [
 *     { id: '1', name: 'Alice', type: 'person' },
 *     { id: '2', name: 'Bob', type: 'person' },
 *     { id: '3', name: 'Carrot', type: 'item' }
 *   ],
 *   beliefs: [
 *     {
 *       subject: { id: '1' },
 *       related_to: { id: '2' },
 *       concept: { id: 'Likes' },
 *       name: 'Alice likes Bob',
 *       description: 'Alice likes Bob',
 *       trust: 0.5
 *     },
 *     {
 *       subject: { id: '2' },
 *       related_to: { id: '3' },
 *       concept: { id: 'Desires' },
 *       name: 'Bob desires Carrot',
 *       description: 'Bob desires Carrot',
 *       trust: 0.5
 *     }
 *   ],
 *   desires: [
 *     {
 *       person: { id: '1' },
 *       item: { id: '3' },
 *       benefit: 'like'
 *     },
 *     {
 *       person: { id: '2' },
 *       item: { id: '3' },
 *       benefit: 'like'
 *     }
 *   ]
 * });
 */
export function addGraph(graph: KnowledgeGraph) {
  const insertNoun = DB.prepare(`
    INSERT OR IGNORE INTO nouns (id, name, type)
    VALUES (:id, :name, :type)
`);

  for (const noun of graph.nouns) {
    if (!noun.id) {
      noun.id = uuidv4();
    }
    insertNoun.run(noun);
  }

  const insertBelief = DB.prepare(`
    INSERT OR IGNORE INTO beliefs (id, subject_id, related_to_id, concept_id, name, description, trust)
    VALUES (:id, :subject_id, :related_to_id, :concept_id, :name, :description, :trust)
`);

  for (const belief of graph.beliefs) {
    belief.id = uuidv4();
    insertBelief.run({
      ...belief,
      subject_id: belief.subject.id,
      related_to_id: belief.related_to ? belief.related_to.id : null,
      concept_id: belief.concept
    });
  }

  DB.prepare(
    `
    INSERT OR IGNORE INTO knowledge (belief_id, noun_id)
    SELECT DISTINCT beliefs.id, subject_id
    FROM beliefs
    JOIN nouns ON beliefs.subject_id = nouns.id OR beliefs.related_to_id = nouns.id
    WHERE type = 'person'
`
  ).run();

  for (const desire of graph.desires) {
    if (!desire.person) {
      throw new Error(
        `Desire ${JSON.stringify(desire)} does not have a Person`
      );
    }
    let benefit: number;
    switch (desire.benefit) {
      case 'dislike':
        benefit = -1;
        break;
      case 'like':
        benefit = 0.3;
        break;
      case 'love':
        benefit = 1;
        break;
      default:
        throw new Error(`Unknown benefit type: ${desire.benefit}`);
    }
    DB.prepare(
      `
        INSERT OR IGNORE INTO desires (desirer_id, desired_id, benefit)
        VALUES (:desirer_id, :desired_id, :benefit)
    `
    ).run({
      desirer_id: desire.person.id,
      desired_id: desire.item.id,
      benefit: benefit
    });
  }
}

/**
 * @description
 * Build a knowledge graph database from the given graph and create a
 * database file at the default location.
 *
 * @param {KnowledgeGraph} graph The knowledge graph to build into the database.
 *
 * @see {@link module:converse/library/knowledge_graph/buildDB~addGraph|addGraph}
 * @see {@link module:converse/library/knowledge_graph/buildDB~buildSQL|buildSQL}
 */
export function buildGraph(graph: KnowledgeGraph) {
  // Delete the database file if it already exists
  buildSQL();
  addGraph(graph);
}
