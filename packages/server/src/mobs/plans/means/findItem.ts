import { calculateDistance } from '@rt-potion/common';
import { Item } from '../../../items/item';
import { Mob } from '../../mob';
import { Means } from '../planMeans';

export class FindItem implements Means {
  private target: Item | null = null;
  private readonly item_type: string[];
  private readonly action: string;

  constructor(item_type: string[], action: string) {
    this.item_type = item_type;
    this.action = action;
  }

  execute(npc: Mob): boolean {
    if (!this.target || !npc.position || !this.target.position) return true;

    npc.moveToOrExecute(this.target.position, 1, () => {
      this.target!.interact(npc, this.action);

      return false;
    });

    return false;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }
    const targetID = npc.findClosestObjectID(this.item_type, Infinity);
    if (targetID) {
      this.target = Item.getItem(targetID)!;

      // Query mob database to see if there are mobs targeting the same item
      // Increase cost if so
      const x = this.target.position!.x;
      const y = this.target.position!.y;
      const numAlliesTargeting = npc.getNumAlliesTargettingPos(npc.community_id, x, y);
      if (numAlliesTargeting > 0) {
        // The item you want to find is already being targeted by an ally
        return Infinity;
      }

      // The item is not targeted. Go find it!
      return calculateDistance(npc.position, this.target.position!);
    } else {
      // There is no item to find
      return Infinity;
    }
  }
}
