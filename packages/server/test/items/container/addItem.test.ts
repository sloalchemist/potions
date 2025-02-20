import { AddItem } from '../../../src/items/uses/container/addItem';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Container } from '../../../src/items/container';

jest.mock('../../../src/items/uses/usesRegistry', () => ({
  UsesRegistry: {
    instance: {
      registerUse: jest.fn()
    },
    load: jest.fn()
  }
}));

describe('AddItem', () => {
  let mockItem: jest.Mocked<Item>;
  let mockMob: jest.Mocked<Mob>;
  let mockContainer: jest.Mocked<Container>;
  let addItem: AddItem;

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
      placeItem: jest.fn().mockReturnValue(true),
      getCapacity: jest.fn().mockReturnValue(5),
      getInventory: jest.fn().mockReturnValue(0)
    } as unknown as jest.Mocked<Container>;

    // Mock Container.fromItem
    jest.spyOn(Container, 'fromItem').mockReturnValue(mockContainer);

    addItem = new AddItem();

    // Reset all mocks
    jest.clearAllMocks();
  });

  test('should have key as "add_item"', () => {
    expect(addItem.key).toBe('add_item');
  });

  test('should return "Add item to basket" as description', () => {
    expect(addItem.description(mockMob, mockItem)).toBe('Add item to basket');
  });

  test('should successfully add item to container', () => {
    const mockCarriedItem = {
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    mockMob.carrying = mockCarriedItem;

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockContainer.placeItem).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if mob is not carrying anything', () => {
    mockMob.carrying = undefined;

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.placeItem).not.toHaveBeenCalled();
  });

  test('should fail if item is not a container', () => {
    jest.spyOn(Container, 'fromItem').mockReturnValue(undefined);

    const mockCarriedItem = {
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    mockMob.carrying = mockCarriedItem;

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.placeItem).not.toHaveBeenCalled();
  });

  test('should fail if container is full', () => {
    const mockCarriedItem = {
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    mockMob.carrying = mockCarriedItem;
    mockContainer.getCapacity.mockReturnValue(1);
    mockContainer.getInventory.mockReturnValue(1);
    mockContainer.placeItem.mockReturnValue(false);

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.placeItem).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if item type does not match container type', () => {
    const mockCarriedItem = {
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    mockMob.carrying = mockCarriedItem;
    mockContainer.placeItem.mockReturnValue(false);

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.placeItem).toHaveBeenCalledWith(mockMob);
  });
});
