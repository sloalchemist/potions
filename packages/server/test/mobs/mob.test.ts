import { commonSetup, world } from '../testSetup';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Coord } from '@rt-potion/common';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Mob Tests', () => {
  describe('Mob Initialization', () => {
    test('Mob is created with correct attributes', () => {
      const position: Coord = { x: 0, y: 0 };
      const mobId = 'testmob';

      mobFactory.makeMob('player', position, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      expect(testMob).toBeDefined();
      expect(testMob?.name).toBe('testPlayer');
      expect(testMob?.type).toBe('player');
      expect(testMob?.health).toBe(100);
      expect(testMob?.position).toStrictEqual(position);
      expect(testMob?.gold).toBe(0);
      expect(testMob?.attack).toBe(5);
      expect(testMob?.community_id).toBe('alchemists');
    });

    test('Multiple mobs are created with unique attributes', () => {
      const mob1Id = 'mob1';
      const mob2Id = 'mob2';
      const player1Position: Coord = { x: 1, y: 1 };
      const player2Position: Coord = { x: 2, y: 2 };

      mobFactory.makeMob('player', player1Position, mob1Id, 'mobOne');
      mobFactory.makeMob('player', player2Position, mob2Id, 'mobTwo');

      const mob1 = Mob.getMob(mob1Id);
      const mob2 = Mob.getMob(mob2Id);

      expect(mob1).toBeDefined();
      expect(mob2).toBeDefined();

      expect(mob1?.name).toBe('mobOne');
      expect(mob1?.position).toStrictEqual(player1Position);

      expect(mob2?.name).toBe('mobTwo');
      expect(mob2?.position).toStrictEqual(player2Position);

      expect(mob1?.id).not.toBe(mob2?.id);
    });
  });

  describe('Mob Health Behavior', () => {
    test('Health decreases correctly and does not drop below zero', () => {
      const mobId = 'testmob-health';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      // health init is 100. -50 should be 50 health.
      testMob?.changeHealth(-50);
      expect(testMob?.health).toBe(50);

      //health 50 - 60 is < 0, so should be 0.
      testMob?.changeHealth(-60);
      expect(testMob?.health).toBe(0);
    });

    test('Health increases correctly and respects maximum health', () => {
      const mobId = 'testmob-heal';
      const playerLocation: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerLocation, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      //init health 100 - 50 = 50
      testMob?.changeHealth(-50);
      expect(testMob?.health).toBe(50);

      //health 50 + 30 = 80
      testMob?.changeHealth(30);
      expect(testMob?.health).toBe(80);

      //health 80 + 50 is > 100, so should be 100
      testMob?.changeHealth(50);
      expect(testMob?.health).toBe(100);
    });

    test('Health behavior handles exact zero correctly', () => {
      const mobId = 'testmob-exact-zero';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      //deplete init health 100 - 100 = 0
      testMob?.changeHealth(-100);
      expect(testMob?.health).toBe(0);

      //double check max check for below 0
      testMob?.changeHealth(-10);
      expect(testMob?.health).toBe(0);
    });

    test('Health should not increase if mob is dead', () => {
      const mobId = 'testmob-death';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      // kill mob
      testMob?.changeHealth(-100);
      expect(testMob?.health).toBe(0);

      //try to add 50 health
      testMob?.changeHealth(50);
      expect(testMob?.health).toBe(0);
    });

    test('Health should remain the same if 0 health is inputted to changeHealth()', () => {
      const mobId = 'testmob-no-change';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      //try no change in health 100 - 0 = 0
      testMob?.changeHealth(0);
      expect(testMob?.health).toBe(100);
    });
  });

  describe('Mob attribute changes', () => {
    test('Mob attack can be changed', () => {
      const mobId = 'testmob-attack';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      // attack init is 5. -2 should be 3 attack.
      expect(testMob?.attack).toBe(5);
      testMob?.changeAttack(-2);
      expect(testMob?.attack).toBe(3);
    })

    test('Mob personality values can be changed', () => {
      const mobId = 'testmob-personality';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      // personality bravery init is 5. 5 should be 10 bravery.
      expect(testMob?.personality.traits["bravery"]).toBe(5);
      testMob?.changePersonality("bravery", 5);
      expect(testMob?.personality.traits["bravery"]).toBe(10);
    })
  });

  describe('Mob Removal', () => {
    test('Mob is removed correctly and no longer accessible', () => {
      const mobId = 'testmob-remove';
      mobFactory.makeMob('player', { x: 0, y: 0 }, mobId, 'testPlayer');
      const testMob = Mob.getMob(mobId);

      // Verify that the mob exists initially
      expect(testMob).toBeDefined();
      expect(testMob?.name).toBe('testPlayer');

      // Remove the mob
      testMob?.removePlayer();

      // Attempt to retrieve the mob again; it should no longer exist
      const removedMob = Mob.getMob(mobId);
      expect(removedMob).toBeUndefined();
    });

    test('Removing a non-existent Mob does not throw an error', () => {
      const nonExistentMobId = 'nonexistentmob';

      // Attempt to retrieve a non-existent mob
      const nonExistentMob = Mob.getMob(nonExistentMobId);
      expect(nonExistentMob).toBeUndefined();

      // Attempt to call removePlayer on an undefined mob
      expect(() => nonExistentMob?.removePlayer()).not.toThrow();
    });
  });
});

afterEach(() => {
  DB.close();
});
