import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

const PROPOSALS_TO_EVALUATE = 5;

export class OfferMore implements SpeechResponse {
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
