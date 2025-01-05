import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

export class RejectOffer implements SpeechResponse {
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
