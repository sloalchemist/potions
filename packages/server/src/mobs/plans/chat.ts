import { Plan } from './plan';
import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { conversationTracker } from '../social/conversationTracker';

export class Chat implements Plan {
  startConversationWith?: Mob;

  execute(npc: Mob): boolean {
    if (this.startConversationWith !== undefined) {
      conversationTracker.startConversation(npc, this.startConversationWith);
    }
    npc.needs.changeNeed('energy', 5);
    npc.needs.changeNeed('social', 20);
    npc.setMoveTarget(npc.position);
    if (npc.needs.getNeed('social') >= 100) {
      return true;
    }

    return false;
  }

  utility(npc: Mob): number {
    if (!npc.position) {
      return -Infinity;
    }

    const inConversation = conversationTracker.hasConversation(npc);
    const bonusForInConversation = inConversation ? 1000 : 0; // TODO: Replace with just using stubbornness
    if (!inConversation) {
      const nearbyMobIDs = npc.findNearbyMobIDs(6);

      for (const mobID of nearbyMobIDs) {
        const mob = Mob.getMob(mobID)!;
        if (!conversationTracker.hasConversation(mob)) {
          this.startConversationWith = mob;
          break;
        }
      }
    }

    const utilityLevel =
      ((100 - npc.needs.getNeed('social')) / 100) *
        npc.personality.traits[PersonalityTraits.Extroversion] +
      bonusForInConversation;

    if (inConversation || this.startConversationWith !== undefined) {
      return utilityLevel;
    } else {
      return -Infinity;
    }
  }

  description(): string {
    return `saying hi`;
  }

  reaction(): string {
    return `Let's talk!`;
  }

  type(): string {
    return 'chat';
  }
}
