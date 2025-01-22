import { World } from '../../src/world/world';
import { Item } from '../../src/world/item';
import { ItemType } from '../../src/worldDescription';
import { Coord } from '@rt-potion/common/src/coord';

const gateItemType: ItemType = {
  name: 'Gate',
  type: 'gate',
  item_group: 'fence',
  layout_type: 'opens',
  carryable: false,
  smashable: true,
  walkable: true,
  interactions: [],
  attributes: [
    {
      name: 'health',
      value: 100
    }
  ],
  open: false
};

describe('Items and Path Blocking', () => {
  let world: World;

  beforeAll(() => {
    world = new World();
    let tiles = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    let terrain_types = [{ id: 0, name: 'Grass', walkable: true }];
    world.load({
      tiles: tiles,
      terrain_types: terrain_types,
      item_types: [gateItemType],
      mob_types: []
    });
  });

  test('Pathing Correct When Gate is Open/Closed', () => {
    let start_coord: Coord = { x: 0, y: 0 };
    let gate_coord: Coord = { x: 1, y: 1 };
    let end_coord: Coord = { x: 2, y: 2 };
    let detour_coord: Coord = { x: 2, y: 0 };

    const gate = new Item(world, 'gate1', gate_coord, gateItemType);
    gate.lock = 'block';

    world.addItemToGrid(gate);
    world.items['gate1'] = gate;

    // create path attempt one -- closed gate
    let path1 = world.generatePath([], start_coord, end_coord);
    expect(path1).toEqual([detour_coord, end_coord]);

    world.items['gate1'].itemType.open = true;

    // create path attempt two -- open gate
    let path2 = world.generatePath([], start_coord, end_coord);
    expect(path2).toEqual([end_coord]);

    world.items['gate1'].itemType.open = false;

    // create path attempt three -- closed gate
    let path3 = world.generatePath([], start_coord, end_coord);
    expect(path3).toEqual([detour_coord, end_coord]);
  });
});
