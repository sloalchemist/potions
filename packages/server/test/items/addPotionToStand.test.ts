import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Mob } from '../../src/mobs/mob';
import { ItemGenerator } from '../../src/items/itemGenerator';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Try to add various color potions to a blue potion-stand', () => {
  test('Add a blue potion: Should add the potion', () => {

    //set up the world
    const standPosition = { x: 0, y: 1 };
    const position = { x: 0, y: 0 };

    //create a blue potion stand
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

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt({ x: 1, y: 0 });
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('255');

    // add the potion to the stand
    const testAddItem = new AddItem();
    const test = testAddItem.interact(testMob!, testStand!);
    expect(test).toBe(true);

    // check that the potion was added
    const standAfter = Item.getItem(standID!);
    expect(standAfter).not.toBeNull();
    expect(standAfter!.getAttribute('items')).toBe(1);
  });

  test('Add a red potion: Should NOT add the potion', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Potion',
          description: 'A magical concoction',
          type: 'potion',
          carryable: true,
          walkable: true,
          interactions: [],
          attributes: [],
          on_tick: []
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

    //set up the world
    const standPosition = { x: 0, y: 1 };
    const position = { x: 0, y: 0 };
    mobFactory.loadTemplates(worldDescription.mob_types);

    //create a blue potion stand
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

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '16711680',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt({ x: 1, y: 0 });
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('16711680');

    // try to add the potion to the stand
    const testAddItem = new AddItem();
    const test = testAddItem.interact(testMob!, testStand!);
    expect(test).toBe(false);

    // check that the potion was not added
    const standAfter = Item.getItem(standID!);
    expect(standAfter).not.toBeNull();
    expect(standAfter!.getAttribute('items')).toBe(0);
  });
});

afterAll(() => {
  DB.close();
});
