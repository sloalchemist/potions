import {
  getInteractablePhysicals,
  getPhysicalInteractions
} from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { Mob } from '../../../src/world/mob';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Character ownership based interactions', () => {
  let world: World | null = null;
  let potionStand: Item;
  let owner: Mob;
  let ownerPos: Coord;

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

    // Put owner in world
    const ownerId = 'ownderID';
    const ownerCommunity = 'alchemists';
    ownerPos = { x: 1, y: 0 };
    owner = new Mob(
      world,
      ownerId,
      'player1',
      'player',
      100,
      ownerPos,
      {},
      {},
      {},
      ownerCommunity
    );
    world.mobs[ownerId] = owner;
    world.addMobToGrid(owner);

    // Define potion stand type with available interactions and their permissions
    // Collect gold will be allowed
    // Purchase potion will not be allowed
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
            community: false,
            character: true,
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

    // Instantiate potion stand owned by character
    //   potionStand = new Item(world!, 'potionstand', { x: 1, y: 1 }, potionStandItemType, ownerId);
    potionStand = new Item(
      world!,
      'potionstand',
      { x: 1, y: 1 },
      potionStandItemType,
      ownerCommunity,
      ownerId
    );
  });

  test('Owner should be able to collect gold', () => {
    // Get interactable items within range of owner
    const interactablePhysicals = getInteractablePhysicals(
      [potionStand],
      ownerPos
    );

    // Verify the potion stand is interactable
    const standInteractable = interactablePhysicals.some(
      (item) => item.itemType.name === 'Potion Stand'
    );
    expect(standInteractable).toBe(true);

    // Get all interactions available for potion stand
    const interactions = getPhysicalInteractions(
      potionStand,
      undefined,
      owner.community_id,
      owner.key
    );

    // Ensure collect gold is available
    const hasCollectGold = interactions.some(
      (interaction) => interaction.action === 'collect_gold'
    );
    expect(hasCollectGold).toBe(true);
  });

  test('Owner should NOT be able to purchase from their own stand', () => {
    // Get interactions available for the potion stand
    const interactions = getPhysicalInteractions(
      potionStand,
      undefined,
      owner.community_id,
      owner.key
    );

    // Ensure purchase is NOT an available interaction
    const hasPurchaseOption = interactions.some(
      (interaction) => interaction.action === 'purchase'
    );
    expect(hasPurchaseOption).toBe(false);
  });

  afterAll(() => {
    world = null;
  });
});
