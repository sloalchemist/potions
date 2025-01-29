import { Item } from '../../item';
import { Use } from '../use';
import { Mob } from '../../../mobs/mob';
import { Cauldron } from '../../cauldron';

export class AddIngredient implements Use {
  key: string;
  constructor() {
    this.key = 'add_ingredient';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Add ingredient to cauldron';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!mob.carrying) {
      return false;
    }

    const cauldron = Cauldron.fromItem(item);

    if (!cauldron) {
      return false;
    }

    return cauldron.AddIngredient(mob);
  }
}
