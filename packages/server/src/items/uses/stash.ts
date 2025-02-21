import { Mob } from '../../mobs/mob';
import { Carryable } from '../carryable';
import { Item } from '../item';
import { Use } from './use';

export class Stash implements Use {
  key: string;
  constructor() {
    this.key = 'stash';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Stash';
  }

  interact(mob: Mob, item: Item): boolean {
    const carriedItem = mob.carrying;
    if (!carriedItem || carriedItem.id !== item.id) {
      return false;
    }

    Carryable.fromItem(item)!.stash(mob);
    return true;
  }
}
