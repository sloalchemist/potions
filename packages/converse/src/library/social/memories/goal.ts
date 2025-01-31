// Attribute to increase
// Goal condition achieved

import { DB } from '../../database';
import { Speaker } from '../speaker/speaker';

// Have some goal that they come to you wanting a particular effect from a potion

// Goals are increase attribute on a particular relationship to a certain level or to get self to a certain value.

// Identify certain goal.

export class Goal {
  owner: Speaker;

  /**
   * Initializes a new Goal instance for the specified owner.
   * Prepares a goal by randomly selecting an interest_id from
   * the 'nouns' table and inserting it into the 'goals' table
   * if it does not already exist for the given owner.
   *
   * @param owner - The Speaker who owns this goal.
   */
  constructor(owner: Speaker) {
    this.owner = owner;

    DB.prepare(
      `
            INSERT OR IGNORE INTO  goals (noun_id, interest_id)
            SELECT :mob_key, id
            FROM nouns where type = 'person' and id <> :mob_key
            ORDER BY random()
            LIMIT 1
        `
    ).run({ mob_key: owner.id });

    // Add goal to beliefs?
  }

  /**
   * Returns the id of the person this mob is interested in for their current goal.
   * @returns the id of the person, or undefined if no goal exists.
   */
  getGoalTarget(): string | undefined {
    // Specify the parameter type and inline type for the returned row
    const stmt = DB.prepare<{ mob_key: string }, { interest_id: string }>(`
            SELECT interest_id
            FROM goals
            WHERE noun_id = :mob_key
        `);

    // Execute the query and safely access the interest_id
    const result = stmt.get({ mob_key: this.owner.id });

    return result?.interest_id;
  }

  // Increase affinity with a particular person
  // Inrease affinity with a particular group
  // Decrease affinity of group towards person
  // Increase gold - adventurers
}
