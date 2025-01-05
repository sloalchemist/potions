import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class LowerPrice implements Use {
  key: string;
  constructor() {
    this.key = 'lower_price';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Lower price of potions';
  }

  interact(mob: Mob, item: Item): boolean {
    const stand = Purchasable.fromItem(item);

    if (!stand) {
      return false;
    }

    stand.changePrice(-1);
    return true;
  }
}
