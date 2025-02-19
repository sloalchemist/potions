import { House } from '../../src/community/house';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';
import { itemGenerator } from '../../src/items/itemGenerator';
import { Coord } from '@rt-potion/common';

// Mock the database module to ensure DB.prepare is defined
jest.mock('../../src/services/database', () => ({
  DB: {
    prepare: jest.fn()
  }
}));

// Mock the itemGenerator module
jest.mock('../../src/items/itemGenerator', () => ({
  itemGenerator: {
    createItem: jest.fn()
  }
}));

// Create a mock Community instance. Adjust the arguments as required by your Community constructor.
const mockCommunity = new Community('TestCommunity', 'test-community-id');

describe('House', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('center() should return the correct center coordinate', () => {
    const house = new House('1', { x: 10, y: 10 }, 4, 4, 'community-1');
    expect(house.center()).toEqual({ x: 12, y: 12 });
  });

  test('findLeastPopulatedHouse() should return the house with the fewest mobs', () => {
    // Mock DB.prepare().get() to return a specific house id.
    (DB.prepare as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ id: 'house-123' })
    });

    const result = House.findLeastPopulatedHouse('community-1');
    expect(result).toBe('house-123');
    expect(DB.prepare).toHaveBeenCalled();
  });

  test('findLeastPopulatedHouse() should return undefined if no house is found', () => {
    // Mock DB.prepare().get() to return undefined.
    (DB.prepare as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined)
    });

    const result = House.findLeastPopulatedHouse('community-1');
    expect(result).toBeUndefined();
  });

  test('makeHouse() should create a house and insert it into the database', () => {
    // Mock DB.prepare().run() to simulate a successful DB insert.
    (DB.prepare as jest.Mock).mockReturnValue({
      run: jest.fn()
    });

    const topLeft: Coord = { x: 5, y: 5 };
    const house = House.makeHouse(topLeft, 6, 6, mockCommunity);

    expect(house).toBeInstanceOf(House);
    expect(DB.prepare).toHaveBeenCalled();
    expect(itemGenerator.createItem).toHaveBeenCalled();
  });
});
