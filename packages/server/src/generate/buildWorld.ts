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
import { ServerWorldDescription } from '../services/gameWorld/worldMetadata';
import { initializeGameWorld } from '../services/gameWorld/gameWorld';
import { ServerWorld } from '../services/gameWorld/serverWorld';
import {
  initializeSupabase,
  initializeBucket,
  uploadLocalData
} from '../services/supabaseStorage';
import { logger } from '../util/logger';
import globalData from '../../world_assets/global.json';
import path from 'path';

async function main() {
  // Build and save the knowledge graph
  // Initialize the server database

  const args = process.argv.slice(2);
  const worldID = args[0];

  if (!worldID) {
    throw new Error('No world ID provided, provide a world ID as an argument');
  }
  const dbPath = path.join(process.cwd(), `data/${worldID}-server-data.db`);
  const worldSpecificPath = path.join(
    process.cwd(),
    `world_assets/${worldID}/world_specific.json`
  );
  const knowledgeGraphPath = path.join(
    process.cwd(),
    `data/${worldID}-knowledge-graph.db`
  );
  logger.log(`Database path: ${dbPath}, World specific path: ${worldSpecificPath}, 
    Knowledge graph path: ${knowledgeGraphPath}`);
  await initializeServerDatabase(dbPath, true);

  logger.log(`Loading world ${worldID}`);

  const worldSpecificData = await import(worldSpecificPath);

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
  initializeKnowledgeDB(knowledgeGraphPath, true);
  await buildGraph(graph);

  // Create tables and load defaults
  await createTables();
  await loadDefaults(worldDescription);

  // Upload created world to Supabase, overwriting existing versions
  const supabase = initializeSupabase();

  try {
    await initializeBucket(supabase);
    logger.log('Bucket creation handled successfully');
  } catch (err) {
    logger.error('Error during bucket initialization:', err);
    throw err;
  }

  await uploadLocalData(supabase, worldID);

  // Exit
  logger.log('Script finished successfully');
  process.exit(0);
}

// Execute the main function
main();
