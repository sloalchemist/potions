import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

export class React implements SpeechResponse {
  createPotentialSpeechResponse(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    const memory = inResponseTo.getMemoryConveyed();
    if (inResponseTo === null || !inResponseTo.isMakingStatement() || !memory) {
      return [];
    }

    const speechActs: SpeechPart[] = [];

    const tones = speaking.relationships.selectTone(listening).slice(0, 2);

    for (const tone of tones) {
      const react = new SpeechPart(
        tone.associatedTrait(),
        speaking,
        listening,
        `${tone.statement()} ${listening.name}'s comment about ${memory.name}`
      );
      react.canBeChained = true;
      react.context.push(memory);

      speechActs.push(react);
    }

    return speechActs;
  }
}
