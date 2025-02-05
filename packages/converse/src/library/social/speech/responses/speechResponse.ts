import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';

/**
 * Interface representing a speech response.
 */
export interface SpeechResponse {
  createPotentialSpeechResponse(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[];
}
