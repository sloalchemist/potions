import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

/**
 * Represents a joking tone.
 */
export class Joking implements Tone {
  /**
   * Returns the statement associated with the joking tone.
   *
   * @returns The statement.
   */
  statement() {
    return 'jokes about';
  }

  /**
   * Returns the question associated with the joking tone.
   *
   * @returns The question.
   */
  question() {
    return 'jokingly asks';
  }

  /**
   * Returns the valence of the joking tone.
   * The valence is randomly determined to be positive or negative.
   *
   * @returns The valence.
   */
  valence(): number {
    return Math.random() - 0.5;
  }

  /**
   * Returns the associated personality trait of the joking tone.
   *
   * @returns The associated personality trait.
   */
  associatedTrait(): PersonalityTraits {
    return 'funny';
  }
}
