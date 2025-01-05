import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Community } from './community';
import { Graphable } from './graphable';
import { Person } from './person';

export class Eventy implements Graphable {
  public readonly name: string;
  public readonly type: string;
  public readonly time: string;
  public readonly description: string;
  public readonly community: Community;
  public readonly peopleInvolved: Person[];
  private readonly noun: Noun;

  constructor(
    name: string,
    type: string,
    time: string,
    description: string,
    community: Community,
    peopleInvolved: Person[]
  ) {
    this.name = name;
    this.type = type;
    this.time = time;
    this.description = description;
    this.community = community;
    this.peopleInvolved = peopleInvolved;
    this.noun = { name: this.name, type: 'event' };
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
        name: `${this.name}'s community`,
        concept: 'community',
        description: `${this.name} is in ${this.community.name}`,
        trust: 0
      }
    ];
  }
}
