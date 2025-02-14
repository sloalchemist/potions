import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { MarketStand } from '../../marketStand';

export class SetMarketPrice implements Use {
  key: string;

  constructor() {
    this.key = 'set_market_price';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Set price for an item in the market stand';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob, this.key)) return false;

    const marketStand = MarketStand.fromItem(item);
    if (!marketStand) return false;

    // Example logic: We assume the player has a carried item they want to price
    const carriedItem = mob.carrying;
    if (!carriedItem) return false;

    // Hardcoded price adjustment logic (for now)
    let newPrice = carriedItem.getAttribute<number>('price') || 10;
    marketStand.setPrice(carriedItem.type, newPrice);
    
    return true;
  }
}