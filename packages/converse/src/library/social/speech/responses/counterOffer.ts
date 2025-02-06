import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

const PROPOSALS_TO_EVALUATE = 5;

/**
 * Represents a response to make a counter offer in a conversation.
 */
export class CounterOffer implements SpeechResponse {
  /**
   * Creates potential speech responses for making a counter offer.
   *
   * @param inResponseTo - The speech part being responded to.
   * @param speaking - The speaker making the counter offer.
   * @param listening - The listener of the counter offer.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the counter offer response.
   */
  createPotentialSpeechResponse(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    if (!inResponseTo) {
      return [];
    }

    if (inResponseTo.isNegotiatingOffer()) {
      const proposal = inResponseTo.getProposal();
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      let bestProposalValue = 0;
      let counterOffer = null;
      for (let i = 0; i < PROPOSALS_TO_EVALUATE; i++) {
        const newProposal = proposal.mutateBetterForMe(speaking);
        if (!newProposal) {
          continue;
        }
        const value = newProposal.evaluate(speaking);

        if (alreadyTraversed.includes(newProposal.hash())) {
          continue;
        }
        if (value > bestProposalValue) {
          bestProposalValue = value;
          counterOffer = newProposal;
        }
      }
      if (counterOffer) {
        return [
          SpeechPart.buildOffer(
            'negotiator',
            speaking,
            listening,
            `counters with ${counterOffer.latestChange}`,
            counterOffer
          )
        ];
      }
    }
    return [];
  }
}
