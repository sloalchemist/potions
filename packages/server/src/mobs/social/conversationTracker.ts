import { Speaker, SpeakerService } from '@rt-potion/converse';
import { Mob } from '../mob';
import {
  Conversation,
  DatabaseSpeaker,
  memoryService
} from '@rt-potion/converse';
import { pubSub } from '../../services/clientCommunication/pubsub';
import { calculateDistance } from '@rt-potion/common';
import { logger } from '../../util/Logger';

export class ConversationTracker implements SpeakerService {
  private responses: Record<string, string[]> = {};
  private conversations: Conversation[] = [];

  hasConversation(mob: Mob): boolean {
    return this.conversations.some((conversation) =>
      conversation
        .participants()
        .some((participant) => participant.id === mob.id)
    );
  }

  closeChat(mobKey: string, target: string): void {
    pubSub.closeChat(mobKey, target);
  }

  possibleResponses(speaker: Speaker, responses: string[]): void {
    this.responses[speaker.id] = responses;

    pubSub.playerResponses(speaker.id, responses);
  }

  speak(speaker: Speaker, response: string): void {
    pubSub.speak(speaker.id, response);
    logger.log(`Speaker ${speaker.name} says: ${response}`);
  }

  public startConversation(starter: Mob, responder: Mob) {
    if (starter.id === responder.id) {
      throw new Error('Cannot start conversation with self');
    }
    const speaker1 = DatabaseSpeaker.load(starter.id);
    const speaker2 = DatabaseSpeaker.load(responder.id);
    memoryService.observe(speaker1.id, speaker2.id);
    memoryService.observe(speaker2.id, speaker1.id);

    const conversation = new Conversation(speaker1, speaker2, false, this);
    this.conversations.push(conversation);

    conversation.prepareNextResponse();
  }

  private findConversation(mob: Mob): Conversation | undefined {
    return this.conversations.find((conversation) =>
      conversation
        .participants()
        .some((participant) => participant.id === mob.id)
    );
  }

  public addTurnFromOptions(player: Mob, option: number) {
    const response = this.responses[player.id];

    if (!response) {
      throw new Error(`No responses found for player ${player.id}`);
    }
    const conversation = this.findConversation(player);
    if (!conversation) {
      throw new Error(`No conversation found for player ${player.id}`);
    }

    conversation.selectFromOptions(option);
    pubSub.speak(player.id, response[option]);
    logger.log(`Speaker ${player.name} says: ${response}`);
  }

  private updateConversation(conversation: Conversation) {
    const mobs = conversation.participants();
    const mob1 = Mob.getMob(mobs[0].id);
    const mob2 = Mob.getMob(mobs[1].id);
    if (mob1 && mob2) {
      if (calculateDistance(mob1.position, mob2.position) <= 6) {
        conversation.prepareNextResponse();
        return;
      }
    }

    conversation.close();
  }

  public tick() {
    this.conversations = this.conversations.filter(
      (conversation) => !conversation.isFinished()
    );
    for (const conversation of this.conversations) {
      this.updateConversation(conversation);
    }
  }
}

export const conversationTracker = new ConversationTracker();
