import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

export class Goodbye implements SpeechStart {
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    return [new SpeechPart('neutral', speaking, listening, `say goodbye.`)];
  }
}
