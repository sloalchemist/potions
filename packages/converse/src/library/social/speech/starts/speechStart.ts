import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';

/**
 * Interface representing a speech start.
 */
export interface SpeechStart {
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[];
}
