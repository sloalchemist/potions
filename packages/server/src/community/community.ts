import { DB } from '../services/database';

export class Community {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static makeAlliance(one: Community, two: Community) {
    DB.prepare(
      `
            INSERT INTO alliances (community_1_id, community_2_id)
            VALUES (:id1, :id2);
            `
    ).run({ id1: one.id, id2: two.id });
  }

  static makeVillage(id: string, name: string): Community {
    DB.prepare(
      `
            INSERT INTO community (id, name)
            VALUES (:id, :name);
            `
    ).run({ id, name });
    return new Community(id, name);
  }

  static getVillage(id: string): Community {
    const villageData = DB.prepare(
      `
            SELECT 
                id,
                name
            FROM community;
            `
    ).get() as { id: string; name: string };

    if (!villageData) {
      throw new Error(`No village found with id: ${id}`);
    }

    return new Community(villageData.id, villageData.name);
  }

  static SQL = `
        CREATE TABLE community (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );
        
        CREATE TABLE alliances (
            community_1_id TEXT NOT NULL,
            community_2_id TEXT NOT NULL,
            PRIMARY KEY (community_1_id, community_2_id),
            FOREIGN KEY (community_1_id) REFERENCES community (id) ON DELETE CASCADE,
            FOREIGN KEY (community_2_id) REFERENCES community (id) ON DELETE CASCADE
        );
    `;
}
