import { Graphable } from './graphable';
import { Belief } from '../belief';
import { Noun } from '../noun';
import { Desire } from '../desire';

export class Region implements Graphable {
  id: string;
  name: string;
  description?: string;
  parent_region?: Region | null;
  lore?: string[];
  noun: Noun;

  constructor(
    id: string,
    name: string,
    description?: string,
    parent_region?: Region | null,
    lore?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parent_region = parent_region;
    this.lore = lore;
    this.noun = { id: this.id, name: this.name, type: 'region' };
  }

  getDesires(): Desire[] {
    return [];
  }

  getNoun(): Noun {
    return this.noun;
  }
  getBeliefs(): Belief[] {
    if (!this.description || !this.lore) {
      throw new Error('Region must have a description and lore');
    }
    const beliefs: Belief[] = [
      {
        subject: this.noun,
        name: `${this.name}'s description`,
        concept: 'description',
        description: this.description,
        trust: 0
      }
    ] as const;

    if (this.parent_region) {
      beliefs.push({
        subject: this.noun,
        name: `${this.name}'s parent region`,
        concept: 'region',
        description: `${this.name} is a part of ${this.parent_region.name}`,
        trust: 0,
        related_to: this.parent_region.getNoun()
      });
    }
    return beliefs;
  }
}
