import { commonSetup, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { Item } from '../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
});

describe('Item Generator Tests', () => {
  describe('Heart-Beet Generation', () => {
    test('Should generate a heart-beet item at the specified position', () => {
      const position: Coord = { x: 0, y: 0 };

      // Generate a heart-beet item
      itemGenerator.createItem({ type: 'heart-beet', position });

      // Verify the item exists at the specified position
      const heartBeetID = Item.getItemIDAt(position);
      expect(heartBeetID).not.toBeNull();

      const heartBeet = Item.getItem(heartBeetID!);
      expect(heartBeet).not.toBeNull();
      expect(heartBeet!.type).toBe('heart-beet');
    });
  });
});

afterEach(() => {
  DB.close();
});
