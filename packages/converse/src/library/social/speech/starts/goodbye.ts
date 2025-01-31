import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Represents a speech start when saying goodbye.
 */
export class Goodbye implements SpeechStart {
  /**
   * Creates potential speech acts for saying goodbye.
   * @param {Speaker} speaking - The speaker initiating the speech act.
   * @param {Speaker} listening - The listener of the speech act.
   * @param {string[]} _alreadyTraversed - The list of already traversed topics.
   * @returns {SpeechPart[]} The potential speech parts for the speech act.
   */
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    return [new SpeechPart('neutral', speaking, listening, `say goodbye.`)];
  }
}
