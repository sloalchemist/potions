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
  describe('Blob Can Carry Item', () => {
    test('Should allow blob to pick up and carry an item', () => {
      const position1: Coord = { x: 0, y: 0 };
      const potionPosition: Coord = { x: 1, y: 1 };

      // Create blob mob
      mobFactory.makeMob('blob', position1, '1', 'testBlob');
      const blobMob = Mob.getMob('1');
      expect(blobMob).toBeDefined();

      // Create potion
      itemGenerator.createItem({ type: 'potion', position: potionPosition });
      const potionID = Item.getItemIDAt(potionPosition);
      expect(potionID).not.toBeNull();

      const potion = Item.getItem(potionID!);
      expect(potion).toBeDefined();

      const carryablePotion = Carryable.fromItem(potion!);
      expect(carryablePotion).toBeDefined();

      // Player picks up the potion
      carryablePotion!.pickup(blobMob!);
      expect(blobMob!.carrying).toBeDefined(); // Blob should have the potion
    });
  });
});

afterEach(() => {
  DB.close();
});
