import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';

export interface SpeechStart {
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[];
}
