import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { MarketStand } from '../../marketStand';

export class RaiseMarketPrice implements Use {
  key: string;
  
  constructor() {
    this.key = 'raise_market_price';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Raise price of the item in the market stand';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob, this.key)) {
      return false;
    }

    const marketStand = MarketStand.fromItem(item);
    if (!marketStand) {
      return false;
    }

    // Raise price by 1
    marketStand.changePrice(1);
    return true;
  }
}