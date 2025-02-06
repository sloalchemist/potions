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

    // Example logic: Assume the player is buying the first available item type
    const inventory = marketStand.getInventory();
    const availableItemType = Object.keys(inventory).find(
      (type) => inventory[type] > 0
    );

    if (!availableItemType) return false;

    return marketStand.purchaseItem(mob, availableItemType);
  }
}