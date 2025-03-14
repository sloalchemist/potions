import { getPhysicalInteractions } from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { Mob } from '../../../src/world/mob';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Community member non-ownership interactions', () => {
  let world: World | null = null;
  let potionStand: Item;
  let communityMember: Mob;
  let communityMemberPos: Coord;
  const communityId = 'alchemists';

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

    // Will be passed to potion stand creation
    const ownerId = 'ownerID';

    // Non-owner community member setup
    const communityMemberId = 'communityMemberID';
    communityMemberPos = { x: 1, y: 0 };
    communityMember = new Mob(
      world,
      communityMemberId,
      'community_member',
      'player',
      100,
      communityMemberPos,
      {},
      {},
      {},
      communityId // Same community as owner but not the owner
    );
    world.mobs[communityMemberId] = communityMember;
    world.addMobToGrid(communityMember);

    // Define potion stand with interactions
    // Set community and other to true to allow those within the community
    // and all other non-owners access to potion purchase
    const potionStandItemType: ItemType = {
      name: 'Potion Stand',
      type: 'potion-stand',
      carryable: false,
      smashable: false,
      walkable: false,
      interactions: [
        {
          description: 'Purchase potion',
          action: 'purchase',
          while_carried: false,
          permissions: {
            community: true,
            character: false,
            other: true
          }
        }
      ],
      attributes: []
    };

    // Instantiate potion stand with community ownership,
    // but set ownership to the "owner" (i.e. NOT communityMemberId)
    potionStand = new Item(
      world!,
      'potionstand',
      { x: 1, y: 1 },
      potionStandItemType,
      communityId,
      ownerId
    );
  });

  test('Community member should be able to see "other" interactions', () => {
    // Get interactions available for the community member who does not own the stand
    const interactions = getPhysicalInteractions(
      potionStand,
      undefined,
      communityMember.community_id,
      communityMember.key
    );

    // Ensure 'purchase' action is available
    const hasPurchaseOption = interactions.some(
      (interaction) => interaction.action === 'purchase'
    );
    expect(hasPurchaseOption).toBe(true);
  });

  afterAll(() => {
    world = null;
  });
});
