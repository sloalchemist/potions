import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class Purchase implements Use {
  key: string;
  constructor() {
    this.key = 'purchase';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Purchase';
  }

  interact(mob: Mob, item: Item): boolean {
    const stand = Purchasable.fromItem(item);

    if (!stand) {
      return false;
    }

    return stand.purchaseItem(mob);
  }
}
