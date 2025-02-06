import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

export class Joking implements Tone {
  statement() {
    return 'jokes about';
  }

  question() {
    return 'jokingly asks';
  }

  valence(): number {
    return Math.random() - 0.5;
  }

  associatedTrait(): PersonalityTraits {
    return 'funny';
  }
}
