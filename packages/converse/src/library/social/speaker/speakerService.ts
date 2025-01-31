import { Speaker } from './speaker';

/**
 * Interface representing the speaker service.
 */
export interface SpeakerService {
  /**
   * Closes the chat between the specified mob and target.
   * @param {string} mobKey - The key of the mob.
   * @param {string} target - The target to close the chat with.
   */
  closeChat(mobKey: string, target: string): void;

  /**
   * Provides possible responses for the speaker.
   * @param {Speaker} speaker - The speaker instance.
   * @param {string[]} responses - The possible responses.
   */
  possibleResponses(speaker: Speaker, responses: string[]): void;

  /**
   * Makes the speaker say the given response.
   * @param {Speaker} speaker - The speaker instance.
   * @param {string} response - The response to say.
   */
  speak(speaker: Speaker, response: string): void;
}
