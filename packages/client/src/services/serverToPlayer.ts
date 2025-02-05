import { Types } from 'ably';
import {
  addNewHouse,
  addNewItem,
  addNewMob,
  setAttacks,
  setChatting,
  setDate,
  setFighting,
  setGameState,
  setResponses
} from '../world/controller';
import { ServerToPlayerMessageMap } from '@rt-potion/common';
import { world, WorldScene } from '../scenes/worldScene';
import { SpriteMob } from '../sprite/sprite_mob';
import { refresh } from '../worldMetadata';

export function setupPlayerSubscriptions(
  player_channel: Types.RealtimeChannelCallbacks,
  scene: WorldScene
) {
  console.log('Setting up player subscriptions');

  type SubscriptionCallback<T extends keyof ServerToPlayerMessageMap> = (
    data: ServerToPlayerMessageMap[T]
  ) => void;

  function subscribeToPlayerChannel<T extends keyof ServerToPlayerMessageMap>(
    event: T,
    callback: SubscriptionCallback<T>
  ) {
    player_channel.subscribe(event, (message: Types.Message) => {
      callback(message.data as ServerToPlayerMessageMap[T]);
    });
  }

  subscribeToPlayerChannel('player_responses', (data) => {
    setResponses(data.responses);
    setChatting(true);
  });

  subscribeToPlayerChannel('player_attacks', (data) => {
    setAttacks(data.attacks);
    setFighting(true);
  });

  subscribeToPlayerChannel('chat_confirm', (data) => {
    const mob = world.mobs[data.target] as SpriteMob;
    if (!mob) {
      console.error('Mob not found for chat confirm', data.target);
      return;
    }
    setChatting(true);
  });

  subscribeToPlayerChannel('chat_close', () => {
    setChatting(false);
  });

  subscribeToPlayerChannel('fight_close', () => {
    setFighting(false);
  });

  subscribeToPlayerChannel('state', (data) => {
    console.log('Received state message', data);
    const mob_data = data.mobs;
    const item_data = data.items;
    const house_data = data.houses;

    for (const house of house_data) {
      if (!world.houses[house.id]) {
        addNewHouse(scene, house);
      }
    }
    for (const mob of mob_data) {
      if (!world.mobs[mob.id]) {
        addNewMob(scene, mob);
      }
    }

    for (const item of item_data) {
      if (!world.items[item.id]) {
        addNewItem(scene, item);
      }
    }

    setDate(data.date);

    setGameState('stateInitialized');

    refresh();
  });
}
