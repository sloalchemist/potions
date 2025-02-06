import { Proposal } from '../../desires/proposal';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

export class Gift implements SpeechStart {
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
      //const askForSomething = new SpeechAct(this.initiator, `Hello ${this.respondent.name}, ${initialProposal.prompt()}`, 'offer', initialProposal);
      const offerGift = SpeechPart.buildOffer(
        'generous',
        speaking,
        listening,
        `${initialGift.prompt()}`,
        initialGift
      );
      return [offerGift];
      // const justChat = new SpeechAct(this.initiator, `Hello ${this.respondent.name}, tell me about yourself.`, 'chat');
    }

    return [];
  }
}
