import { v4 as uuidv4 } from 'uuid';
import {
  getRandomColor,
  hexStringToNumber,
  numberToHexString
} from './utils/color';
import { world } from './scenes/worldScene';
import { setupAbly } from './services/ablySetup';
import { Item } from './world/item';

export let characterId: string;
export let publicCharacterId: string;

export class Character {
  name: string;
  eyeColor: number;
  furColor: number;
  bellyColor: number;
  community_id: string | undefined;
  inventory: Item[];
  gold: number;

  constructor(
    name: string,
    eyeColor: number,
    furColor: number,
    bellyColor: number,
    community_id: string | undefined,
    inventory: Item[] = [],
    gold: number = 0
  ) {
    this.name = name;
    this.eyeColor = eyeColor;
    this.furColor = furColor;
    this.bellyColor = bellyColor;
    this.community_id = community_id;
    this.inventory = inventory;
    this.gold = gold;
  }

  get health(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].attributes['health'];
  }

  get speed(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].attributes['speed'];
  }

  get target_speed_tick(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].attributes['target_speed_tick'];
  }

  subtype(): string {
    return `${this.eyeColor}-${this.bellyColor}-${this.furColor}`;
  }

  respawn() {
    handlePlayerDeath(this);
  }
}

function handlePlayerDeath(character: Character) {
  // When player dies, they drop half their gold
  // Ticket says inventory + half their gold drops on the ground but idk what that means...
  console.log('Handling player death:', character);
  const halfGold = Math.floor(character.gold / 2);

  // Drop items in inventory??
  character.inventory = [];
  character.gold = halfGold;
}

export let currentCharacter: Character | null = null;
export let refreshCallback: () => void;

export function addRefreshCallback(callback: () => void) {
  refreshCallback = callback;
}

export async function refresh() {
  refreshCallback();
}

export async function changeName(name: string) {
  if (localStorage.getItem('name') !== name) {
    characterId = uuidv4();
    publicCharacterId = characterId.substr(0, 8);
    localStorage.setItem('characterId', characterId);
    setupAbly();
  }
  localStorage.setItem('name', name);
  currentCharacter!.name = name;
}

export async function retrieveCharacter() {
  characterId = localStorage.getItem('characterId') || uuidv4();
  publicCharacterId = characterId.substr(0, 8);
  localStorage.setItem('characterId', characterId);

  currentCharacter = new Character(
    localStorage.getItem('name') || 'Nobody',
    hexStringToNumber(localStorage.getItem('eyeColor') || getRandomColor()),
    hexStringToNumber(localStorage.getItem('furColor') || getRandomColor()),
    hexStringToNumber(localStorage.getItem('bellyColor') || getRandomColor()),
    localStorage.getItem('community_id') || undefined,
    [], // Initialize inventory
    100 // Initialize gold
  );

  saveColors();
}

export async function saveColors() {
  localStorage.setItem(
    'eyeColor',
    numberToHexString(currentCharacter!.eyeColor)
  );
  localStorage.setItem(
    'furColor',
    numberToHexString(currentCharacter!.furColor)
  );
  localStorage.setItem(
    'bellyColor',
    numberToHexString(currentCharacter!.bellyColor)
  );
}
