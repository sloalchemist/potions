import { PurchaseItem } from '../../../../src/mobs/plans/means/purchaseItem';
import { Mob } from '../../../../src/mobs/mob';
import { Item } from '../../../../src/items/item';
import { calculateDistance } from '@rt-potion/common';

jest.mock('@rt-potion/common', () => ({
  calculateDistance: jest.fn()
}));

describe('PurchaseItem', () => {
  let purchaseItem: PurchaseItem;
  let mockNpc: jest.Mocked<Mob>;
  let mockPotionStand: jest.Mocked<Item>;

  beforeEach(() => {
    purchaseItem = new PurchaseItem();

    mockNpc = {
      position: { x: 5, y: 5 },
      moveToOrExecute: jest.fn(),
      findNClosestObjectIDs: jest.fn(),
      gold: 100
    } as unknown as jest.Mocked<Mob>;

    mockPotionStand = {
      position: { x: 10, y: 10 },
      interact: jest.fn(),
      getAttribute: jest.fn()
    } as unknown as jest.Mocked<Item>;

    // Whenever Item.getItem is called, return our mockPotionStand.
    jest.spyOn(Item, 'getItem').mockImplementation(() => mockPotionStand);
    (calculateDistance as jest.Mock).mockReset();
  });

  // --- Tests for execute() method (lines 10-23) ---

  test('execute returns true if potionStandTarget is null', () => {
    // Default state: potionStandTarget is null.
    expect(purchaseItem.execute(mockNpc)).toBe(true);
  });

  test('execute returns true if NPC has no position', () => {
    Object.defineProperty(mockNpc, 'position', { value: undefined });
    expect(purchaseItem.execute(mockNpc)).toBe(true);
  });

  test('execute returns true if potionStandTarget.position is missing', () => {
    // Create a potion stand with missing position.
    const potionWithoutPos = { ...mockPotionStand, position: undefined };
    Object.defineProperty(purchaseItem, 'potionStandTarget', {
      value: potionWithoutPos
    });
    expect(purchaseItem.execute(mockNpc)).toBe(true);
  });

  test('execute calls moveToOrExecute and then interact when conditions are met', () => {
    // Set a valid potionStandTarget.
    Object.defineProperty(purchaseItem, 'potionStandTarget', {
      value: mockPotionStand
    });
    const result = purchaseItem.execute(mockNpc);
    expect(result).toBe(false);
    expect(mockNpc.moveToOrExecute).toHaveBeenCalledWith(
      mockPotionStand.position,
      1,
      expect.any(Function)
    );
    // Simulate callback execution.
    const callback = (mockNpc.moveToOrExecute as jest.Mock).mock.calls[0][2];
    callback();
    expect(mockPotionStand.interact).toHaveBeenCalledWith(mockNpc, 'purchase');
  });

  // --- Tests for cost() method (lines 28, 39-49) ---

  test('cost throws an error if NPC has no position', () => {
    Object.defineProperty(mockNpc, 'position', { value: undefined });
    expect(() => purchaseItem.cost(mockNpc)).toThrow('NPC has no position');
  });

  test('cost returns Infinity if no potion stand ID is found', () => {
    // Simulate no potion stand found.
    mockNpc.findNClosestObjectIDs.mockReturnValue([]);
    expect(purchaseItem.cost(mockNpc)).toBe(Infinity);
  });

  test('cost returns Infinity if NPC has insufficient gold', () => {
    Object.defineProperty(mockNpc, 'gold', { value: 10 });
    mockNpc.findNClosestObjectIDs.mockReturnValue(['stand1']);
    // Always return a number so that undefined is never returned.
    mockPotionStand.getAttribute.mockImplementation((attr: string) => {
      if (attr === 'price') return 50;
      if (attr === 'items') return 5;
      return 0;
    });
    expect(purchaseItem.cost(mockNpc)).toBe(Infinity);
  });

  test('cost returns Infinity if potion stand has no items', () => {
    Object.defineProperty(mockNpc, 'gold', { value: 100 });
    mockNpc.findNClosestObjectIDs.mockReturnValue(['stand1']);
    mockPotionStand.getAttribute.mockImplementation((attr: string) => {
      if (attr === 'price') return 50;
      if (attr === 'items') return 0;
      return 0;
    });
    expect(purchaseItem.cost(mockNpc)).toBe(Infinity);
  });

  test('cost returns calculated cost if NPC can afford the potion', () => {
    Object.defineProperty(mockNpc, 'gold', { value: 100 });
    mockNpc.findNClosestObjectIDs.mockReturnValue(['stand1']);
    mockPotionStand.getAttribute.mockImplementation((attr: string) => {
      if (attr === 'price') return 10;
      if (attr === 'items') return 5;
      return 0;
    });
    (calculateDistance as jest.Mock).mockReturnValue(5);
    // Expected cost: distance (5) + price (10) = 15.
    expect(purchaseItem.cost(mockNpc)).toBe(15);
  });
});
