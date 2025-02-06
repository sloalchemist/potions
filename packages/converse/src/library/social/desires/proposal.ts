import { Speaker } from '../speaker/speaker';
import { Item } from '../speaker/item';

export class Offer {
  item: Item;
  quantity: number;
  value: Record<string, number> = {};

  constructor(item: Item, quantity: number, value: Record<string, number>) {
    this.item = item;
    this.quantity = quantity;
    this.value = value;
  }

  evaluate(mob: Speaker): number {
    return this.value[mob.id];
  }

  equals(other: Offer): boolean {
    return this.item.id === other.item.id && this.quantity === other.quantity;
  }

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

  constructor(initiator: Speaker, respondent: Speaker) {
    this.initiator = initiator;
    this.respondent = respondent;
  }

  reject() {
    this.rejected = true;
  }

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

  hash(): string {
    return `${this.initiator.id}-${this.respondent.id}-${Array.from(
      this.initiatorOffers
    )
      .map((offer) => offer.item.id)
      .join('-')}-${Array.from(this.respondentOffers)
      .map((offer) => offer.item.id)
      .join('-')}`;
  }

  evaluate(evaluator: Speaker): number {
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

  private other(mob: Speaker): Speaker {
    return mob === this.initiator ? this.respondent : this.initiator;
  }

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

  clone(): Proposal {
    const clone = new Proposal(this.initiator, this.respondent);
    clone.initiatorOffers = new Set(this.initiatorOffers);
    clone.respondentOffers = new Set(this.respondentOffers);
    return clone;
  }

  equals(other: Proposal): boolean {
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

  addInitialAsk(item: Item, quantity: number) {
    this.respondentOffers.add(
      new Offer(item, quantity, {
        [this.initiator.id]: this.initiator.benefitOf(item, quantity),
        [this.respondent.id]: this.respondent.benefitOf(item, quantity)
      })
    );
  }

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

  toString(): string {
    return `Offers: ${JSON.stringify(Array.from(this.initiatorOffers))} 
        Offers: ${JSON.stringify(Array.from(this.respondentOffers))}`;
  }
}
