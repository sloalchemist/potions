import { commonSetup, world, itemGenerator } from '../../testSetup';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Mob } from '../../../src/mobs/mob';
import { DB } from '../../../src/services/database';
import { Community } from '../../../src/community/community';
import { Carryable } from '../../../src/items/carryable';
import { Item } from '../../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('fighters', 'Fighters guild');
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
      expect(fighterMob!.carrying).toBeDefined(); // Fighter should have the potion
    });

    test('Should throw error when trying to drop item with no position', () => {
      const position1: Coord = { x: 0, y: 0 };

      // Create fighter mob with no position by setting it to undefined
      mobFactory.makeMob('fighter', position1, '1', 'testFighter');
      const fighterMob = Mob.getMob('1');
      if (!fighterMob) {
        throw new Error('Fighter mob is undefined');
      }

      // Here we simulate the "no position" by setting the position to undefined through a method or check
      Object.defineProperty(fighterMob, 'position', {
        value: undefined,
        writable: false
      });

      // Create potion
      itemGenerator.createItem({ type: 'potion', position: position1 });
      const potionID = Item.getItemIDAt(position1);
      if (!potionID) {
        throw new Error('Potion ID is undefined');
      }

      const potion = Item.getItem(potionID);
      const carryablePotion = Carryable.fromItem(potion!);

      if (!carryablePotion) {
        throw new Error('Carryable potion is undefined');
      }

      // Mob tries to drop item without a position
      expect(() => carryablePotion.dropAtFeet(fighterMob)).toThrowError(
        'Mob has no position'
      );
    });
  });
});

afterEach(() => {
  DB.close();
});
