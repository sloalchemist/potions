import { Community } from '../src/community/community';
import { ServerWorld } from '../src/services/gameWorld/serverWorld';
import { ItemGenerator } from '../src/items/itemGenerator';
import { initializeServerDatabase } from '../src/services/database';
import { createTables } from '../src/generate/generateWorld';
import { initializePubSub } from '../src/services/clientCommunication/pubsub';
import { StubbedPubSub } from '../src/services/clientCommunication/stubbedPubSub';
import { Graphable } from '@rt-potion/converse';
import { buildGraphFromWorld } from '../src/generate/socialWorld';

import { Graphable } from '@rt-potion/converse';
import { buildGraphFromWorld } from '../src/generate/socialWorld';

export let world: ServerWorld;
export let village: Community;
export let itemGenerator: ItemGenerator;
export let graph: Graphable[];

/**
 * Initial common setup for testing.
 * @param testName The name of the database instance for the test file (i.e. 'data/[TEST_FILENAME].db').
 */
export const commonSetup = (testName: string) => {
  // Any common setup code
  jest.clearAllMocks();

  // testName param is required to avoid concurrent access issues since jest runs test files in parallel
  initializeServerDatabase(testName, true);
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
        name: 'Solid Object',
        description: 'test',
        type: 'solid object',
        carryable: false,
        smashable: false,
        walkable: false, // This is what matters
        interactions: [],
        attributes: [],
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
  graph = buildGraphFromWorld(worldDescription);
};
