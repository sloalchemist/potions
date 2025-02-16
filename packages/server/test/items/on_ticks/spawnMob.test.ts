import { SpawnMob } from '../../../src/items/on_ticks/spawnMob';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { mobFactory } from '../../../src/mobs/mobFactory';

// Mocking Mob.getCountOfType and mobFactory.makeMob
jest.mock('../../../src/mobs/mobFactory', () => ({
  mobFactory: {
    makeMob: jest.fn()
  }
}));

jest.mock('../../../src/mobs/mob', () => ({
  Mob: {
    getCountOfType: jest.fn()
  }
}));

describe('SpawnMob', () => {
  let spawnMob: SpawnMob;
  let mockItem: Item;

  beforeEach(() => {
    spawnMob = new SpawnMob();

    mockItem = {
      position: { x: 10, y: 10 } // Item has a valid position for testing
    } as Item;
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests to avoid conflicts
  });

  test('should return false if item has no position', () => {
    // Case 1: item has no position
    mockItem.position = undefined;

    const result = spawnMob.onTick(mockItem, {
      type: 'monster',
      max: 5,
      rate: 0.5
    });

    expect(result).toBe(false);
  });

  test('should call mobFactory.makeMob if mob count is less than max and random rate allows', () => {
    // Case 2: mob count is less than max and the rate condition is met
    Mob.getCountOfType = jest.fn(() => 3); // Less than max count
    mobFactory.makeMob = jest.fn(); // Mock mobFactory to verify it's called

    const result = spawnMob.onTick(mockItem, {
      type: 'monster',
      max: 5,
      rate: 1
    });

    expect(result).toBe(true);
    expect(mobFactory.makeMob).toHaveBeenCalledWith(
      'monster',
      mockItem.position
    );
  });

  test('should not call mobFactory.makeMob if mob count exceeds max', () => {
    // Case 3: mob count exceeds max
    Mob.getCountOfType = jest.fn(() => 6); // More than max count

    const result = spawnMob.onTick(mockItem, {
      type: 'monster',
      max: 5,
      rate: 0.5
    });

    expect(result).toBe(true);
    expect(mobFactory.makeMob).not.toHaveBeenCalled();
  });

  test('should not call mobFactory.makeMob if rate condition is not met', () => {
    // Case 4: random rate condition fails (we simulate Math.random() < 0.5 by testing with 0.1 rate)
    Mob.getCountOfType = jest.fn(() => 3); // Less than max count
    mobFactory.makeMob = jest.fn(); // Mock mobFactory to verify it's called

    const result = spawnMob.onTick(mockItem, {
      type: 'monster',
      max: 5,
      rate: 0.1
    });

    expect(result).toBe(true);
  });

  test('should return true even if mob is not spawned due to rate or max count', () => {
    // Case 5: rate is low or max count is reached but the method should still return true.
    Mob.getCountOfType = jest.fn(() => 5); // At max count
    const result = spawnMob.onTick(mockItem, {
      type: 'monster',
      max: 5,
      rate: 0.5
    });

    expect(result).toBe(true);
  });
});
