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

/**
 * Represents the personality of a speaker.
 */
export class Personality {
  me: Speaker;

  /**
   * Creates a new Personality instance.
   *
   * @param me - The speaker whose personality is being managed.
   */
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

  /**
   * Gets the value of the specified personality trait for the speaker from the database.
   *
   * @param trait - The trait to get the value of.
   * @returns The value of the trait.
   */
  getTrait(trait: PersonalityTraits): number {
    const traitSQL = DB.prepare(
      `SELECT ${trait} FROM personality WHERE noun_id = ?`
    ).get(this.me.id) as { [id: string]: number };
    return traitSQL[trait];
  }

  /**
   * Normalizes the values of the personality traits.
   *
   * This method adjusts the values of all personality traits (except 'immaturity')
   * so that their sum equals 1. The 'immaturity' trait is reduced by 10% in each normalization.
   */
  normalizeTraits(): void {
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

  /**
   * Increases the values of the specified personality traits for the speaker.
   *
   * The 'immaturity' trait is reduced by 10% in each reinforcement.
   *
   * @param traits - The traits to reinforce.
   */
  reinforceTraits(traits: PersonalityTraits[]): void {
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

  /**
   * Gets the description of the speaker's personality.
   *
   * @returns The description of the personality.
   */
  description(): string {
    return memoryService.getBeliefAbout(this.me.id, 'personality').description;
  }
}
