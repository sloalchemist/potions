import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

export class Compliment implements Tone {
  statement() {
    return 'compliments';
  }

  question() {
    return 'asks in a complimentry way';
  }

  valence(): number {
    return 1;
  }

  associatedTrait(): PersonalityTraits {
    return 'complimentary';
  }

  effect(): number {
    return 10;
  }
}
