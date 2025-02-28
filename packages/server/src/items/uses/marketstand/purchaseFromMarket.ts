import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { MarketStand } from '../../marketStand';

export class PurchaseFromMarket implements Use {
  key: string;

  constructor() {
    this.key = 'purchase_market_item';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Buy an item from the market stand';
  }

  interact(mob: Mob, item: Item): boolean {
    const marketStand = MarketStand.fromItem(item);
    if (!marketStand) return false;

    // Get the item type from the stand (since it only stores one type at a time)
    const itemType = marketStand.getItemType();
    if (!itemType) return false;

    return marketStand.purchaseItem(mob, itemType);
  }
}
