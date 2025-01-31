import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

/**
 * Represents a neutral tone.
 */
export class Neutral implements Tone {
  /**
   * Returns the statement associated with the neutral tone.
   *
   * @returns The statement.
   */
  statement() {
    return 'tells';
  }

  /**
   * Returns the question associated with the neutral tone.
   *
   * @returns The question.
   */
  question() {
    return 'asks';
  }

  /**
   * Returns the valence of the neutral tone.
   * A valence of 0 indicates a neutral tone.
   *
   * @returns The valence.
   */
  valence(): number {
    return 0;
  }

  /**
   * Returns the associated personality trait of the neutral tone.
   *
   * @returns The associated personality trait.
   */
  associatedTrait(): PersonalityTraits {
    return 'neutral';
  }
}
