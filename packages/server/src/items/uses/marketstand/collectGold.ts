import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class CollectGold implements Use {
  key: string;
  type: 'market-stand';

  constructor() {
    this.key = 'collect_gold';
    this.type = 'market-stand';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Collect gold';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob, this.key)) {
      return false;
    }

    const stand = Purchasable.fromItem(item);

    if (!stand) {
      return false;
    }

    stand.collectGold(mob);

    return true;
  }
}
