import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';

export class Cauldron {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }
  // attributes: num_items, current_potion (based of color addition)

//   static fromItem(item: Item): Container | undefined {
//     if (item.hasAttribute('items') && item.hasAttribute('templateType')) {
//       return new Container(item);
//     }

//     return undefined;
//   }

//   getType(): string {
//     return this.item.getAttribute('templateType');
//   }

//   getInventory(): number {
//     return this.item.getAttribute('items');
//   }

  getNumItems(): number {
    return this.item.getAttribute('num_items');
  }

  getCurrentPotion(): string {
    return this.item.getAttribute('current_potion');
  }

  placeItem(mob: Mob): boolean {
    const carriedItem = mob.carrying;

    if (carriedItem && carriedItem.type === this.getType()) {
      if (carriedItem.subtype != this.item.subtype) {
        return false;
      }
      carriedItem.destroy();
      this.item.changeAttributeBy('items', 1);

      return true;
    }

    return false;
  }

  retrieveItem(mob: Mob): boolean {
    if (this.getInventory() <= 0) {
      return false;
    }

    this.item.changeAttributeBy('items', -1);

    itemGenerator.createItem({
      type: this.getType(),
      subtype: this.item.subtype,
      carriedBy: mob
    })

    return true;
  }

    brewPotion(item:Item): void{
        return 
    }
}
