import { TILE_SIZE, WorldScene } from '../scenes/worldScene';
import {
  calculateDistance,
  FantasyDateI,
  floor,
  HouseI,
  ItemI,
  MobI,
  Coord
} from '@rt-potion/common';
import { ItemType } from '../worldDescription';
import { SpriteMob } from '../sprite/sprite_mob';
import { SpriteItem } from '../sprite/sprite_item';
import { world } from '../scenes/worldScene';
import { publicCharacterId, currentCharacter, refresh } from '../worldMetadata';
import { SpriteHouse } from '../sprite/sprite_house';
import { Item } from './item';
import { Mob } from './mob';
import { startWorld } from '../services/playerToServer';

export type Interactions = {
  item: Physical;
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

function prepInteraction(label: string, physical: Physical): string {
  if (!physical.templateType) {
    return label;
  } else {
    return label.replace('$item_name', physical.templateType);
  }
}

interface ItemInteraction {
  while_carried: boolean;
  requires_item?: string;
  action: string;
  description: string;
}

// cast Item objects to Physical
interface Physical {
  position: Coord | null;
  itemType: ItemType;
  key: string;
  conditionMet: (interaction: ItemInteraction) => boolean;
  attributes?: Record<string, any>;
  templateType?: string;
}

export function getCarriedItemInteractions(
  physical: Physical,
  nearbyItems: Physical[],
  nearbyMobs: Mob[],
  playerId: string
): Interactions[] {
  const interactions: Interactions[] = [];

  interactions.push({
    action: 'drop',
    item: physical,
    label: `Drop ${physical.itemType.name}`
  });

  // give to nearby mobs
  nearbyMobs.forEach((mob) => {
    if (mob.key !== playerId) {
      interactions.push({
        action: 'give',
        item: physical,
        give_to: mob.key,
        label: `Give ${physical.itemType.name} to ${mob.name}`
      });
    }
  });

  // unique carried item interactions
  physical.itemType.interactions.forEach((interaction) => {
    if (interaction.while_carried) {
      const requiredItem = interaction.requires_item 
        ? nearbyItems.find((i) => i.itemType.type === interaction.requires_item)
        : true;
      
      if ((!interaction.requires_item || requiredItem) && physical.conditionMet(interaction)) {
        interactions.push({
          action: interaction.action,
          item: physical,
          label: prepInteraction(interaction.description, physical)
        });
      }
    }
  });

  return interactions;
}

export function getPhysicalInteractions(physical: Physical, carried?: Physical): Interactions[] {
  const interactions: Interactions[] = [];

  // if the item can be picked up
  if (physical.itemType.carryable) {
    interactions.push({
      action: 'pickup',
      item: physical,
      label: `Pick up ${physical.itemType.name}`
    });
  }

  // if the item can be smashed
  if (physical.itemType.smashable) {
    interactions.push({
      action: 'smash',
      item: physical,
      label: `Smash ${physical.itemType.name}`
    });
  }

  // handles unique interactions
  physical.itemType.interactions.forEach((interaction) => {
    if (!interaction.while_carried && physical.conditionMet(interaction)) {
      if(
        interaction.action == "add_item" && 
        carried && 
        physical.attributes?.templateType &&
        carried.itemType.name.localeCompare(physical.attributes.templateType.toString()) || 
        interaction.action != "add_item"
      ) {
        interactions.push({
          action: interaction.action,
          item: physical,
          label: prepInteraction(interaction.description, physical)
        });
      }
    }
  });

  return interactions;
}

export function getClosestPhysical(physicals: Physical[], playerPos: Coord): Physical {
  return physicals.reduce((closest, current) => {
    if (!closest.position || !current.position) return closest;
    const closestDistance = calculateDistance(closest.position, playerPos);
    const currentDistance = calculateDistance(current.position, playerPos);
    return currentDistance < closestDistance ? current : closest;
  });
}

function getItemsAtPosition(physicals: Physical[], position: Coord): Physical[] {
  return physicals.filter((physical) => {
    return position.x === physical.position!.x && position.y === physical.position!.y;
  });
}

export function getInteractablePhysicals(items: Item[], playerPos: Coord): Physical[] {
  // convert items to physicals
  const physicals = items.map(item => item as unknown as Physical);
  
  // player is standing on
  let onTopObjects = getItemsAtPosition(physicals, playerPos);

  // nearby "openable" items
  let nearbyOpenableObjects = physicals.filter(p => p.itemType.layout_type === "opens");
  if (nearbyOpenableObjects.length > 1) {
    nearbyOpenableObjects = [getClosestPhysical(nearbyOpenableObjects, playerPos)];
  }
  
  // nearby non-walkable items
  let nearbyObjects = physicals.filter(p => !p.itemType.walkable);
  if (nearbyObjects.length > 1) {
    nearbyObjects = [getClosestPhysical(nearbyObjects, playerPos)];
  }
  return [...onTopObjects, ...nearbyObjects, ...nearbyOpenableObjects];
}

function collisionListener(physicals: Item[]) {
  const player = world.mobs[publicCharacterId] as SpriteMob;
  const playerPos = floor(player.position!);
  
  // retrieves a list of all of the nearby and on top of objects
  const interactableObjects = getInteractablePhysicals(physicals, playerPos);
  let interactions: Interactions[] = [];

  let carriedItem = undefined;
  // if player is carrying object, add its according interactions
  if (player.carrying) {
    const item = world.items[player.carrying];
    carriedItem = item as unknown as Physical;
    
    const nearbyMobs = world.getMobsAt(playerPos.x, playerPos.y, 2);
    const carriedInteractions = getCarriedItemInteractions(
      carriedItem,
      interactableObjects,
      nearbyMobs,
      publicCharacterId
    );
    interactions = [...interactions, ...carriedInteractions];
  }

  // retrieves interactions for all relevant items
  interactableObjects.forEach(physical => {
    interactions = [...interactions, ...getPhysicalInteractions(physical, carriedItem)];
  });

  // updates client only if interactions changes
  if (!areInteractionsEqual(lastInteractions, interactions) && interactionCallback) {
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
