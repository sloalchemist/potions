import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Carryable } from '../../src/items/carryable';
import { Item } from '../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Carrying Item Tests', () => {
  describe('Fighter Can Carry Item', () => {
    test('Should allow fighter to pick up and carry an item', () => {
      const position1: Coord = { x: 0, y: 0 };
      const potionPosition: Coord = { x: 1, y: 1 };

      // Create fighter mob
      mobFactory.makeMob('fighter', position1, '1', 'testFighter');
      const fighterMob = Mob.getMob('1');
      expect(fighterMob).toBeDefined();

      // Create potion
      itemGenerator.createItem({ type: 'potion', position: potionPosition });
      const potionID = Item.getItemIDAt(potionPosition);
      expect(potionID).not.toBeNull();

      const potion = Item.getItem(potionID!);
      expect(potion).toBeDefined();

      const carryablePotion = Carryable.fromItem(potion!);
      expect(carryablePotion).toBeDefined();

      // Player picks up the potion
      carryablePotion!.pickup(fighterMob!);
      expect(fighterMob!.carrying).toBeDefined(); // Blob should have the potion
    });
  });
});

afterEach(() => {
  DB.close();
});
