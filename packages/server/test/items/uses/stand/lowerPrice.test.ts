import { LowerPrice } from '../../../../src/items/uses/stand/lowerPrice';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Purchasable } from '../../../../src/items/purchasable';

jest.mock('../../../../src/items/purchasable');

describe('LowerPrice', () => {
  let lowerPrice: LowerPrice;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockPurchasable: jest.Mocked<Purchasable>;

  beforeEach(() => {
    lowerPrice = new LowerPrice();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Create mock item
    mockItem = {
      validateOwnership: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Item>;

    // Create mock purchasable
    mockPurchasable = {
      changePrice: jest.fn()
    } as unknown as jest.Mocked<Purchasable>;

    // Mock Purchasable.fromItem
    (Purchasable.fromItem as jest.Mock).mockReturnValue(mockPurchasable);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "lower_price"', () => {
    expect(lowerPrice.key).toBe('lower_price');
  });

  test('should return "Lower price of potions" as description', () => {
    expect(lowerPrice.description(mockMob, mockItem)).toBe(
      'Lower price of potions'
    );
  });

  test('should successfully lower price', () => {
    const result = lowerPrice.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'lower_price'
    );
    expect(Purchasable.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockPurchasable.changePrice).toHaveBeenCalledWith(-1);
  });

  test('should fail if ownership validation fails', () => {
    mockItem.validateOwnership.mockReturnValue(false);

    const result = lowerPrice.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'lower_price'
    );
    expect(Purchasable.fromItem).not.toHaveBeenCalled();
    expect(mockPurchasable.changePrice).not.toHaveBeenCalled();
  });

  test('should fail if item is not purchasable', () => {
    (Purchasable.fromItem as jest.Mock).mockReturnValue(null);

    const result = lowerPrice.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'lower_price'
    );
    expect(mockPurchasable.changePrice).not.toHaveBeenCalled();
  });
});
