import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

/**
 * Represents an insult tone.
 */
export class Insult implements Tone {
  /**
   * Returns the statement associated with the insult tone.
   * @returns {string} The statement.
   */
  statement(): string {
    return 'insults';
  }

  /**
   * Returns the question associated with the insult tone.
   * @returns {string} The question.
   */
  question(): string {
    return 'insultingly asks';
  }

  /**
   * Returns the valence of the insult tone.
   * A negative valence indicates a negative tone.
   * @returns {number} The valence.
   */
  valence(): number {
    return -1;
  }

  /**
   * Returns the associated personality trait of the insult tone.
   * @returns {PersonalityTraits} The associated personality trait.
   */
  associatedTrait(): PersonalityTraits {
    return 'insulting';
  }
}
