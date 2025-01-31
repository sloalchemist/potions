import { memoryService } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Represents a speech start when gossiping.
 */
export class Gossip implements SpeechStart {
  /**
   * Creates potential speech acts for gossiping.
   * @param {Speaker} speaking - The speaker initiating the speech act.
   * @param {Speaker} listening - The listener of the speech act.
   * @param {string[]} _alreadyTraversed - The list of already traversed topics.
   * @returns {SpeechPart[]} The potential speech parts for the speech act.
   */
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
