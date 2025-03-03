import { Mob } from '../mobs/mob';
import { Item } from './item';
import { Community } from '../community/community';
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

  /**
   * Attempts to purchase an item for the given mob based on its gold, favorability,
   * and the item's price and availability.
   *
   * The purchase is influenced by the favorability between the mob's community
   * and the item's owning community. The effective maximum price the mob is willing
   * to pay is dynamically adjusted based on this favorability.
   *
   * @param mob - The mob attempting to purchase the item.
   * @returns {boolean} - Returns true if the purchase was successful, false otherwise.
   * The purchase will fail if the mob lacks sufficient gold, the item is out of stock,
   * or the item's price exceeds the maximum allowable price considering favorability.
   */
  purchaseItem(mob: Mob): boolean {
    if (mob.gold < this.price || this.items <= 0) {
      return false;
    }

    // Get favorability
    const ownedByCommunity = this.item.owned_by_community ?? '';
    const favor = Community.getFavor(mob.community_id, ownedByCommunity);

    // Base price settings
    const baseMaxPrice = 20;
    const favorThreshold = 50; // Neutral favor level
    const minPriceCap = 10; // Minimum price they will tolerate
    const maxPriceCap = 100; // Maximum price limit

    // Adjust max price dynamically based on favorability
    let effectiveMaxPrice;

    if (favor >= favorThreshold) {
      // More favor = Higher price tolerance (scales at 0.5 per point above 50)
      effectiveMaxPrice = baseMaxPrice + (favor - favorThreshold) * 0.5;
    } else {
      // Less favor = Lower price tolerance (scales at 0.2 per point below 50)
      effectiveMaxPrice = baseMaxPrice - (favorThreshold - favor) * 0.2;
    }

    // Enforce minimum and maximum caps
    effectiveMaxPrice = Math.max(
      minPriceCap,
      Math.min(effectiveMaxPrice, maxPriceCap)
    );

    // If the price exceeds the max cap, favorability doesn't matter—reject outright
    if (this.price > maxPriceCap) {
      return false;
    }

    // If the price is still too high even after favor adjustment, reject
    if (this.price > effectiveMaxPrice) {
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

  changePrice(amount: number) {
    const new_price = Math.min(99, Math.max(1, this.price + amount));

    this.item.setAttribute<number>('price', new_price);
  }
}
