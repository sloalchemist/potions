import { ServerWorld } from './gameWorld/serverWorld';
import { AblyService } from './clientCommunication/ablyService';
import 'dotenv/config';
import { initializeServerDatabase } from './database';
import { initializePubSub, pubSub } from './clientCommunication/pubsub';
import { initializeGameWorld } from './gameWorld/gameWorld';
import { ServerWorldDescription } from './gameWorld/worldMetadata';
import { initializeKnowledgeDB } from '@rt-potion/converse';
import {
  downloadData,
  initializeSupabase,
  uploadLocalData,
  initializeBucket
} from './supabaseStorage';
import { shouldUploadDB } from '../util/dataUploadUtil';
import { fetchWorldSpecificData } from '../util/githubPagesUtil';

let lastUpdateTime = Date.now();
let lastUploadTime = Date.now();
let world: ServerWorld;
export let worldID: string = '';

export const supabase = initializeSupabase();

function initializeAbly(worldId: string): AblyService {
  if (
    !process.env.ABLY_API_KEY ||
    process.env.ABLY_API_KEY.indexOf('INSERT') === 0
  ) {
    throw new Error('Cannot run without an API key. Add your key to .env');
  }

  return new AblyService(process.env.ABLY_API_KEY, worldId);
}

async function initializeAsync() {
  const args = process.argv.slice(2);
  worldID = args[0];

  if (!worldID) {
    throw new Error('No world ID provided, provide a world ID as an argument');
  }

  console.log(`loading world ${worldID}`);

  // Create bucket if it doesn't exist
  try {
    await initializeBucket(supabase);
    console.log('Bucket creation handled successfully');
  } catch (err) {
    console.error('Error during bucket initialization:', err);
    throw err;
  }

  try {
    await downloadData(supabase, worldID);
    console.log('Data successfully downloaded from Supabase');
  } catch {
    try {
      console.log('Download failed, uploading local files instead');
      await uploadLocalData(supabase, worldID);
    } catch (error) {
      console.log(
        'Could not download data or upload data, cannot play the game'
      );
      throw error;
    }
  }

  try {
    initializeKnowledgeDB('data/knowledge-graph.db', false);
    initializeServerDatabase('data/server-data.db');

    const worldSpecificData = await fetchWorldSpecificData("world_specific");
    const globalData = await fetchWorldSpecificData("global.json");
    const globalDescription = globalData as ServerWorldDescription;
    const specificDescription =
      worldSpecificData as Partial<ServerWorldDescription>;

    const worldDescription: ServerWorldDescription = {
      ...globalDescription,
      ...specificDescription
    };

    world = new ServerWorld(worldDescription);
    initializeGameWorld(world);

    initializePubSub(initializeAbly(worldID));

    pubSub.startBroadcasting();
  } catch (error) {
    console.error('Failed to initialize world:', error);
    throw error;
  }
}

initializeAsync();

// Used for update on developer cheat
export function setLastUploadTime(time: number) {
  lastUploadTime = time;
}

export function worldTimer() {
  const now = Date.now();
  const deltaTime = now - lastUpdateTime;

  if (world) {
    world.tick(deltaTime);
    pubSub.sendBroadcast();
  }

  if (shouldUploadDB(now, lastUploadTime)) {
    uploadLocalData(supabase, worldID);
    lastUploadTime = now;
  }

  lastUpdateTime = now;
}
