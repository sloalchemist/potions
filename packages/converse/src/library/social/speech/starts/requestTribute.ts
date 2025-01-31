import { Proposal } from '../../desires/proposal';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Represents a speech start when requesting a tribute.
 */
export class RequestTribute implements SpeechStart {
  /**
   * Creates potential speech acts for requesting a tribute.
   * @param {Speaker} speaking - The speaker initiating the speech act.
   * @param {Speaker} listening - The listener of the speech act.
   * @param {string[]} alreadyTraversed - The list of already traversed topics.
   * @returns {SpeechPart[]} The potential speech parts for the speech act.
   */
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    const initialRequest = new Proposal(speaking, listening);

    if (initialRequest.addRandomBenefit(speaking, speaking)) {
      if (alreadyTraversed.includes(initialRequest.hash())) {
        return [];
      }
      const offer = SpeechPart.buildOffer(
        'demanding',
        speaking,
        listening,
        `${initialRequest.prompt()}`,
        initialRequest
      );
      return [offer];
    }

    return [];
  }
}
