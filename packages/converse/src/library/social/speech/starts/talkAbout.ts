import { Belief, memoryService } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Represents a speech start when talking about a topic.
 */
export class TalkAbout implements SpeechStart {
  /**
   * Creates potential speech acts for talking about a topic.
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
    const thingsToTalkAbout: Belief[] = [];

    const talkAboutListener = memoryService.findFactAbout(
      speaking.id,
      listening.id
    );

    if (talkAboutListener && !alreadyTraversed.includes(talkAboutListener.id)) {
      thingsToTalkAbout.push(talkAboutListener);
    }
    const lastLearned = memoryService.getLastLearned(speaking.id);
    if (lastLearned) {
      const talkAboutLastLearned = memoryService.findFactAbout(
        speaking.id,
        lastLearned.id
      );
      if (
        talkAboutLastLearned &&
        !alreadyTraversed.includes(talkAboutLastLearned.id)
      ) {
        thingsToTalkAbout.push(talkAboutLastLearned);
      }
    }

    const speechActs: SpeechPart[] = [];
    for (const thingToTalkAbout of thingsToTalkAbout) {
      const tone = speaking.relationships.selectTone(listening)[0];

      const talkAbout = SpeechPart.buildStatement(
        tone.associatedTrait(),
        speaking,
        listening,
        `${tone.statement()} ${thingToTalkAbout.name}`,
        thingToTalkAbout
      );
      talkAbout.setTone(tone);

      speechActs.push(talkAbout);
    }

    return speechActs;
  }
}
