import { Belief, memoryService } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

export class TalkAbout implements SpeechStart {
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
