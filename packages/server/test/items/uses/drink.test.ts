import { Drink } from '../../../src/items/uses/drink';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { drinkPotion } from '../../../src/items/potionEffects';

jest.mock('../../../src/items/potionEffects');

describe('Drink', () => {
  let drink: Drink;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;

  beforeEach(() => {
    drink = new Drink();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "drink"', () => {
    expect(drink.key).toBe('drink');
  });

  test('should return "Drink" as description', () => {
    expect(drink.description(mockMob, mockItem)).toBe('Drink');
  });

  test('should successfully drink potion with subtype', () => {
    // Create mock item with subtype for success case
    mockItem = {
      subtype: 'health-potion',
      destroy: jest.fn()
    } as unknown as jest.Mocked<Item>;

    const result = drink.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(drinkPotion).toHaveBeenCalledWith(mockMob, mockItem.subtype);
    expect(mockItem.destroy).toHaveBeenCalled();
  });

  test('should fail if item has no subtype', () => {
    // Create mock item without subtype for failure case
    mockItem = {
      destroy: jest.fn()
    } as unknown as jest.Mocked<Item>;

    const result = drink.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(drinkPotion).not.toHaveBeenCalled();
    expect(mockItem.destroy).not.toHaveBeenCalled();
  });
});
