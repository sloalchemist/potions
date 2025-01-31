import { Speaker } from './speaker/speaker';
import { SpeechAct } from './speech/speechAct';

/**
 * Represents a turn in a conversation.
 */
export class Turn {
  mob: Speaker;
  speechAct: SpeechAct;

  /**
   * Creates a new Turn instance.
   * @param {Speaker} mob - The speaker taking the turn.
   * @param {SpeechAct} speechAct - The speech act performed during the turn.
   */
  constructor(mob: Speaker, speechAct: SpeechAct) {
    this.mob = mob;
    this.speechAct = speechAct;
  }

  /**
   * Gets the message of the turn.
   * @returns {string} The message of the turn.
   */
  getMessage(): string {
    return `${this.mob.name}: ${this.speechAct.getText()}`;
  }

  /**
   * Gets the speaker of the turn.
   * @returns {Speaker} The speaker of the turn.
   */
  getMob(): Speaker {
    return this.mob;
  }
}
