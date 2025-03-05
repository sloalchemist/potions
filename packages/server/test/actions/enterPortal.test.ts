import { EnterPortal } from '../../src/items/uses/enterPortal';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { getWorlds } from '../../src/services/authMarshalling';
import { pubSub } from '../../src/services/clientCommunication/pubsub';

jest.mock('../../src/services/authMarshalling');
jest.mock('../../src/services/clientCommunication/pubsub', () => ({
  pubSub: {
    showPortalMenu: jest.fn(),
    hide: jest.fn()
  }
}));

describe('EnterPortal', () => {
  let enterPortal: EnterPortal;
  let mockMob: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock getWorlds to return test data
    (getWorlds as jest.Mock).mockResolvedValue([
      { id: '1', world_id: 'test-world-1' },
      { id: '2', world_id: 'test-world-2' }
    ]);

    enterPortal = new EnterPortal();
    // Wait for worlds to populate
    await new Promise(process.nextTick);

    // Create mock mob
    mockMob = {
      id: 'test-mob-id',
      hide: jest.fn()
    } as unknown as jest.Mocked<Mob>;
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => ({ x: 5, y: 5 })),
      configurable: true
    });

    // Create mock item (portal)
    mockItem = {} as jest.Mocked<Item>;
    Object.defineProperty(mockItem, 'position', {
      get: jest.fn(() => ({ x: 5, y: 5 })),
      configurable: true
    });
  });

  test('should have key as "enter"', () => {
    expect(enterPortal.key).toBe('enter');
  });

  test('should successfully interact when mob is near portal', () => {
    const result = enterPortal.interact(mockMob, mockItem);

    expect(result).toBe(true);
    expect(pubSub.showPortalMenu).toHaveBeenCalledWith(
      mockMob.id,
      enterPortal.worlds
    );
    expect(pubSub.hide).toHaveBeenCalledWith(mockMob.id);
    expect(mockMob.hide).toHaveBeenCalled();
  });

  test('should fail if mob is too far from portal', () => {
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => ({ x: 10, y: 10 })), // More than 2 units away
      configurable: true
    });

    const result = enterPortal.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(pubSub.showPortalMenu).not.toHaveBeenCalled();
    expect(pubSub.hide).not.toHaveBeenCalled();
    expect(mockMob.hide).not.toHaveBeenCalled();
  });

  test('should fail if mob has no position', () => {
    Object.defineProperty(mockMob, 'position', {
      get: jest.fn(() => undefined),
      configurable: true
    });

    const result = enterPortal.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(pubSub.showPortalMenu).not.toHaveBeenCalled();
    expect(pubSub.hide).not.toHaveBeenCalled();
    expect(mockMob.hide).not.toHaveBeenCalled();
  });

  test('should fail if portal has no position', () => {
    Object.defineProperty(mockItem, 'position', {
      get: jest.fn(() => undefined),
      configurable: true
    });

    const result = enterPortal.interact(mockMob, mockItem);

    expect(result).toBe(false);
    expect(pubSub.showPortalMenu).not.toHaveBeenCalled();
    expect(pubSub.hide).not.toHaveBeenCalled();
    expect(mockMob.hide).not.toHaveBeenCalled();
  });
});
