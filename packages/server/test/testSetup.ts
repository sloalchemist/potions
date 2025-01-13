import { Community } from '../src/community/community';
import { ServerWorld } from '../src/services/gameWorld/serverWorld';
import { ItemGenerator } from '../src/items/itemGenerator';
import { initializeTestServerDatabase } from '../src/services/database';
import { createTables } from '../src/generate/generateWorld';
import { initializePubSub } from '../src/services/clientCommunication/pubsub';
import { StubbedPubSub } from '../src/services/clientCommunication/stubbedPubSub';

import { buildGraph, constructGraph, Graphable, intializeTestKnowledgeDB } from '@rt-potion/converse';
import { buildGraphFromWorld } from '../src/generate/socialWorld';

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
      [-1, -1],
      [-1, -1]
    ],
    terrain_types: [],
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
        name: 'Heart Beet',
        description: 'test',
        type: 'heart-beet',
        carryable: true,
        smashable: true,
        walkable: true,
        interactions: [],
        attributes: [],
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

        // subtype: '255',
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
        name: 'Villager',
        name_style: 'norse-english',
        type: 'villager'
      }
    ],
    communities: [],
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
  graph = buildGraphFromWorld(worldDescription);

  intializeTestKnowledgeDB();
  buildGraph(constructGraph(graph));
};