import {
  buildGraph,
  constructGraph,
  initializeKnowledgeDB
} from '@rt-potion/converse';
import { initializeServerDatabase } from '../services/database';
import { createTables, loadDefaults } from './generateWorld';
import { StubbedPubSub } from '../services/clientCommunication/stubbedPubSub';
import { initializePubSub } from '../services/clientCommunication/pubsub';
import { buildGraphFromWorld } from './socialWorld';
import globalData from '../../data/global.json';
// change to github link
import worldSpecificData from '../../data/world_specific.json';
import { ServerWorldDescription } from '../services/gameWorld/worldMetadata';
import { initializeGameWorld } from '../services/gameWorld/gameWorld';
import { ServerWorld } from '../services/gameWorld/serverWorld';

async function main() {
  // Build and save the knowledge graph
  // Initialize the server database
  await initializeServerDatabase('data/server-data.db', true);

  const args = process.argv.slice(2);
  const worldID = args[0];

  if (!worldID) {
    throw new Error('No world ID provided, provide a world ID as an argument');
  }

  console.log(`Loading world ${worldID}`);

  initializePubSub(new StubbedPubSub());
  // Load global data and parse
  const globalDescription = globalData as ServerWorldDescription;
  const specificDescription =
    worldSpecificData as Partial<ServerWorldDescription>;

  const worldDescription: ServerWorldDescription = {
    ...globalDescription,
    ...specificDescription
  };

  initializeGameWorld(new ServerWorld(worldDescription));

  const socialWorld = buildGraphFromWorld(worldDescription);
  const graph = constructGraph(socialWorld);
  initializeKnowledgeDB('data/knowledge-graph.db', true);
  await buildGraph(graph);

  // Create tables and load defaults
  await createTables();
  await loadDefaults(worldDescription);

  console.log('Script finished successfully');
  process.exit(0);
}

// Execute the main function
main();
