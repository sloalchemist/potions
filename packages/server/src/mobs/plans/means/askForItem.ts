import { Conversation } from '@rt-potion/converse';
import { Mob } from '../../mob';
import { Means } from '../planMeans';
import { calculateDistance } from '@rt-potion/common';
//import { Coord } from '@rt-potion/common';

export class AskForItem implements Means {
  mobWithItem: Mob | null = null;
  carriedItemType: string | null = null;
  itemTypes: string[];
  conversation: Conversation | null = null;

  constructor(item_types: string[]) {
    this.itemTypes = item_types;
  }

  execute(_npc: Mob): boolean {
    return false;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }
    if (this.conversation) {
      return 0;
    }

    const nearbyMobs = npc.findNearbyMobIDs(npc.visionDistance);

    for (const mobID of nearbyMobs) {
      const mob = Mob.getMob(mobID)!;
      if (mob.carrying) {
        const carriedItem = mob.carrying;
        if (carriedItem && this.itemTypes.includes(carriedItem.type)) {
          this.mobWithItem = mob;
          this.carriedItemType = carriedItem.type;
          return calculateDistance(npc.position, mob.position!);
        }
      }
    }

    return Infinity;
  }
}
