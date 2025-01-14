import { TILE_SIZE, WorldScene } from '../scenes/worldScene';
import {
  calculateDistance,
  FantasyDateI,
  floor,
  HouseI,
  ItemI,
  MobI
} from '@rt-potion/common';
import { SpriteMob } from '../sprite/sprite_mob';
import { SpriteItem } from '../sprite/sprite_item';
import { world } from '../scenes/worldScene';
import { publicCharacterId, currentCharacter, refresh } from '../worldMetadata';
import { SpriteHouse } from '../sprite/sprite_house';
import { Item } from './item';
import { Mob } from './mob';
import { startWorld } from '../services/playerToServer';

export type Interactions = {
  item: Item;
  action: string;
  label: string;
  give_to?: string;
};

let interactionCallback: (interactions: Interactions[]) => void;
let chatCompanionCallback: (companions: Mob[]) => void;
let lastInteractions: Interactions[] = [];
let lastChatCompanions: Mob[] = [];
let chatting: boolean = false;

export let fantasyDate: FantasyDateI;

let responseCallback: (responses: string[]) => void = () => {};

type GameState = 'uninitialized' | 'worldLoaded' | 'stateInitialized';

export let gameState: GameState = 'uninitialized';

export function setGameState(state: GameState) {
  console.log('Setting game state to:', state);
  gameState = state;
}

export function setChatting(chat: boolean) {
  console.log('setChatting', chat);
  chatting = chat;
  // Allows for rechatting with the same NPC
  if (!chat) {
    lastChatCompanions = [];
  }
}

export function setResponseCallback(callback: (responses: string[]) => void) {
  responseCallback = callback;
}

export function setResponses(responses: string[]) {
  responseCallback(responses);
}

export function initializePlayer() {
  if (currentCharacter) {
    console.log('joining', currentCharacter, currentCharacter.name);

    startWorld();
  }
}

export function tick(scene: WorldScene) {
  world.tick(scene.game.loop.delta);
}

function areInteractionsEqual(
  lastInteractions: Interactions[],
  currentInteractions: Interactions[]
): boolean {
  // Check if arrays have the same length
  if (lastInteractions.length !== currentInteractions.length) {
    return false;
  }

  // Check if each element in the arrays is equal
  for (let i = 0; i < lastInteractions.length; i++) {
    const last = lastInteractions[i];
    const current = currentInteractions[i];

    // Compare both the item_key and action
    if (last.item.key !== current.item.key || last.action !== current.action) {
      return false;
    }
  }

  // If all elements are equal, return true
  return true;
}

export function areListsEqual(list1: Mob[], list2: Mob[]): boolean {
  if (list1.length !== list2.length) {
    return false;
  }

  return list1.every((item, index) => item.key === list2[index].key);
}

export function mobRangeListener(mobs: Mob[]) {
  if (chatCompanionCallback && !chatting) {
    const filteredMobs = mobs.filter((mob) => mob.type !== 'player');
    filteredMobs.sort((a, b) => a.key.localeCompare(b.key));
    if (!areListsEqual(filteredMobs, lastChatCompanions)) {
      console.log("filter: ", filteredMobs, "last:", lastChatCompanions);
      chatCompanionCallback(filteredMobs);
      lastChatCompanions = filteredMobs;
    }
  }
}

function prepInteraction(label: string, item: Item): string {
  if (!item.templateType) {
    return label;
  } else {
    return label.replace('$item_name', item.templateType || '');
  }
}

function getOnTopOf(physicals: Item[], player: SpriteMob): Item[] {
  const playerCoord = floor(player.position!);
  return physicals.filter((physical) => {
    return playerCoord.x === physical.position!.x && physical.position!.y === playerCoord.y;
  });
}

function collisionListener(physicals: Item[]) {
  const interactions: Interactions[] = [];

  const items: Item[] = [];
  const player = world.mobs[publicCharacterId] as SpriteMob;

  const onTopOf = getOnTopOf(physicals, player);

  let distant = physicals.filter((physical) => {
    return !physical.itemType.walkable;
  });

  if (distant.length > 1) {
    const nonWalkablePhysicals = distant.filter(
      (physical) => !physical.itemType.walkable
    );
    if (nonWalkablePhysicals.length > 1) {
      const closestPhysical = nonWalkablePhysicals.reduce(
        (closest, current) => {
          const closestDistance = calculateDistance(
            closest.position!,
            player.position!
          );
          const currentDistance = calculateDistance(
            current.position!,
            player.position!
          );
          return currentDistance < closestDistance ? current : closest;
        }
      );
      distant = [closestPhysical];
    }
  }

  const combined = [...onTopOf, ...distant];
  //console.log('collisionListener', physicals);

  combined.forEach((physical) => {
    if (physical instanceof Item) {
      const item = physical as Item;
      if (item.itemType.carryable && !player.carrying) {
        interactions.push({
          action: 'pickup',
          item: item,
          label: `Pick up ${item.itemType.name}`
        });
      }

      if (item.itemType.smashable) {
        interactions.push({
          action: 'smash',
          item: item,
          label: `Smash ${item.itemType.name}`
        });
      }

      item.itemType.interactions.forEach((interaction) => {
        if (!interaction.while_carried && item.conditionMet(interaction)) {
          interactions.push({
            action: interaction.action,
            item: item,
            label: prepInteraction(interaction.description, item)
          });
        }
      });
      items.push(item);
    }
  });

  if (player.carrying) {
    const item = world.items[player.carrying] as SpriteItem;

    interactions.push({
      action: 'drop',
      item: item,
      label: `Drop ${item.itemType.name}`
    });

    const nearbyMobs = world.getMobsAt(
      player.position!.x,
      player.position!.y,
      2
    );
    nearbyMobs.forEach((mob) => {
      if (mob.key != publicCharacterId) {
        interactions.push({
          action: 'give',
          item: item,
          give_to: mob.key,
          label: `Give ${item.itemType.name} to ${mob.name}`
        });
      }
    });

    item.itemType.interactions.forEach((interaction) => {
      if (interaction.while_carried) {
        if (
          (!interaction.requires_item ||
            items.find((i) => i.itemType.type === interaction.requires_item)) &&
          item.conditionMet(interaction)
        ) {
          interactions.push({
            action: interaction.action,
            item: item,
            label: prepInteraction(interaction.description, item)
          });
        }
      }
    });
  }

  if (
    !areInteractionsEqual(lastInteractions, interactions) &&
    interactionCallback
  ) {
    interactionCallback(interactions);
    lastInteractions = interactions;
  }
}

export function setChatCompanionCallback(
  callback: (companions: Mob[]) => void
) {
  chatCompanionCallback = callback;
}

export function setInteractionCallback(
  callback: (interactions: Interactions[]) => void
) {
  interactionCallback = callback;
}

export function addNewHouse(scene: WorldScene, house: HouseI) {
  const newHouse = new SpriteHouse(scene, house);
  world.houses[newHouse.key] = newHouse;
}

export function addNewMob(scene: WorldScene, mob: MobI) {
  if (!mob.position) {
    throw new Error('Mob has no position');
  }

  let newMob: SpriteMob;
  if (world.mobs[mob.id]) {
    newMob = world.mobs[mob.id] as SpriteMob;
  } else {
    newMob = new SpriteMob(scene, mob);
    world.mobs[newMob.key] = newMob;
  }

  if (mob.id === publicCharacterId) {
    console.log(`setting currentCharacter ${newMob.key}`, mob);
    newMob.attributeListeners.push((_mob, key, _delta) => {
      if (key === 'health' || key === 'gold') {
        refresh();
      }
    });
    //scene.cameras.main.startFollow(newMob.sprite);
    // This is the new "Setup camera section"
    scene.follow(newMob.sprite);

    scene.cameras.main.setBounds(
      0,
      0,
      world.worldWidth * TILE_SIZE,
      world.worldHeight * TILE_SIZE
    );
    newMob.addCollisionListener(collisionListener);
    newMob.addMobRangeListener(mobRangeListener);
    const eyeColor = currentCharacter!.eyeColor;
    const bellyColor = currentCharacter!.bellyColor;
    const furColor = currentCharacter!.furColor;
    newMob.subtype = `${eyeColor}-${bellyColor}-${furColor}`;
  }
}

export function setDate(date: FantasyDateI) {
  fantasyDate = date;
}

export function addNewItem(scene: WorldScene, item: ItemI) {
  const newItem = new SpriteItem(scene, item);
  world.items[newItem.key] = newItem;
  if (item.carried_by) {
    const mob = world.mobs[item.carried_by] as SpriteMob;
    mob.carrying = newItem.key;
  }
}
