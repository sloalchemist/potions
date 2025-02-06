import { memoryService, Question } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

function replaceSubject(input: string, replacement: string): string {
  // Replace all occurrences of "<subject>" with the replacement string
  return input.replace(/<subject>/g, replacement);
}

export class AskAbout implements SpeechStart {
  createPotentialSpeechAct(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    const questions: Question[] = [];
    const questionRelatedToListener = memoryService.getQuestionAbout(
      speaking.id,
      listening.id,
      listening.id
    );
    if (questionRelatedToListener) {
      questions.push(questionRelatedToListener);
    }
    const lastLearned = memoryService.getLastLearned(speaking.id);
    if (lastLearned) {
      const questionRelatedToLastLearned = memoryService.getQuestionAbout(
        speaking.id,
        listening.id,
        lastLearned.id
      );
      if (questionRelatedToLastLearned) {
        questions.push(questionRelatedToLastLearned);
      }
    }

    const goalTarget = speaking.goal.getGoalTarget();
    if (goalTarget) {
      const questionRelatedToGoal = memoryService.getQuestionAbout(
        speaking.id,
        listening.id,
        goalTarget
      );
      if (questionRelatedToGoal) {
        questions.push(questionRelatedToGoal);
      }
    }

    const speechActs: SpeechPart[] = [];

    for (const question of questions) {
      const topic = `${question.concept_id}-${question.noun_id}`;

      if (alreadyTraversed.includes(topic)) {
        return [];
      }

      let subject = question.name;
      if (question.noun_id === listening.id) {
        subject = 'you';
      }

      const tone = speaking.relationships.selectTone(listening)[0];

      const askAboutMob = SpeechPart.buildQuestion(
        'curiosity',
        speaking,
        listening,
        `asks ${replaceSubject(question.as_question, subject)}`,
        question
      );

      askAboutMob.setTone(tone);

      speechActs.push(askAboutMob);
      //}
    }

    return speechActs;
  }
}
