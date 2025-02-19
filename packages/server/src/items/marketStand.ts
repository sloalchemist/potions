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

  getGold(): number {
    return this.item.getAttribute<number>('gold') || 0;
  }

  addItem(mob: Mob): boolean {
    const carriedItem = mob.carrying;
    if (!carriedItem) return false;

    const inventory = this.getInventory();
    inventory[carriedItem.type] = (inventory[carriedItem.type] || 0) + 1;

    this.item.setAttribute('inventory', JSON.stringify(inventory));
    carriedItem.destroy();

    return true;
  }

  setPrice(itemType: string, price: number): void {
    const prices = this.getPrices();
    prices[itemType] = Math.max(1, price); // Ensure price is at least 1
    this.item.setAttribute('prices', JSON.stringify(prices));
  }

  purchaseItem(mob: Mob, itemType: string): boolean {
    const inventory = this.getInventory(); // Retrieves parsed object
    const prices = this.getPrices(); // Retrieves parsed object

    if (!inventory[itemType] || inventory[itemType] <= 0) return false;
    if (!prices[itemType]) return false;
    if (mob.gold < prices[itemType]) return false;

    // Deduct gold, reduce inventory, and give item
    mob.changeGold(-prices[itemType]);
    inventory[itemType] -= 1;

    // 🔥 Store inventory as a JSON string
    this.item.setAttribute('inventory', JSON.stringify(inventory));

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
