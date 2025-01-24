import { Item } from '../../item';
import { Use } from '../use';
import { Mob } from '../../../mobs/mob';
import { Brewable } from '../../brewable';

export class Brew implements Use {
  key: string;
  constructor() {
    this.key = 'brew';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Brew';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!mob.position) {
      return false;
    }

    const brewable = Brewable.fromItem(item);

    if (!brewable) {
      return false;
    }

    return brewable.brew(mob);
  }
}
