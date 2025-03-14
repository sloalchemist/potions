import { MarketStand } from '../../../src/items/marketStand';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { itemGenerator } from '../../../src/items/itemGenerator';

jest.mock('../../../src/items/item');
jest.mock('../../../src/items/itemGenerator', () => ({
  itemGenerator: {
    createItem: jest.fn()
  }
}));

describe('MarketStand', () => {
  let mockItem: jest.Mocked<Item>;
  let mockMob: jest.Mocked<Mob>;
  let mockCarriedItem: jest.Mocked<Item>;
  let marketStand: MarketStand | undefined;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock item
    mockItem = {
      hasAttribute: jest.fn(),
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      changeAttributeBy: jest.fn()
    } as unknown as jest.Mocked<Item>;

    // Setup mock carried item
    mockCarriedItem = {
      type: 'log',
      destroy: jest.fn()
    } as unknown as jest.Mocked<Item>;

    // Setup mock mob
    mockMob = {
      carrying: mockCarriedItem,
      gold: 100,
      changeGold: jest.fn()
    } as unknown as jest.Mocked<Mob>;
  });

  describe('fromItem', () => {
    it('should create a MarketStand instance when item has required attributes', () => {
      mockItem.hasAttribute.mockImplementation(
        (attr) => attr === 'inventory' || attr === 'prices'
      );

      marketStand = MarketStand.fromItem(mockItem);
      expect(marketStand).toBeDefined();
    });

    it('should return undefined when item is missing required attributes', () => {
      mockItem.hasAttribute.mockReturnValue(false);

      marketStand = MarketStand.fromItem(mockItem);
      expect(marketStand).toBeUndefined();
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      mockItem.hasAttribute.mockImplementation(
        (attr) =>
          attr === 'inventory' || attr === 'prices' || attr === 'item_type'
      );
      marketStand = MarketStand.fromItem(mockItem);
    });

    it('should successfully add item of same type', () => {
      mockItem.getAttribute.mockImplementation((attr): string | number => {
        if (attr === 'inventory') return '{"log": 1}';
        if (attr === 'prices') return '{"log": 10}';
        if (attr === 'item_type') return 'log';
        return '';
      });

      const result = marketStand!.addItem(mockMob);

      expect(result).toBe(true);
      expect(mockItem.changeAttributeBy).toHaveBeenCalledWith('items', 1);
      expect(mockCarriedItem.destroy).toHaveBeenCalled();
    });

    it('should reject item of different type', () => {
      mockItem.getAttribute.mockImplementation((attr): string | number => {
        if (attr === 'item_type') return 'potion';
        return '';
      });

      const result = marketStand!.addItem(mockMob);

      expect(result).toBe(false);
      expect(mockCarriedItem.destroy).not.toHaveBeenCalled();
    });

    it('should reject when mob is not carrying anything', () => {
      mockMob.carrying = undefined;

      const result = marketStand!.addItem(mockMob);

      expect(result).toBe(false);
    });
  });

  describe('changePrice', () => {
    beforeEach(() => {
      mockItem.hasAttribute.mockImplementation(
        (attr) => attr === 'inventory' || attr === 'prices' || attr === 'price'
      );
      marketStand = MarketStand.fromItem(mockItem);
    });

    it('should increase price within bounds', () => {
      mockItem.getAttribute.mockReturnValue(10);

      marketStand!.changePrice(1);

      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 11);
    });

    it('should decrease price within bounds', () => {
      mockItem.getAttribute.mockReturnValue(10);

      marketStand!.changePrice(-1);

      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 9);
    });

    it('should not increase price above 99', () => {
      mockItem.getAttribute.mockReturnValue(99);

      marketStand!.changePrice(1);

      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 99);
    });

    it('should not decrease price below 1', () => {
      mockItem.getAttribute.mockReturnValue(1);

      marketStand!.changePrice(-1);

      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 1);
    });
  });

  describe('purchaseItem', () => {
    beforeEach(() => {
      mockItem.hasAttribute.mockImplementation(
        (attr) => attr === 'inventory' || attr === 'prices'
      );
      marketStand = MarketStand.fromItem(mockItem);
    });

    it('should successfully purchase available item', () => {
      mockItem.getAttribute.mockImplementation((attr): string | number => {
        if (attr === 'inventory') return '{"log": 1}';
        if (attr === 'prices') return '{"log": 10}';
        return 0;
      });

      const result = marketStand!.purchaseItem(mockMob, 'log');

      expect(result).toBe(true);
      expect(mockMob.changeGold).toHaveBeenCalledWith(-10);
      expect(mockItem.changeAttributeBy).toHaveBeenCalledWith('items', -1);
      expect(mockItem.changeAttributeBy).toHaveBeenCalledWith('gold', 10);
      expect(itemGenerator.createItem).toHaveBeenCalledWith({
        type: 'log',
        carriedBy: mockMob
      });
    });

    it('should fail when item is not in inventory', () => {
      mockItem.getAttribute.mockImplementation((attr): string | number => {
        if (attr === 'inventory') return '{}';
        if (attr === 'prices') return '{"log": 10}';
        return 0;
      });

      const result = marketStand!.purchaseItem(mockMob, 'log');

      expect(result).toBe(false);
      expect(mockMob.changeGold).not.toHaveBeenCalled();
      expect(itemGenerator.createItem).not.toHaveBeenCalled();
    });

    it('should fail when price is not set', () => {
      mockItem.getAttribute.mockImplementation((attr): string | number => {
        if (attr === 'inventory') return '{"log": 1}';
        if (attr === 'prices') return '{}';
        return 0;
      });

      const result = marketStand!.purchaseItem(mockMob, 'log');

      expect(result).toBe(false);
      expect(mockMob.changeGold).not.toHaveBeenCalled();
      expect(itemGenerator.createItem).not.toHaveBeenCalled();
    });

    it('should fail when mob has insufficient gold', () => {
      mockItem.getAttribute.mockImplementation((attr): string | number => {
        if (attr === 'inventory') return '{"log": 1}';
        if (attr === 'prices') return '{"log": 200}';
        return 0;
      });

      const result = marketStand!.purchaseItem(mockMob, 'log');

      expect(result).toBe(false);
      expect(mockMob.changeGold).not.toHaveBeenCalled();
      expect(itemGenerator.createItem).not.toHaveBeenCalled();
    });
  });

  describe('collectGold', () => {
    beforeEach(() => {
      mockItem.hasAttribute.mockImplementation(
        (attr) => attr === 'inventory' || attr === 'prices'
      );
      marketStand = MarketStand.fromItem(mockItem);
    });

    it('should transfer gold from stand to mob', () => {
      mockItem.getAttribute.mockReturnValue(50);

      marketStand!.collectGold(mockMob);

      expect(mockMob.changeGold).toHaveBeenCalledWith(50);
      expect(mockItem.setAttribute).toHaveBeenCalledWith('gold', 0);
    });

    it('should handle zero gold', () => {
      mockItem.getAttribute.mockReturnValue(0);

      marketStand!.collectGold(mockMob);

      expect(mockMob.changeGold).toHaveBeenCalledWith(0);
      expect(mockItem.setAttribute).toHaveBeenCalledWith('gold', 0);
    });
  });
});
