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
import { downloadFile, uploadFile } from './supabaseStorage';
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
  if (now % 600000 < 1000) {
    // Persist data in supabase
    const fileBufferServer = await fs.promises.readFile("../../data/server-data.db", 'utf-8')
    const blobServer = new Blob([fileBufferServer], { type: "applciation/octet-stream" });
    const fileServer = new File([blobServer], "server-data.db")

    const fileBufferKnowledge = await fs.promises.readFile("../../data/knowledge-graph.db", 'utf-8')
    const blobKnowledge = new Blob([fileBufferKnowledge], { type: "applciation/octet-stream" });
    const fileKnowledge = new File([blobKnowledge], "knowledge-graph.db")

    uploadFile(fileServer, ".")
    uploadFile(fileKnowledge, ".")
  }

  lastUpdateTime = now;
}
