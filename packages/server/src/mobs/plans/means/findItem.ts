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
      //console.log(`finding item ${npc.name} targetting ${this.target.type}`);
      return calculateDistance(npc.position, this.target.position!);
    } else {
      return Infinity;
    }
  }
}
