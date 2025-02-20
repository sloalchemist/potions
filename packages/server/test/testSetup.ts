import { Community } from '../src/community/community';
import { ServerWorld } from '../src/services/gameWorld/serverWorld';
import { ItemGenerator } from '../src/items/itemGenerator';
import { initializeTestServerDatabase } from '../src/services/database';
import { createTables } from '../src/generate/generateWorld';
import { initializePubSub } from '../src/services/clientCommunication/pubsub';
import { StubbedPubSub } from '../src/services/clientCommunication/stubbedPubSub';
import {
  buildGraph,
  constructGraph,
  Graphable,
  intializeTestKnowledgeDB
} from '@rt-potion/converse';
import { buildGraphFromWorld } from '../src/generate/socialWorld';
import { initializeGameWorld } from '../src/services/gameWorld/gameWorld';

export let world: ServerWorld;
export let village: Community;
export let itemGenerator: ItemGenerator;
export let graph: Graphable[];

/**
 * Initial common setup for testing.
 */
export const commonSetup = (worldSize: number = 2) => {
  // Any common setup code
  jest.clearAllMocks();

  initializeTestServerDatabase();
  createTables();
  initializePubSub(new StubbedPubSub());

  const worldDescription = {
    // Makes a worldSize x worldSize matrix of tiles filled with 1
    tiles: Array.from({ length: worldSize }, () => Array(worldSize).fill(1)),
    terrain_types: [
      {
        name: 'Grass',
        id: 1,
        walkable: true
      }
    ],
    item_types: [
      {
        name: 'Potion',
        description: 'test',
        type: 'potion',
        carryable: true,
        smashable: true,
        walkable: true,
        interactions: [],
        attributes: [],
        on_tick: []
      },
      {
        name: 'Wall',
        type: 'wall',
        description:
          'A sturdy structure that blocks movement and provides protection.',
        carryable: false,
        smashable: true,
        attributes: [
          {
            name: 'health',
            value: 100
          }
        ],
        interactions: [],
        walkable: false,
        drops_item: 'log'
      },
      {
        name: 'Partial Wall',
        type: 'partial-wall',
        description:
          'An incomplete wall, requiring additional materials to finish.',
        carryable: false,
        walkable: false,
        smashable: true,
        attributes: [
          {
            name: 'complete',
            value: 3
          },
          {
            name: 'health',
            value: 1
          }
        ],
        interactions: [],
        drops_item: 'log'
      },
      {
        name: 'Basket',
        description: 'Stores items for the community.',
        type: 'basket',
        carryable: false,
        templated: true,
        walkable: false,
        show_template_at: {
          x: 1,
          y: 1
        },
        attributes: [
          {
            name: 'items',
            value: 0
          }
        ],
        interactions: []
      },
      {
        name: 'Gold',
        description: 'money!!!',
        type: 'gold',
        walkable: true,
        smashable: false,
        carryable: true,
        interactions: []
      },
      {
        name: 'Blueberry',
        description: 'test',
        type: 'blueberry',
        carryable: true,
        smashable: true,
        walkable: true,
        interactions: [],
        attributes: [
          {
            name: 'brew_color',
            value: '#0000FF'
          }
        ],
        on_tick: []
      },
      {
        name: 'Cauldron',
        description: 'For mixing potions',
        type: 'cauldron',
        carryable: false,
        walkable: false,
        interactions: [
          {
            description: 'Add ingredient',
            action: 'add_ingredient',
            while_carried: false
          },
          {
            description: 'Bottle potion',
            action: 'bottle_potion',
            while_carried: false
          },
          {
            description: 'Dump Cauldron',
            action: 'dump_cauldron',
            while_carried: false
          }
        ],
        attributes: [
          {
            name: 'ingredients',
            value: 0
          },
          {
            name: 'potion_subtype',
            value: ''
          }
        ],
        on_tick: []
      },
      {
        type: 'blueberry-bush',
        name: 'Blueberry bush',
        description: 'A shrub that produces small, sweet blueberries.',
        carryable: false,
        walkable: false,
        smashable: false,
        interactions: [],
        on_tick: [
          {
            action: 'spawn_item',
            parameters: {
              type: 'blueberry',
              global_max: 10,
              local_max: 1, // This is important for test
              radius: 2,
              rate: 2 // Ensures item spawns every tick
            }
          }
        ]
      },
      {
        name: 'Heartbeet',
        description: 'Brew potions',
        type: 'heart-beet',
        walkable: true,
        carryable: true,
        interactions: [],
        attributes: [
          {
            name: 'brew_color',
            value: '#FF0000'
          },
          {
            name: 'health',
            value: 1
          }
        ],
        on_tick: []
      },
      {
        name: 'Log',
        description: 'test',
        type: 'log',
        carryable: true,
        smashable: true,
        walkable: true,
        interactions: [],
        attributes: [],
        on_tick: []
      },
      {
        name: 'Potion stand',
        description: 'test',
        type: 'potion-stand',
        carryable: false,
        smashable: true,
        walkable: true,
        show_price_at: {
          x: 7,
          y: -10
        },
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
      },
      {
        name: 'Fence',
        type: 'fence',
        description:
          'A simple barrier to mark boundaries or restrict movement.',
        carryable: false,
        walkable: false,
        smashable: true,
        attributes: [
          {
            name: 'health',
            value: 100
          }
        ],
        interactions: [],
        drops_item: 'log'
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
        defense: 1,
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
      },
      {
        name: 'Blob',
        description: 'A Mob',
        name_style: 'norse-english',
        type: 'blob',
        health: 100,
        speed: 2.5,
        attack: 5,
        defense: 1,
        gold: 0,
        community: 'blobs',
        stubbornness: 20,
        bravery: 5,
        aggression: 5,
        industriousness: 40,
        adventurousness: 10,
        gluttony: 50,
        sleepy: 80,
        extroversion: 50,
        speaker: true
      },
      {
        name: 'Villager',
        name_style: 'norse-english',
        type: 'villager',
        description: 'A friendly inhabitant of the silverclaw community.',
        health: 10,
        speed: 0.5,
        attack: 5,
        defense: 1,
        gold: 0,
        community: 'silverclaw',
        stubbornness: 20,
        bravery: 5,
        aggression: 5,
        industriousness: 40,
        adventurousness: 10,
        gluttony: 50,
        sleepy: 80,
        extroversion: 50,
        speaker: true
      },
      {
        name: 'Fighter',
        name_style: 'french-roman',
        type: 'fighter',
        description: 'A brave combatant, loyal to the fighters guild.',
        speaker: true,
        health: 100,
        speed: 0.75,
        attack: 100,
        defense: 1,
        gold: 0,
        community: 'fighters',
        stubbornness: 20,
        bravery: 60,
        aggression: 80,
        industriousness: 40,
        adventurousness: 20,
        gluttony: 10,
        sleepy: 10,
        extroversion: 50
      }
    ],
    communities: [
      {
        id: 'silverclaw',
        name: 'Village of the Silverclaw',
        description:
          'The Silverclaw Tribe, descendants of the silver-souled, known for their resilience and independence.'
      },
      {
        id: 'alchemists',
        name: 'Alchemists guild',
        description:
          "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."
      },
      {
        id: 'blobs',
        name: 'Blobs',
        description: 'Blobs who run around the map and cause havoc'
      },
      {
        id: 'fighters',
        name: 'Fighters guild',
        description: 'A small village of fighters.'
      }
    ],
    alliances: [],
    houses: [],
    items: [],
    npcs: [],
    containers: [],
    regions: [
      {
        id: 'elyndra',
        name: 'elyndra',
        description: 'the overall world in which everything exists.',
        parent: null,
        concepts: ['concept_elyndra', 'concept_elyndra_as_battleground']
      },
      {
        id: 'claw_island',
        name: 'Claw Island',
        description:
          'a relatively peaceful island in the Shattered Expanse full of blueberries and heartbeets.',
        parent: 'shattered_expanse',
        concepts: []
      }
    ]
  };
  itemGenerator = new ItemGenerator(worldDescription.item_types);
  world = new ServerWorld(worldDescription);
  initializeGameWorld(world);
  graph = buildGraphFromWorld(worldDescription);
  intializeTestKnowledgeDB();
  buildGraph(constructGraph(graph));
};
