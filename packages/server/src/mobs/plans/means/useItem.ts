import { Mob } from '../../mob';
import { Means } from '../planMeans';

export class UseItem implements Means {
  private readonly item_type: string[];
  private readonly action;

  constructor(item_type: string[], action: string) {
    this.item_type = item_type;
    this.action = action;
  }

  execute(npc: Mob): boolean {
    if (!npc.position) return true;

    const carriedItem = npc.carrying;

    if (!carriedItem) {
      return true;
    }
    carriedItem.interact(npc, this.action);

    return true;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }

    if (npc.carrying) {
      const carryingItem = npc.carrying;
      if (carryingItem && this.item_type.includes(carryingItem.type)) {
        return 0;
      }
    }
    return Infinity;
  }
}
