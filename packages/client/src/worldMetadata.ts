import { v4 as uuidv4 } from 'uuid';
import {
  getRandomColor,
  hexStringToNumber,
  numberToHexString
} from './utils/color';
import { world } from './scenes/worldScene';
import { setupAbly } from './services/ablySetup';

export let characterId: string;
export let publicCharacterId: string;
export let worldID: string;

export class Character {
  name: string;
  eyeColor: number;
  furColor: number;
  bellyColor: number;
  community_id: string;

  constructor(
    name: string,
    eyeColor: number,
    furColor: number,
    bellyColor: number,
    community_id: string
  ) {
    this.name = name;
    this.eyeColor = eyeColor;
    this.furColor = furColor;
    this.bellyColor = bellyColor;
    this.community_id = community_id;
  }

  get gold(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].attributes['gold'];
  }

  get health(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].attributes['health'];
  }

  get attack(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].attributes['attack'];
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

  get stubbornness(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['stubbornness'];
  }

  get bravery(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['bravery'];
  }

  get aggression(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['aggression'];
  }

  get industriousness(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['industriousness'];
  }

  get adventurousness(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['adventurousness'];
  }

  get gluttony(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['gluttony'];
  }

  get sleepy(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['sleepy'];
  }

  get extroversion(): number {
    if (!world || !world.mobs[publicCharacterId]) {
      return 0;
    }
    return world.mobs[publicCharacterId].personalities['extroversion'];
  }

  subtype(): string {
    return `${this.eyeColor}-${this.bellyColor}-${this.furColor}`;
  }
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
    'alchemists'
  );

  saveColors();
}

export function getWorldID() {
  return worldID;
}

export function setWorldID(worldName: string) {
  worldID = worldName;
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
