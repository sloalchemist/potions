import { Mob } from '../../mobs/mob';
import { Carryable } from '../carryable';
import { Item } from '../item';
import { Use } from './use';

export class Drop implements Use {
  key: string;
  constructor() {
    this.key = 'drop';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Drop';
  }

  interact(mob: Mob, item: Item): boolean {
    const carriedItem = mob.carrying;
    if (!carriedItem || carriedItem.id !== item.id) {
      return false;
    }

    Carryable.fromItem(item)!.dropAtFeet(mob);
    return true;
  }
}
