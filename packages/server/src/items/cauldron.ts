import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';
import { numberToHexString, combineHexColors, hexStringToNumber } from '../util/colorUtil';

export class Cauldron {
  private item: Item;


  private constructor(item: Item) {
    this.item = item;
  }
  // attributes: num_items, current_potion (based of color addition)

  static fromItem(item: Item): Cauldron | undefined {
    if (item.hasAttribute('num_items') && item.hasAttribute('potion_subtype')) {
      return new Cauldron(item);
    }
    return undefined;
  }

  getNumItems(): number {
    return this.item.getAttribute('num_items');
  }

  getPotionSubtype(): string {
    return this.item.getAttribute('potion_subtype');
  }

  dumpCauldron(): boolean {
    this.item.setAttribute('num_items', 0);
    this.item.setAttribute('potion_subtype', "");

    return true
  }

  addIngredient(mob: Mob): boolean {
    const carriedItem = mob.carrying;

    if (carriedItem && carriedItem.hasAttribute("brew_color") && this.getNumItems() <= 3) {

      // if no items in cauldron, add item
      if (this.getPotionSubtype() == "") {
        this.item.setAttribute('potion_subtype', String(hexStringToNumber(carriedItem.getAttribute('brew_color'))));
        this.item.changeAttributeBy('num_items', 1);
        carriedItem.destroy();
        return true;
      }

      //convert subtype to hex string
      const hexString = numberToHexString(Number(this.getPotionSubtype()));

      //combine hex colors
      const newColor = combineHexColors(hexString, carriedItem.getAttribute('brew_color'));

      // destroy carried item
      carriedItem.destroy();

      this.item.changeAttributeBy('num_items', 1);
      this.item.setAttribute('potion_subtype', String(hexStringToNumber(newColor)));
      return true;
    }

    return false;
  }

  bottlePotion(mob: Mob): boolean {
    if (this.getNumItems() <= 0) {
      return false;
    }

    this.item.setAttribute('num_items', 0);

    itemGenerator.createItem({
      type: 'potion',
      subtype: this.getPotionSubtype(),
      carriedBy: mob
    })

    this.item.setAttribute('potion_subtype', "");
    return true;
  }
}
