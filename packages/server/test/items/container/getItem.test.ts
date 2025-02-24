import { GetItem } from '../../../src/items/uses/container/getItem';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Container } from '../../../src/items/container';

describe('GetItem', () => {
  let mockItem: jest.Mocked<Item>;
  let mockMob: jest.Mocked<Mob>;
  let mockContainer: jest.Mocked<Container>;
  let getItem: GetItem;

  beforeEach(() => {
    // Create mock item
    mockItem = {
      type: 'basket',
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      validateOwnership: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Item>;

    // Create mock mob with position
    mockMob = {
      position: { x: 0, y: 0 },
      carrying: undefined
    } as unknown as jest.Mocked<Mob>;

    // Create mock container
    mockContainer = {
      retrieveItem: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Container>;

    // Mock Container.fromItem
    jest.spyOn(Container, 'fromItem').mockReturnValue(mockContainer);

    getItem = new GetItem();

    // Reset all mocks
    jest.clearAllMocks();
  });

  test('should have key as "get_item"', () => {
    expect(getItem.key).toBe('get_item');
  });

  test('should return "Get item from basket" as description', () => {
    expect(getItem.description(mockMob, mockItem)).toBe('Get item from basket');
  });

  test('should successfully get item from container', () => {
    mockItem.getAttribute.mockImplementation((attr) => {
      switch (attr) {
        case 'items':
          return 1;
        case 'templateType':
          return 'potion';
        default:
          return 0;
      }
    });

    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockContainer.retrieveItem).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if item is not a container', () => {
    jest.spyOn(Container, 'fromItem').mockReturnValue(undefined);

    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.retrieveItem).not.toHaveBeenCalled();
  });

  test('should fail if container is empty', () => {
    mockItem.getAttribute.mockImplementation((attr) => {
      switch (attr) {
        case 'items':
          return 0;
        default:
          return 0;
      }
    });

    mockContainer.retrieveItem.mockReturnValue(false);

    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.retrieveItem).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if mob is already carrying something', () => {
    const mockCarriedItem = {
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    mockMob.carrying = mockCarriedItem;

    const result = getItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.retrieveItem).not.toHaveBeenCalled();
  });
});
