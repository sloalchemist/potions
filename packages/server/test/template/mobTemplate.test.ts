// Taken from mob.test.ts

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

      mobFactory.makeMob('player', position, mobId, 'testPlayer'); // Create mob
      const testMob = Mob.getMob(mobId); // get mob

      expect(testMob).toBeDefined(); // do tests on the mob here...
    });
  });

  describe('Mob Health Behavior', () => {
    test('Health decreases correctly and does not drop below zero', () => {
      const mobId = 'testmob-health';
      const playerPosition: Coord = { x: 0, y: 0 };

      mobFactory.makeMob('player', playerPosition, mobId, 'testPlayer'); // make mob
      const testMob = Mob.getMob(mobId); // get mob

      // health init is 100. -50 should be 50 health.
      testMob?.changeHealth(-50); // decrease mob health
      expect(testMob?.health).toBe(50);

      //health 50 - 60 is < 0, so should be 0
      testMob?.changeHealth(-60);
      expect(testMob?.health).toBe(0);
    });
  });
});

afterEach(() => {
  DB.close();
});
