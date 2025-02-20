import { DumpCauldron } from '../../../src/items/uses/cauldron/dumpCauldron';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Cauldron } from '../../../src/items/cauldron';

describe('DumpCauldron', () => {
  let mockItem: jest.Mocked<Item>;
  let mockMob: jest.Mocked<Mob>;
  let mockCauldron: jest.Mocked<Cauldron>;
  let dumpCauldron: DumpCauldron;

  beforeEach(() => {
    // Create mock item
    mockItem = {
      type: 'cauldron',
      getAttribute: jest.fn(),
      setAttribute: jest.fn()
    } as unknown as jest.Mocked<Item>;

    // Create mock mob with position
    mockMob = {
      position: { x: 0, y: 0 }
    } as unknown as jest.Mocked<Mob>;

    // Create mock cauldron
    mockCauldron = {
      DumpCauldron: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Cauldron>;

    // Mock Cauldron.fromItem
    jest.spyOn(Cauldron, 'fromItem').mockReturnValue(mockCauldron);

    dumpCauldron = new DumpCauldron();

    // Reset all mocks
    jest.clearAllMocks();
  });

  test('should have key as "dump_cauldron"', () => {
    expect(dumpCauldron.key).toBe('dump_cauldron');
  });

  test('should return "Dump ingredient/s from cauldron" as description', () => {
    expect(dumpCauldron.description(mockMob, mockItem)).toBe(
      'Dump ingredient/s from cauldron'
    );
  });

  test('should successfully dump cauldron', () => {
    mockItem.getAttribute.mockImplementation((attr) => {
      switch (attr) {
        case 'ingredients':
          return 1;
        case 'potion_subtype':
          return 16711680;
        case 'color_weight':
          return 1;
        default:
          return 0;
      }
    });

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockCauldron.DumpCauldron).toHaveBeenCalled();
  });

  test('should fail if mob has no position', () => {
    Object.defineProperty(mockMob, 'position', {
      get: () => undefined,
      configurable: true
    });

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCauldron.DumpCauldron).not.toHaveBeenCalled();
  });

  test('should fail if item is not a cauldron', () => {
    jest.spyOn(Cauldron, 'fromItem').mockReturnValue(undefined);

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCauldron.DumpCauldron).not.toHaveBeenCalled();
  });

  test('should fail if cauldron is already empty', () => {
    mockItem.getAttribute.mockImplementation((attr) => {
      switch (attr) {
        case 'ingredients':
          return 0;
        case 'potion_subtype':
          return 0;
        case 'color_weight':
          return 1;
        default:
          return 0;
      }
    });

    mockCauldron.DumpCauldron.mockReturnValue(false);

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCauldron.DumpCauldron).toHaveBeenCalled();
  });
});
