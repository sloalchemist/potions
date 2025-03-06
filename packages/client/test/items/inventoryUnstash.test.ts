import { Item } from '../../src/world/item';
import { Mob } from '../../src/world/mob';
import { World } from '../../src/world/world';
import { ItemType } from '../../src/worldDescription';

describe('"Unstash" action item interaction tests', () => {
  let world: World;
  let log_item: Item;
  let heartbeet_item: Item;
  let nearby_mob: Mob;

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

    const log_type: ItemType = {
      name: 'Log',
      type: 'log',
      carryable: true,
      smashable: true,
      walkable: false,
      interactions: [],
      attributes: []
    };
    log_item = new Item(world!, 'log', { x: 1, y: 1 }, log_type);
    world.items['log'] = log_item;

    const heartbeet_type: ItemType = {
      name: 'Heartbeet',
      type: 'heartbeet',
      carryable: true,
      smashable: true,
      walkable: false,
      interactions: [],
      attributes: []
    };

    heartbeet_item = new Item(
      world!,
      'heartbeet',
      { x: 1, y: 2 },
      heartbeet_type
    );
    world.items['heartbeet'] = heartbeet_item;

    nearby_mob = new Mob(
      world!,
      'mob2',
      'Player2',
      'player',
      100,
      { x: 1, y: 1 },
      {},
      {},
      {}
    );
  });

  test('Unstash item when not carrying an item', () => {
    log_item.pickup(world, nearby_mob);
    expect(!nearby_mob.carrying).toBe(false);

    log_item.stash(world, nearby_mob, { x: 1, y: 1 });
    expect(world.getStoredItems().length == 1).toBe(true);
    expect(!nearby_mob.carrying).toBe(true);

    log_item.unstash(world, nearby_mob, { x: 1, y: 1 });
    expect(world.getStoredItems().length == 0).toBe(true);
    expect(!nearby_mob.carrying).toBe(false);
  });

  test('Unstash item when carrying an item', () => {
    log_item.pickup(world, nearby_mob);
    expect(!nearby_mob.carrying).toBe(false);

    log_item.stash(world, nearby_mob, { x: 1, y: 1 });
    expect(world.getStoredItems().length == 1).toBe(true);
    expect(!nearby_mob.carrying).toBe(true);

    heartbeet_item.pickup(world, nearby_mob);
    expect(!nearby_mob.carrying).toBe(false);

    log_item.unstash(world, nearby_mob, { x: 1, y: 1 });
    expect(world.getStoredItems().length == 1).toBe(true);
    expect(!nearby_mob.carrying).toBe(false);
  });

  afterAll(() => {});
});
