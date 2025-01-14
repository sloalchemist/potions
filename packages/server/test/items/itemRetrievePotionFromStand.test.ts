import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Retrieve } from '../../src/items/uses/stand/retrieve';
import { Mob } from '../../src/mobs/mob';
import { ItemGenerator } from '../../src/items/itemGenerator';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
});

describe('Try to retrieve a potion from a potion stand', () => {
  test('Should create a potion stand with a potion and player should retrieve it', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Potion',
          description: 'A potion',
          type: 'potion',
          carryable: true,
          walkable: true,
          interactions: [],
          attributes: [],
          on_tick: []
        },

        {
          name: 'Potion stand',
          description: 'A stand that sells potions',
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
              description: 'Get $item_name',
              action: 'retrieve_item',
              while_carried: false
            }
          ],
          attributes: [
            {
              name: 'items',
              value: 0
            },
            {
              name: 'price',
              value: 10
            },
            {
              name: 'gold',
              value: 0
            },
            {
              name: 'health',
              value: 1
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
          description:
            "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."
        }
      ]
    };

    // Generate world
    const standPosition = { x: 0, y: 1 };
    const playerPosition = { x: 0, y: 0 };
    mobFactory.loadTemplates(worldDescription.mob_types);

    // Create a potion stand
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      attributes: {
        templateType: 'potion'
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();
    const testStand = Item.getItem(standID!);
    expect(testStand).not.toBeNull();

    // Create player
    mobFactory.makeMob('player', playerPosition, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // Give potion to player
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });

    // Place potion on stand
    const potion = new AddItem();
    potion.interact(testMob!, testStand!);

    // Ensure potion is on stand
    expect(testStand).not.toBeNull();
    expect(testStand!.getAttribute('items')).toBe(1);

    // Check to see that player is not carrying anything before retrieval
    // expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying).toBeNull();

    // add the potion to the stand
    // Retrieve the potion from the stand
    const testAddItem = new Retrieve();
    const test = testAddItem.interact(testMob!, testStand!);
    // expect(test).toBe(true);

    // Check that the player has the potion
    // const standAfter = Item.getItem(standID!);
    // expect(standAfter).not.toBeNull();
    // expect(standAfter!.getAttribute('items')).toBe(1);
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
  });
});

afterEach(() => {
  DB.close();
});
