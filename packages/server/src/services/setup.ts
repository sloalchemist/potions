import { ServerWorld } from './gameWorld/serverWorld';
import { AblyService } from './clientCommunication/ablyService';
import 'dotenv/config';
import { initializeServerDatabase } from './database';
import { initializePubSub, pubSub } from './clientCommunication/pubsub';
import globalData from '../../data/global.json';
import worldSpecificData from '../../data/world_specific.json';
import { initializeGameWorld } from './gameWorld/gameWorld';
import { ServerWorldDescription } from './gameWorld/worldMetadata';
import { initializeKnowledgeDB } from '@rt-potion/converse';
import { downloadFile, uploadLocalData } from './supabaseStorage';
import * as fs from 'fs'

let lastUpdateTime = Date.now();
let world: ServerWorld;

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
  const worldID = args[0];

  if (!worldID) {
    throw new Error('No world ID provided, provide a world ID as an argument');
  }

  console.log(`loading world ${worldID}`);

  try{

    await downloadFile("knowledge-graph.db");
    await downloadFile("knowledge-graph.db-wal");
    await downloadFile("knowledge-graph.db-shm");
    await downloadFile("server-data.db");
    await downloadFile("server-data.db-wal");
    await downloadFile("server-data.db-shm");
    console.log("Files successfully downloaded from Supabase")
  } catch (error) {

    console.log("No files found in Supabase bucket, uploading files");
    await uploadLocalData();
  }

  try {

    initializeKnowledgeDB('data/knowledge-graph.db', false);
    initializeServerDatabase('data/server-data.db');

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

export async function worldTimer() {
  const now = Date.now();
  const deltaTime = now - lastUpdateTime;

  if (world) {
    world.tick(deltaTime);
    pubSub.sendBroadcast();
  }

  // Is true every ten minutes (< 1000 for precision errors)
  if (now % 60000 < 1000) {
    uploadLocalData();
    console.log("Persisted Local DBs to Supabase Bucket")
  }

  lastUpdateTime = now;
}
