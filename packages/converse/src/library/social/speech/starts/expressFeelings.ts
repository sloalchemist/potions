import { Belief, memoryService } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Represents a speech start that expresses feelings.
 */
export class ExpressFeelings implements SpeechStart {
  /**
   * Creates potential speech acts for expressing feelings.
   *
   * @param speaking - The speaker initiating the speech act.
   * @param listening - The listener of the speech act.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the speech act.
   */
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    const feelings: Belief[] = [];
    const feelings1 = memoryService.getBeliefRelatedTo(
      speaking.id,
      listening.id,
      'feeling'
    );

    if (feelings1 && !alreadyTraversed.includes(feelings1.id)) {
      feelings.push(feelings1);
    }

    const speechActs: SpeechPart[] = [];

    for (const feeling of feelings) {
      const expressFeelings = SpeechPart.buildStatement(
        'openness',
        speaking,
        listening,
        `says how they ${feeling.name}`,
        feeling
      );

      speechActs.push(expressFeelings);
    }

    return speechActs;
  }
}
