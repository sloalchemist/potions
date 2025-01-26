import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';
import { numberToHexString, combineHexColors, hexStringToNumber } from '../util/colorUtil';

export class Cauldron {
  private item: Item;


  private constructor(item: Item) {
    this.item = item;
  }
  // attributes: ingredients, current_potion (based of color addition)

  static fromItem(item: Item): Cauldron | undefined {
    if (item.hasAttribute('ingredients') && item.hasAttribute('potion_subtype')) {
      return new Cauldron(item);
    }
    return undefined;
  }

  getNumItems(): number {
    return this.item.getAttribute('ingredients');
  }

  getPotionSubtype(): string {
    return this.item.getAttribute('potion_subtype');
  }

  DumpCauldron(): boolean {
    this.item.setAttribute('ingredients', 0);
    this.item.setAttribute('potion_subtype', "");

    return true
  }

  AddIngredient(mob: Mob): boolean {
    const carriedItem = mob.carrying;

    if (carriedItem && carriedItem.hasAttribute("brew_color") && this.getNumItems() <= 3) {

      // if no items in cauldron, add item
      if (this.getPotionSubtype() == "") {
        this.item.setAttribute('potion_subtype', String(hexStringToNumber(carriedItem.getAttribute('brew_color'))));
        this.item.changeAttributeBy('ingredients', 1);
        carriedItem.destroy();
        return true;
      }

      //convert subtype to hex string
      const hexString = numberToHexString(Number(this.getPotionSubtype()));

      //combine hex colors
      const newColor = combineHexColors(hexString, carriedItem.getAttribute('brew_color'));

      // destroy carried item
      carriedItem.destroy();

      this.item.changeAttributeBy('ingredients', 1);
      this.item.setAttribute('potion_subtype', String(hexStringToNumber(newColor)));
      return true;
    }

    return false;
  }

  bottlePotion(mob: Mob): boolean {
    if (this.getNumItems() <= 0) {
      return false;
    }

    this.item.setAttribute('ingredients', 0);

    itemGenerator.createItem({
      type: 'potion',
      subtype: this.getPotionSubtype(),
      carriedBy: mob
    })

    this.item.setAttribute('potion_subtype', "");
    return true;
  }
}
