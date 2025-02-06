import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Graphable } from './graphable';
import { Region } from './region';

export class Community implements Graphable {
  id: string;
  name: string;
  description: string;
  region: Region;
  lore?: string[];
  noun: Noun;

  constructor(
    id: string,
    name: string,
    description: string,
    region: Region,
    lore?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.region = region;
    this.lore = lore;
    this.noun = { id: id, name: this.name, type: 'community' };

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
    if (!this.lore) {
      throw new Error('Community must have a description and region');
    }
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
        concept: 'region',
        description: `${this.name} is in ${this.region.name}`,
        related_to: this.region.getNoun(),
        trust: 0
      }
    ];
  }
  /*
    export interface Belief {
    subject: Noun,
    related_to: Noun,
    concept: Concept,
    name: string,
    description: string,
    trust: number
}*/
  /*
    build(): KnowledgeGraph {


        for (const lore of this.lore) {
            connections.push({ "source": `community_${this.id}`, "target": lore });
        }

        return { "facts": facts, "connections": connections };
    }*/
}
