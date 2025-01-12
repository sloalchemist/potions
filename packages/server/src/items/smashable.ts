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

  smashItem(mob: Mob) {
    this.mob = mob; // Store mob in the class property
    const attackDmg = Math.floor(Math.random() * mob.attack);
    this.changeHealth(-attackDmg);
  }

  changeHealth(amount: number) {
    this.item.changeAttributeBy('health', amount);
    
    
    if (this.item.getAttribute<number>('health') <= 0) {
      
      this.item.destroy();
    }
  }

  destroyPotionStand(){
    const gold = this.item.getAttribute<number>('gold');
    const itemsCount = this.item.getAttribute<number>('items');
    if (this.item.type == 'potion-stand') {
      if (this.item.getAttribute<number>('gold') > 0){
        const position = Item.findEmptyPosition(this.mob.position);
        itemGenerator.createItem({
          type: 'gold',
          position,
          attributes: { amount: this.item.getAttribute<number>('gold') }
        });
      }
      const itemcount = this.item.getAttribute<number>('items');
      if (itemcount > 0){
        console.log('drop potion');
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
}