import { getPhysicalInteractions } from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { Mob } from '../../../src/world/mob';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Community ownership based interactions', () => {
  let world: World | null = null;
  let lightning_bolt: Item;
  let player: Mob;
  let playerPos: Coord;

  beforeAll(() => {
    world = new World();
    world.load({
      tiles: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ],
      terrain_types: [{ id: 0, name: 'Grass', walkable: true }],
      item_types: [],
      mob_types: []
    });

    const publicCharacterId = '11111';
    playerPos = { x: 1, y: 0 };
    player = new Mob(
      world,
      publicCharacterId,
      'player1',
      'player',
      100,
      playerPos,
      {},
      {},
      'fighters'
    );
    world.mobs[publicCharacterId] = player;
    world.addMobToGrid(player);

    // Instantiate lightning bloom
    const lightningItemType: ItemType = {
      name: 'Lightning Bloom',
      type: 'lightning-bloom',
      attributes: [
        {
          name: 'brew_color',
          value: '#AA00FF'
        },
        {
          name: 'health',
          value: 1
        },
        {
          name: 'specialized_resource',
          value: 'fighters'
        }
      ],
      walkable: true,
      smashable: true,
      interactions: [
        {
          description: 'Eat',
          action: 'eat',
          while_carried: true
        }
      ],
      carryable: true
    };

    lightning_bolt = new Item(
      world!,
      'lightningbolt',
      { x: 1, y: 3 },
      lightningItemType
    );
  });

  test('Player should be able to pick up specialized resource based on affiliation', () => {
    player.community_id = 'fighters';

    // Get interactions available for the basket
    const interactions = getPhysicalInteractions(
      lightning_bolt,
      undefined,
      player.community_id
    );
    console.log(interactions);
    console.log(lightning_bolt);
    console.log('HELLLO');
    // Check that pickup IS an available interaction
    expect(
      interactions.some((interaction) => interaction.action === 'pickup')
    ).toBe(true);
  });

  test('Player should not be able to pick up specialized resources if not affiliated', () => {
    player.community_id = 'blobs';

    // Get interactions available for the basket
    const interactions = getPhysicalInteractions(
      lightning_bolt,
      undefined,
      player.community_id
    );

    // Check that pickup IS NOT an available interaction
    expect(
      interactions.some((interaction) => interaction.action === 'pickup')
    ).toBe(false);
  });

  afterAll(() => {
    world = null;
  });
});
