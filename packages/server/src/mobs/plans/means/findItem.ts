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
    const maxDistance = Infinity;
    const maxNumTargets = Infinity;
    const targetIDs = npc.findNClosestObjectIDs(
      this.item_type,
      maxNumTargets,
      maxDistance
    );
    if (targetIDs) {
      // Check each target in order of proximity. If not targeted, then go find it
      for (const targetID of targetIDs) {
        const target = Item.getItem(targetID)!;

        // Query mob database to see if there are mobs targeting the same item
        const x = target.position!.x;
        const y = target.position!.y;
        const numAlliesTargeting = npc.getNumAlliesTargettingPos(
          npc.community_id,
          x,
          y
        );
        if (numAlliesTargeting === 0) {
          // The item is not targeted. Go find it!
          this.target = target;
          return calculateDistance(npc.position, target.position!);
        }
      }

      // Allies are already going to all potential targets
      return Infinity;
    } else {
      // There are no items to find
      return Infinity;
    }
  }
}
