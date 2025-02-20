import { AddItem } from '../../../../src/items/uses/container/addItem';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Container } from '../../../../src/items/container';

jest.mock('../../../../src/items/container');

describe('AddItem', () => {
  let addItem: AddItem;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockContainer: jest.Mocked<Container>;
  let mockCarriedItem: jest.Mocked<Item>;

  beforeEach(() => {
    addItem = new AddItem();

    // Create mock carried item
    mockCarriedItem = {
      id: 'carried-item-id'
    } as jest.Mocked<Item>;

    // Create mock mob with carrying property
    mockMob = {
      carrying: mockCarriedItem
    } as unknown as jest.Mocked<Mob>;

    // Create mock item (container)
    mockItem = {
      validateOwnership: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Item>;

    // Create mock container
    mockContainer = {
      placeItem: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Container>;

    // Mock Container.fromItem
    (Container.fromItem as jest.Mock).mockReturnValue(mockContainer);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "add_item"', () => {
    expect(addItem.key).toBe('add_item');
  });

  test('should return "Add item to basket" as description', () => {
    expect(addItem.description(mockMob, mockItem)).toBe('Add item to basket');
  });

  test('should successfully add item to container', () => {
    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Container.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockContainer.placeItem).toHaveBeenCalledWith(mockMob);
  });

  test('should fail if mob is not carrying anything', () => {
    mockMob.carrying = undefined;

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Container.fromItem).not.toHaveBeenCalled();
    expect(mockContainer.placeItem).not.toHaveBeenCalled();
  });

  test('should fail if item is not a container', () => {
    (Container.fromItem as jest.Mock).mockReturnValue(null);

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockContainer.placeItem).not.toHaveBeenCalled();
  });

  test('should return false if adding item fails', () => {
    mockContainer.placeItem.mockReturnValue(false);

    const result = addItem.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Container.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockContainer.placeItem).toHaveBeenCalledWith(mockMob);
  });
});
