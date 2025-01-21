import { Mob } from '../../src/world/mob';
import { World } from '../../src/world/world';
import { Item } from '../../src/world/item';
import { ItemType } from "../../src/worldDescription";
import { Coord } from "../../../common/src/coord"; 

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

const gateItemType: ItemType = {
  name: "Gate",
  type: "gate",
  item_group: "fence",
  layout_type: "opens", 
  carryable: false,     
  smashable: true,               
  walkable: true,       
  interactions: [],
  attributes: [
      {
          "name": "health",
          "value": 100
      }
  ],
  open: false
};

const mockWorld = {
  addMobToGrid: jest.fn(),
  getItemAt: jest.fn(),
  generatePath: jest.fn().mockReturnValue(TEST_NEW_PATH),
  moveMob: jest.fn(),
  items : {} as Record<string, Item>,
  addItemToGrid: jest.fn(),
  pathFinder: {
    clearBlockingItems: jest.fn(),
    setBlockingItem: jest.fn(),
    generatePath: jest.fn().mockReturnValue(TEST_NEW_PATH),
  },
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

describe("Items and Path Blocking", () => {
  let world: World;

  beforeAll(() => {
    world = new World();
    world.load({
      tiles: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      terrain_types: [{ id: 0, name: 'Grass', walkable: true }],
      item_types: [],
      mob_types: [],
    });
  });

  test('Pathing Correct When Gate is Open/Closed', () => {
    let c1: Coord = {x: 2, y: 2};
    let c2: Coord = {x: 4, y: 4};

    const gate = new Item(world, "gate1", { x: 3, y: 3 }, gateItemType);
    gate.lock = "lock";

    world.addItemToGrid(gate);
    world.items["gate1"] = gate;

    jest.spyOn(world['pathFinder']!, "setBlockingItem")
    
    // create path attempt one -- closed gate
    world.generatePath([], c1, c2)
    expect(world['pathFinder']!.setBlockingItem).toHaveBeenCalledTimes(1);

    gate.itemType.open = true;

    // create path attempt two -- open gate
    world.generatePath([], c1, c2)
    expect(world['pathFinder']!.setBlockingItem).toHaveBeenCalledTimes(1);
    gate.itemType.open = false;

    // create path attempt three -- closed gate
    world.generatePath([], c1, c2)
    expect(world['pathFinder']!.setBlockingItem).toHaveBeenCalledTimes(2);
  });
});