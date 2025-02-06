import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Graphable } from './graphable';
import { Region } from './region';

export class Item implements Graphable {
  private readonly noun: Noun;

  constructor(
    public readonly name: string,
    public description: string,
    public readonly region: Region
  ) {
    this.name = name;
    this.description = description;
    this.region = region;
    this.noun = { name: this.name, type: 'item' };

    if (!region) {
      throw new Error(`Item ${name} must have a region`);
    }
  }

  getDesires(): Desire[] {
    return [];
  }

  getNoun(): Noun {
    return this.noun;
  }

  getBeliefs(): Belief[] {
    return [
      {
        subject: this.noun,
        name: `${this.name}'s description`,
        concept: 'description',
        description: this.description,
        trust: 0
      },
      {
        subject: this.noun,
        name: `${this.name}'s region`,
        related_to: this.region.getNoun(), // Use the noun of the region
        concept: 'region',
        description: `${this.name} is in ${this.region.name}`,
        trust: 0
      }
    ];
  }
}
