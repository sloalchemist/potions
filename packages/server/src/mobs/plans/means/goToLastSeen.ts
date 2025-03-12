import { Item } from '../../../items/item';
import { Mob } from '../../mob';
import { Means } from '../planMeans';
import { calculateDistance, Coord } from '@rt-potion/common';

export class GoToLastSeen implements Means {
  private target?: Coord;
  private readonly item_type: string[];

  constructor(item_type: string[]) {
    this.item_type = item_type;
  }

  execute(npc: Mob): boolean {
    if (!this.target || !npc.position) return true;

    npc.setMoveTarget(this.target);

    return false;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }

    if (
      this.target &&
      calculateDistance(npc.position, this.target) < npc.visionDistance
    ) {
      this.target = undefined;
    }

    const closestObjectID = npc.findNClosestObjectIDs(
      this.item_type,
      1,
      npc.visionDistance
    );
    if (closestObjectID && closestObjectID[0]) {
      this.target = Item.getItem(closestObjectID[0])!.position;
    }

    if (this.target) {
      return calculateDistance(npc.position, this.target) + 1;
    } else {
      return Infinity;
    }
  }
}
