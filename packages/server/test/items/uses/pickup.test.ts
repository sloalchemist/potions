import { Pickup } from '../../../src/items/uses/pickup';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Carryable } from '../../../src/items/carryable';

jest.mock('../../../src/items/carryable');

describe('Pickup', () => {
  let pickup: Pickup;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockCarryable: jest.Mocked<Carryable>;

  beforeEach(() => {
    pickup = new Pickup();

    // Create mock mob
    mockMob = {
      carrying: undefined,
      changeGold: jest.fn()
    } as unknown as jest.Mocked<Mob>;

    // Create mock carryable with all required methods
    mockCarryable = {
      pickup: jest.fn(),
      dropAtFeet: jest.fn()
    } as unknown as jest.Mocked<Carryable>;

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "pickup"', () => {
    expect(pickup.key).toBe('pickup');
  });

  test('should return "Pickup" as description', () => {
    expect(pickup.description(mockMob, mockItem)).toBe('Pickup');
  });

  test('should fail if item has no position', () => {
    mockItem = {
      position: undefined,
      type: 'potion'
    } as unknown as jest.Mocked<Item>;
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);

    const result = pickup.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCarryable.pickup).not.toHaveBeenCalled();
  });

  test('should fail if item is not carryable', () => {
    mockItem = {
      position: { x: 0, y: 0 },
      type: 'potion'
    } as unknown as jest.Mocked<Item>;
    (Carryable.fromItem as jest.Mock).mockReturnValue(null);

    const result = pickup.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCarryable.pickup).not.toHaveBeenCalled();
  });

  test('should pickup gold and add to mob gold amount', () => {
    const goldAmount = 100;
    mockItem = {
      position: { x: 0, y: 0 },
      type: 'gold',
      getAttribute: jest.fn().mockReturnValue(goldAmount),
      destroy: jest.fn()
    } as unknown as jest.Mocked<Item>;
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);

    const result = pickup.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockMob.changeGold).toHaveBeenCalledWith(goldAmount);
    expect(mockItem.destroy).toHaveBeenCalled();
    expect(mockCarryable.pickup).not.toHaveBeenCalled();
  });

  test('should drop currently carried item and pickup new item', () => {
    // Create carried item
    const carriedItem = {
      id: 'carried-item-id'
    } as unknown as jest.Mocked<Item>;
    mockMob.carrying = carriedItem;

    // Create new item to pick up
    mockItem = {
      position: { x: 0, y: 0 },
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    // Create carryable for currently carried item
    const carriedCarryable = {
      dropAtFeet: jest.fn(),
      pickup: jest.fn() // Add pickup method even though it won't be used
    } as unknown as jest.Mocked<Carryable>;

    // Mock Carryable.fromItem to return different instances for carried and new items
    (Carryable.fromItem as jest.Mock).mockImplementation((item: Item) => {
      if (item === carriedItem) {
        return carriedCarryable;
      }
      if (item === mockItem) {
        return mockCarryable;
      }
      return null;
    });

    const result = pickup.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(carriedCarryable.dropAtFeet).toHaveBeenCalledWith(mockMob);
    expect(mockCarryable.pickup).toHaveBeenCalledWith(mockMob);
  });

  test('should pickup item when mob is not carrying anything', () => {
    mockItem = {
      position: { x: 0, y: 0 },
      type: 'potion'
    } as unknown as jest.Mocked<Item>;
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);

    const result = pickup.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockCarryable.pickup).toHaveBeenCalledWith(mockMob);
  });
});
