import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { Smashable } from '../../src/items/smashable';
import { Item } from '../../src/items/item';

beforeAll(() => {
  commonSetup();
      Community.makeVillage('alchemists', 'Alchemists guild');
      mobFactory.loadTemplates(world.mobTypes);
});


describe('Potion Stand Smashable Tests', () => {
  test('should drop gold and items when potion stand is destroyed', () => {
    const potionStandPosition = { x: 0, y: 0 };
    const mobPosition = { x: 1, y: 1 };

    // Create player mob
    mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
    const testMob = Mob.getMob('1');
    expect(testMob).not.toBeNull();

    // Verify mob attributes
    expect(testMob?.health).toBe(100);

    // Create ItemGenerator and Potion Stand
    itemGenerator.createItem({
      type: 'potion-stand',
      position: potionStandPosition,
      attributes: {
        items: 1,
        price: 10,
        gold: 50,
        health: 0
      }
    });

    const potionStandID = Item.getItemIDAt(potionStandPosition);

    if (!potionStandID) {
        throw new Error(`No item found at position ${JSON.stringify(potionStandPosition)}`);
      }

    const potionStand = Item.getItem(potionStandID);
    
    if (!potionStand) {
        throw new Error(`No item found with ID ${potionStandID}`);
    }

    // Create Smashable from Potion Stand
    const smashable = Smashable.fromItem(potionStand);
    expect(smashable).toBeDefined();

    // Smash the potion stand
    smashable?.smashItem(testMob!);

    // Assert that gold and items are dropped
    let droppedGoldID: string | null = null;

    // Scan positions around the mob for dropped gold
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const potentialPosition = { x: potionStandPosition.x + dx, y: potionStandPosition.y + dy };
            const potentialGoldID = Item.getItemIDAt(potentialPosition);

            if (potentialGoldID) {
                const potentialGold = Item.getItem(potentialGoldID);
                if (potentialGold?.type === 'gold') {
                    droppedGoldID = potentialGoldID;
                    break;
                }
            }
        }
        if (droppedGoldID) break; // Exit the loop if gold is found
    }

    const droppedGold = Item.getItem(droppedGoldID!);
    // console.log(droppedGold);
    // console.log("this is my print" + droppedGold?.type);
    expect(droppedGold?.type).toBe("gold");
    expect(droppedGold?.getAttribute('amount')).toBe(50);

    // Assert items drop
    let itemsDropped = 0;

    // Define a grid range to search around the potion stand
    const searchRadius = 2; // Adjust this based on your game's item placement logic
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            const potentialPosition = { x: potionStandPosition.x + dx, y: potionStandPosition.y + dy };
            const potentialItemID = Item.getItemIDAt(potentialPosition);

            if (potentialItemID) {
                const potentialItem = Item.getItem(potentialItemID);
                if (potentialItem?.type === 'potion') {
                    itemsDropped++;
                }
            }
        }
    }

    // Verify that exactly 3 items were dropped
    expect(itemsDropped).toBe(1);
  });
});

afterAll(() => {
  DB.close();
});