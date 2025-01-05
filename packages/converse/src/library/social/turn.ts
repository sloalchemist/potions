import { Speaker } from './speaker/speaker';
import { SpeechAct } from './speech/speechAct';

export class Turn {
  mob: Speaker;
  speechAct: SpeechAct;

  constructor(mob: Speaker, speechAct: SpeechAct) {
    this.mob = mob;
    this.speechAct = speechAct;
  }

  getMessage(): string {
    return `${this.mob.name}: ${this.speechAct.getText()}`;
  }

  getMob(): Speaker {
    return this.mob;
  }
}
