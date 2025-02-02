import { DB } from '../../services/database';
import { Mob } from '../mob';

export enum PersonalityTraits {
  Stubbornness = 'stubbornness',
  Bravery = 'bravery',
  Aggression = 'aggression',
  Industriousness = 'industriousness',
  Adventurousness = 'adventurousness',
  Gluttony = 'gluttony',
  Sleepy = 'sleepy',
  Extroversion = 'extroversion'
}

export interface PersonalityData {
  mob_id: string;
  stubbornness: number;
  bravery: number;
  aggression: number;
  industriousness: number;
  adventurousness: number;
  gluttony: number;
  sleepy: number;
  extroversion: number;
}

export type Personalities = {
  mob_id: string;
  stubbornness: number;
  bravery: number;
  aggression: number;
  industriousness: number;
  adventurousness: number;
  gluttony: number;
  sleepy: number;
  extroversion: number;
};

export class Personality {
  traits: Record<PersonalityTraits, number>;

  static loadPersonality(npc: Mob): Personality {
    const personality = DB.prepare(
      `
            SELECT
            stubbornness,
            bravery,
            aggression,
            industriousness,
            adventurousness,
            gluttony,
            sleepy,
            extroversion
            FROM personalities
            WHERE mob_id = :id
            `
    ).get({ id: npc.id }) as PersonalityData;

    return new Personality(personality);
  }

  constructor(data: PersonalityData) {
    this.traits = {
      [PersonalityTraits.Stubbornness]: data.stubbornness, // How likely the NPC is to change actions
      [PersonalityTraits.Bravery]: data.bravery, // How likely the NPC is to flee
      [PersonalityTraits.Aggression]: data.aggression, // How likely the NPC is to attack another
      [PersonalityTraits.Industriousness]: data.industriousness, // How likely to engage in productive activity
      [PersonalityTraits.Adventurousness]: data.adventurousness, // How likely to engage in wandering
      [PersonalityTraits.Gluttony]: data.gluttony, // How likely to eat
      [PersonalityTraits.Sleepy]: data.sleepy, // How likely to sleep
      [PersonalityTraits.Extroversion]: data.extroversion // How likely to engage in social activity
    };
  }

  static SQL = `
        CREATE TABLE personalities (
            mob_id TEXT PRIMARY KEY,
            stubbornness REAL NOT NULL,
            bravery REAL NOT NULL,
            aggression REAL NOT NULL,
            industriousness REAL NOT NULL,
            adventurousness REAL NOT NULL,
            gluttony REAL NOT NULL,
            sleepy REAL NOT NULL,
            extroversion REAL NOT NULL,
            FOREIGN KEY (mob_id) REFERENCES mobs (id) ON DELETE CASCADE
        );
    `;
}
