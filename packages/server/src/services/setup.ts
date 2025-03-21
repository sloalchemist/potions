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
  uploadLocalData
} from './supabaseStorage';
import { shouldUploadDB } from '../util/dataUploadUtil';
import { getEnv } from '@rt-potion/common';
import { logger } from '../util/logger';
import globalData from '../../world_assets/global.json';
import path from 'path';

let lastUpdateTime = Date.now();
let lastUploadTime = Date.now();
let world: ServerWorld;
export let worldID: string = '';

export const supabase = initializeSupabase();

function initializeAbly(worldId: string): AblyService {
  const apiKey = getEnv('ABLY_API_KEY');
  if (apiKey.indexOf('INSERT') === 0) {
    throw new Error('Cannot run without an API key. Add your key to .env');
  }
  return new AblyService(apiKey, worldId);
}

async function initializeAsync() {
  const args = process.argv.slice(2);
  worldID = args[0];

  if (!worldID) {
    throw new Error('No world ID provided, provide a world ID as an argument');
  }

  logger.log(`loading world ${worldID}: ${__dirname}`);
  const worldSpecificData = await import(
    path.join(process.cwd(), `world_assets/${worldID}/world_specific.json`)
  );

  try {
    await downloadData(supabase, worldID);
    logger.log('Server data successfully downloaded from Supabase');
  } catch (error) {
    logger.log(`
      Could not download data for ${worldID}. Ensure it exists by creating it. 
      Otherwise, it could be a network error or something outside our control.
    `);
    throw error;
  }

  try {
    initializeKnowledgeDB(`data/${worldID}-knowledge-graph.db`, false);
    initializeServerDatabase(`data/${worldID}-server-data.db`);

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
    logger.error('Failed to initialize world:', error);
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

export function getWorld(): ServerWorld {
  return world;
}
