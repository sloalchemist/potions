import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

/**
 * Represents a compliment tone.
 */
export class Compliment implements Tone {
  /**
   * Returns the statement associated with the compliment tone.
   *
   * @returns The statement.
   */
  statement(): string {
    return 'compliments';
  }

  /**
   * Returns the question associated with the compliment tone.
   *
   * @returns The question.
   */
  question(): string {
    return 'asks in a complimentary way';
  }

  /**
   * Returns the valence of the compliment tone.
   * A positive valence indicates a positive tone.
   *
   * @returns The valence.
   */
  valence(): number {
    return 1;
  }

  /**
   * Returns the associated personality trait of the compliment tone.
   *
   * @returns The associated personality trait.
   */
  associatedTrait(): PersonalityTraits {
    return 'complimentary';
  }

  /**
   * Returns the effect value of the compliment tone.
   * The effect value indicates the strength of the tone's impact.
   *
   * @returns The effect value.
   */
  effect(): number {
    return 10;
  }
}
