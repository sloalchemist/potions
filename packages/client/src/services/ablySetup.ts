import { Realtime, Types } from 'ably';
import { WorldScene } from '../scenes/worldScene';
import { publicCharacterId, characterId } from '../worldMetadata';
import { setupPlayerSubscriptions } from './serverToPlayer';
import { setupBroadcast } from './serverToBroadcast';

export let broadcastChannel: Types.RealtimeChannelCallbacks;
export let playerChannel: Types.RealtimeChannelCallbacks;

const SERVER_URL = process.env.SERVER_URL;
let channelsBoundToWorld: boolean = false;
let authorizer = SERVER_URL.slice(-1) == "/" ? 'auth?username=' : '/auth?username='
export function setupAbly(): Promise<void> {
  let worldID: string;
  return new Promise((resolve, _reject) => {
    const authUrl = SERVER_URL + authorizer + characterId;

    const ably = new Realtime({
      authCallback: (tokenParams, callback) => {
        fetch(authUrl)
          .then((response) => response.json())
          .then((data) => {
            worldID = data.worldID;
            callback(null, data.tokenRequest);
          })
          .catch((err) => {
            console.error('Error fetching auth token:', err);
          });
      }
    });

    ably.connection.on('connected', () => {
      console.log('Connected to Ably');

      broadcastChannel = ably.channels.get(`world-${worldID}`);
      playerChannel = ably.channels.get(`${publicCharacterId}-${worldID}`);

      resolve();
      console.log('Ably client initialized successfully.');
    });
  });
}

export function bindAblyToWorldScene(scene: WorldScene) {
  if (channelsBoundToWorld) {
    return;
  }

  channelsBoundToWorld = true;

  setupBroadcast(broadcastChannel, scene);
  setupPlayerSubscriptions(playerChannel, scene);
}
