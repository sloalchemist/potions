import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

/**
 * Represents a response to accept an offer in a conversation.
 */
export class AcceptOffer implements SpeechResponse {
  /**
   * Creates potential speech responses for accepting an offer.
   *
   * @param inResponseTo - The speech part being responded to.
   * @param speaking - The speaker accepting the offer.
   * @param listening - The listener of the acceptance.
   * @param _alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the acceptance response.
   */
  createPotentialSpeechResponse(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    if (inResponseTo === null) {
      return [];
    }
    if (inResponseTo.isNegotiatingOffer()) {
      const proposal = inResponseTo.getProposal();
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      const acceptedOffer = proposal.clone();

      acceptedOffer.accepted = true;
      const speechAct = SpeechPart.buildOffer(
        'neutral',
        speaking,
        listening,
        `accepts ${listening.name}'s offer`,
        acceptedOffer
      );
      speechAct.canBeChained = true;
      return [speechAct];
    }
    return [];
  }
}
