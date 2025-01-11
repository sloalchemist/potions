import { v4 as uuidv4 } from 'uuid';
import {
  getRandomColor,
  hexStringToNumber,
  numberToHexString
} from './utils/color';
import { world } from './scenes/worldScene';

export let characterId: string;
export let publicCharacterId: string;

export class Character {
  name: string;
  eyeColor: number;
  furColor: number;
  bellyColor: number;

  constructor(
    name: string,
    eyeColor: number,
    furColor: number,
    bellyColor: number
  ) {
    this.name = name;
    this.eyeColor = eyeColor;
    this.furColor = furColor;
    this.bellyColor = bellyColor;
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
  localStorage.setItem('name', name);
  currentCharacter!.name = name;
}

export function validateName(name: string | null): boolean {
  return !!name && name.trim() !== '' && name.length < 10
}

export async function retrieveCharacter() {
  characterId = localStorage.getItem('characterId') || uuidv4();
  publicCharacterId = characterId.substr(0, 8);
  localStorage.setItem('characterId', characterId);

  currentCharacter = new Character(
    localStorage.getItem('name') || 'Nobody',
    hexStringToNumber(localStorage.getItem('eyeColor') || getRandomColor()),
    hexStringToNumber(localStorage.getItem('furColor') || getRandomColor()),
    hexStringToNumber(localStorage.getItem('bellyColor') || getRandomColor())
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
