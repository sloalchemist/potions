import { commonSetup, itemGenerator, world } from '../testSetup';
import { DB } from '../../src/services/database';
import { Item } from '../../src/items/item';
import { BuildWall } from '../../src/items/uses/building/buildWall';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Pickup } from '../../src/items/uses/pickup';
import { Community } from '../../src/community/community';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('BuildWall Tests', () => {
  describe('Building a wall from a partial wall', () => {
    test('Should replace partial wall with a full wall when mob interacts carrying a log', () => {
      // Init variables
      let logPos: Coord = { x: 0, y: 0 };
      let wallPos: Coord = { x: 0, y: 1 };

      // Create a log at the specified position
      itemGenerator.createItem({ type: 'log', position: logPos });
      const logId = Item.getItemIDAt(logPos);
      const log = Item.getItem(logId!);
      expect(log).toBeDefined();

      // Create a partial wall at the specified position
      itemGenerator.createItem({ type: 'partial-wall', position: wallPos });
      const partialWallId = Item.getItemIDAt(wallPos);
      const partialWall = Item.getItem(partialWallId!);
      expect(partialWall).toBeDefined();
      expect(partialWall?.type).toBe('partial-wall');

      // Create a mob
      const playerLocation: Coord = { x: 1, y: 0 };
      mobFactory.makeMob('player', playerLocation, '1234', 'testPlayer1');
      const mob = Mob.getMob('1234');
      expect(mob).toBeDefined();

      // Mob picks up the log
      const pickup = new Pickup();
      expect(pickup.interact(mob!, log!)).toBeTruthy();
      expect(mob!.carrying).toBeDefined();

      // Mob interacts with the partial wall to build a full wall
      const buildWall = new BuildWall();
      expect(buildWall.interact(mob!, log!)).toBeTruthy();

      // Verify the partial wall is replaced with a full wall
      const wallId = Item.getItemIDAt(wallPos);
      const wall = Item.getItem(wallId!);
      expect(wall).toBeDefined();
      expect(wall?.type).toBe('wall');
    });
  });
});

afterEach(() => {
  DB.close();
});
