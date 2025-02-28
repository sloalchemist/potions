import {
  getInteractablePhysicals,
  getPhysicalInteractions
} from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { Mob } from '../../../src/world/mob';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Community ownership based interactions', () => {
  let world: World | null = null;
  let potionStand: Item;
  let player: Mob;
  let playerPos: Coord;

  beforeAll(() => {
    // Initialize world
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

    // Put player in world to allow controller to test client side permissions
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
      'alchemists'
    );
    world.mobs[publicCharacterId] = player;
    world.addMobToGrid(player);

    // Define potion stand type with available interactions and their permissions
    const potionStandItemType: ItemType = {
      name: 'Potion Stand',
      type: 'potion-stand',
      carryable: false,
      smashable: false,
      walkable: false,
      interactions: [
        {
          description: 'Collect gold',
          action: 'collect_gold',
          while_carried: false,
          permissions: {
            community: true,
            character: false,
            other: false
          }
        },
        {
          description: 'Purchase potion',
          action: 'purchase',
          while_carried: false,
          permissions: {
            community: false,
            character: false,
            other: true
          }
        }
      ],
      attributes: []
    };

    // Instantiate potion stand
    potionStand = new Item(
      world!,
      'potionstand',
      { x: 1, y: 1 },
      potionStandItemType,
      'alchemists'
    );
  });

  test('Should allow community members to collect gold', () => {
    // Get interactable items within range of player
    const interactablePhysicals = getInteractablePhysicals(
      [potionStand],
      playerPos
    );

    // Determine if potion stand is currently interactable
    const standInteractable = interactablePhysicals.some(
      (item) => item.itemType.name === 'Potion Stand'
    );

    expect(standInteractable).toBe(true);
    // console.log('Interactable items in proximity: ', interactablePhysicals);

    // Get all interactions available for potion stand
    const interactions = getPhysicalInteractions(
      potionStand,
      undefined,
      player.community_id
    );
    // console.log('Interactions available: ', interactions);

    // Collect gold should be an interaction given the defined permissions
    const hasCollectGold = interactions.some(
      (interaction) => interaction.action === 'collect_gold'
    );
    expect(hasCollectGold).toBe(true);
  });

  test('Should prevent community members from purchasing potions', () => {
    // Get interactions available for the potion stand
    const interactions = getPhysicalInteractions(
      potionStand,
      undefined,
      player.community_id
    );

    // Check that purchase is NOT an available interaction
    expect(
      interactions.some((interaction) => interaction.action === 'purchase')
    ).toBe(false);
  });

  afterAll(() => {
    world = null;
  });
});
