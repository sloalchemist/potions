import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class CollectGold implements Use {
  key: string;
  constructor() {
    this.key = 'collect_gold';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Collect gold';
  }

  interact(mob: Mob, item: Item): boolean {
    const stand = Purchasable.fromItem(item);

    if (!stand) {
      return false;
    }

    stand.collectGold(mob);

    return true;
  }
}
