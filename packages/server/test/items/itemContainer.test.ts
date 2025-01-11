import { commonSetup, graph } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Mob } from '../../src/mobs/mob';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { initialize } from '@rt-potion/converse';
import { buildAndSaveGraph, constructGraph } from '@rt-potion/converse';

beforeAll(() => {
  commonSetup("data/itemContainer.test.db");

  buildAndSaveGraph('../converse/data/test.db', constructGraph(graph));
  initialize('../converse/data/test.db');
});

describe('Adds blue potion to blue potion-stand', () => {
  test('Should add the potion', () => {
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
          subtype: '255',
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
          description: "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."  
        }
      ],
      regions: [
        {
          id: "elyndra",
          name: "elyndra",
          description: "the overall world in which everything exists.",
          parent: null,
          concepts: ["concept_elyndra", "concept_elyndra_as_battleground"]
        },
        {
          id: "claw_island",
          name: "Claw Island",
          description: "a relatively peaceful island in the Shattered Expanse full of blueberries and heartbeets.",
          parent: "shattered_expanse",
          concepts: []
        }
      ]
    };

    //set up the world
    const standPosition = { x: 0, y: 1 };
    const position = { x: 0, y: 0 };
    mobFactory.loadTemplates(worldDescription.mob_types);
    Community.makeVillage("alchemists", "Alchemists guild");
    
    //create a potion stand
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    itemGenerator.createItem({
      type: 'potion-stand',
      position: standPosition
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();
    const stand = Item.getItem(standID!);
    expect(stand).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 }
    });
    
    
    // create a player
    mobFactory.makeMob('player', position, '79e0aef2', 'TestPlayer');

    // test
    const testMob = Mob.getMob('79e0aef2');
    expect(testMob).not.toBeNull();

    const testItem = Item.getItem('d39dd773-0200-4b04-909c-68c557cc50b9');
    expect(testItem).not.toBeNull();
    
    if (testMob && testItem) {
      const testAddItem = new AddItem();
      const test = testAddItem.interact(testMob, testItem);
      expect(test).toBe(true);
    }
  });
});

afterAll(() => {
  DB.close();
});
