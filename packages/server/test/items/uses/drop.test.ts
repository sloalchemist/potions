import { Drop } from '../../../src/items/uses/drop';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Carryable } from '../../../src/items/carryable';

jest.mock('../../../src/items/carryable');

describe('Drop', () => {
  let drop: Drop;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockCarryable: jest.Mocked<Carryable>;

  beforeEach(() => {
    drop = new Drop();

    // Create mock item with ID
    mockItem = {
      id: 'test-item-id'
    } as unknown as jest.Mocked<Item>;

    // Create mock mob with carrying property
    mockMob = {
      carrying: mockItem
    } as unknown as jest.Mocked<Mob>;

    // Create mock carryable
    mockCarryable = {
      dropAtFeet: jest.fn()
    } as unknown as jest.Mocked<Carryable>;

    // Mock the static fromItem method
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);
  });

  test('should have key as "drop"', () => {
    expect(drop.key).toBe('drop');
  });

  test('should return "Drop" as description', () => {
    expect(drop.description(mockMob, mockItem)).toBe('Drop');
  });

  test('should successfully drop carried item', () => {
    const result = drop.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Carryable.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCarryable.dropAtFeet).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if mob is not carrying any item', () => {
    mockMob.carrying = undefined;

    const result = drop.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCarryable.dropAtFeet).not.toHaveBeenCalled();
  });

  test('should fail if mob is carrying a different item', () => {
    const differentItem = { id: 'different-item-id' } as unknown as Item;
    mockMob.carrying = differentItem;

    const result = drop.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCarryable.dropAtFeet).not.toHaveBeenCalled();
  });
});
