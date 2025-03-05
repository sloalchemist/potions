import { Realtime, Types } from 'ably';
import { WorldScene, world } from '../scenes/worldScene';
import { publicCharacterId, characterId } from '../worldMetadata';
import { setupPlayerSubscriptions } from './serverToPlayer';
import { setupBroadcast } from './serverToBroadcast';
import { SpriteMob } from '../sprite/sprite_mob';

export let broadcastChannel: Types.RealtimeChannelCallbacks;
export let playerChannel: Types.RealtimeChannelCallbacks;
export let chatChannel: Types.RealtimeChannelCallbacks;

const SERVER_URL = process.env.SERVER_URL; //Cannot use getEnv in the client package https://webpack.js.org/guides/environment-variables/
let channelsBoundToWorld: boolean = false;

export function setupAbly(): Promise<string> {
  let authorizer =
    SERVER_URL.slice(-1) == '/' ? 'auth?username=' : '/auth?username=';
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
      chatChannel = ably.channels.get(`chat-${worldID}`);

      resolve(worldID);
      console.log('Ably client initialized successfully.', worldID);
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

  chatChannel.subscribe('chat', (payload: Types.Message) => {
    const mob_id = payload.data.mob_id;
    if (publicCharacterId === mob_id) return;

    const mob = world.mobs[mob_id];
    if (mob) {
      (mob as SpriteMob).showSpeechBubble(payload.data.message, true);
    }
  });
}
