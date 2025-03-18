import { Read } from '../../src/items/uses/read';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';

describe('Read', () => {
  let read: Read;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;

  beforeEach(() => {
    read = new Read();

    // Create mock mob
    mockMob = {
      sendMessage: jest.fn()
    } as unknown as jest.Mocked<Mob>;

    // Reset mocks
    jest.clearAllMocks();
  });

  test('should have key as "read"', () => {
    expect(read.key).toBe('read');
  });

  test('should return "Read" as description', () => {
    expect(read.description(mockMob, mockItem)).toBe('Read');
  });

  test('should fail if item type is not "message-in-bottle"', () => {
    mockItem = {
      type: 'potion'
    } as unknown as jest.Mocked<Item>;

    const result = read.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(mockMob.sendMessage).not.toHaveBeenCalled();
  });

  test('should send message and return true when reading "message-in-bottle"', () => {
    mockItem = {
      type: 'message-in-bottle'
    } as unknown as jest.Mocked<Item>;

    const result = read.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(mockMob.sendMessage).toHaveBeenCalledWith(
      'Greetings from the Deep… The sea whispers of forgotten treasures and ancient secrets hidden in the abyss. As you drift through the waters of Oozon, keep your eyes sharp. May the waves guide you.'
    );
  });
});
