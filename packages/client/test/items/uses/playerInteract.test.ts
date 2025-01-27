import { getInteractablePhysicals } from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('When player is next to two non-walkable items, only one interaction is returned', () => {
  let world: World | null = null;
  beforeAll(() => {
    world = new World();
    world.load({
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [{ id: 0, name: 'Grass', walkable: true }],
      item_types: [],
      mob_types: []
    });
  });

  test('Only one interaction when next to wall and fence', () => {
    var partialWallType: ItemType = {
      name: 'Partial Wall',
      type: 'partial-wall',
      carryable: false,
      smashable: true,
      walkable: false,
      interactions: [],
      attributes: []
    };
    var fencetype: ItemType = {
      name: 'Fence',
      type: 'fence',
      carryable: false,
      smashable: true,
      walkable: false,
      interactions: [],
      attributes: []
    };
    var partialWall_1 = new Item(
      world!,
      'partial-wall',
      { x: 1, y: 0 },
      partialWallType
    );
    var fence_1 = new Item(world!, 'fence', { x: 1, y: 1 }, fencetype);
    var fence_2 = new Item(world!, 'fence', { x: 0, y: 1 }, fencetype);
    var playerPos: Coord = { x: 0, y: 0 };
    var physicals: Item[] = [partialWall_1, fence_1, fence_2];
    var interactablePhysicals = getInteractablePhysicals(physicals, playerPos);

    // player should be able to interact with both wall and one of the fences
    var wallExists = interactablePhysicals.some(
      (wall) => wall.itemType.type == 'partial-wall'
    );
    var fenceExists = interactablePhysicals.some(
      (fence) => fence.itemType.type == 'fence'
    );
    expect(wallExists && fenceExists).toBe(true);

    // there should still be unique interactions among non-distinct non-walkable items
    var numFences = interactablePhysicals.filter(
      (fence) => fence.itemType.type == 'fence'
    );
    expect(numFences.length).toBe(1);
  });
  afterAll(() => {
    world = null;
  });
});
