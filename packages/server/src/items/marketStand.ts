import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';

export class MarketStand {
  private item: Item | null = null
  private gold: number = 0
  private itemquant: number = 0

  private constructor() {
    this.item = null
    this.gold = 0
    this.itemquant = 0
    
  }

  static fromItem(item: Item): MarketStand | undefined {
    if (item.hasAttribute('inventory') && item.hasAttribute('prices')) {
      return new MarketStand();
    }

    return undefined;
  }

  // This is so fucked, the container uses indexes, why are we using records. It makes me want to shoot myself.
  getInventory(): Record<string, number> {
    if (this.item == null) {
      return {"none":0}
    }
    const rawInventory = this.item.getAttribute<string>('inventory');
    return rawInventory ? JSON.parse(rawInventory) : {};
  }

  getPrices(): Record<string, number> {
    if (this.item == null) {
      return {}
    }
    const rawPrices = this.item.getAttribute<string>('prices');
    return rawPrices ? JSON.parse(rawPrices) : {};
  }

  getGold(): number {
    if (this.item == null) {
      return 0
    }
    return this.gold;
  }

  addItem(mob: Mob): boolean {
    const carriedItem = mob.carrying;
    if (!carriedItem) return false;

    const inventory = this.getInventory();
    if (JSON.stringify(inventory) == JSON.stringify({"none":0}) || inventory == null) {
      this.item = carriedItem
      this.item.setAttribute('inventory', JSON.stringify(inventory));
    }
    inventory[carriedItem.type] = (inventory[carriedItem.type] || 0) + 1;
    carriedItem.destroy();

    return true;
  }

  setPrice(itemType: string, price: number): void {
    if (this.item == null) {
      return 
    }
    const prices = this.getPrices();
    prices[itemType] = Math.max(1, price); // Ensure price is at least 1
    this.item.setAttribute('prices', JSON.stringify(prices));
  }

  purchaseItem(mob: Mob, itemType: string): boolean {
    if (this.item == null) {
      return false
    }
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

  // This should have proper logic, but the records jsut made me mental boom like HOLY SHIT IM CRASHING OUT.
  retrieveItem(mob: Mob): boolean {
    return true
    /**
    if (this.getInventory() <= 0) {
      return false;
    }

    this.item.changeAttributeBy('items', -1);

    itemGenerator.createItem({
      type: this.getType(),
      subtype: this.item.subtype,
      carriedBy: mob
    });

    return true;
      
     
     */
  }


  collectGold(mob: Mob): void {
    mob.changeGold(this.getGold());
    this.gold = 0;
  }
}
