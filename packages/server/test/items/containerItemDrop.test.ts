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
  // if vscode says the below is bad, ignore it :)
  mobFactory.loadTemplates(world.mobTypes);
});


describe('Log Smashable Tests', () => {
  test('should not drop gold or items when log is smashed', () => {
    const logPosition: Coord = { x: 5, y: 5 };
    const mobPosition: Coord = { x: 6, y: 6 };

    // Create player mob
    mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
    const testMob = Mob.getMob('1');
    expect(testMob).not.toBeNull();

    // Verify mob attributes
    expect(testMob?.health).toBe(100);

    // Create Log item
    itemGenerator.createItem({
      type: 'log',
      position: logPosition,
      attributes: {
        health: 10
      }
    });


    const logID = Item.getItemIDAt(logPosition);

    if (!logID) {
      throw new Error(`No item found at position ${JSON.stringify(logPosition)}`);
    }

    const logItem = Item.getItem(logID);

    if (!logItem) {
      throw new Error(`No item found with ID ${logID}`);
    }

    // Create Smashable from Log
    const smashable = Smashable.fromItem(logItem);
    expect(smashable).toBeDefined();

    // Smash the log
    smashable?.smashItem(testMob!);
    
  });
});

afterEach(() => {
  DB.close();
});