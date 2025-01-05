import { FrenchRomanNames } from './frenchRomanNames';
import { MonstrousNames } from './monstrousNames';
import { NorseEnglishNames } from './norseEnglishNames';

export interface NameGenerator {
  generateName(): string;
}

export class NameGeneratorFactory {
  private nameGenerators: Record<string, NameGenerator> = {};

  constructor() {
    this.nameGenerators['norse-english'] = new NorseEnglishNames();
    this.nameGenerators['french-roman'] = new FrenchRomanNames();
    this.nameGenerators['monstrous'] = new MonstrousNames();
  }

  generateName(type: string): string {
    const nameGenerator = this.nameGenerators[type];
    if (!nameGenerator) {
      throw new Error(`Unknown name generator: ${type}`);
    }
    return nameGenerator.generateName();
  }
}

export const nameGeneratorFactory = new NameGeneratorFactory();
