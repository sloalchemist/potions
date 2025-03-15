import { AddIngredient } from '../../../src/items/uses/cauldron/addIngredient';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Cauldron } from '../../../src/items/cauldron';

jest.mock('../../../src/items/cauldron');

describe('AddIngredient', () => {
  let addIngredient: AddIngredient;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockCauldron: jest.Mocked<Cauldron>;
  let mockCarriedItem: jest.Mocked<Item>;

  beforeEach(() => {
    addIngredient = new AddIngredient();

    // Create mock carried item
    mockCarriedItem = {
      id: 'carried-item-id'
    } as jest.Mocked<Item>;

    // Create mock mob with carrying property
    mockMob = {
      carrying: mockCarriedItem
    } as unknown as jest.Mocked<Mob>;

    // Create mock item (cauldron)
    mockItem = {} as jest.Mocked<Item>;

    // Create mock cauldron
    mockCauldron = {
      AddIngredient: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Cauldron>;

    // Mock Cauldron.fromItem
    (Cauldron.fromItem as jest.Mock).mockReturnValue(mockCauldron);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "add_ingredient"', () => {
    expect(addIngredient.key).toBe('add_ingredient');
  });

  test('should return "Add ingredient to cauldron" as description', () => {
    expect(addIngredient.description(mockMob, mockItem)).toBe(
      'Add ingredient to cauldron'
    );
  });

  test('should successfully add ingredient to cauldron', () => {
    const result = addIngredient.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Cauldron.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCauldron.AddIngredient).toHaveBeenCalledWith(mockCarriedItem);
  });

  test('should fail if mob is not carrying anything', () => {
    mockMob.carrying = undefined;

    const result = addIngredient.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Cauldron.fromItem).not.toHaveBeenCalled();
    expect(mockCauldron.AddIngredient).not.toHaveBeenCalled();
  });

  test('should fail if item is not a cauldron', () => {
    (Cauldron.fromItem as jest.Mock).mockReturnValue(null);

    const result = addIngredient.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCauldron.AddIngredient).not.toHaveBeenCalled();
  });

  test('should return false if adding ingredient fails', () => {
    mockCauldron.AddIngredient.mockReturnValue(false);

    const result = addIngredient.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Cauldron.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCauldron.AddIngredient).toHaveBeenCalledWith(mockCarriedItem);
  });
});
