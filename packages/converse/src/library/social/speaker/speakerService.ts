import { Speaker } from './speaker';

/**
 * Interface representing the speaker service.
 */
export interface SpeakerService {
  closeChat(mobKey: string, target: string): void;

  possibleResponses(speaker: Speaker, responses: string[]): void;
  speak(speaker: Speaker, response: string): void;
}
