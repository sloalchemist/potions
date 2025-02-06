import { memoryService } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

export class Answer implements SpeechResponse {
  createPotentialSpeechResponse(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    const questionOn = inResponseTo.getQuestionOn();
    if (inResponseTo === null || !inResponseTo.isQuestion() || !questionOn) {
      return [];
    }

    const answer = memoryService.findAnswer(
      speaking.id,
      listening.id,
      questionOn
    );

    if (!answer) {
      const speechAct = new SpeechPart(
        'neutral',
        speaking,
        listening,
        `I don't know the answer to your question`
      );
      speechAct.canBeChained = true;
      return [speechAct];
    }

    const speechActs: SpeechPart[] = [];

    const dontTrust = new SpeechPart(
      'neutral',
      speaking,
      listening,
      `I don't trust you enough to tell you`
    );
    dontTrust.canBeChained = true;
    speechActs.push(dontTrust);

    const chatResponse = `say ${answer.description}`;

    const speechAct = SpeechPart.buildStatement(
      'helpfulness',
      speaking,
      listening,
      chatResponse,
      answer
    );
    speechAct.canBeChained = true;

    speechActs.push(speechAct);

    return speechActs;
  }
}
