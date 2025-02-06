import { PersonalityTraits } from '../../personality';
import { Tone } from './tone';

export class Insult implements Tone {
  statement() {
    return 'insults';
  }

  question() {
    return 'insultingly asks';
  }

  valence(): number {
    return -1;
  }

  associatedTrait(): PersonalityTraits {
    return 'insulting';
  }
}
