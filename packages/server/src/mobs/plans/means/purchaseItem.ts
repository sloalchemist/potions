import { calculateDistance } from '@rt-potion/common';
import { Item } from '../../../items/item';
import { Mob } from '../../mob';
import { Means } from '../planMeans';

export class PurchaseItem implements Means {
  private potionStandTarget: Item | null = null;

  execute(npc: Mob): boolean {
    if (
      !this.potionStandTarget ||
      !npc.position ||
      !this.potionStandTarget.position
    )
      return true;

    npc.moveToOrExecute(this.potionStandTarget.position, 1, () => {
      this.potionStandTarget!.interact(npc, 'purchase');

      return false;
    });

    return false;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }
    // If no potion is found on the ground, look for a potion stand
    const potionStandTargetID = npc.findNClosestObjectIDs(
      ['potion-stand'],
      1,
      Infinity
    );
    if (!potionStandTargetID || !potionStandTargetID[0]) {
      return Infinity;
    }
    this.potionStandTarget = Item.getItem(potionStandTargetID[0])!;
    const price = this.potionStandTarget.getAttribute<number>('price');
    const items = this.potionStandTarget.getAttribute<number>('items');
    if (npc.gold >= price && items > 0) {
      return (
        calculateDistance(npc.position, this.potionStandTarget.position!) +
        price
      );
    }

    return Infinity;
  }
}
