import { Community } from '../src/community/community';
import { ServerWorld } from '../src/services/gameWorld/serverWorld';
import { ItemGenerator } from '../src/items/itemGenerator';
import { initializeServerDatabase } from '../src/services/database';
import { createTables } from '../src/generate/generateWorld';
import { initializePubSub } from '../src/services/clientCommunication/pubsub';
import { StubbedPubSub } from '../src/services/clientCommunication/stubbedPubSub';
import { Carryable } from '../src/items/carryable';

export let world: ServerWorld;
export let village: Community;
export let itemGenerator: ItemGenerator;

export const commonSetup = () => {
  // Any common setup code
  jest.clearAllMocks();

  initializeServerDatabase('data/test.db', true);
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
    mob_types: [],
    communities: [],
    alliances: [],
    houses: [],
    items: [],
    npcs: [],
    containers: [],
    regions: []
  };
  itemGenerator = new ItemGenerator(worldDescription.item_types);
  world = new ServerWorld(worldDescription);
};
