import { CreateMarket } from '../../../src/items/uses/marketstand/createMarket';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Create } from '../../../src/items/uses/create';

jest.mock('../../../src/items/uses/create', () => ({
  Create: {
    createItemFrom: jest.fn()
  }
}));

jest.mock('../../../src/items/item', () => ({
  Item: {
    countTypeOfItemInRadius: jest.fn()
  }
}));

describe('CreateMarket', () => {
  let createMarket: CreateMarket;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;

  beforeEach(() => {
    createMarket = new CreateMarket();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Create mock item
    mockItem = {} as jest.Mocked<Item>;

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "create_market"', () => {
    expect(createMarket.key).toBe('create_market');
  });

  test('should return "Create market" as description', () => {
    expect(createMarket.description(mockMob, mockItem)).toBe('Create market');
  });

  test('should successfully create market', () => {
    (Create.createItemFrom as jest.Mock).mockReturnValue(true);

    const result = createMarket.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Create.createItemFrom).toHaveBeenCalledWith(
      mockItem,
      mockMob,
      'market-stand'
    );
  });

  test('should return false if creating market fails', () => {
    (Create.createItemFrom as jest.Mock).mockReturnValue(false);

    const result = createMarket.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Create.createItemFrom).toHaveBeenCalledWith(
      mockItem,
      mockMob,
      'market-stand'
    );
  });

  test('should not create market if a gate is within the radius of the mob', () => {
    // return 1, indicating a gate is nearby
    (Item.countTypeOfItemInRadius as jest.Mock).mockReturnValue(1);

    const result = createMarket.interact(mockMob, mockItem);

    // The market should not be created, result being false
    expect(result).toBe(false);

    // Ensure method was called with the correct arguments
    expect(Item.countTypeOfItemInRadius).toHaveBeenCalledWith(
      'gate',
      mockMob.position,
      1
    );

    // Ensure that createItemFrom was not called since the gate is nearby
    expect(Create.createItemFrom).not.toHaveBeenCalled();
  });
});
