import { Item } from '../../item';
import { Use } from '../use';
import { Mob } from '../../../mobs/mob';
import { Cauldron } from '../../cauldron';

export class BottlePotion implements Use {
  key: string;
  constructor() {
    this.key = 'bottle_potion';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Bottle Potion';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!mob.position) {
      return false;
    }

    const cauldron = Cauldron.fromItem(item);

    if (!cauldron) {
      return false;
    }

    return cauldron.bottlePotion(mob);
  }
}
