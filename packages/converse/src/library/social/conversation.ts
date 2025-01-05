import { dialogService } from './prompts/promptService';
import {
  buildPromptForSpeech,
  buildPromptsForResponses,
  parseMultiResponse,
  parseResponse,
  summarizeConversation
} from './prompts/promptBuilder';
import { Speaker } from './speaker/speaker';
import { SpeechFactory } from './speech/speechFactory';
import { Turn } from './turn';
import { PersonalityTraits } from './personality';
import { SpeechAct } from './speech/speechAct';
import { SpeakerService } from './speaker/speakerService';

enum ConversationState {
  PROCESSING,
  WAITING_FOR_RESPONSE,
  FINISHED
}

export class Conversation {
  private readonly initiator: Speaker;
  private readonly respondent: Speaker;
  private readonly speakerService: SpeakerService;

  private chatHistory: Turn[] = [];

  private readonly usesLLM: boolean;

  private speechOptions: SpeechAct[] = [];

  private topicsCovered: string[] = [];
  private personalityTraitsUsed: Record<string, PersonalityTraits[]> = {};

  private state: ConversationState = ConversationState.WAITING_FOR_RESPONSE;

  constructor(
    initator: Speaker,
    respondent: Speaker,
    usesLLM: boolean = false,
    speakerService: SpeakerService
  ) {
    if (initator.conversation !== null || respondent.conversation !== null) {
      throw new Error(
        `Mob already in conversation ${JSON.stringify(respondent.conversation)}`
      );
    }

    this.initiator = initator;
    this.respondent = respondent;
    this.usesLLM = usesLLM;
    this.initiator.relationships.introduce(this.respondent);
    this.respondent.relationships.introduce(this.initiator);
    this.personalityTraitsUsed[initator.id] = [];
    this.personalityTraitsUsed[respondent.id] = [];
    this.speakerService = speakerService;

    this.initiator.conversation = this;
    this.respondent.conversation = this;
  }

  public participants(): Speaker[] {
    return [this.initiator, this.respondent];
  }

  prepareNextResponse() {
    const mob = this.whoseTurn();

    if (this.state !== ConversationState.WAITING_FOR_RESPONSE) {
      return;
    }
    this.state = ConversationState.PROCESSING;

    if (mob.type === 'player') {
      this.preparePlayerResponse(mob);
    } else {
      this.prepareNPCResponse(mob);
    }
  }

  selectFromOptions(option: number): SpeechAct {
    const speechAct = this.speechOptions[option];
    if (!speechAct) {
      throw new Error(
        `Invalid option: ${option} from ${this.speechOptions.length}`
      );
    }
    this.addTurn(this.whoseTurn(), speechAct);

    return this.speechOptions[option];
  }

  close(): void {
    this.finishConversation();
  }

  isFinished(): boolean {
    return this.state === ConversationState.FINISHED;
  }

  getChats(): string {
    return this.chatHistory
      .map((turn) => turn.getMessage())
      .filter((message) => message.trim() !== '')
      .join('\n');
  }

  private prepareNPCResponse(npc: Speaker): void {
    const speechAct = this.generateSpeechAct(npc);
    if (speechAct == null) {
      throw Error('No speech act found');
    }

    if (this.usesLLM) {
      const prompt = buildPromptForSpeech(npc, this.other(npc), speechAct);

      dialogService.sendPrompt(
        [prompt],
        (data) => {
          if (data.length !== 1) {
            throw new Error('Expected one response');
          }
          const response = parseResponse(data[0], npc.name);
          if (response) {
            speechAct.setText(response);
            this.addTurn(npc, speechAct);
            this.speakerService.speak(npc, response);
          }
        },
        (error) => {
          // Handle any errors that occurred during the promise execution
          console.error(error);
        }
      );
    } else {
      this.addTurn(npc, speechAct);
      this.speakerService.speak(npc, speechAct.getPrompt());
    }
  }

  private preparePlayerResponse(player: Speaker): void {
    this.speechOptions = this.getPotentialSpeechActs(player);
    const prompts = buildPromptsForResponses(
      player,
      this.other(player),
      this.speechOptions
    );

    if (this.usesLLM) {
      dialogService.sendPrompt(
        prompts,
        (data) => {
          const responses = parseMultiResponse(data, player.name);

          if (responses.length === prompts.length) {
            for (let i = 0; i < responses.length; i++) {
              this.speechOptions[i].setText(responses[i]);
            }
            this.speakerService.possibleResponses(
              player,
              responses.slice(0, prompts.length)
            );
          } else {
            console.error(
              'Invalid number of responses',
              responses.length,
              prompts.length
            );
          }
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      this.speakerService.possibleResponses(
        player,
        this.speechOptions.map((option) => option.getPrompt())
      );
    }
  }

  private other(person: Speaker): Speaker {
    return this.initiator === person ? this.respondent : this.initiator;
  }

  private lastSpeechAct(): SpeechAct | null {
    const lastTurn = this.chatHistory[this.chatHistory.length - 1];
    if (lastTurn) {
      return lastTurn.speechAct;
    }
    return null;
  }

  private selectNHighestValueSpeechAct(
    speechActs: SpeechAct[],
    n: number
  ): SpeechAct[] {
    const sortedSpeechActs = speechActs.sort(
      (a, b) => b.getValue() - a.getValue()
    );
    return sortedSpeechActs.slice(0, n);
  }

  private generateSpeechAct(currentSpeaker: Speaker): SpeechAct {
    const lastAct = this.lastSpeechAct();
    const lastInitiative = lastAct ? lastAct.getInitiative() : null;

    const potentialSpeechActs = SpeechFactory.createPotentialSpeechActs(
      lastInitiative,
      currentSpeaker,
      this.other(currentSpeaker),
      this.topicsCovered
    );
    const nextAct = this.selectNHighestValueSpeechAct(
      potentialSpeechActs,
      1
    )[0];
    return nextAct;
  }

  private whoseTurn(): Speaker {
    return this.chatHistory.length % 2 === 0 ? this.initiator : this.respondent;
  }

  private getPotentialSpeechActs(currentSpeaker: Speaker): SpeechAct[] {
    const lastAct = this.lastSpeechAct();
    const lastInitiative = lastAct ? lastAct.getInitiative() : null;

    const potentialSpeechActs = SpeechFactory.createPotentialSpeechActs(
      lastInitiative,
      currentSpeaker,
      this.other(currentSpeaker),
      this.topicsCovered
    );

    return this.selectNHighestValueSpeechAct(potentialSpeechActs, 3);
  }

  private summarize(subject: Speaker, other: Speaker) {
    const prompt = summarizeConversation(subject, other);
    dialogService.sendPrompt(
      [prompt],
      (data) => {
        if (data.length !== 1) {
          throw new Error('Expected one response');
        }
        const response = parseResponse(data[0], '');
        subject.relationships.updateConversationSummary(other, response);
      },
      (error) => {
        // Handle any errors that occurred during the promise execution
        console.error(error);
      }
    );
  }

  private finishConversation() {
    if (this.state === ConversationState.FINISHED) {
      return;
    }

    this.speakerService.closeChat(this.respondent.id, this.initiator.id);
    this.speakerService.closeChat(this.initiator.id, this.respondent.id);

    if (this.usesLLM) {
      this.summarize(this.initiator, this.respondent);
      this.summarize(this.respondent, this.initiator);
    }

    this.initiator.personality.reinforceTraits(
      this.personalityTraitsUsed[this.initiator.id]
    );
    this.respondent.personality.reinforceTraits(
      this.personalityTraitsUsed[this.respondent.id]
    );

    this.initiator.conversation = null;
    this.respondent.conversation = null;

    this.state = ConversationState.FINISHED;
  }

  private addTurn(participant: Speaker, speechAct: SpeechAct) {
    this.chatHistory.push(new Turn(participant, speechAct));
    this.addToTraitsUsed(participant, speechAct.getTraits());
    this.topicsCovered.push(...speechAct.getTopics());
    speechAct.doEffects();

    if (speechAct.isGoodbye()) {
      this.finishConversation();
    } else {
      this.state = ConversationState.WAITING_FOR_RESPONSE;
    }
  }

  private addToTraitsUsed(speaker: Speaker, traits: PersonalityTraits[]) {
    for (const trait of traits) {
      if (!this.personalityTraitsUsed[speaker.id].includes(trait)) {
        this.personalityTraitsUsed[speaker.id].push(trait);
      }
    }
  }
}
