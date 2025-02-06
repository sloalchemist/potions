import { Proposal } from '../desires/proposal';
import { Speaker } from '../speaker/speaker';
import { Tone } from './tones/tone';
import { neutralTone } from './tones/toneFactory';
import { PersonalityTraits } from '../personality';
import { Belief, Question } from '../memories/memoryService';

/**
 * Represents a part of a speech in a conversation.
 */
export class SpeechPart {
  private prompt: string;

  private offer?: Proposal;
  private questionOn?: Question;
  private memoriesConveyed?: Belief;

  private speaker: Speaker;
  private listener: Speaker;

  private tone: Tone = neutralTone;

  context: Belief[] = [];
  memoriesReferenced: Belief[] = [];

  personalityTraitsUsed: PersonalityTraits;
  private finished: boolean = false;
  canBeChained: boolean = false;

  /**
   * Constructs a SpeechPart instance.
   *
   * @param trait - The personality trait used in the speech part.
   * @param speaker - The speaker of the speech part.
   * @param listener - The listener of the speech part.
   * @param prompt - The prompt text of the speech part.
   * @param offer - The proposal associated with the speech part, if any.
   */
  constructor(
    trait: PersonalityTraits,
    speaker: Speaker,
    listener: Speaker,
    prompt: string,
    offer?: Proposal
  ) {
    this.personalityTraitsUsed = trait;
    this.prompt = prompt;
    this.offer = offer;
    this.speaker = speaker;
    this.listener = listener;
  }

  /**
   * Builds a question speech part.
   *
   * @param trait - The personality trait used in the speech part.
   * @param speaker - The speaker of the speech part.
   * @param listener - The listener of the speech part.
   * @param prompt - The prompt text of the speech part.
   * @param question - The question associated with the speech part.
   * @returns The constructed question speech part.
   */
  static buildQuestion(
    trait: PersonalityTraits,
    speaker: Speaker,
    listener: Speaker,
    prompt: string,
    question: Question
  ) {
    const speech = new SpeechPart(trait, speaker, listener, prompt);
    speech.questionOn = question;
    return speech;
  }

  /**
   * Builds a statement speech part.
   *
   * @param trait - The personality trait used in the speech part.
   * @param speaker - The speaker of the speech part.
   * @param listener - The listener of the speech part.
   * @param prompt - The prompt text of the speech part.
   * @param belief - The belief associated with the speech part.
   * @returns The constructed statement speech part.
   */
  static buildStatement(
    trait: PersonalityTraits,
    speaker: Speaker,
    listener: Speaker,
    prompt: string,
    belief: Belief
  ) {
    const speech = new SpeechPart(trait, speaker, listener, prompt);
    speech.memoriesConveyed = belief;
    return speech;
  }

  /**
   * Builds an offer speech part.
   *
   * @param trait - The personality trait used in the speech part.
   * @param speaker - The speaker of the speech part.
   * @param listener - The listener of the speech part.
   * @param prompt - The prompt text of the speech part.
   * @param offer - The proposal associated with the speech part.
   * @returns The constructed offer speech part.
   */
  static buildOffer(
    trait: PersonalityTraits,
    speaker: Speaker,
    listener: Speaker,
    prompt: string,
    offer: Proposal
  ) {
    return new SpeechPart(trait, speaker, listener, prompt, offer);
  }

  /**
   * Gets the memory conveyed in the speech part.
   *
   * @returns The memory conveyed, or undefined if none exists.
   */
  getMemoryConveyed(): Belief | undefined {
    return this.memoriesConveyed;
  }

  /**
   * Gets the question associated with the speech part.
   *
   * @returns The question, or undefined if none exists.
   */
  getQuestionOn(): Question | undefined {
    return this.questionOn;
  }

  /**
   * Sets the tone of the speech part.
   *
   * @param tone - The tone to set.
   */
  setTone(tone: Tone) {
    this.tone = tone;
  }

  /**
   * Gets the tone of the speech part.
   *
   * @returns The tone of the speech part.
   */
  getTone(): Tone {
    return this.tone;
  }

  /**
   * Gets the benefit to the listener of the speech part.
   *
   * @returns The benefit to the listener.
   */
  getBenefitToListener(): number {
    return this.memoriesConveyed ? 1 : 0 + this.tone.valence();
  }

  /**
   * Calculates the value of the speech part.
   *
   * @returns The value of the speech part.
   */
  value(): number {
    let value = 0;
    const affinityWith = this.speaker.relationships.getAffinity(this.listener);
    if (this.personalityTraitsUsed !== 'neutral') {
      value += this.speaker.personality.getTrait(this.personalityTraitsUsed);
    }

    if (this.isNegotiatingOffer()) {
      value += this.offer!.evaluate(this.speaker);
    }

    if (this.speaker.goal.getGoalTarget() === this.listener.id) {
      value += this.getBenefitToListener();
    }

    if (this.memoriesConveyed) {
      value += affinityWith;
      value -= this.memoriesConveyed.trust;
    }

    if (this.offer) {
      value += this.offer.evaluate(this.speaker);
    }

    return value;
  }

  /**
   * Checks if the speech part is making a statement.
   *
   * @returns True if making a statement, false otherwise.
   */
  isMakingStatement(): boolean {
    return this.memoriesConveyed !== undefined;
  }

  /**
   * Checks if the speech part is a question.
   *
   * @returns True if it is a question, false otherwise.
   */
  isQuestion(): boolean {
    return this.questionOn !== undefined;
  }

  /**
   * Checks if the speech part is a goodbye.
   *
   * @returns True if it is a goodbye, false otherwise.
   */
  isGoodbye(): boolean {
    return (
      !this.isMakingStatement() &&
      !this.isQuestion() &&
      !this.isNegotiatingOffer()
    );
  }

  /**
   * Gets the prompt text of the speech part.
   *
   * @returns The prompt text.
   */
  getPrompt(): string {
    return this.prompt;
  }

  /**
   * Checks if the speech part is negotiating an offer.
   *
   * @returns True if negotiating an offer, false otherwise.
   */
  isNegotiatingOffer(): boolean {
    return this.offer !== undefined;
  }

  /**
   * Gets the proposal associated with the speech part.
   *
   * @returns The proposal, or undefined if none exists.
   */
  getProposal(): Proposal | undefined {
    return this.offer;
  }
}
