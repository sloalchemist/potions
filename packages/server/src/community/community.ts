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
            FROM community
            WHERE id = :id;
            `
    ).get({ id }) as { id: string; name: string };

    if (!villageData) {
      throw new Error(`No village found with id: ${id}`);
    }

    return new Community(villageData.id, villageData.name);
  }

  /**
   * Checks whether two communities, identified by their IDs, are not allied.
   *
   * This function queries the database for an entry in the `alliances` table
   * that indicates an alliance between the two specified community IDs. If
   * no such entry exists, the communities are considered "not allied."
   *
   * @param {string} id_1 - The ID of the first community.
   * @param {string} id_2 - The ID of the second community.
   * @returns {boolean} - Returns `true` if the communities are not allied,
   *                      `false` if they are allied.
   *
   * Database query explanation:
   * - The SQL query checks for a record in the `alliances` table where
   *   `community_1_id` matches `id_1` and `community_2_id` matches `id_2`.
   * - If a matching record is found, the two communities are allied.
   * - If no record is found, they are not allied.
   */
  static isNotAllied(id_1: string, id_2: string): boolean {
    // Query the database to check if an alliance exists between the two communities
    const allianceData = DB.prepare(
      `
          SELECT 
              community_1_id, community_2_id
          FROM alliances
          WHERE 
            (alliances.community_1_id = :id_1 AND alliances.community_2_id = :id_2) OR
            (alliances.community_1_id = :id_2 AND alliances.community_2_id = :id_1)
      `
    ).get({ id_1: id_1, id_2: id_2 }) as { id_1: string; id_2: string };

    // If no record is found, log and return true (not allied)
    if (!allianceData) {
      return true;
    }

    // If a record is found, log and return false (allied)
    return false;
  }

  static getFavor(id_1: string, id_2: string) {
    const favorNum = DB.prepare(
      `
            SELECT favor
            FROM favorability
            WHERE
              (community_1_id = :id_1 AND community_2_id = :id_2) OR
              (community_1_id = :id_2 AND community_2_id = :id_1);
            `
    ).get({ id_1: id_1, id_2: id_2 }) as { favor: number };
    if (!favorNum) {
      throw new Error(
        `Non-existent communities in favorability database with ${id_1} and ${id_2}`
      );
    }
    return favorNum.favor;
  }

  static getAllFavorsForCommunity(communityId: string): Record<string, number> {
    const results = DB.prepare(
      `
      SELECT community_1_id, community_2_id, favor
      FROM favorability
      WHERE community_1_id = :communityId OR community_2_id = :communityId
    `
    ).all({ communityId }) as {
      community_1_id: string;
      community_2_id: string;
      favor: number;
    }[];

    const favorabilities: Record<string, number> = {};

    for (const row of results) {
      const otherCommunity =
        row.community_1_id === communityId
          ? row.community_2_id
          : row.community_1_id;

      if (favorabilities[otherCommunity] !== undefined) {
        favorabilities[otherCommunity] += row.favor;
      } else {
        favorabilities[otherCommunity] = row.favor;
      }
    }

    return favorabilities;
  }

  /**
   * Creates a favorability relation between two communities, and initializes it by an amount
   *
   * @param id_1 The ID of the first community
   * @param id_2 The ID of the second community
   * @param amount The amount you want to initialize the favor between the two communities
   */
  static makeFavor(id_1: string, id_2: string, amount: number) {
    DB.prepare(
      `   INSERT INTO favorability (community_1_id, community_2_id, favor)
        VALUES (:name1, :name2, :num);
        `
    ).run({ name1: id_1, name2: id_2, num: amount });
  }
  /**
   * Adjusts the favorability relation between two communities, and changes it by a certain amount
   *
   * @param first The ID of the first community
   * @param second The ID of the second community
   * @param amount The amount you want to adjust the favor by
   */
  static adjustFavor(first: string, second: string, amount: number) {
    DB.prepare(
      `   UPDATE favorability
        SET favor = favor + :num
        WHERE
            (community_1_id = :id_1 AND community_2_id = :id_2) OR
            (community_1_id = :id_2 AND community_2_id = :id_1)
        `
    ).run({ id_1: first, id_2: second, num: amount });
  }

  static SQL = `
        CREATE TABLE community (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE TABLE favorability (
            community_1_id TEXT NOT NULL,
            community_2_id TEXT NOT NULL,
            favor REAL NOT NULL DEFAULT 0,
            PRIMARY KEY (community_1_id, community_2_id),
            FOREIGN KEY (community_1_id) REFERENCES community (id) ON DELETE CASCADE,
            FOREIGN KEY (community_2_id) REFERENCES community (id) ON DELETE CASCADE
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
