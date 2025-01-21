import { Mob } from '../../src/world/mob';
import { World } from '../../src/world/world';
import { Item } from '../../src/world/item';

const TEST_UNWALKABLE_ITEM = { isWalkable: () => false } as unknown as Item;
const TEST_WALKABLE_ITEM = { isWalkable: () => true } as unknown as Item;
const TEST_OLD_PATH = [
  { x: 1, y: 1 },
  { x: 2, y: 2 }
];
const TEST_NEW_PATH = [
  { x: 2, y: 2 },
  { x: 3, y: 3 }
];

const mockWorld = {
  addMobToGrid: jest.fn(),
  getItemAt: jest.fn(),
  generatePath: jest.fn().mockReturnValue(TEST_NEW_PATH),
  moveMob: jest.fn(),
  addItemToGrid: jest.fn(),
};

const createTestMob = (): Mob => {
  const mob = new Mob(
    mockWorld as unknown as World,
    'test',
    'test',
    'test',
    1,
    { x: 0, y: 0 },
    {}
  );
  mob.path = TEST_OLD_PATH;
  return mob;
};

describe('Mob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be created in world', () => {
    const mob = createTestMob();

    expect(mob).toBeDefined();
    expect(mockWorld.addMobToGrid).toHaveBeenCalledWith(mob);
  });

  describe('tick', () => {
    it('should recalculate path if next step has unwalkable item', () => {
      mockWorld.getItemAt.mockReturnValue(TEST_UNWALKABLE_ITEM);

      const mob = createTestMob();
      mob.tick(mockWorld as unknown as World, 1);

      expect(mockWorld.generatePath).toHaveBeenCalledWith(
        mob.unlocks,
        expect.any(Object),
        TEST_OLD_PATH[TEST_OLD_PATH.length - 1]
      );
      // Need to do separate floating point comparison for mob position
      expect(mockWorld.generatePath.mock.calls[0][1].x).toBeCloseTo(0);
      expect(mockWorld.generatePath.mock.calls[0][1].y).toBeCloseTo(0);
      expect(mob.path).toEqual(TEST_NEW_PATH);
    });

    it('should not recalculate path if next step has walkable item', () => {
      mockWorld.getItemAt.mockReturnValue(TEST_WALKABLE_ITEM);

      const mob = createTestMob();
      mob.tick(mockWorld as unknown as World, 1);

      expect(mockWorld.generatePath).not.toHaveBeenCalled();
      expect(mob.path).toEqual(TEST_OLD_PATH);
    });

    it('should not recalculate path if next step has no item', () => {
      mockWorld.getItemAt.mockReturnValue(undefined);

      const mob = createTestMob();
      mob.tick(mockWorld as unknown as World, 1);

      expect(mockWorld.generatePath).not.toHaveBeenCalled();
      expect(mob.path).toEqual(TEST_OLD_PATH);
    });
  });
});