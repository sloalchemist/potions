import { buildAndSaveGraph, constructGraph } from '@rt-potion/converse';
import { initializeServerDatabase } from '../services/database';
import { createTables, loadDefaults } from './generateWorld';
import { StubbedPubSub } from '../services/clientCommunication/stubbedPubSub';
import { initializePubSub } from '../services/clientCommunication/pubsub';
import { buildGraphFromWorld } from './socialWorld';
import globalData from '../../data/global.json';
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
  const globalDescription: ServerWorldDescription =
    globalData as ServerWorldDescription;
  initializeGameWorld(new ServerWorld(globalDescription));

  const socialWorld = buildGraphFromWorld(globalDescription);
  const graph = constructGraph(socialWorld);
  initializeKnowledgeDB('data/knowledge-graph.db');
  await buildGraph(graph);

  // Create tables and load defaults
  await createTables();
  await loadDefaults(globalDescription);

  console.log('Script finished successfully');
  process.exit(0);
}

// Execute the main function
main();
