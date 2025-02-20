import { Give } from '../../../src/items/uses/give';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Carryable } from '../../../src/items/carryable';

jest.mock('../../../src/items/carryable');

describe('Give', () => {
  let give: Give;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockReceiver: jest.Mocked<Mob>;
  let mockCarryable: jest.Mocked<Carryable>;

  beforeEach(() => {
    give = new Give();

    // Create mock item with ID
    mockItem = {
      id: 'test-item-id'
    } as unknown as jest.Mocked<Item>;

    // Create mock mob with carrying property
    mockMob = {
      carrying: mockItem
    } as unknown as jest.Mocked<Mob>;

    // Create mock receiver
    mockReceiver = {} as jest.Mocked<Mob>;

    // Create mock carryable
    mockCarryable = {
      giveItem: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Carryable>;

    // Mock the static fromItem method
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);
  });

  test('should have key as "give"', () => {
    expect(give.key).toBe('give');
  });

  test('should return "Give" as description', () => {
    expect(give.description(mockMob, mockItem)).toBe('Give');
  });

  test('should successfully give carried item to receiver', () => {
    const result = give.interact(mockMob, mockItem, mockReceiver);

    expect(result).toBe(true);
    expect(Carryable.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCarryable.giveItem).toHaveBeenCalledWith(mockMob, mockReceiver);
  });

  test('should fail if mob is not carrying any item', () => {
    mockMob.carrying = undefined;

    const result = give.interact(mockMob, mockItem, mockReceiver);

    expect(result).toBe(false);
    expect(mockCarryable.giveItem).not.toHaveBeenCalled();
  });

  test('should fail if mob is carrying a different item', () => {
    const differentItem = { id: 'different-item-id' } as unknown as Item;
    mockMob.carrying = differentItem;

    const result = give.interact(mockMob, mockItem, mockReceiver);

    expect(result).toBe(false);
    expect(mockCarryable.giveItem).not.toHaveBeenCalled();
  });

  test('should fail if receiver is undefined', () => {
    const result = give.interact(mockMob, mockItem, undefined);

    expect(result).toBe(false);
    expect(mockCarryable.giveItem).not.toHaveBeenCalled();
  });
});
