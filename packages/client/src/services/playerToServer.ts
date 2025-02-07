import { Coord, floor, PlayerToServerMessageMap } from '@rt-potion/common';
import { Mob } from '../world/mob';
import { world } from '../scenes/worldScene';
import { currentCharacter, publicCharacterId } from '../worldMetadata';
import { SpriteMob } from '../sprite/sprite_mob';
import { broadcastChannel, playerChannel } from './ablySetup';

export function publishPlayerMessage<T extends keyof PlayerToServerMessageMap>(
  type: T,
  payload: PlayerToServerMessageMap[T]
) {
  playerChannel.publish(type, payload);
}

export function requestChat(mob: Mob) {
  publishPlayerMessage('chat_request', { mob_key: mob.key });
}

export function speak(message: string, response: number) {
  publishPlayerMessage('speak', { response: response });
  const player = world.mobs[publicCharacterId] as SpriteMob;
  player.showSpeechBubble(message, true);
}

export function interact(
  item_key: string,
  action: string,
  give_to: string | null
) {
  publishPlayerMessage('interact', {
    item_key: item_key,
    action: action,
    give_to: give_to
  });
}

export function startWorld() {
  broadcastChannel.presence.enter(publicCharacterId, (err) => {
    if (err) {
      console.error('Error entering presence:', err);
    } else {
      console.log('Successfully entered presence.');
      publishPlayerMessage('join', {
        name: currentCharacter!.name,
        subtype: currentCharacter!.subtype()
      });
    }
  });
}

/**
 * Broadcasts a leave event for the current world through the presence channel.
 * @param {string} target_world_id - The ID of the world to move to, from the worlds table in Supabase.
 * Can also be 'STAY_AT_WORLD' to indicate staying in the current world, as defined in serverToBroadcast.
 * @throws {Error} When there's an error leaving the presence channel
 */
export function leaveWorld(target_world_id: string) {
  const leaveData = {
    publicCharacterId: publicCharacterId,
    target_world_id: target_world_id
  };
  broadcastChannel.presence.leave(leaveData, (err) => {
    if (err) {
      console.error('Error leaving presence:', err);
    } else {
      console.log('Successfully left presence.');
    }
  });
}

export function publishPlayerPosition(target: Coord) {
  if (playerChannel && target) {
    const flooredTarget = floor(target);
    const player = world.mobs[publicCharacterId];
    player.target = flooredTarget;
    const path = world.generatePath(
      player.unlocks,
      player.position!,
      flooredTarget
    );
    player.path = path;
    publishPlayerMessage('move', { target: flooredTarget });
    //console.log(`Publishing move to ${JSON.stringify(target)}`)
  }
}

// TODO: perhaps use this function in the case that we want to update player state on more than just leave
// topic 'update_state' is not currently subscribed to on server side
export function publishPlayerStateToPersist() {
  if (playerChannel) {
    console.log('Requesting data persistence.');
    publishPlayerMessage('update_state', { name: publicCharacterId });
  }
}
