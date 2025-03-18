import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';

export class MarketStand {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }

  static fromItem(item: Item): MarketStand | undefined {
    if (item.hasAttribute('inventory') && item.hasAttribute('prices')) {
      return new MarketStand(item);
    }

    return undefined;
  }

  getInventory(): Record<string, number> {
    const rawInventory = this.item.getAttribute<string>('inventory');
    return rawInventory ? JSON.parse(rawInventory) : {};
  }

  getPrices(): Record<string, number> {
    const rawPrices = this.item.getAttribute<string>('prices');
    return rawPrices ? JSON.parse(rawPrices) : {};
  }

  changePrice(amount: number) {
    if (!this.item.hasAttribute('price')) {
      return;
    }

    const currentPrice = this.item.getAttribute<number>('price');
    const newPrice = Math.max(1, Math.min(99, currentPrice + amount)); // Ensure price stays between 1 and 99
    this.item.setAttribute<number>('price', newPrice);
  }

  getGold(): number {
    return this.item.getAttribute<number>('gold') || 0;
  }

  addItem(mob: Mob): boolean {
    const carriedItem = mob.carrying;
    if (!carriedItem) return false;

    const currentItemType = this.getItemType();

    // If market stand is empty, set the new item type
    if (!currentItemType || currentItemType === null) {
      this.item.setAttribute('item_type', carriedItem.type);
    }

    // Ensure that only the same item type can be added
    if (this.getItemType() !== carriedItem.type) return false;

    // Update both the items count and inventory
    this.item.changeAttributeBy('items', 1);

    // Update inventory
    const inventory = this.getInventory();
    const itemType = carriedItem.type;
    inventory[itemType] = (inventory[itemType] || 0) + 1;
    this.item.setAttribute('inventory', JSON.stringify(inventory));

    carriedItem.destroy();
    return true;
  }

  getItemType(): string | null {
    return this.item.hasAttribute('item_type')
      ? this.item.getAttribute<string>('item_type')
      : null;
  }

  setPrice(itemType: string, price: number): void {
    const prices = this.getPrices();
    prices[itemType] = Math.max(1, price); // Ensure price is at least 1
    this.item.setAttribute('prices', JSON.stringify(prices));
  }

  purchaseItem(mob: Mob, itemType: string): boolean {
    const inventory = this.getInventory();
    const prices = this.getPrices();

    if (!inventory[itemType] || inventory[itemType] <= 0) return false;
    if (!prices[itemType]) return false;
    if (mob.gold < prices[itemType]) return false;

    // Deduct gold, reduce inventory, and give item
    mob.changeGold(-prices[itemType]);
    inventory[itemType] -= 1;
    this.item.changeAttributeBy('items', -1);

    // Update inventory
    this.item.setAttribute('inventory', JSON.stringify(inventory));

    // Add gold to the stand
    this.item.changeAttributeBy('gold', prices[itemType]);

    itemGenerator.createItem({
      type: itemType,
      carriedBy: mob
    });

    return true;
  }

  collectGold(mob: Mob): void {
    mob.changeGold(this.getGold());
    this.item.setAttribute<number>('gold', 0);
  }
}
