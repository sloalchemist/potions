import { Community } from '../src/community/community';
import { ServerWorld } from '../src/services/gameWorld/serverWorld';
import { ItemGenerator } from '../src/items/itemGenerator';
import { initializeTestServerDatabase } from '../src/services/database';
import { createTables } from '../src/generate/generateWorld';
import { initializePubSub } from '../src/services/clientCommunication/pubsub';
import { StubbedPubSub } from '../src/services/clientCommunication/stubbedPubSub';
import { buildGraph, constructGraph, Graphable, intializeTestKnowledgeDB } from '@rt-potion/converse';
import { buildGraphFromWorld } from '../src/generate/socialWorld';
import { initializeGameWorld } from '../src/services/gameWorld/gameWorld';

export let world: ServerWorld;
export let village: Community;
export let itemGenerator: ItemGenerator;
export let graph: Graphable[];

/**
 * Initial common setup for testing.
 */
export const commonSetup = () => {
  // Any common setup code
  jest.clearAllMocks();

  initializeTestServerDatabase();
  createTables();
  initializePubSub(new StubbedPubSub());

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
        "name": "Wall",
        "type": "wall",
        "description": "A sturdy structure that blocks movement and provides protection.",
        "carryable": false,
        "smashable": true,
        "attributes": [
            {
                "name": "health",
                "value": 100
            }
        ],
        "interactions": [],
        "walkable": false
    },
    {
        "name": "Partial Wall",
        "type": "partial-wall",
        "description": "An incomplete wall, requiring additional materials to finish.",
        "carryable": false,
        "walkable": false,
        "smashable": true,
        "attributes": [
            {
                "name": "complete",
                "value": 3
            },
            {
                "name": "health",
                "value": 1
            }
        ],
        "interactions": []
      },
      {
        name: 'Basket',
        description: 'test',
        type: 'basket',
        carryable: true,
        smashable: true,
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
        name: 'Blueberry',
        description: 'test',
        type: 'blueberry',
        carryable: true,
        smashable: true,
        walkable: true,
        interactions: [],
        attributes: [],
        on_tick: []
      },
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
        type: "blueberry-bush",
        name: "Blueberry bush",
        description: "A shrub that produces small, sweet blueberries.",
        carryable: false,
        walkable: false,
        smashable: false,
        interactions: [],
        on_tick: [
            {
                action: "spawn_item",
                parameters: {
                    type: "blueberry",
                    global_max: 10,
                    local_max: 1, // This is important for test
                    radius: 2,
                    rate: 2 // Ensures item spawns every tick
                }
            }
        ]
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
      },
      {
      name: 'Blob',
      description: 'A Mob',
      name_style: 'norse-english',
      type: 'blob',
      health: 100,
      speed: 2.5,
      attack: 5,
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
      }
    ],
    communities: [
      { 
        id: 'alchemists', 
        name: 'Alchemists guild', 
        description: "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."  
      },
      { 
      id: 'blobs', 
      name: 'Blobs', 
      description: "Blobs who run around the map and cause havoc"  
      }
    ],
    alliances: [],
    houses: [],
    items: [],
    npcs: [],
    containers: [],
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
  itemGenerator = new ItemGenerator(worldDescription.item_types);
  world = new ServerWorld(worldDescription);
  initializeGameWorld(world);
  graph = buildGraphFromWorld(worldDescription);
  intializeTestKnowledgeDB();
  buildGraph(constructGraph(graph));
};
