import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

export class AcceptOffer implements SpeechResponse {
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
