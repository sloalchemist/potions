import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

export class Neutral implements Tone {
  statement() {
    return 'tells';
  }

  question() {
    return 'asks';
  }

  valence(): number {
    return 0;
  }

  associatedTrait(): PersonalityTraits {
    return 'neutral';
  }
}
