import { Mob } from '../../mob';
import { Means } from '../planMeans';
import { Item } from '../../../items/item';

export class DeliverItem implements Means {
  private readonly basket: Item;
  private readonly item_type: string;

  constructor(basket: Item, item_type: string) {
    this.basket = basket;
    this.item_type = item_type;
  }

  execute(npc: Mob): boolean {
    if (!npc.position || !this.basket.position) return true;

    const success = npc.moveToOrExecute(this.basket.position, 1, () => {
      this.basket.interact(npc, 'add_item');
      return true;
    });

    return success;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }

    const carryingItem = npc.carrying;
    if (carryingItem) {
      if (carryingItem.type === this.item_type) {
        return 0;
      }
    }

    return Infinity;
  }
}
