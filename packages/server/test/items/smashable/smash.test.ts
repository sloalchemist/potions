import { Smash } from '../../../src/items/uses/smash';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Smashable } from '../../../src/items/smashable';

jest.mock('../../../src/items/smashable');

describe('Smash', () => {
  let smash: Smash;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockSmashable: jest.Mocked<Smashable>;

  beforeEach(() => {
    smash = new Smash();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;

    // Create mock item
    mockItem = {} as jest.Mocked<Item>;

    // Create mock smashable
    mockSmashable = {
      smashItem: jest.fn()
    } as unknown as jest.Mocked<Smashable>;

    // Mock Smashable.fromItem
    (Smashable.fromItem as jest.Mock).mockReturnValue(mockSmashable);

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "smash"', () => {
    expect(smash.key).toBe('smash');
  });

  test('should return "Smash" as description', () => {
    expect(smash.description(mockMob, mockItem)).toBe('Smash');
  });

  test('should successfully smash item', () => {
    const result = smash.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Smashable.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockSmashable.smashItem).toHaveBeenCalledWith(mockMob);
  });

  test('should throw if item is not smashable', () => {
    (Smashable.fromItem as jest.Mock).mockReturnValue(null);

    expect(() => {
      smash.interact(mockMob, mockItem);
    }).toThrow();
  });
});
