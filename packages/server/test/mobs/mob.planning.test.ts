import { commonSetup, world, itemGenerator } from '../testSetup';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Coord } from '@rt-potion/common';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';
import { FantasyDate } from '../../src/date/fantasyDate';

beforeEach(() => {
  commonSetup(5);
  Community.makeVillage('silverclaw', 'Village of the Silverclaw');
  mobFactory.loadTemplates(world.mobTypes);
});
describe('Mob Tests', () => {
  describe('Mob Plan Behavior', () => {
    test('Villagers only find untargeted items', () => {
      // Spawn two villagers
      const mob1Id = 'testmob-1';
      const mob1Position: Coord = { x: 0, y: 0 };
      mobFactory.makeMob('villager', mob1Position, mob1Id, 'test1Mob');
      const test1Mob = Mob.getMob(mob1Id);
      const mob2Id = 'testmob-2';
      const mob2Position: Coord = { x: 1, y: 1 };
      mobFactory.makeMob('villager', mob2Position, mob2Id, 'test2Mob');
      const test2Mob = Mob.getMob(mob2Id);

      // Spawn a pile of gold
      const gold1Position: Coord = { x: 3, y: 3 };
      itemGenerator.createItem({ type: 'gold', position: gold1Position});

      // Tick so the mobs find a target
      FantasyDate.initialDate();
      FantasyDate.runTick();
      
      test1Mob!.tick(1);
      test2Mob!.tick(1);

      // Ensure the second mob does not target the gold since it is already being targeted
      expect(test1Mob).toBeDefined();
      expect(test2Mob).toBeDefined();
      expect(test1Mob!.action).toBe("get rich");
      expect(test2Mob!.action).not.toBe("get rich");
    });
  });
});

afterEach(() => {
  DB.close();
});