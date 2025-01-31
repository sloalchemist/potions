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

/**
 * Enum representing the state of a conversation.
 * @enum {number}
 */
enum ConversationState {
  PROCESSING,
  WAITING_FOR_RESPONSE,
  FINISHED
}

/**
 * Represents a conversation between two speakers.
 */
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

  /**
   * Creates a new Conversation instance.
   * @param {Speaker} initiator - The speaker who initiates the conversation.
   * @param {Speaker} respondent - The speaker who responds to the conversation.
   * @param {SpeakerService} speakerService - The service managing speakers.
   * @param {boolean} usesLLM - Whether the conversation uses a large language model.
   */
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

  /**
   * Returns the participants of the conversation.
   * @returns {Speaker[]} An array containing the initiator and respondent.
   */
  public participants(): Speaker[] {
    return [this.initiator, this.respondent];
  }

  /**
   * Prepares the next response in the conversation.
   */
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

  /**
   * Selects a speech option from the available options.
   * @param {number} option - The index of the selected option.
   * @returns {SpeechAct} The selected speech act.
   * @throws Will throw an error if the option is invalid.
   */
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
  /**
   * Closes the conversation.
   */
  close(): void {
    this.finishConversation();
  }

  /**
   * Checks if the conversation is finished.
   * @returns {boolean} True if the conversation is finished, false otherwise.
   */
  isFinished(): boolean {
    return this.state === ConversationState.FINISHED;
  }

  /**
   * Gets the chat history as a single string.
   * @returns {string} The chat history.
   */
  getChats(): string {
    return this.chatHistory
      .map((turn) => turn.getMessage())
      .filter((message) => message.trim() !== '')
      .join('\n');
  }

  /**
   * Prepares the next response for an NPC.
   * @param {Speaker} npc - The NPC speaker.
   * @private
   */
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

  /**
   * Prepares the next response for a player.
   * @param {Speaker} player - The player speaker.
   * @private
   */
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

  /**
   * Gets the other participant in the conversation.
   * @param {Speaker} person - The current speaker.
   * @returns {Speaker} The other speaker.
   * @private
   */
  private other(person: Speaker): Speaker {
    return this.initiator === person ? this.respondent : this.initiator;
  }

  /**
   * Gets the last speech act in the conversation.
   * @returns {SpeechAct | null} The last speech act, or null if there is none.
   * @private
   */
  private lastSpeechAct(): SpeechAct | null {
    const lastTurn = this.chatHistory[this.chatHistory.length - 1];
    if (lastTurn) {
      return lastTurn.speechAct;
    }
    return null;
  }

  /**
   * Selects the top N highest value speech acts.
   * @param {SpeechAct[]} speechActs - The array of speech acts to select from.
   * @param {number} n - The number of speech acts to select.
   * @returns {SpeechAct[]} The selected speech acts.
   * @private
   */
  private selectNHighestValueSpeechAct(
    speechActs: SpeechAct[],
    n: number
  ): SpeechAct[] {
    const sortedSpeechActs = speechActs.sort(
      (a, b) => b.getValue() - a.getValue()
    );
    return sortedSpeechActs.slice(0, n);
  }

  /**
   * Generates the next speech act for the current speaker.
   * @param {Speaker} currentSpeaker - The current speaker.
   * @returns {SpeechAct} The generated speech act.
   * @private
   */
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

  /**
   * Determines whose turn it is in the conversation.
   * @returns {Speaker} The speaker whose turn it is.
   * @private
   */
  private whoseTurn(): Speaker {
    return this.chatHistory.length % 2 === 0 ? this.initiator : this.respondent;
  }

  /**
   * Gets the potential speech acts for the current speaker.
   * @param {Speaker} currentSpeaker - The current speaker.
   * @returns {SpeechAct[]} The potential speech acts.
   * @private
   */
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

  /**
   * Summarizes the conversation between two speakers.
   * @param {Speaker} subject - The subject speaker.
   * @param {Speaker} other - The other speaker.
   * @private
   */
  private summarize(subject: Speaker, other: Speaker): void {
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

  /**
   * Finishes the conversation.
   * @private
   */
  private finishConversation(): void {
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

  /**
   * Adds a turn to the conversation.
   * @param {Speaker} participant - The participant of the turn.
   * @param {SpeechAct} speechAct - The speech act of the turn.
   * @private
   */
  private addTurn(participant: Speaker, speechAct: SpeechAct): void {
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

  /**
   * Adds traits to the list of traits used by a speaker.
   * @param {Speaker} speaker - The speaker.
   * @param {PersonalityTraits[]} traits - The traits to add.
   * @private
   */
  private addToTraitsUsed(speaker: Speaker, traits: PersonalityTraits[]): void {
    for (const trait of traits) {
      if (!this.personalityTraitsUsed[speaker.id].includes(trait)) {
        this.personalityTraitsUsed[speaker.id].push(trait);
      }
    }
  }
}
