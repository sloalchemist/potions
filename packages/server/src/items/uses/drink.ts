import { Item } from '../item';
import { Use } from './use';
import { Mob } from '../../mobs/mob';
import { drinkPotion } from '../potionEffects';

export class Drink implements Use {
  static KEY = 'drink';
  key: string;
  constructor() {
    this.key = Drink.KEY;
  }

  description(_mob: Mob, _item: Item): string {
    return 'Drink';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.subtype) {
      return false;
    }

    drinkPotion(mob, item.subtype);
    item.destroy();

    return true;
  }
}
