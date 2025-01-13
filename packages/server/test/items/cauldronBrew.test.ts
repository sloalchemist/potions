import { commonSetup, graph } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { buildAndSaveGraph, constructGraph, initialize } from '@rt-potion/converse';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { Item } from '../../src/items/item';
import { Item as ClientItem } from '../../../client/src/world/item';
import { World } from '../../../client/src/world/world';

beforeAll(() => {
  commonSetup("cauldronBrewable");
  buildAndSaveGraph('../converse/data/test.db', constructGraph(graph));
  initialize('../converse/data/test.db');
});

describe('Create cauldron and see if still brewable', () => {
  test('should (1) create player mob, (2) create cauldron, ' +
    '(3) create heart beet (4) see if able to brew', () => {
      const worldDescription = {
        tiles: [
          [0, 0],
          [0, 0]
        ],
        terrain_types: [{
            name: "dirt",
            id: 0,
            walkable: true
        }],
        item_types: [
            {
                name: 'Cauldron',
                description: 'For mixing potions',
                type: 'cauldron',
                carryable: false,
                walkable: false,
                interactions: [],
                attributes: [],
                on_tick: []
            },
            {
                name: "Heartbeet",
                description: 'Brew potions',
                type: "heart-beet",
                walkable: true,
                carryable: true,
                interactions: [
                    {
                        description: "Brew red potion",
                        action: "brew",
                        while_carried: true,
                        requires_item: "cauldron"
                    }
                ],
                attributes: [
                    {
                        name: "brew_color",
                        value: "#FF0000"
                    },
                    {
                        name: "health",
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

    // create mobFactory's mobTemplates
    mobFactory.loadTemplates(worldDescription.mob_types);
    // create community
    Community.makeVillage("alchemists", "Alchemists guild");

    const position = { x: 1, y: 0 };
    // create player mob
    mobFactory.makeMob(
        "player",
        position,
        "1",
        "testPlayer"
      );
      const itemGenerator = new ItemGenerator(worldDescription.item_types);
    //   const cposition = { x: 0, y: 0 };
    //   itemGenerator.createItem({
    //       type: 'cauldron',
    //       position: cposition
    //   });
      const hposition = { x: 0, y: 1 };
      itemGenerator.createItem({
        type: 'heart-beet',
        position: hposition
    });


    // query mob from world
    const testMob = Mob.getMob("1");
    if (!testMob) {
        throw new Error('No mob found');
    }
    // const cauldronID = Item.getItemIDAt(cposition);
    // if (!cauldronID) {
    //     throw new Error(`No item found at position ${cposition}`);
    // }
    // const cauldron = Item.getItem(cauldronID);
    // if (!cauldron) {
    //     throw new Error(`No item found with ID ${cauldronID}`);
    // }

    const heartID = Item.getItemIDAt(hposition);
    if (!heartID) {
        throw new Error(`No item found at position ${hposition}`);
    }
    const heart = Item.getItem(heartID); 
    if (!heart) {
        throw new Error(`No item found with ID ${heartID}`);
    }
    
    const itemType = {
        name: "Heartbeet",
        description: 'Brew potions',
        type: "heart-beet",
        walkable: true,
        carryable: true,
        interactions: [
            {
                description: "Brew red potion",
                action: "brew",
                while_carried: true,
                requires_item: "cauldron"
            }
        ],
        attributes: [
            {
                name: "brew_color",
                value: "#FF0000"
            },
            {
                name: "health",
                value: 1
            }
        ],
        on_tick: []
      }
    
    const world = new World();
    world.load(worldDescription);
    const newItem = new ClientItem(world, "key", hposition, itemType);
    console.log(itemType.interactions[0]);
    testMob.co
    console.log(condition);
  });
});

afterAll(() => {
  DB.close();
});