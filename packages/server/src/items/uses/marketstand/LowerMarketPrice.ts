import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { MarketStand } from '../../marketStand';

export class LowerMarketPrice implements Use {
  key: string;

  constructor() {
    this.key = 'lower_market_price';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Lower price of the item in the market stand';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob, this.key)) {
      return false;
    }

    const marketStand = MarketStand.fromItem(item);
    if (!marketStand) {
      return false;
    }

    // Lower price by 1
    marketStand.changePrice(-1);
    return true;
  }
}
