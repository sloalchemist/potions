import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

/**
 * Represents a response to reject an offer in a conversation.
 */
export class RejectOffer implements SpeechResponse {
  /**
   * Creates potential speech responses for rejecting an offer.
   *
   * @param inResponseTo - The speech part being responded to.
   * @param speaking - The speaker rejecting the offer.
   * @param listening - The listener of the rejection.
   * @param _alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the rejection response.
   */
  createPotentialSpeechResponse(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    if (!inResponseTo) {
      return [];
    }
    if (inResponseTo.isNegotiatingOffer()) {
      const proposal = inResponseTo.getProposal();
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      const rejectedOffer = proposal.clone();
      rejectedOffer.reject();
      return [
        new SpeechPart(
          'neutral',
          speaking,
          listening,
          `rejects ${listening.name}'s offer`,
          rejectedOffer
        )
      ];
    }
    return [];
  }
}
