import { commonSetup } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { Item } from '../../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
});

describe('Item Position Gathering Tests', () => {
  describe('Test Finding Open Position', () => {
    test('Desired placement position is open', () => {
      const desiredPosition: Coord = { x: 0, y: 0 };
      const openPosition: Coord | undefined =
        Item.findEmptyPosition(desiredPosition);
      expect(openPosition).not.toBeUndefined();
      expect(JSON.stringify(desiredPosition)).toBe(
        JSON.stringify(openPosition)
      );
    });

    test('Desired placement position is taken', () => {
      jest.mock('../../../src/items/item', () => {
        getItemIDAt: jest.fn();
      });
      const desiredPosition: Coord = { x: 0, y: 0 };
      // mock the first position checked to be in use
      jest.spyOn(Item, 'getItemIDAt').mockImplementation((coord) => {
        if (JSON.stringify(coord) === JSON.stringify(desiredPosition)) {
          return 'location in use';
        }
        return undefined;
      });

      const openPosition: Coord | undefined =
        Item.findEmptyPosition(desiredPosition);
      expect(openPosition).not.toBeUndefined();
      expect(JSON.stringify(desiredPosition)).not.toBe(
        JSON.stringify(openPosition)
      );
    });

    test('All placement options in range taken', () => {
      jest.mock('../../../src/items/item', () => {
        getItemIDAt: jest.fn();
      });
      // mock the all position checked to be in use
      jest.spyOn(Item, 'getItemIDAt').mockReturnValue('location in use');

      const desiredPosition: Coord = { x: 0, y: 0 };
      const openPosition: Coord | undefined =
        Item.findEmptyPosition(desiredPosition);
      expect(openPosition).toBeUndefined();
    });
  });
});

afterEach(() => {
  DB.close();
});
