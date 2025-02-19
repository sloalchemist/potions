import { AskForItem } from '../../../../src/mobs/plans/means/askForItem';
import { Mob } from '../../../../src/mobs/mob';
import { calculateDistance } from '@rt-potion/common';

// Mock calculateDistance from @rt-potion/common
jest.mock('@rt-potion/common', () => ({
  calculateDistance: jest.fn()
}));

describe('AskForItem', () => {
  let askForItem: AskForItem;
  let mockNpc: Mob;
  let mockNearbyMob: Mob;

  beforeEach(() => {
    // Create an instance of AskForItem with desired item types.
    askForItem = new AskForItem(['sword', 'shield']);

    // Set up a mock NPC with a position and a method to find nearby mob IDs.
    mockNpc = {
      id: 'npc1',
      position: { x: 1, y: 1 },
      visionDistance: 5,
      findNearbyMobIDs: jest.fn()
    } as unknown as Mob;

    // Set up a mock nearby mob carrying a "sword"
    mockNearbyMob = {
      id: 'mob1',
      position: { x: 3, y: 3 },
      carrying: { type: 'sword' }
    } as unknown as Mob;

    // For tests that use calculateDistance, have it return 5.
    (calculateDistance as jest.Mock).mockReturnValue(5);

    // Spy on Mob.getMob to override its implementation.
    // Default: when called with 'mob1', return our mockNearbyMob.
    jest.spyOn(Mob, 'getMob').mockImplementation((id: string) => {
      if (id === 'mob1') return mockNearbyMob;
      return undefined;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return false for execute method since it is not implemented', () => {
    const result = askForItem.execute(mockNpc);
    expect(result).toBe(false);
  });

  test('should return Infinity if no nearby mobs are found', () => {
    // Simulate that findNearbyMobIDs returns an empty array.
    (mockNpc.findNearbyMobIDs as jest.Mock).mockReturnValue([]);
    const result = askForItem.cost(mockNpc);
    expect(result).toBe(Infinity);
  });

  test('should return the distance to a nearby mob carrying a desired item', () => {
    // Simulate that findNearbyMobIDs returns the ID of our nearby mob.
    (mockNpc.findNearbyMobIDs as jest.Mock).mockReturnValue([mockNearbyMob.id]);

    const result = askForItem.cost(mockNpc);
    expect(result).toBe(5);
    expect(calculateDistance).toHaveBeenCalledWith(
      mockNpc.position,
      mockNearbyMob.position
    );
  });

  test('should set mobWithItem and carriedItemType if a nearby mob has a matching item', () => {
    (mockNpc.findNearbyMobIDs as jest.Mock).mockReturnValue([mockNearbyMob.id]);

    askForItem.cost(mockNpc);
    expect(askForItem.mobWithItem).toBe(mockNearbyMob);
    expect(askForItem.carriedItemType).toBe('sword');
  });

  test('should return Infinity if no nearby mobs carry a desired item type', () => {
    // Create a mob that carries an undesired item type.
    const noItemMob = {
      id: 'mob2',
      position: { x: 2, y: 2 },
      carrying: { type: 'axe' }
    } as unknown as Mob;
    (mockNpc.findNearbyMobIDs as jest.Mock).mockReturnValue([noItemMob.id]);

    // Override Mob.getMob so that when asked for 'mob2', it returns noItemMob.
    jest.spyOn(Mob, 'getMob').mockImplementation((id: string) => {
      if (id === 'mob2') return noItemMob;
      return undefined;
    });

    const result = askForItem.cost(mockNpc);
    expect(result).toBe(Infinity);
  });
});
