import {
  AddItemData,
  AddMobData,
  BroadcastData,
  DestroyItemData,
  DestroyMobData,
  DoingData,
  DropItemData,
  StashItemData,
  UnstashItemData,
  GiveItemData,
  ItemChangeData,
  MobChangeData,
  MoveData,
  PickupItemData,
  PortalData,
  SetDatetimeData,
  SpeakData,
  ShowPortalMenuData
} from '@rt-potion/common';
import { Types } from 'ably';
import { focused } from '../main';
import { world, WorldScene } from '../scenes/worldScene';
import { SpriteItem } from '../sprite/sprite_item';
import { SpriteMob } from '../sprite/sprite_mob';
import {
  addNewItem,
  addNewMob,
  gameState,
  setAvailableWorlds,
  setDate,
  updateInventory
} from '../world/controller';
import { publicCharacterId } from '../worldMetadata';
import { leaveWorld } from './playerToServer';

export let playerDead = false;

//constant to indicate to server to have player remain in the current world
//must match MAINTAIN_WORLD_OPTION in server/src/services/clientCommunication/ablyService.ts
const MAINTAIN_WORLD_OPTION = 'NO_CHANGE';

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

  function handleStashItem(data: StashItemData) {
    const item = world.items[data.item_key];
    const mob = world.mobs[data.mob_key];
    item.stash(world, mob, data.position);
    world.addStoredItem(item);
    updateInventory();
  }

  function handleUnstashItem(data: UnstashItemData) {
    const item = world.items[data.item_key];
    const mob = world.mobs[data.mob_key];
    item.unstash(world, mob, data.position);
    world.removeStoredItem(item);
    updateInventory();
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

        // once game focused, leave the world and display game over
        waitUntilFocused.then(() => {
          scene.showGameOver();
          // in cases where player should stay in the same world, pass MAINTAIN_WORLD_OPTION
          leaveWorld(MAINTAIN_WORLD_OPTION);
          scene.resetToLoadWorldScene();
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
    if (mob) {
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

  function handleShowPortalMenu(data: ShowPortalMenuData) {
    if (data.mob_key === publicCharacterId) {
      setAvailableWorlds(data.worlds);
      scene.scene.launch('PortalMenuScene');
    }
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
        case 'stash_item':
          console.log(
            broadcastItem.data as StashItemData,
            'BROADCAST STASH ITEM'
          );
          handleStashItem(broadcastItem.data as StashItemData);
          break;
        case 'unstash_item':
          console.log(
            broadcastItem.data as StashItemData,
            'BROADCAST UNSTASH ITEM'
          );
          handleUnstashItem(broadcastItem.data as UnstashItemData);
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
        case 'show_portal_menu':
          handleShowPortalMenu(broadcastItem.data);
          break;
        default:
          console.error(
            `No handler found for type: ${JSON.stringify(broadcastItem)}`
          );
      }
    }
  });
}
