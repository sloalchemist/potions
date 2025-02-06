import { Speaker } from '../speaker/speaker';
import { SpeechPart } from './speechPart';
import { AcceptOffer } from './responses/acceptOffer';
import { Answer } from './responses/answer';
import { AskAbout } from './starts/askAbout';
import { CounterOffer } from './responses/counterOffer';
import { Gift } from './starts/gift';
import { Goodbye } from './starts/goodbye';
import { Gossip } from './starts/gossip';
import { TalkAbout } from './starts/talkAbout';
import { OfferMore } from './responses/offerMore';
import { React } from './responses/react';
import { RejectOffer } from './responses/rejectOffer';
import { RequestTribute } from './starts/requestTribute';
import { SpeechStart } from './starts/speechStart';
import { SpeechResponse } from './responses/speechResponse';
import { ExpressFeelings } from './starts/expressFeelings';
import { SpeechAct } from './speechAct';

/**
 * Factory for creating speech acts, starts, and responses.
 */
export class SpeechFactory {
  potentialSpeechStarts: SpeechStart[] = [];
  potentialSpeechResponses: SpeechResponse[] = [];

  constructor() {
    this.potentialSpeechStarts.push(new Goodbye());
    this.potentialSpeechStarts.push(new Gift());
    this.potentialSpeechStarts.push(new RequestTribute());
    this.potentialSpeechStarts.push(new AskAbout());
    this.potentialSpeechStarts.push(new Gossip());
    this.potentialSpeechStarts.push(new TalkAbout());
    this.potentialSpeechStarts.push(new ExpressFeelings());

    this.potentialSpeechResponses.push(new Answer());
    this.potentialSpeechResponses.push(new React());

    this.potentialSpeechResponses.push(new CounterOffer());
    this.potentialSpeechResponses.push(new OfferMore());
    this.potentialSpeechResponses.push(new AcceptOffer());
    this.potentialSpeechResponses.push(new RejectOffer());
  }

  /**
   * Creates potential speech starts.
   *
   * @param speaking - The speaker initiating the speech act.
   * @param listening - The listener of the speech act.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the speech act.
   */
  static createPotentialSpeechStarts(
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    let speechActs: SpeechPart[] = [];

    for (const speech of this.instance.potentialSpeechStarts) {
      speechActs = speechActs.concat(
        speech.createPotentialSpeechAct(speaking, listening, alreadyTraversed)
      );
    }
    return speechActs;
  }

  /**
   * Creates potential speech responses.
   *
   * @param inResponseTo - The speech part being responded to.
   * @param speaking - The speaker making the response.
   * @param listening - The listener of the response.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech parts for the response.
   */
  static createPotentialSpeechResponses(
    inResponseTo: SpeechPart,
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechPart[] {
    let speechActs: SpeechPart[] = [];

    for (const speech of this.instance.potentialSpeechResponses) {
      speechActs = speechActs.concat(
        speech.createPotentialSpeechResponse(
          inResponseTo,
          speaking,
          listening,
          alreadyTraversed
        )
      );
    }
    return speechActs;
  }

  /**
   * Creates potential speech acts.
   *
   * @param inResponseTo - The speech part being responded to, or null if initiating.
   * @param speaking - The speaker initiating or responding.
   * @param listening - The listener of the speech act.
   * @param alreadyTraversed - The list of already traversed topics.
   * @returns The potential speech acts.
   */
  static createPotentialSpeechActs(
    inResponseTo: SpeechPart | null,
    speaking: Speaker,
    listening: Speaker,
    alreadyTraversed: string[]
  ): SpeechAct[] {
    const potentialSpeechActs = SpeechFactory.createPotentialSpeechStarts(
      speaking,
      listening,
      alreadyTraversed
    );
    if (potentialSpeechActs.length === 0) {
      throw new Error('No potential speech acts found');
    }
    if (inResponseTo) {
      const potentialSpeechResponses =
        SpeechFactory.createPotentialSpeechResponses(
          inResponseTo,
          speaking,
          listening,
          alreadyTraversed
        );
      const speechCombos: SpeechAct[] = [];
      if (potentialSpeechResponses.length === 0) {
        return potentialSpeechActs.map(
          (start) => new SpeechAct(speaking, listening, start)
        );
      }
      for (const response of potentialSpeechResponses) {
        if (response.canBeChained) {
          for (const start of potentialSpeechActs) {
            speechCombos.push(
              new SpeechAct(speaking, listening, start, response)
            );
          }
        } else {
          speechCombos.push(new SpeechAct(speaking, listening, response));
        }
      }
      return speechCombos;
    } else {
      return potentialSpeechActs.map(
        (start) => new SpeechAct(speaking, listening, start)
      );
    }
  }

  static instance = new SpeechFactory();
}
