import { RaisePrice } from '../../../../src/items/uses/stand/raisePrice';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Purchasable } from '../../../../src/items/purchasable';

jest.mock('../../../../src/items/purchasable');

describe('RaisePrice', () => {
  let raisePrice: RaisePrice;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockPurchasable: jest.Mocked<Purchasable>;

  beforeEach(() => {
    raisePrice = new RaisePrice();

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

  test('should have key as "raise_price"', () => {
    expect(raisePrice.key).toBe('raise_price');
  });

  test('should return "Raise price of potions" as description', () => {
    expect(raisePrice.description(mockMob, mockItem)).toBe(
      'Raise price of potions'
    );
  });

  test('should successfully raise price', () => {
    const result = raisePrice.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'raise_price'
    );
    expect(Purchasable.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockPurchasable.changePrice).toHaveBeenCalledWith(1);
  });

  test('should fail if ownership validation fails', () => {
    mockItem.validateOwnership.mockReturnValue(false);

    const result = raisePrice.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'raise_price'
    );
    expect(Purchasable.fromItem).not.toHaveBeenCalled();
    expect(mockPurchasable.changePrice).not.toHaveBeenCalled();
  });

  test('should fail if item is not purchasable', () => {
    (Purchasable.fromItem as jest.Mock).mockReturnValue(null);

    const result = raisePrice.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockItem.validateOwnership).toHaveBeenCalledWith(
      mockMob,
      'raise_price'
    );
    expect(mockPurchasable.changePrice).not.toHaveBeenCalled();
  });
});
