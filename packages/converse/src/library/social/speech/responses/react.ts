import { Speaker } from '../../speaker/speaker';
import { SpeechPart } from '../speechPart';
import { SpeechResponse } from './speechResponse';

/**
 * Represents a response to react to a statement in a conversation.
 */
export class React implements SpeechResponse {
  /**
   * Creates potential speech responses for reacting to a statement.
   *
   * @param inResponseTo - The speech part being responded to.
   * @param speaking - The speaker reacting to the statement.
   * @param listening - The listener of the reaction.
   * @param _alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the reaction response.
   */
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
