import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';
import {
  numberToHexString,
  combineHexColors,
  hexStringToNumber
} from '../util/colorUtil';

export class Cauldron {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }

  static fromItem(item: Item): Cauldron | undefined {
    if (
      item.hasAttribute('ingredients') &&
      item.hasAttribute('potion_subtype')
    ) {
      return new Cauldron(item);
    }
    return undefined;
  }

  getNumItems(): number {
    return this.item.getAttribute('ingredients');
  }

  getPotionSubtype(): number {
    return this.item.getAttribute('potion_subtype');
  }

  getColorWeight(): number {
    return this.item.getAttribute('color_weight');
  }

  DumpCauldron(): boolean {
    this.item.setAttribute('ingredients', 0);
    this.item.setAttribute('potion_subtype', 0);
    this.item.setAttribute('color_weight', 1);

    return true;
  }

  AddIngredient(ingredient: Item): boolean {
    if (
      ingredient &&
      (ingredient.hasAttribute('brew_color') || ingredient.type == 'potion') &&
      this.getNumItems() < 3
    ) {
      // get ingredient color from carried item
      var ingredientColor: string;
      if (ingredient.type == 'potion') {
        ingredientColor = numberToHexString(Number(ingredient.subtype));
      } else {
        ingredientColor = ingredient.getAttribute('brew_color');
      }

      //calculate weight for added ingredient
      let ingredientWeight = 1;
      if (ingredient.type == 'potion') {
        ingredientWeight = 0.5; //change depending on how much you want potions to affect color
      }

      // if no items in cauldron, add item
      if (Number(this.getPotionSubtype()) == 0) {
        this.item.setAttribute(
          'potion_subtype',
          hexStringToNumber(ingredientColor)
        );
        this.item.changeAttributeBy('ingredients', 1);
        ingredient.destroy();
        this.item.setAttribute('color_weight', ingredientWeight);
        return true;
      }

      //convert subtype to hex string
      const hexString = numberToHexString(Number(this.getPotionSubtype()));

      //combine hex colors
      const newColor = combineHexColors(
        hexString,
        ingredientColor,
        this.getColorWeight(),
        ingredientWeight
      );

      //if output color is the same as the ingredient color, increase weight
      if (newColor == ingredientColor) {
        this.item.changeAttributeBy('color_weight', ingredientWeight);
      } else {
        this.item.setAttribute('color_weight', ingredientWeight);
      }

      // destroy carried item
      ingredient.destroy();

      this.item.changeAttributeBy('ingredients', 1);
      this.item.setAttribute('potion_subtype', hexStringToNumber(newColor));
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
      subtype: String(this.getPotionSubtype()),
      carriedBy: mob
    });

    this.item.setAttribute('potion_subtype', 0);
    return true;
  }
}
