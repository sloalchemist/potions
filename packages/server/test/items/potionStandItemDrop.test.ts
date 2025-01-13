import { commonSetup } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { itemGenerator, ItemGenerator } from '../../src/items/itemGenerator';
import { Smashable } from '../../src/items/smashable';
import { Item } from '../../src/items/item';

beforeAll(() => {
  commonSetup();
});


describe('Potion Stand Smashable Tests', () => {
  test('should drop gold and items when potion stand is destroyed', () => {
    const worldDescription = {
        tiles: [
            [1, 1],
            [1, 1]
          ],
          terrain_types: [
              {
                "name": "Grass",
                "id": 1,
                "walkable": true
            }
          ],
      item_types: [
        {
            name: 'Potion',
            description: 'A magical concoction',
            type: 'potion',
            subtype: '255',
            carryable: true,
            walkable: true,
            interactions: [],
            attributes: [],
            on_tick: []
          },
          {
            name: "Gold",
            description: "money!!!",
            type: "gold",
            walkable: true,
            smashable: false,
            carryable: true,
            interactions: []
            },

          {
            name: 'Potion stand',
            description: 'A stand that sells health potions.',
            type: 'potion-stand',
            carryable: false,
            smashable: true,
            walkable: true,
            show_price_at: {
              x: 7,
              y: -10
            },

            subtype: '255',
            interactions: [
              {
                description: 'Add $item_name',
                action: 'add_item',
                while_carried: false
              }
            ],
            attributes: [
              {
                name: 'items',
                value: 1
              },
              {
                name: 'price',
                value: 10
              },
              {
                name: 'gold',
                value: 50
              },
              {
                name: 'health',
                value: 0
              }
            ],
            on_tick: []
          }
      ],
      mob_types: [
        {
          name: 'Player',
          description: 'The player',
          name_style: 'norse-english',
          type: 'player',
          health: 100,
          speed: 2.5,
          attack: 5,
          gold: 0,
          community: 'alchemists',
          stubbornness: 20,
          bravery: 5,
          aggression: 5,
          industriousness: 40,
          adventurousness: 10,
          gluttony: 50,
          sleepy: 80,
          extroversion: 50,
          speaker: true
        }
      ],
      communities: [
        {
          id: 'alchemists',
          name: 'Alchemists guild',
          description: 'A group of alchemists studying potions and elements.'
        }
      ]
    };

    const potionStandPosition = { x: 0, y: 0 };
    const mobPosition = { x: 1, y: 1 };

    // Create mobFactory's mobTemplates
    mobFactory.loadTemplates(worldDescription.mob_types);

    // Create community
    Community.makeVillage('alchemists', 'Alchemists guild');

    // Create player mob
    mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
    const testMob = Mob.getMob('1');
    expect(testMob).not.toBeNull();

    // Verify mob attributes
    expect(testMob?.health).toBe(100);

    // Create ItemGenerator and Potion Stand
    ItemGenerator.initialize(worldDescription.item_types);
    itemGenerator.createItem({
      type: 'potion-stand',
      position: potionStandPosition
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
    expect(itemsDropped).toBe(0);
  });
});

afterAll(() => {
  DB.close();
});