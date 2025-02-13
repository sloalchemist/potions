jest.mock('../../../src/worldMetadata', () => ({
  publicCharacterId: '11111'
}));

jest.mock('../../../src/scenes/worldScene', () => {
  const { World } = jest.requireActual('../../../src/world/world');
  return { world: new World() };
});

import { world } from '../../../src/scenes/worldScene';
import {
  getInteractablePhysicals,
  getPhysicalInteractions
} from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
// import { World } from '../../../src/world/world';
import { Mob } from '../../../src/world/mob';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Community ownership based interactions', () => {
  // let world: World | null = null;
  let potionStand: Item;

  beforeAll(() => {
    // Initialize world
    // world = new World();
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

    const player = new Mob(
      world,
      publicCharacterId,
      'player1',
      'player',
      100,
      { x: 1, y: 1 },
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
            other: false
          }
        },
        {
          description: 'Purchase potion',
          action: 'purchase',
          while_carried: false,
          permissions: {
            community: false,
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

    console.log('publicCharacterId:', publicCharacterId);
    console.log('world.mobs:', world.mobs);
    console.log(
      'world.mobs[publicCharacterId]:',
      world.mobs[publicCharacterId]
    );
  });

  test('Should allow community members to collect gold', () => {
    const playerPos: Coord = { x: 1, y: 0 };

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
    const interactions = getPhysicalInteractions(potionStand);
    // console.log('Interactions available: ', interactions);

    // Collect gold should be an interaction given the defined permissions
    const hasCollectGold = interactions.some(
      (interaction) => interaction.action === 'collect_gold'
    );
    expect(hasCollectGold).toBe(true);
  });

  test('Should prevent community members from purchasing potions', () => {
    // Get interactions available for the potion stand
    const interactions = getPhysicalInteractions(potionStand);

    // Check that purchase is NOT an available interaction
    expect(
      interactions.some((interaction) => interaction.action === 'purchase')
    ).toBe(false);
  });

  afterAll(() => {
    // world = null;
  });
});
