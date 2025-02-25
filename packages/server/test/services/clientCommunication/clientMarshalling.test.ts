import { getScoreboardData } from '../../../src/services/clientCommunication/clientMarshalling';
import { DB } from '../../../src/services/database';
import { initializeTestServerDatabase } from '../../../src/services/database';

describe('clientMarshalling', () => {
  beforeAll(() => {
    initializeTestServerDatabase();
    // Create mobs table
    DB.prepare(
      `
      CREATE TABLE mobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gold INTEGER DEFAULT 0
      )
    `
    ).run();
  });

  beforeEach(() => {
    // Clear mobs table before each test
    DB.prepare('DELETE FROM mobs').run();
  });

  describe('getScoreboardData', () => {
    it('returns top 3 mobs ordered by gold', () => {
      // Insert test data
      const testMobs = [
        { id: '1', name: 'Poor Mob', gold: 10 },
        { id: '2', name: 'Rich Mob', gold: 1000 },
        { id: '3', name: 'Middle Mob', gold: 500 },
        { id: '4', name: 'Extra Mob', gold: 5 }
      ];

      const insert = DB.prepare(
        'INSERT INTO mobs (id, name, gold) VALUES (?, ?, ?)'
      );
      testMobs.forEach((mob) => insert.run(mob.id, mob.name, mob.gold));

      const result = getScoreboardData();

      expect(result.scores).toHaveLength(3);
      expect(result.scores).toEqual([
        ['Rich Mob', 1000],
        ['Middle Mob', 500],
        ['Poor Mob', 10]
      ]);
    });
  });
});
