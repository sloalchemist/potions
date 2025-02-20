import { CollectGold } from '../../../src/items/uses/stand/collectGold';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Purchasable } from '../../../src/items/purchasable';

jest.mock('../../../src/items/purchasable');

describe('CollectGold', () => {
  let collectGold: CollectGold;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockPurchasable: jest.Mocked<Purchasable>;

  beforeEach(() => {
    collectGold = new CollectGold();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Create mock item
    mockItem = {
      validateOwnership: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Item>;

    // Create mock purchasable
    mockPurchasable = {
      collectGold: jest.fn()
    } as unknown as jest.Mocked<Purchasable>;

    // Mock Purchasable.fromItem
    (Purchasable.fromItem as jest.Mock).mockReturnValue(mockPurchasable);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "collect_gold"', () => {
    expect(collectGold.key).toBe('collect_gold');
  });

  test('should return "Collect gold" as description', () => {
    expect(collectGold.description(mockMob, mockItem)).toBe('Collect gold');
  });

  test('should successfully collect gold', () => {
    const result = collectGold.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'collect_gold'
    );
    expect(Purchasable.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockPurchasable.collectGold).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if ownership validation fails', () => {
    mockItem.validateOwnership.mockReturnValue(false);

    const result = collectGold.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'collect_gold'
    );
    expect(Purchasable.fromItem).not.toHaveBeenCalled();
    expect(mockPurchasable.collectGold).not.toHaveBeenCalled();
  });

  test('should fail if item is not purchasable', () => {
    (Purchasable.fromItem as jest.Mock).mockReturnValue(null);

    const result = collectGold.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'collect_gold'
    );
    expect(mockPurchasable.collectGold).not.toHaveBeenCalled();
  });
});
