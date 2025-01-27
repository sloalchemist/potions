import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { Smashable } from '../../src/items/smashable';
import { Item } from '../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Potion Smashable Tests', () => {
  test('should not drop gold or items when potion is smashed', () => {
    const potionPosition: Coord = { x: 3, y: 3 };
    const mobPosition: Coord = { x: 4, y: 4 };

    // Create player mob
    mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
    const testMob = Mob.getMob('1');
    expect(testMob).not.toBeNull();

    // Verify mob attributes
    expect(testMob?.health).toBe(100);

    // Create Potion item
    itemGenerator.createItem({
      type: 'potion',
      position: potionPosition,
      attributes: {
        health: 5 // Potion has health to simulate it being smashable
      }
    });

    //get the Potion ID
    const potionID = Item.getItemIDAt(potionPosition);

    //If the potion cannot be found
    if (!potionID) {
      throw new Error(
        `No item found at position ${JSON.stringify(potionPosition)}`
      );
    }
    //Get thte actual potion item
    const potionItem = Item.getItem(potionID);
    //If it doesn't exist, throw error
    if (!potionItem) {
      throw new Error(`No item found with ID ${potionID}`);
    }

    // Create Smashable from Potion
    const smashable = Smashable.fromItem(potionItem);
    expect(smashable).toBeDefined();

    // Smash the potion
    smashable?.smashItem(testMob!);

    // Assert that no gold is dropped
    let goldDropped = false;

    //Perform the spiral search in the same way items are droppped.
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const potentialPosition = {
          x: potionPosition.x + dx,
          y: potionPosition.y + dy
        };
        const potentialGoldID = Item.getItemIDAt(potentialPosition);

        if (potentialGoldID) {
          const potentialGold = Item.getItem(potentialGoldID);
          if (potentialGold?.type === 'gold') {
            goldDropped = true;
          }
        }
      }
    }
    //Assert that no gold has beend dropped.
    expect(goldDropped).toBe(false);

    // Assert that no additional items are dropped
    let itemsDropped = 0;
    //Perform the spiral search in the same way items are droppped.
    const searchRadius = 2;
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        const potentialPosition = {
          x: potionPosition.x + dx,
          y: potionPosition.y + dy
        };
        const potentialItemID = Item.getItemIDAt(potentialPosition);

        if (potentialItemID) {
          const potentialItem = Item.getItem(potentialItemID);
          if (potentialItem?.type !== 'potion') {
            itemsDropped++;
          }
        }
      }
    }
    //Assert that there are no items dropped
    expect(itemsDropped).toBe(0);
  });
});

afterEach(() => {
  DB.close();
});
