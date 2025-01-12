import { Mob } from '../mobs/mob';
import { Item } from './item';

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

  smashItem(mob: Mob) {
    const attackDmg = Math.floor(Math.random() * mob.attack);
    this.changeHealth(-attackDmg);
  }

  changeHealth(amount: number) {
    this.item.changeAttributeBy('health', amount);
    
    if (this.item.getAttribute<number>('health') <= 0) {
     if(this.item.type == 'potion-stand') {
        console.log("This is a potion Stand")

     }

      this.item.destroy();
    }
  }
}
