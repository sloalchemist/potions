import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

const PROPOSALS_TO_EVALUATE = 5;

/**
 * Represents a response to offer more in a conversation.
 */
export class OfferMore implements SpeechResponse {
  /**
   * Creates potential speech responses for offering more.
   *
   * @param inResponseTo - The speech part being responded to.
   * @param speaking - The speaker offering more.
   * @param listening - The listener of the offer.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the offer response.
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
        const newProposal = proposal.mutateBetterForOther(speaking);
        if (!newProposal) {
          continue;
        }
        const value = newProposal.evaluate(speaking);

        // Check if proposal has already been searched
        if (alreadyTraversed.includes(newProposal.hash())) {
          //('Already evaluated proposal: ', newProposal.toString());
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
            `offers more to the deal: `,
            counterOffer
          )
        ];
      }
    }
    return [];
  }
}
