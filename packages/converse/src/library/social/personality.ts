import { DB } from '../database';
import { memoryService } from './memories/memoryService';
import { Speaker } from './speaker/speaker';

// Replace the enum with a string union type
export type PersonalityTraits =
  | 'immaturity'
  | 'curiosity'
  | 'chitChatter'
  | 'openness'
  | 'complimentary'
  | 'insulting'
  | 'funny'
  | 'neutral'
  | 'helpfulness'
  | 'extroversion'
  | 'generous'
  | 'demanding'
  | 'negotiator';

export class Personality {
  me: Speaker;

  getTrait(trait: PersonalityTraits): number {
    const traitSQL = DB.prepare(
      `SELECT ${trait} FROM personality WHERE noun_id = ?`
    ).get(this.me.id) as { [id: string]: number };
    return traitSQL[trait];
  }

  normalizeTraits() {
    // Get all traits except 'immaturity' for normalization
    const traits = [
      'curiosity',
      'chitChatter',
      'openness',
      'complimentary',
      'insulting',
      'funny',
      'neutral',
      'helpfulness',
      'extroversion',
      'generous',
      'demanding',
      'negotiator'
    ] as const satisfies PersonalityTraits[];

    const traitsSQL = traits
      .map((trait) => `${trait} = ${trait} / (SELECT sum_val FROM total)`)
      .join(', ');

    const sql = `
            WITH total AS (
                SELECT (${traits.map((trait) => `${trait}`).join(' + ')}) AS sum_val
                FROM personality
                WHERE noun_id = :me_id
            )
            UPDATE personality
            SET ${traitsSQL}, immaturity = immaturity * 0.9
            WHERE noun_id = :me_id
        `;

    DB.prepare(sql).run({ me_id: this.me.id });
  }

  static traitsEverUsed: PersonalityTraits[] = [];

  reinforceTraits(traits: PersonalityTraits[]) {
    if (traits.length === 0) {
      return;
    }
    for (const trait of traits) {
      if (!Personality.traitsEverUsed.includes(trait)) {
        Personality.traitsEverUsed.push(trait);
      }
    }

    // Construct the part of the SQL that increments each trait by 0.1
    const increments = traits
      .map((trait) => `${trait} = ${trait} + immaturity`)
      .join(', ');

    // Add the immaturity multiplication to the end of the SET clause
    const sql = `
            UPDATE personality
            SET ${increments}, immaturity = immaturity * 0.9
            WHERE noun_id = :me_id
        `;

    DB.prepare(sql).run({ me_id: this.me.id });
    this.normalizeTraits();
  }

  description() {
    return memoryService.getBeliefAbout(this.me.id, 'personality').description;
  }

  constructor(me: Speaker) {
    this.me = me;

    // Get all traits dynamically from the type union
    const traits = [
      'immaturity',
      'curiosity',
      'chitChatter',
      'openness',
      'complimentary',
      'insulting',
      'funny',
      'neutral',
      'helpfulness',
      'extroversion',
      'generous',
      'demanding',
      'negotiator'
    ] as const satisfies PersonalityTraits[];
    const columns = traits.join(', ');
    const placeholders = traits.map((trait) => `:${trait}`).join(', ');

    const personalitySQL = DB.prepare(`
            INSERT OR IGNORE INTO personality (noun_id, ${columns})
            VALUES (:noun_id, ${placeholders})
        `);

    // Initialize all traits to a default value (e.g., 5), except 'immaturity' which is set to 100
    const defaultValues = traits.reduce(
      (acc, trait) => {
        acc[trait] = trait === 'immaturity' ? 100 : 5;
        return acc;
      },
      {} as { [key: string]: number }
    );

    personalitySQL.run({ noun_id: me.id, ...defaultValues });

    this.normalizeTraits();
  }
}
