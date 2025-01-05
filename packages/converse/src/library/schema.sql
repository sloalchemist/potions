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
    complementry REAL NOT NULL,
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