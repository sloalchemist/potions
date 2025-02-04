import { Mob } from '../mobs/mob';
import { Item } from './item';
import { itemGenerator } from './itemGenerator';

export class Smashable {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }

  static fromItem(item: Item): Smashable | undefined {
    if (item.hasAttribute('health')) {
      return new Smashable(item);
    }

    return undefined;
  }

  private mob!: Mob; // Add mob as a class property

  /**
   * Damage item with mob by random amount within mob attack
   * @param Mob The mob that is doing the attack
   * @param rng For random value, only for testing
   */
  smashItem(mob: Mob, rng: () => number = Math.random) {
    this.mob = mob; // Store mob in the class property
    let attackDmg = Math.floor(rng() * mob._attack);
    // prevent 0 damage from being inflicted
    attackDmg = attackDmg > 0 ? attackDmg : 1;
    this.changeHealth(-attackDmg);
  }

  changeHealth(amount: number) {
    this.item.changeAttributeBy('health', amount);
    if (this.item.getAttribute<number>('health') <= 0) {
      this.destroySmashable();
      this.item.destroy();
      if (this.item.drops_item) {
        this.dropItem(this.item, this.item.drops_item);
      }
    }
  }

  dropItem(item: Item, droppedItem: string) {
    itemGenerator.createItem({
      type: droppedItem,
      position: item.position
    });
  }

  // Renamed function to capture smashables
  destroySmashable() {
    const gold = this.item.getAttribute<number>('gold');
    if (gold > 0) {
      const position = Item.findEmptyPosition(this.mob.position);
      itemGenerator.createItem({
        type: 'gold',
        position,
        attributes: { amount: gold }
      });
    }
    const itemcount = this.item.getAttribute<number>('items');
    if (itemcount > 0) {
      for (let i = 0; i < itemcount; i++) {
        const position = Item.findEmptyPosition(this.mob.position);
        itemGenerator.createItem({
          type: 'potion',
          subtype: this.item.subtype,
          position: position
        });
      }
    }
  }
}
