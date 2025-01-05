import { Item } from '../item';
import { Use } from './use';
import { Mob } from '../../mobs/mob';

export class Eat implements Use {
  static KEY = 'eat';
  key: string;
  constructor() {
    this.key = Eat.KEY;
  }

  description(_mob: Mob, _item: Item): string {
    return 'Eat';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!mob.position) {
      return false;
    }

    item.destroy();
    mob.needs.changeNeed('satiation', 100);

    return true;
  }
}
