import { Mob } from '../mobs/mob';
import { hexStringToNumber } from '../util/colorUtil';
import { Item } from './item';
import { itemGenerator } from './itemGenerator';

export class Brewable {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }

  static fromItem(item: Item): Brewable | undefined {
    if (item.hasAttribute('brew_color')) {
      return new Brewable(item);
    }

    return undefined;
  }

  get brewColor(): string {
    return this.item.getAttribute<string>('brew_color');
  }

  brew(mob: Mob): boolean {
    this.item.destroy();

    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber(this.brewColor)),
      carriedBy: mob
    });

    return true;
  }
}
