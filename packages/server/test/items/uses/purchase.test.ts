import { Purchase } from '../../../src/items/uses/stand/purchase';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Purchasable } from '../../../src/items/purchasable';

jest.mock('../../../src/items/purchasable');

describe('Purchase', () => {
  let purchase: Purchase;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockStand: jest.Mocked<Purchasable>;

  beforeEach(() => {
    purchase = new Purchase();

    // Mock instances instead of calling constructors
    mockMob = { /* mock Mob methods if needed */ } as any;
    mockItem = { /* mock Item methods if needed */ } as any;
    mockStand = { purchaseItem: jest.fn() } as any;

    (Purchasable.fromItem as jest.Mock).mockReturnValue(mockStand);
  });

  test('should have key as "purchase"', () => {
    expect(purchase.key).toBe('purchase');
  });

  test('should return "Purchase" as description', () => {
    expect(purchase.description(mockMob, mockItem)).toBe('Purchase');
  });

  test('should return false if item is not purchasable', () => {
    (Purchasable.fromItem as jest.Mock).mockReturnValue(null);
    expect(purchase.interact(mockMob, mockItem)).toBe(false);
  });

  test('should call purchaseItem on stand when interact is called', () => {
    mockStand.purchaseItem.mockReturnValue(true);
    expect(purchase.interact(mockMob, mockItem)).toBe(true);
    expect(mockStand.purchaseItem).toHaveBeenCalledWith(mockMob);
  });
});
