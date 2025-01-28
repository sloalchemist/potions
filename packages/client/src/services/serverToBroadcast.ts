import {
  AddItemData,
  AddMobData,
  BroadcastData,
  DestroyItemData,
  DestroyMobData,
  DoingData,
  DropItemData,
  GiveItemData,
  ItemChangeData,
  MobChangeData,
  MoveData,
  PickupItemData,
  PortalData,
  SetDatetimeData,
  SpeakData
} from '@rt-potion/common';
import { world, WorldScene } from '../scenes/worldScene';
import { addNewItem, addNewMob, gameState, setDate } from '../world/controller';
import { SpriteMob } from '../sprite/sprite_mob';
import { publicCharacterId } from '../worldMetadata';
import { SpriteItem } from '../sprite/sprite_item';
import { Types } from 'ably';
import { leaveWorld } from './playerToServer';
import { focused } from '../main';

export let playerDead = false;

export function setupBroadcast(
  broadcast_channel: Types.RealtimeChannelCallbacks,
  scene: WorldScene
) {
  function handleAddMob(data: AddMobData) {
    if (!world.mobs[data.id]) {
      addNewMob(scene, data.mob);
    }
  }

  function handleAddItem(data: AddItemData) {
    if (!world.items[data.id]) {
      addNewItem(scene, data.item);
    }
  }

  function handleDestroyItem(data: DestroyItemData) {
    const item = world.items[data.object_key];
    if (item) {
      item.destroy(world);
    }
    if (data.mob_key && world.mobs[data.mob_key]) {
      world.mobs[data.mob_key].carrying = undefined;
    }
  }

  function handlePickupItem(data: PickupItemData) {
    const item = world.items[data.item_key];
    const mob = world.mobs[data.mob_key];
    item.pickup(world, mob);
  }

  function handleGiveItem(data: GiveItemData) {
    const item = world.items[data.item_key];
    const from = world.mobs[data.from_key];
    const to = world.mobs[data.to_key];
    item.giveItem(world, from, to);
  }

  function handleDropItem(data: DropItemData) {
    const item = world.items[data.item_key];
    const mob = world.mobs[data.mob_key];
    item.drop(world, mob, data.position);
  }

  function handleDoing(data: DoingData) {
    const mob = world.mobs[data.id] as SpriteMob;
    mob.doing = data.action;
  }

  function handleMove(data: MoveData) {
    const mob = world.mobs[data.id];
    if (mob) {
      if (data.id !== publicCharacterId) {
        mob.target = data.target;
        mob.path = data.path;
      }
    } else {
      console.error('Mob not found for movement', data.id);
      throw new Error('Mob not found for movement');
    }
  }

  function handleDestroyMob(data: DestroyMobData) {
    const mob = world.mobs[data.id];
    if (mob) {
      mob.destroy(world);
      if (data.id === publicCharacterId) {
        playerDead = true;

        // wait until the window is focused before moving on
        const waitUntilFocused = new Promise<void>((resolve) => {
          const checkFocus = () => {
            if (focused == true) {
              // resolve once game is focused
              resolve();
            } else {
              // keep waiting
              setTimeout(checkFocus, 100);
            }
          };
          checkFocus();
        });

        // one game focused, leave the world and display game over
        waitUntilFocused.then(() => {
          leaveWorld();
          scene.showGameOver(scene);
        });
      }
    }
  }

  function handlePortal(data: PortalData) {
    const mob = world.mobs[data.mob_key];
    if (mob?.key === publicCharacterId) {
      mob.destroy(world);
      scene.scene.stop('WorldScene');
    }
  }

  function handleMobChange(data: MobChangeData) {
    const mob = world.mobs[data.id] as SpriteMob;
    if (mob) {
      mob.changeAttribute(data.property, data.delta, data.new_value);
    }
  }

  function handleSpeak(data: SpeakData) {
    const mob = world.mobs[data.id] as SpriteMob;
    if (mob && mob.key !== publicCharacterId) {
      mob.showSpeechBubble(data.message, false);
    }
  }

  function handleItemChange(data: ItemChangeData) {
    const item = world.items[data.id] as SpriteItem;
    if (item) {
      item.attributes[data.property] = data.value;
      item.animate();
    }
  }

  function handleSetDatetime(data: SetDatetimeData) {
    setDate(data.date);
  }

  // Subscribe to broadcast and dispatch events using switch
  broadcast_channel.subscribe('tick', (message: Types.Message) => {
    if (gameState !== 'stateInitialized') return;
    const broadcastData = message.data.broadcast as BroadcastData[];

    for (const broadcastItem of broadcastData) {
      switch (broadcastItem.type) {
        case 'add_mob':
          handleAddMob(broadcastItem.data as AddMobData);
          break;
        case 'add_item':
          handleAddItem(broadcastItem.data as AddItemData);
          break;
        case 'destroy_item':
          handleDestroyItem(broadcastItem.data as DestroyItemData);
          break;
        case 'pickup_item':
          handlePickupItem(broadcastItem.data as PickupItemData);
          break;
        case 'give_item':
          handleGiveItem(broadcastItem.data as GiveItemData);
          break;
        case 'drop_item':
          handleDropItem(broadcastItem.data as DropItemData);
          break;
        case 'doing':
          handleDoing(broadcastItem.data as DoingData);
          break;
        case 'move':
          handleMove(broadcastItem.data as MoveData);
          break;
        case 'destroy_mob':
          handleDestroyMob(broadcastItem.data as DestroyMobData);
          break;
        case 'portal':
          handlePortal(broadcastItem.data as PortalData);
          break;
        case 'mob_change':
          handleMobChange(broadcastItem.data as MobChangeData);
          break;
        case 'speak':
          handleSpeak(broadcastItem.data as SpeakData);
          break;
        case 'item_change':
          handleItemChange(broadcastItem.data as ItemChangeData);
          break;
        case 'set_datetime':
          handleSetDatetime(broadcastItem.data as SetDatetimeData);
          break;
        default:
          console.error(
            `No handler found for type: ${JSON.stringify(broadcastItem)}`
          );
      }
    }
  });
}
