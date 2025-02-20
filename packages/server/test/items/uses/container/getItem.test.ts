import { GetItem } from '../../../../src/items/uses/container/getItem';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Container } from '../../../../src/items/container';

jest.mock('../../../../src/items/container');

describe('GetItem', () => {
  let getItem: GetItem;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockContainer: jest.Mocked<Container>;

  beforeEach(() => {
    getItem = new GetItem();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Create mock item (container)
    mockItem = {
      validateOwnership: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Item>;

    // Create mock container
    mockContainer = {
      retrieveItem: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Container>;

    // Mock Container.fromItem
    (Container.fromItem as jest.Mock).mockReturnValue(mockContainer);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "get_item"', () => {
    expect(getItem.key).toBe('get_item');
  });

  test('should return "Get item from basket" as description', () => {
    expect(getItem.description(mockMob, mockItem)).toBe('Get item from basket');
  });

  test('should successfully get item from container', () => {
    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Container.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockContainer.retrieveItem).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if item is not a container', () => {
    (Container.fromItem as jest.Mock).mockReturnValue(null);

    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.retrieveItem).not.toHaveBeenCalled();
  });

  test('should return false if getting item fails', () => {
    mockContainer.retrieveItem.mockReturnValue(false);

    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Container.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockContainer.retrieveItem).toHaveBeenCalledWith(mockMob);
  });
});
