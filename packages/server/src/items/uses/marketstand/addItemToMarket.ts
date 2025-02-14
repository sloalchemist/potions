import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { MarketStand } from '../../marketStand';

export class AddItemToMarket implements Use {
  key: string;

  constructor() {
    this.key = 'add_to_market';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Add an item to the market stand';
  }

  interact(mob: Mob, item: Item): boolean {
    const marketStand = MarketStand.fromItem(item);
    if (!marketStand) return false;

    return marketStand.addItem(mob);
  }
}