import { Eat } from '../../src/items/uses/eat';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { Needs } from '../../src/mobs/traits/needs';

describe('Eat', () => {
  let eat: Eat;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockNeeds: jest.Mocked<Needs>;

  beforeEach(() => {
    eat = new Eat();

    // Create mock needs
    mockNeeds = {
      changeNeed: jest.fn()
    } as unknown as jest.Mocked<Needs>;

    // Create mock mob
    mockMob = {
      needs: mockNeeds
    } as unknown as jest.Mocked<Mob>;
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => ({ x: 0, y: 0 })),
      configurable: true
    });

    // Create mock item
    mockItem = {
      destroy: jest.fn()
    } as unknown as jest.Mocked<Item>;
  });

  test('should have key as "eat"', () => {
    expect(eat.key).toBe('eat');
  });

  test('should return "Eat" as description', () => {
    expect(eat.description(mockMob, mockItem)).toBe('Eat');
  });

  test('should successfully eat item when mob has position', () => {
    const result = eat.interact(mockMob, mockItem);
    expect(result).toBe(true);
    expect(mockItem.destroy).toHaveBeenCalled();
    expect(mockNeeds.changeNeed).toHaveBeenCalledWith('satiation', 100);
  });

  test('should fail to eat item when mob has no position', () => {
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => undefined),
      configurable: true
    });
    const result = eat.interact(mockMob, mockItem);
    expect(result).toBe(false);
    expect(mockItem.destroy).not.toHaveBeenCalled();
    expect(mockNeeds.changeNeed).not.toHaveBeenCalled();
  });
});
