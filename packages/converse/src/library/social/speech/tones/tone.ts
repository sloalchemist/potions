import { PersonalityTraits } from '../../personality';

/**
 * Interface representing a tone.
 */
export interface Tone {
  question(): string;
  statement(): string;
  valence(): number;
  associatedTrait(): PersonalityTraits;
}
