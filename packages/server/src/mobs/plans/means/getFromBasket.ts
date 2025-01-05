import { Item } from '../../../items/item';
import { Mob } from '../../mob';
import { Means } from '../planMeans';
import { Container } from '../../../items/container';
import { calculateDistance } from '@rt-potion/common';

export class GetFromBasket implements Means {
  private basket: Item;

  constructor(basket: Item) {
    this.basket = basket;
  }

  execute(npc: Mob): boolean {
    if (!npc.position || !this.basket.position) return true;

    // Access `basket` from outer class
    npc.moveToOrExecute(this.basket.position, 1, () => {
      this.basket.interact(npc, 'get_item');

      return false;
    });

    return false;
  }

  cost(npc: Mob): number {
    if (!npc.position) {
      throw new Error('NPC has no position');
    }
    const items = Container.fromItem(this.basket)!.getInventory();
    if (items === 0) {
      return Infinity;
    }

    return calculateDistance(npc.position, this.basket.position!);
  }
}
