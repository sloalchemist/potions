import { Proposal } from '../desires/proposal';
import { Belief, memoryService } from '../memories/memoryService';
import { PersonalityTraits } from '../personality';
import { Speaker } from '../speaker/speaker';
import { SpeechPart } from './speechPart';
import { Tone } from './tones/tone';

/**
 * Represents a speech act in a conversation.
 */
export class SpeechAct {
  private readonly spokenBy: Speaker;
  private readonly spokenTo: Speaker;
  private readonly response?: SpeechPart;
  private readonly initiative: SpeechPart;

  private readonly proposal?: Proposal;
  private readonly value: number;

  private readonly memoriesConveyed: Belief[] = [];
  private readonly topics: string[] = [];
  private readonly context: Belief[];

  private readonly personalityTraitsUse: PersonalityTraits[] = [];

  private text?: string;

  constructor(
    spokenBy: Speaker,
    spokenTo: Speaker,
    initiative: SpeechPart,
    response: SpeechPart | undefined = undefined
  ) {
    this.spokenBy = spokenBy;
    this.spokenTo = spokenTo;
    this.initiative = initiative;
    this.response = response;

    this.proposal = this.initiative.getProposal();

    if (!this.proposal && this.response) {
      const proposal = this.response.getProposal();
      if (proposal) {
        this.proposal = proposal;
      }
    }
    this.value =
      this.initiative.value() +
      (this.response ? this.response.value() : 0) +
      Math.random() * this.spokenBy.personality.getTrait('immaturity');

    const memoriesConveyed = this.initiative.getMemoryConveyed();
    if (memoriesConveyed) {
      this.memoriesConveyed.push(memoriesConveyed);
    }
    const responseMemoriesConveyed = this.response
      ? this.response.getMemoryConveyed()
      : undefined;
    if (responseMemoriesConveyed) {
      this.memoriesConveyed.push(responseMemoriesConveyed);
    }

    this.topics.push(...this.memoriesConveyed.map((memory) => memory.id));
    const questionOn = this.initiative.getQuestionOn();
    if (questionOn) {
      this.topics.push(`${questionOn.concept_id}-${questionOn.noun_id}`);
    }
    const proposal = this.getProposal();
    if (proposal) {
      this.topics.push(proposal.hash());
    }

    this.context = this.initiative.context.concat(
      this.response ? this.response.context : []
    );
    this.context.push(...this.memoriesConveyed);

    if (this.initiative.personalityTraitsUsed) {
      this.personalityTraitsUse.push(this.initiative.personalityTraitsUsed);
    }
    if (this.response && this.response.personalityTraitsUsed) {
      this.personalityTraitsUse.push(this.response.personalityTraitsUsed);
    }
  }

  /**
   * Gets the initiative speech part.
   *
   * @returns The initiative speech part.
   */
  getInitiative(): SpeechPart {
    return this.initiative;
  }

  /**
   * Gets the proposal associated with the speech act.
   *
   * @returns The proposal, or undefined if none exists.
   */
  getProposal(): Proposal | undefined {
    return this.proposal;
  }

  /**
   * Checks if the speech act is a goodbye.
   *
   * @returns True if it is a goodbye, false otherwise.
   */
  isGoodbye(): boolean {
    return this.initiative.isGoodbye();
  }

  /**
   * Calculates the benefit to the listener.
   *
   * @returns The benefit to the listener.
   */
  benefitToListener(): number {
    return (
      this.initiative.getBenefitToListener() +
      (this.response ? this.response.getBenefitToListener() : 0)
    );
  }

  /**
   * Gets the value of the speech act.
   *
   * @returns The value of the speech act.
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Gets the context of the speech act.
   *
   * @returns The context of the speech act.
   */
  getContext(): Belief[] {
    return this.context;
  }

  /**
   * Sets the text of the speech act.
   *
   * @param text - The text to set.
   */
  setText(text: string) {
    this.text = text;
  }

  /**
   * Gets the text of the speech act.
   *
   * @returns The text of the speech act.
   */
  getText(): string {
    return this.text ? this.text : this.getPrompt();
  }

  /**
   * Gets the tones of the speech act.
   *
   * @returns The tones of the speech act.
   */
  getTones(): Tone[] {
    const tones: Tone[] = [];
    tones.push(this.initiative.getTone());
    if (this.response) {
      tones.push(this.response.getTone());
    }
    return tones;
  }

  /**
   * Applies the effects of the speech act.
   */
  doEffects() {
    this.spokenTo.relationships.listenTo(this.spokenBy, this);

    const memoriesConveyed = this.getMemoriesConveyed();

    const belief_ids = memoriesConveyed.map((belief) => belief.id);
    memoryService.addKnowledge(this.spokenTo.id, belief_ids);

    const proposal = this.getProposal();
    if (proposal) {
      if (proposal.accepted) {
        proposal.processAcceptance();
      }
    }
  }

  /**
   * Gets the personality traits used in the speech act.
   *
   * @returns The personality traits used.
   */
  getTraits(): PersonalityTraits[] {
    return this.personalityTraitsUse;
  }

  /**
   * Gets the topics of the speech act.
   *
   * @returns The topics of the speech act.
   */
  getTopics(): string[] {
    return this.topics;
  }

  /**
   * Gets the prompt of the speech act.
   *
   * @returns The prompt of the speech act.
   */
  getPrompt() {
    if (this.response) {
      return (
        this.response.getPrompt() + ', and then ' + this.initiative.getPrompt()
      );
    } else {
      return this.initiative.getPrompt();
    }
  }

  /**
   * Gets the memories conveyed in the speech act.
   *
   * @returns The memories conveyed.
   */
  getMemoriesConveyed(): Belief[] {
    return this.memoriesConveyed;
  }
}
