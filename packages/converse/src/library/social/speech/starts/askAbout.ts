import { memoryService, Question } from '../../memories/memoryService';
import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechStart } from './speechStart';

/**
 * Replaces all occurrences of "<subject>" in the input string with the replacement string.
 *
 * @param input - The input string containing "<subject>" placeholders.
 * @param replacement - The string to replace "<subject>" with.
 * @returns The modified string.
 */
function replaceSubject(input: string, replacement: string): string {
  return input.replace(/<subject>/g, replacement);
}

/**
 * Represents aspeech start that asks about something.
 */
export class AskAbout implements SpeechStart {
  /**
   * Creates potential speech acts for asking about a topic.
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
