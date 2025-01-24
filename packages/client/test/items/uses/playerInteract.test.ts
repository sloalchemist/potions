// import { getInteractablePhysicals } from '../../../src/world/controller';
// import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
// import { ItemType } from '../../../src/worldDescription';
// import { Coord } from '@rt-potion/common';

describe('When player is next to two non-walkable items, only one interaction is returned', () => {
  let world: World | null = null;
  beforeAll(() => {
    world = new World();
    world.load({
      tiles: [
        [0, 0],
        [0, 0]
      ],
      terrain_types: [{ id: 0, name: 'Grass', walkable: true }],
      item_types: [],
      mob_types: []
    });
  });

  test('Only one interaction when next to wall and fence', () => {
    // const partialWallType: ItemType = {
    //   name: 'Partial Wall',
    //   type: 'partial-wall',
    //   carryable: false,
    //   smashable: true,
    //   walkable: false,
    //   interactions: [],
    //   attributes: []
    // };
    // const fencetype: ItemType = {
    //   name: 'Fence',
    //   type: 'fence',
    //   carryable: false,
    //   smashable: true,
    //   walkable: false,
    //   interactions: [],
    //   attributes: []
    // };
    // const partialWall_1 = new Item(
    //   world!,
    //   'partial-wall',
    //   { x: 1, y: 0 },
    //   partialWallType
    // );
    // const fence_1 = new Item(world!, 'fence', { x: 1, y: 1 }, fencetype);
    // const fence_2 = new Item(world!, 'fence', { x: 0, y: 1 }, fencetype);
    // const playerPos: Coord = { x: 0, y: 0 };
    // const physicals: Item[] = [partialWall_1, fence_1, fence_2];
    // const interactablePhysicals = getInteractablePhysicals(
    //   physicals,
    //   playerPos
    // );
    // console.log(111111111111111)
    // console.log(interactablePhysicals)
  });
  afterAll(() => {
    world = null;
  });
});
