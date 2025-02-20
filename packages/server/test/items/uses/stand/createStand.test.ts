import { CreateStand } from '../../../../src/items/uses/stand/createStand';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Create } from '../../../../src/items/uses/create';

jest.mock('../../../../src/items/uses/create', () => ({
  Create: {
    createItemFrom: jest.fn()
  }
}));

describe('CreateStand', () => {
  let createStand: CreateStand;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;

  beforeEach(() => {
    createStand = new CreateStand();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Create mock item
    mockItem = {} as jest.Mocked<Item>;

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "create_stand"', () => {
    expect(createStand.key).toBe('create_stand');
  });

  test('should return "Create stand" as description', () => {
    expect(createStand.description(mockMob, mockItem)).toBe('Create stand');
  });

  test('should successfully create stand', () => {
    (Create.createItemFrom as jest.Mock).mockReturnValue(true);

    const result = createStand.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Create.createItemFrom).toHaveBeenCalledWith(
      mockItem,
      mockMob,
      'potion-stand'
    );
  });

  test('should return false if creating stand fails', () => {
    (Create.createItemFrom as jest.Mock).mockReturnValue(false);

    const result = createStand.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Create.createItemFrom).toHaveBeenCalledWith(
      mockItem,
      mockMob,
      'potion-stand'
    );
  });
});
