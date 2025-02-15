import { Mob } from '../../../mobs/mob';
import { Item } from '../../item';
import { Use } from '../use';
import { MarketStand } from '../../marketStand';

export class GetFromMarket implements Use {
  key: string;
  constructor() {
    this.key = 'get_market';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Get item from basket';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob, this.key)) {
      return false;
    }

    const market = MarketStand.fromItem(item);

    if (!market) {
      return false;
    }

    return market.retrieveItem(mob);
  }
}
