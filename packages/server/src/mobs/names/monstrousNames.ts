// Random Fantasy Name Generator (Monstrous Names)

import { NameGenerator } from './nameGenerator';

export class MonstrousNames implements NameGenerator {
  private monstrousPrefixes: string[] = [
    'Grak',
    'Vroth',
    'Skal',
    'Drak',
    'Krul',
    'Zor',
    'Thar',
    'Balg',
    'Gnash',
    'Murk'
  ];

  private monstrousMiddle: string[] = [
    'arg',
    'urz',
    'thok',
    'brol',
    'nak',
    'grom',
    'dred',
    'shak',
    'glub',
    'zor'
  ];

  private monstrousSuffixes: string[] = [
    'ash',
    'oth',
    'gath',
    'rek',
    'mok',
    'zoth',
    'dar',
    'vok',
    'rax',
    'gul'
  ];

  private vowels: string[] = ['a', 'e', 'i', 'o', 'u'];

  private consonants: string[] = [
    'b',
    'c',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'm',
    'n',
    'p',
    'r',
    's',
    't',
    'v',
    'w',
    'z'
  ];

  // Generate a random monstrous name
  public generateName(): string {
    const prefix = this.randomElement(this.monstrousPrefixes);
    const middle =
      Math.random() < 0.5 ? this.randomElement(this.monstrousMiddle) : '';
    const suffix = this.randomElement(this.monstrousSuffixes);

    return this.capitalize(prefix + middle + suffix);
  }

  // Generate a completely random syllable-based name
  public generateRandomSyllableName(
    minSyllables: number = 2,
    maxSyllables: number = 2
  ): string {
    const syllableCount = this.randomInt(minSyllables, maxSyllables);
    let name = '';

    for (let i = 0; i < syllableCount; i++) {
      name += this.randomElement(this.consonants);
      name += this.randomElement(this.vowels);

      if (Math.random() < 0.5) {
        name += this.randomElement(this.consonants);
      }
    }

    return this.capitalize(name);
  }

  // Utility: Get a random element from an array
  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Utility: Generate a random integer in a range
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Utility: Capitalize a string
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
