import { commonSetup, world, itemGenerator } from '../testSetup';
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
  describe('Mob Plan Behavior', () => {
    test('Correct Item Planning For Gathering', () => {
      const mob1Id = 'testmob-1';
      const mob1Position: Coord = { x: 0, y: 0 };
      mobFactory.makeMob('villager', mob1Position, mob1Id, 'test1Mob');
      const test1Mob = Mob.getMob(mob1Id);
      const mob2Id = 'testmob-2';
      const mob2Position: Coord = { x: 1, y: 1 };
      mobFactory.makeMob('villager', mob2Position, mob2Id, 'test2Mob');
      const test2Mob = Mob.getMob(mob2Id);
      const gold1Position: Coord = { x: 2, y: 2 };
      // Generate a gold item
      itemGenerator.createItem({ type: 'gold', position: gold1Position});
      const gold2Position: Coord = { x: 3, y: 3};
      // Generate a gold item
      itemGenerator.createItem({ type: 'gold', position: gold2Position});
      test1Mob!.tick(1)
      test2Mob!.tick(1)
      expect((test1Mob as any).target_x).toBe(2);
      expect((test1Mob as any).target_y).toBe(2);
      expect((test2Mob as any).target_x).toBe(3);
      expect((test2Mob as any).target_y).toBe(3);
    });
  });
});

afterEach(() => {
  DB.close();
});