import { Speaker } from '../speaker/speaker';
import { Item } from '../speaker/item';

export class Offer {
  item: Item;
  quantity: number;
  value: Record<string, number> = {};

  /**
   * Constructs an instance of the Offer class.
   *
   * @param item - The item being offered.
   * @param quantity - The quantity of the item being offered.
   * @param value - A record mapping speaker IDs to the value they associate with the offer.
   */
  constructor(item: Item, quantity: number, value: Record<string, number>) {
    this.item = item;
    this.quantity = quantity;
    this.value = value;
  }

  /**
   * Evaluates the offer for the given mob by returning the value associated with the mob's ID.
   *
   * @param mob - The speaker for whom the offer is being evaluated.
   * @returns The numerical value of the offer for the specified mob.
   */
  evaluate(mob: Speaker): number {
    return this.value[mob.id];
  }

  /**
   * Compares two offers by their item and quantity. Returns true if both items and quantities are equal, false otherwise.
   *
   * @param other - The offer to compare with.
   * @returns True if the offers are equal, false otherwise.
   */
  equals(other: Offer): boolean {
    return this.item.id === other.item.id && this.quantity === other.quantity;
  }

  /**
   * Generates a string representation of the offer suitable for display to the user.
   *
   * @returns A string representation of the offer.
   */
  prompt(): string {
    return `${this.quantity} ${this.item.name}`;
  }
}

export class Proposal {
  initiatorOffers = new Set<Offer>();
  respondentOffers = new Set<Offer>();

  initiator: Speaker;
  respondent: Speaker;

  accepted = false;
  rejected = false;
  latestChange: string = '';

  /**
   * Constructs an instance of the Proposal class.
   *
   * @param initiator - The speaker making the proposal.
   * @param respondent - The speaker to whom the proposal is being made.
   */
  constructor(initiator: Speaker, respondent: Speaker) {
    this.initiator = initiator;
    this.respondent = respondent;
  }

  /**
   * Rejects the proposal.
   *
   * This can be used to mark the proposal as failed. It is typically invoked
   * after a negotiation has failed.
   */
  reject() {
    this.rejected = true;
  }

  /**
   * Processes the acceptance of a proposal by creating obligations.
   *
   * Converts the offers from both the initiator and respondent into obligations
   * that each party must fulfill within a specified time frame. The obligations
   * are established for each offer by the respective parties.
   */
  processAcceptance() {
    // turn proposal into obligations
    const timeToComplete = 60 * 2; // 60 seconds to complete

    for (const offer of this.initiatorOffers) {
      this.initiator.obligations.obligate(
        this.respondent,
        offer.quantity,
        offer.item,
        timeToComplete
      );
    }
    for (const offer of this.respondentOffers) {
      this.respondent.obligations.obligate(
        this.initiator,
        offer.quantity,
        offer.item,
        timeToComplete
      );
    }
  }

  /**
   * Generates a unique hash string for the proposal.
   *
   * The hash is composed of the initiator's ID, the respondent's ID, and the IDs
   * of the items in both the initiator's and respondent's offers. This provides
   * a unique identifier for the proposal based on the involved parties and items.
   *
   * @returns A string representing the unique hash of the proposal.
   */
  hash(): string {
    return `${this.initiator.id}-${this.respondent.id}-${Array.from(
      this.initiatorOffers
    )
      .map((offer) => offer.item.id)
      .join('-')}-${Array.from(this.respondentOffers)
      .map((offer) => offer.item.id)
      .join('-')}`;
  }

  /**
   * Evaluates the proposal for the given speaker by calculating the difference between their offers and the offers of the other speaker.
   *
   * The evaluation is done by summing the values of all the offers made by the given speaker, and then subtracting the sum of the values of all the offers made by the other speaker.
   *
   * @param evaluator - The speaker for whom the proposal is being evaluated.
   * @returns The numerical value of the proposal for the specified speaker.
   */
  evaluate(evaluator: Speaker): number {
    /**
     * Calculates the total value of a set of offers for a given evaluator.
     *
     * @param offers - The set of offers to evaluate.
     * @returns The total value of the offers for the evaluator.
     */
    const evaluate = (offers: Set<Offer>) =>
      Array.from(offers).reduce(
        (sum, offer) => sum + offer.evaluate(evaluator),
        0
      );

    if (evaluator === this.respondent) {
      return evaluate(this.initiatorOffers) - evaluate(this.respondentOffers);
    } else {
      return evaluate(this.respondentOffers) - evaluate(this.initiatorOffers);
    }
  }

  /**
   * Returns the speaker that is not the given mob.
   *
   * If the given mob is the initiator, this method returns the respondent.
   * If the given mob is the respondent, this method returns the initiator.
   *
   * @param mob - The speaker to check.
   * @returns The other speaker.
   */
  private other(mob: Speaker): Speaker {
    return mob === this.initiator ? this.respondent : this.initiator;
  }

  /**
   * Returns true if the proposal has substance, i.e. if it has offers that are not the same on both sides.
   *
   * A proposal is considered to have substance if it has at least one offer that is not the same on both sides, i.e. if the initiator and the respondent have different items being offered.
   *
   * If the proposal has no offers, or if all the offers are the same on both sides, this method returns false.
   *
   * @returns true if the proposal has substance, false otherwise.
   */
  hasSubtance(): boolean {
    // Reject if offer has the same items on both sides
    for (const offer of this.initiatorOffers) {
      for (const otherOffer of this.respondentOffers) {
        if (offer.item.id === otherOffer.item.id) {
          return false;
        }
      }
    }

    return this.initiatorOffers.size > 0 || this.respondentOffers.size > 0;
  }

  /**
   * Returns a deep copy of the proposal.
   *
   * @returns a new Proposal that is a deep copy of the current proposal.
   */
  clone(): Proposal {
    const clone = new Proposal(this.initiator, this.respondent);
    clone.initiatorOffers = new Set(this.initiatorOffers);
    clone.respondentOffers = new Set(this.respondentOffers);
    return clone;
  }

  /**
   * Compares this proposal with another proposal to determine if they are equal.
   *
   * Two proposals are considered equal if they have the same initiator and respondent,
   * and if the sets of offers from both the initiator and respondent are identical.
   *
   * @param other - The proposal to compare with.
   * @returns True if the proposals are equal, false otherwise.
   */
  equals(other: Proposal): boolean {
    /**
     * Checks if two sets of offers contain the same elements.
     *
     * Two sets of offers are considered the same if they have the same size
     * and every offer in the first set has an equivalent offer in the second set.
     *
     * @param setA - The first set of offers to compare.
     * @param setB - The second set of offers to compare.
     * @returns True if the two sets contain the same offers, false otherwise.
     */
    const hasSameOffers = (setA: Set<Offer>, setB: Set<Offer>) =>
      setA.size === setB.size &&
      Array.from(setA).every((offerA) =>
        Array.from(setB).some((offerB) => offerA.equals(offerB))
      );

    return (
      hasSameOffers(this.initiatorOffers, other.initiatorOffers) &&
      hasSameOffers(this.respondentOffers, other.respondentOffers) &&
      this.initiator === other.initiator &&
      this.respondent === other.respondent
    );
  }

  /**
   * Adds an initial ask to the proposal, from the respondent to the initiator.
   * The benefit of the offer for both the initiator and respondent is calculated
   * automatically.
   *
   * @param item - The item to be offered.
   * @param quantity - The quantity of the item to be offered.
   */
  addInitialAsk(item: Item, quantity: number) {
    this.respondentOffers.add(
      new Offer(item, quantity, {
        [this.initiator.id]: this.initiator.benefitOf(item, quantity),
        [this.respondent.id]: this.respondent.benefitOf(item, quantity)
      })
    );
  }

  /**
   * Adds a random benefit to the proposal, from the benefiter to the giver, of
   * at least the given minimum value.
   *
   * If the benefiter has a desire for an item that is already being offered,
   * the quantity of the offer is increased by one.
   *
   * Otherwise, a new offer is added to the proposal, with a quantity of one.
   *
   * The benefit of the offer for both the benefiter and the giver is calculated
   * automatically.
   *
   * @param benefiter - The speaker to whom the benefit is being added.
   * @param giver - The speaker who is giving the benefit.
   * @param minimumValue - The minimum value of the benefit to be added.
   * @returns True if a benefit was added, false otherwise.
   */
  addRandomBenefit(
    benefiter: Speaker,
    giver: Speaker,
    minimumValue: number = 0
  ): boolean {
    const theirOffer =
      benefiter === this.initiator
        ? this.respondentOffers
        : this.initiatorOffers;
    const desire = benefiter.findRandomDesire(
      giver,
      this.other(benefiter),
      minimumValue
    );

    if (desire) {
      for (const offer of theirOffer) {
        if (offer.item.id === desire.desired.id) {
          this.latestChange = `Added to quantity of ${desire.desired.name} offer`;
          return true;
        }
      }

      const value: Record<string, number> = {};
      value[benefiter.id] = desire.benefit;
      const otherParty =
        benefiter === this.initiator ? this.respondent : this.initiator;
      value[otherParty.id] = otherParty.benefitOf(desire.desired, 1);

      theirOffer.add(new Offer(desire.desired, 1, value));

      this.latestChange = `I want a ${desire.desired.name} to be added to the deal.`;
      return true;
    }

    return false;
  }

  /**
   * Randomly mutates a proposal to be better for the other party.
   *
   * With 30% chance, takes away a random item from the other party's side.
   * With 30% chance, adds a random desire to the other party's side.
   * If the proposal is unchanged or has no substance, returns null.
   *
   * @param mutator - The speaker to mutate the proposal for.
   * @returns The mutated proposal or null if no change was made.
   */
  mutateBetterForOther(mutator: Speaker): Proposal | null {
    const newProposal = this.clone();
    // either take away something from my side or add something to your side
    const random = Math.random();
    if (random < 0.3) {
      // take away something from their side
      const myOffer =
        mutator === this.initiator
          ? newProposal.respondentOffers
          : newProposal.initiatorOffers;
      if (myOffer.size > 0) {
        const offerArray = Array.from(myOffer);
        const randomIndex = Math.floor(Math.random() * offerArray.length);
        myOffer.delete(offerArray[randomIndex]);
      }
    } else if (random < 0.6) {
      // add something to my side
      newProposal.addRandomBenefit(this.other(mutator), mutator);
    }

    if (newProposal.equals(this) || !newProposal.hasSubtance()) {
      return null;
    }

    return newProposal;
  }

  /**
   * Randomly mutates a proposal to be more favorable for the mutator.
   *
   * With 50% chance, removes a random item from the mutator's side of the proposal.
   * Otherwise, adds a random benefit to the other party's side.
   * If the mutated proposal is unchanged or lacks substance, returns null.
   *
   * @param mutator - The speaker for whom the proposal is being mutated.
   * @returns The mutated proposal or null if no change was made.
   */
  mutateBetterForMe(mutator: Speaker): Proposal | null {
    const newProposal = this.clone();
    // either take away something from my side or add something to your side
    const random = Math.random();
    if (random < 0.5) {
      // take away something from my side
      const myOffer =
        mutator === this.initiator
          ? newProposal.initiatorOffers
          : newProposal.respondentOffers;
      if (myOffer.size > 0) {
        const offerArray = Array.from(myOffer);
        const randomIndex = Math.floor(Math.random() * offerArray.length);
        myOffer.delete(offerArray[randomIndex]);
      }
    } else {
      // add something to other side
      newProposal.addRandomBenefit(mutator, mutator);
    }

    if (newProposal.equals(this) || !newProposal.hasSubtance()) {
      return null;
    }

    return newProposal;
  }

  /**
   * Builds a prompt string from the proposal.
   *
   * The prompt will be in one of three forms:
   * 1. I demand [list of things] from you.
   * 2. I offer [list of things] to you as a gift.
   * 3. I offer [list of things] in exchange for you giving me [list of things].
   *
   * @returns The prompt string
   */
  prompt(): string {
    let prompt = '';

    if (this.initiatorOffers.size === 0) {
      prompt = `I demand ${Array.from(this.respondentOffers)
        .map((offer) => offer.prompt())
        .join(', ')} from you.`;
    } else if (this.respondentOffers.size === 0) {
      prompt = `I offer ${Array.from(this.initiatorOffers)
        .map((offer) => offer.prompt())
        .join(', ')} to you as a gift.`;
    } else {
      prompt = `I offer ${Array.from(this.initiatorOffers)
        .map((offer) => offer.prompt())
        .join(', ')} in exchange for you giving me ${Array.from(
        this.respondentOffers
      )
        .map((offer) => offer.prompt())
        .join(', ')}.`;
    }

    return prompt;
  }

  /**
   * A string representation of the proposal.
   *
   * The string will have the form "Offers: [...initiator offers...], Offers: [...respondent offers...]"
   * where each offer is a JSON string.
   *
   * @returns A string representation of the proposal.
   */
  toString(): string {
    return `Offers: ${JSON.stringify(Array.from(this.initiatorOffers))} 
        Offers: ${JSON.stringify(Array.from(this.respondentOffers))}`;
  }
}
