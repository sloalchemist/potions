import { Proposal } from '../../desires/proposal';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Represents a speech start when offering a gift.
 */
export class Gift implements SpeechStart {
  /**
   * Creates potential speech acts for offering a gift.
   *
   * @param speaking - The speaker initiating the speech act.
   * @param listening - The listener of the speech act.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the speech act.
   */
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    const initialGift = new Proposal(speaking, listening);

    if (initialGift.addRandomBenefit(listening, speaking)) {
      if (alreadyTraversed.includes(initialGift.hash())) {
        return [];
      }
      const offerGift = SpeechPart.buildOffer(
        'generous',
        speaking,
        listening,
        `${initialGift.prompt()}`,
        initialGift
      );
      return [offerGift];
    }

    return [];
  }
}
