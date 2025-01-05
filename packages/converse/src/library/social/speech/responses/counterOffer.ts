import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

const PROPOSALS_TO_EVALUATE = 5;

export class CounterOffer implements SpeechResponse {
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
