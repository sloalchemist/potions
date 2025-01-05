import { memoryService } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

export class Gossip implements SpeechStart {
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    _alreadyTraversed: string[]
  ): SpeechPart[] {
    const event = memoryService.getRandomMemoryGap(
      speaking.id,
      listening.id,
      'event'
    );

    if (event) {
      if (speaking.relationships.getAffinity(listening) >= event.trust) {
        const tone = speaking.relationships.selectTone(listening)[0];
        const gossip = SpeechPart.buildStatement(
          'extroversion',
          speaking,
          listening,
          `${tone.statement()} ${listening.name} about ${event.name}`,
          event
        );
        gossip.setTone(tone);

        return [gossip];
      }
    }

    return [];
  }
}
