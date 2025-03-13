import { MarketStand } from '../../../src/items/marketStand';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';

jest.mock('../../../src/items/itemGenerator', () => ({
  createItem: jest.fn()
})); // Mock itemGenerator to prevent actual item creation during tests

describe('MarketStand', () => {
  let mockItem: Item;
  let mockMob: Mob;
  let marketStand: MarketStand;

  beforeEach(() => {
    mockItem = {
      hasAttribute: jest.fn(),
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      changeAttributeBy: jest.fn()
    } as unknown as Item;

    // Set up necessary attributes for `mockItem`
    (mockItem.hasAttribute as jest.Mock).mockImplementation((attr: string) => {
      return attr === 'inventory' || attr === 'prices' || attr === 'price';
    });

    (mockItem.getAttribute as jest.Mock).mockImplementation((attr: string) => {
      if (attr === 'inventory') {
        return '{"sword": 10}'; // Mock inventory
      }
      if (attr === 'prices') {
        return '{"sword": 5}'; // Mock prices
      }
      if (attr === 'price') {
        return 10; // Always return 10 for price
      }
      return null;
    });

    mockMob = {
      gold: 100,
      carrying: { type: 'sword' },
      changeGold: jest.fn()
    } as unknown as Mob;

    jest.clearAllMocks(); // Reset all mocks before each test

    // Use the fromItem static method to create the MarketStand instance
    marketStand = MarketStand.fromItem(mockItem) as MarketStand;
  });

  test('should create MarketStand if item has "inventory" and "prices" attributes', () => {
    (mockItem.hasAttribute as jest.Mock).mockReturnValue(true); // Item has the necessary attributes
    const item = {
      hasAttribute: jest.fn(() => true),
      getAttribute: jest.fn()
    } as unknown as Item;
    const stand = MarketStand.fromItem(item);
    expect(stand).toBeInstanceOf(MarketStand);
  });

  describe('getInventory', () => {
    test('should return parsed inventory object', () => {
      const inventory = marketStand.getInventory();
      expect(inventory).toEqual({ sword: 10 });
    });

    test('should return empty object if inventory is empty or invalid', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValueOnce(''); // Empty inventory
      const inventory = marketStand.getInventory();
      expect(inventory).toEqual({});
    });
  });

  describe('getPrices', () => {
    test('should return parsed prices object', () => {
      (mockItem.hasAttribute as jest.Mock).mockReturnValue('{"sword": 5}');
      const prices = marketStand.getPrices();
      expect(prices).toEqual({ sword: 5 });
    });

    test('should return empty object if prices are empty or invalid', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValueOnce('');
      const prices = marketStand.getPrices();
      expect(prices).toEqual({});
    });
  });

  describe('changePrice', () => {
    test('should change the price to a valid range', () => {
      marketStand.changePrice(5); // Change price by +5
      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 15);
    });

    test('should not set the price below 1', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValueOnce(0); // Initial price is 0
      marketStand.changePrice(-10); // Change price by -10
      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 1);
    });

    test('should not set the price above 99', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValueOnce(95); // Initial price is 95
      marketStand.changePrice(10); // Change price by +10
      expect(mockItem.setAttribute).toHaveBeenCalledWith('price', 99);
    });
  });

  describe('addItem', () => {
    test('should add item if market stand is empty', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValueOnce('null'); // No item type set
      // Mock the carried item to be a sword, and include a mock for `destroy`
      mockMob.carrying = {
        type: 'sword',
        destroy: jest.fn() // Mock the destroy method
      } as unknown as Item;

      // Mock `getItemType` to return null initially (market stand is empty)
      marketStand.getItemType = jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce('sword');

      const result = marketStand.addItem(mockMob);
      expect(result).toBe(true);
      expect(mockItem.setAttribute).toHaveBeenCalledWith('item_type', 'sword');
      // Ensure the carried item was destroyed
      expect(mockMob.carrying?.destroy).toHaveBeenCalled();
    });

    test('should not add item if item type does not match', () => {
      (mockItem.hasAttribute as jest.Mock).mockReturnValue('axe'); // Existing item type is 'axe'
      const result = marketStand.addItem(mockMob);
      expect(result).toBe(false); // Different item type cannot be added
    });

    test('should add item if the types match', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValueOnce('sword'); // Existing item type is 'sword'

      // Mock the carried item to be a sword, and include a mock for `destroy`
      mockMob.carrying = {
        type: 'sword',
        destroy: jest.fn() // Mock the destroy method
      } as unknown as Item;

      // Mock `getItemType` to return 'sword' initially (indicating the market stand already has a sword)
      marketStand.getItemType = jest
        .fn()
        .mockReturnValueOnce('sword')
        .mockReturnValueOnce('sword');

      const result = marketStand.addItem(mockMob);
      expect(result).toBe(true);
      expect(mockItem.changeAttributeBy).toHaveBeenCalledWith('items', 1);
      expect(mockMob.carrying?.destroy).toHaveBeenCalled();
    });
  });

  describe('setPrice', () => {
    test('should set a valid price for an item type', () => {
      (mockItem.hasAttribute as jest.Mock).mockReturnValue('{}'); // Empty prices initially
      marketStand.setPrice('sword', 10);
      expect(mockItem.setAttribute).toHaveBeenCalledWith(
        'prices',
        '{"sword":10}'
      );
    });

    test('should ensure price is at least 1', () => {
      (mockItem.hasAttribute as jest.Mock).mockReturnValue('{}'); // Empty prices initially
      marketStand.setPrice('sword', -5); // Setting negative price
      expect(mockItem.setAttribute).toHaveBeenCalledWith(
        'prices',
        '{"sword":1}'
      );
    });
  });

  describe('collectGold', () => {
    test('should collect gold and reset the gold on the market stand', () => {
      (mockItem.getAttribute as jest.Mock).mockReturnValue(10); // Gold available in the market stand
      marketStand.collectGold(mockMob);
      expect(mockMob.changeGold).toHaveBeenCalledWith(10); // Add 10 gold to mob
      expect(mockItem.setAttribute).toHaveBeenCalledWith('gold', 0); // Reset market stand gold
    });
  });
});
