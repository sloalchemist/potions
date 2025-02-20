import { commonSetup, world, itemGenerator } from '../../testSetup';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Mob } from '../../../src/mobs/mob';
import { DB } from '../../../src/services/database';
import { Community } from '../../../src/community/community';
import { Smashable } from '../../../src/items/smashable';
import { Item } from '../../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Log Smashable Tests', () => {
  test('should not drop gold or items when log is smashed', () => {
    const fencePosition: Coord = { x: 5, y: 5 };
    const mobPosition: Coord = { x: 6, y: 6 };

    // Create player mob
    mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
    const testMob = Mob.getMob('1');
    expect(testMob).not.toBeNull();

    // Verify mob attributes
    expect(testMob?.health).toBe(100);

    // Create Fence item
    itemGenerator.createItem({
      type: 'fence',
      position: fencePosition,
      attributes: {
        health: 10
      }
    });
    //Get the item ID
    const fenceID = Item.getItemIDAt(fencePosition);
    //if it doesn't exist, throw error.
    if (!fenceID) {
      throw new Error(
        `No item found at position ${JSON.stringify(fencePosition)}`
      );
    }
    //Get actual item
    const fenceItem = Item.getItem(fenceID);
    //Throw error if it doesn't exist
    if (!fenceItem) {
      throw new Error(`No item found with ID ${fenceID}`);
    }

    // Create Smashable from Fence
    const smashable = Smashable.fromItem(fenceItem);
    expect(smashable).toBeDefined();

    // Smash the Fence
    smashable?.smashItem(testMob!);

    // Assert that no gold is dropped
    let goldDropped = false;

    // Scan positions around the mob for dropped gold
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const potentialPosition = {
          x: fencePosition.x + dx,
          y: fencePosition.y + dy
        };
        const potentialGoldID = Item.getItemIDAt(potentialPosition);
        //perform the search and look for gold in the pattern
        if (potentialGoldID) {
          const potentialGold = Item.getItem(potentialGoldID);
          if (potentialGold?.type === 'gold') {
            goldDropped = true;
          }
        }
      }
    }
    // Check to make sure no gold was dropped
    expect(goldDropped).toBe(false);

    // Assert that no items are dropped
    let itemsDropped = 0;

    const searchRadius = 2;
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        const potentialPosition = {
          x: fencePosition.x + dx,
          y: fencePosition.y + dy
        };
        const potentialItemID = Item.getItemIDAt(potentialPosition);
        //Ensure there are no items dropped in the search pattern.
        if (potentialItemID) {
          const potentialItem = Item.getItem(potentialItemID);
          if (potentialItem?.type === 'potion') {
            itemsDropped++;
          }
        }
      }
    }
    //Test to make sure none were dropped.
    expect(itemsDropped).toBe(0);
  });
});

afterEach(() => {
  DB.close();
});
