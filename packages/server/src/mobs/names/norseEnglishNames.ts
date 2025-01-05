// Random Fantasy Name Generator (English/Nordic hybrid)

import { NameGenerator } from './nameGenerator';

export class NorseEnglishNames implements NameGenerator {
  private englishPrefixes: string[] = [
    'Ash',
    'Black',
    'Bright',
    'Cinder',
    'Dark',
    'Earth',
    'Fire',
    'Frost',
    'Iron',
    'Light',
    'Oak',
    'Shadow',
    'Silver',
    'Stone',
    'Storm',
    'Thorn',
    'White',
    'Wolf'
  ];

  private nordicPrefixes: string[] = [
    'Bjorn',
    'Eirik',
    'Hakon',
    'Ivar',
    'Knut',
    'Leif',
    'Sigurd',
    'Thor',
    'Ulf',
    'Vidar'
  ];

  private englishSuffixes: string[] = [
    'dale',
    'fall',
    'field',
    'ford',
    'gate',
    'hall',
    'haven',
    'holm',
    'mere',
    'ridge',
    'shire',
    'stead',
    'stone',
    'vale',
    'wood'
  ];

  private nordicSuffixes: string[] = [
    'heim',
    'fjord',
    'lund',
    'skov',
    'strand',
    'vik',
    'voll',
    'gaard',
    'berg',
    'dal'
  ];

  private vowels: string[] = ['a', 'e', 'i', 'o', 'u', 'y'];

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

  // Generate a random name
  public generateName(): string {
    const useNordicPrefix = Math.random() < 0.5;
    const useNordicSuffix = Math.random() < 0.5;

    const prefix = useNordicPrefix
      ? this.randomElement(this.nordicPrefixes)
      : this.randomElement(this.englishPrefixes);

    const suffix = useNordicSuffix
      ? this.randomElement(this.nordicSuffixes)
      : this.randomElement(this.englishSuffixes);

    return this.capitalize(prefix + suffix);
  }

  // Generate a completely random syllable-based name
  public generateRandomSyllableName(
    minSyllables: number = 2,
    maxSyllables: number = 4
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
