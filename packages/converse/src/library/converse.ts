import { DB, initializeDatabase, initializeInMemoryDatabase } from './database';
import { DB, initializeDatabase, initializeInMemoryDatabase } from './database';
import { addGraph } from './knowledge_graph/buildDB';
import { Community } from './knowledge_graph/people/community';
import { constructGraph } from './knowledge_graph/people/graphable';
import { Person } from './knowledge_graph/people/person';
import { Region } from './knowledge_graph/people/region';

export function addPerson(person: Person): void {
  addGraph(constructGraph([person]));
}

export function addPlayer(id: string): void {
  DB.prepare(
    `
    INSERT OR IGNORE INTO players (noun_id)
    VALUES (:id)
  `
  ).run({ id });
}

export function intializeTestKnowledgeDB(): void {
  initializeInMemoryDatabase();
}

export function initializeKnowledgeDB(dbPath: string): void {
  initializeDatabase(dbPath);
}

export function findCommunity(name: string): Community | undefined {
  const communityData = DB.prepare(
    `
   SELECT 
    communities.id AS community_id,
    communities.name AS community_name,
    community_description.description AS community_description,
    community_region.related_to_id AS region_id,
    regions.name AS region_name
    FROM 
    nouns AS communities
    JOIN beliefs AS community_region ON communities.id = community_region.subject_id AND community_region.concept_id = 'region'
    JOIN beliefs AS community_description ON communities.id = community_description.subject_id AND community_description.concept_id = 'description'
    JOIN nouns AS regions ON community_region.related_to_id = regions.id
    WHERE communities.id = :name
  `
  ).get({ name }) as {
    community_id: string;
    community_name: string;
    community_description: string;
    region_id: string;
    region_name: string;
  };

  if (communityData) {
    const region = new Region(
      communityData.region_id,
      communityData.region_name
    );
    return new Community(
      communityData.community_id,
      communityData.community_name,
      communityData.community_description,
      region
    );
  }
  return undefined;
}
