import { Mob } from '../mobs/mob';
import { Item } from './item';
import { itemGenerator } from './itemGenerator';

export class Purchasable {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }

  static fromItem(item: Item): Purchasable | undefined {
    if (
      item.hasAttribute('gold') &&
      item.hasAttribute('price') &&
      item.hasAttribute('items') &&
      item.hasAttribute('templateType')
    ) {
      return new Purchasable(item);
    }

    return undefined;
  }

  get templateType(): string {
    return this.item.getAttribute<string>('templateType');
  }

  get gold(): number {
    return this.item.getAttribute<number>('gold');
  }

  get price(): number {
    return this.item.getAttribute<number>('price');
  }

  get items(): number {
    return this.item.getAttribute<number>('items');
  }

  purchaseItem(mob: Mob): boolean {
    if (mob.gold < this.price || this.items <= 0) {
      return false;
    }

    this.changeItems(-1);
    this.changeGold(this.price);
    mob.changeGold(-this.price);

    itemGenerator.createItem({
      type: this.templateType,
      subtype: this.item.subtype,
      carriedBy: mob
    });

    return true;
  }

  collectGold(mob: Mob) {
    mob.changeGold(this.gold);
    this.item.setAttribute<number>('gold', 0);
  }

  changeGold(amount: number) {
    this.item.changeAttributeBy('gold', amount);
  }

  changeItems(amount: number) {
    this.item.changeAttributeBy('items', amount);
    if (this.items < 0) {
      throw new Error('Items cannot be negative');
    }
  }

  static createStandFromItem(createStandFrom: Item, creator: Mob): boolean {
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: createStandFrom.subtype,
      position: creator.position,
      attributes: {
        templateType: createStandFrom.type,
        items: 1,
        capacity: 20
      }
    });

    createStandFrom.destroy();

    return true;
  }

  changePrice(amount: number) {
    const new_price = Math.min(99, Math.max(1, this.price + amount));

    this.item.setAttribute<number>('price', new_price);
  }
}
