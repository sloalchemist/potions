import { DumpCauldron } from '../../../../src/items/uses/cauldron/dumpCauldron';
import { Item } from '../../../../src/items/item';
import { Mob } from '../../../../src/mobs/mob';
import { Cauldron } from '../../../../src/items/cauldron';

jest.mock('../../../../src/items/cauldron');

describe('DumpCauldron', () => {
  let dumpCauldron: DumpCauldron;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let mockCauldron: jest.Mocked<Cauldron>;

  beforeEach(() => {
    dumpCauldron = new DumpCauldron();

    // Create mock mob
    mockMob = {} as jest.Mocked<Mob>;
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => ({ x: 0, y: 0 })),
      configurable: true
    });

    // Create mock item
    mockItem = {} as jest.Mocked<Item>;

    // Create mock cauldron
    mockCauldron = {
      DumpCauldron: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<Cauldron>;

    // Mock Cauldron.fromItem
    (Cauldron.fromItem as jest.Mock).mockReturnValue(mockCauldron);

    // Reset mocks
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
    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(Cauldron.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCauldron.DumpCauldron).toHaveBeenCalled();
  });

  test('should fail if mob has no position', () => {
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => undefined),
      configurable: true
    });

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Cauldron.fromItem).not.toHaveBeenCalled();
    expect(mockCauldron.DumpCauldron).not.toHaveBeenCalled();
  });

  test('should fail if item is not a cauldron', () => {
    (Cauldron.fromItem as jest.Mock).mockReturnValue(null);

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockCauldron.DumpCauldron).not.toHaveBeenCalled();
  });

  test('should return false if dumping fails', () => {
    mockCauldron.DumpCauldron.mockReturnValue(false);

    const result = dumpCauldron.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(Cauldron.fromItem).toHaveBeenCalledWith(mockItem);
    expect(mockCauldron.DumpCauldron).toHaveBeenCalled();
  });
});
