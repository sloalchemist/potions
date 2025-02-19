import { getCarriedItemInteractions } from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { Mob } from '../../../src/world/mob';
import { World } from '../../../src/world/world';
import { ItemType } from '../../../src/worldDescription';

describe('"Give" action item interaction tests', () => {
  let world: World | null = null;
  let log_item: Item | null = null;
  let nearby_mob: Mob | null = null;

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

    nearby_mob = new Mob(
      world!,
      'mob2',
      'Player2',
      'player',
      100,
      { x: 1, y: 1 },
      {},
      {}
    );
  });

  test('Give action is present when receiver is not carrying an item', () => {
    const interactions = getCarriedItemInteractions(
      log_item!,
      [],
      [nearby_mob!],
      'player'
    );

    expect(interactions.some((interaction) => interaction.action === 'give'));
  });

  test('Give action is absent when receiver is carrying item', () => {
    nearby_mob!.carrying = 'log';

    const interactions = getCarriedItemInteractions(
      log_item!,
      [],
      [nearby_mob!],
      'player'
    );

    expect(
      interactions.some((interaction) => interaction.action === 'give')
    ).toBe(false);
  });

  afterAll(() => {
    world = null;
  });
});
