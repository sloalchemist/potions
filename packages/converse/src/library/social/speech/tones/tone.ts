import { PersonalityTraits } from '../../personality';

export interface Tone {
  question(): string;
  statement(): string;
  valence(): number;
  associatedTrait(): PersonalityTraits;
}
