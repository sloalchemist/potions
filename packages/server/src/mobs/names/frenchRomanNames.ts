// Random Fantasy Name Generator (French/Roman lordly names)

import { NameGenerator } from './nameGenerator';

export class FrenchRomanNames implements NameGenerator {
  private frenchPrefixes = [
    'Beau',
    'Chateau',
    'Fleur',
    'Jardin',
    'Lumiere',
    'Mont',
    'Riviere',
    'Val',
    'Vigne'
  ] as const satisfies readonly string[];

  private test = this.frenchPrefixes[1];

  private romanPrefixes = [
    'Aurelius',
    'Claudius',
    'Flavius',
    'Julius',
    'Lucius',
    'Marcus',
    'Octavius',
    'Quintus',
    'Tiberius',
    'Valerius'
  ] as const satisfies readonly string[];

  private frenchSuffixes = [
    'mont',
    'ville',
    'fort',
    'chateau',
    'lac',
    'terre',
    'bois',
    'plaine',
    'roc',
    'vallee'
  ] as const satisfies readonly string[];

  private romanSuffixes = [
    'us',
    'ium',
    'ianus',
    'ensis',
    'or',
    'ar',
    'ax',
    'ius',
    'ae',
    'a'
  ] as const satisfies readonly string[];

  private vowels = [
    'a',
    'e',
    'i',
    'o',
    'u',
    'y'
  ] as const satisfies readonly string[];

  private consonants = [
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
    'q',
    'r',
    's',
    't',
    'v',
    'x',
    'z'
  ] as const satisfies readonly string[];

  // Generate a random name
  public generateName(): string {
    const useRomanPrefix = Math.random() < 0.5;
    const useRomanSuffix = Math.random() < 0.5;

    const prefix = useRomanPrefix
      ? this.randomElement(this.romanPrefixes)
      : this.randomElement(this.frenchPrefixes);

    const suffix = useRomanSuffix
      ? this.randomElement(this.romanSuffixes)
      : this.randomElement(this.frenchSuffixes);

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
  private randomElement<T>(array: readonly T[]): T {
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
