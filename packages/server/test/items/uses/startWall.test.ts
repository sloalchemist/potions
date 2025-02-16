import { StartWall } from '../../../src/items/uses/building/startWall';
import { Mob } from '../../../src/mobs/mob';
import { Item } from '../../../src/items/item';
import { itemGenerator } from '../../../src/items/itemGenerator';

// Ensure that the path matches the correct location of itemGenerator
jest.mock('../../../src/items/itemGenerator', () => ({
  itemGenerator: {
    createItem: jest.fn()
  }
}));

describe('StartWall', () => {
  let startWall: StartWall;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;

  beforeEach(() => {
    jest.clearAllMocks();

    startWall = new StartWall();

    mockMob = {
      position: { x: 10, y: 20 }
    } as jest.Mocked<Mob>;

    // Create the mock object and cast it to unknown then to jest.Mocked<Item>
    mockItem = {
      id: 'item1',
      position: { x: 0, y: 0 },
      // We cast 'wall' to the expected type using a double cast since ItemType isn't exported.
      itemType: 'wall' as unknown as Item['itemType'],
      type: 'building',
      drops_item: 'partial-wall',
      owned_by: 'mob1',
      destroy: jest.fn(),
      validateOwnership: jest.fn(),
      setAttribute: jest.fn(),
      changeAttributeBy: jest.fn(),
      getAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      tick: jest.fn(),
      interact: jest.fn()
    } as unknown as jest.Mocked<Item>;
  });

  test('should have the correct key', () => {
    expect(startWall.key).toBe('start_wall');
  });

  test('description should return the correct string', () => {
    const description = startWall.description(mockMob, mockItem);
    expect(description).toBe('Start building a wall');
  });

  test('interact should call item.destroy and itemGenerator.createItem', () => {
    startWall.interact(mockMob, mockItem);

    // Check that destroy method is called on the item
    expect(mockItem.destroy).toHaveBeenCalledTimes(1);

    // Check that createItem was called with the correct arguments
    expect(itemGenerator.createItem).toHaveBeenCalledWith({
      type: 'partial-wall',
      position: mockMob.position
    });
  });

  test('interact should return true', () => {
    const result = startWall.interact(mockMob, mockItem);
    expect(result).toBe(true);
  });
});
