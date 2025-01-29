import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class RaisePrice implements Use {
  key: string;
  constructor() {
    this.key = 'raise_price';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Raise price of potions';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob)) {
      return false;
    }

    const stand = Purchasable.fromItem(item);

    if (!stand) {
      return false;
    }

    stand.changePrice(1);
    return true;
  }
}
