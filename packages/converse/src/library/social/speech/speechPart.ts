import { Proposal } from '../desires/proposal';
import { Speaker } from '../speaker/speaker';
import { Tone } from './tones/tone';
import { neutralTone } from './tones/toneFactory';
import { PersonalityTraits } from '../personality';
import { Belief, Question } from '../memories/memoryService';

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

  static buildOffer(
    trait: PersonalityTraits,
    speaker: Speaker,
    listener: Speaker,
    prompt: string,
    offer: Proposal
  ) {
    return new SpeechPart(trait, speaker, listener, prompt, offer);
  }

  getMemoryConveyed(): Belief | undefined {
    return this.memoriesConveyed;
  }

  getQuestionOn(): Question | undefined {
    return this.questionOn;
  }

  setTone(tone: Tone) {
    this.tone = tone;
  }

  getTone(): Tone {
    return this.tone;
  }

  getBenefitToListener(): number {
    return this.memoriesConveyed ? 1 : 0 + this.tone.valence();
  }

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

  isMakingStatement(): boolean {
    return this.memoriesConveyed !== undefined;
  }

  isQuestion(): boolean {
    return this.questionOn !== undefined;
  }

  isGoodbye(): boolean {
    return (
      !this.isMakingStatement() &&
      !this.isQuestion() &&
      !this.isNegotiatingOffer()
    );
  }

  // Retrieve the speech text for use in conversation
  getPrompt(): string {
    return this.prompt;
  }

  isNegotiatingOffer(): boolean {
    return this.offer !== undefined;
  }

  getProposal(): Proposal | undefined {
    return this.offer;
  }
}
