import { BottlePotion } from '../../../../src/items/uses/cauldron/bottlePotion';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Cauldron } from '../../../../src/items/cauldron';

jest.mock('../../../../src/items/cauldron');

describe('BottlePotion', () => {
  let bottlePotion: BottlePotion;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockCauldron: jest.Mocked<Cauldron>;

  beforeEach(() => {
    bottlePotion = new BottlePotion();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => ({ x: 0, y: 0 })),
      configurable: true
    });

    // Create mock item
    mockItem = {} as jest.Mocked<Item>;

    // Create mock cauldron
    mockCauldron = {
      bottlePotion: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Cauldron>;

    // Mock Cauldron.fromItem
    (Cauldron.fromItem as jest.Mock).mockReturnValue(mockCauldron);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "bottle_potion"', () => {
    expect(bottlePotion.key).toBe('bottle_potion');
  });

  test('should return "Bottle Potion" as description', () => {
    expect(bottlePotion.description(mockMob, mockItem)).toBe('Bottle Potion');
  });

  test('should successfully bottle potion', () => {
    const result = bottlePotion.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Cauldron.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCauldron.bottlePotion).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if mob has no position', () => {
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => undefined),
      configurable: true
    });

    const result = bottlePotion.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Cauldron.fromItem).not.toHaveBeenCalled();
    expect(mockCauldron.bottlePotion).not.toHaveBeenCalled();
  });

  test('should fail if item is not a cauldron', () => {
    (Cauldron.fromItem as jest.Mock).mockReturnValue(null);

    const result = bottlePotion.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCauldron.bottlePotion).not.toHaveBeenCalled();
  });

  test('should return false if bottling fails', () => {
    mockCauldron.bottlePotion.mockReturnValue(false);

    const result = bottlePotion.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Cauldron.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCauldron.bottlePotion).toHaveBeenCalledWith(mockMob);
  });
});
