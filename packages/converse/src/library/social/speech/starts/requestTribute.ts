import { Proposal } from '../../desires/proposal';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

export class RequestTribute implements SpeechStart {
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    const initialRequest = new Proposal(speaking, listening);

    if (initialRequest.addRandomBenefit(speaking, speaking)) {
      if (alreadyTraversed.includes(initialRequest.hash())) {
        return [];
      }
      //const askForSomething = new SpeechAct(this.initiator, `Hello ${this.respondent.name}, ${initialProposal.prompt()}`, 'offer', initialProposal);
      const offer = SpeechPart.buildOffer(
        'demanding',
        speaking,
        listening,
        `${initialRequest.prompt()}`,
        initialRequest
      );
      return [offer];
      // const justChat = new SpeechAct(this.initiator, `Hello ${this.respondent.name}, tell me about yourself.`, 'chat');
    }

    return [];
  }
}
