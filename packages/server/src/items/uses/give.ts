import { Mob } from '../../mobs/mob';
import { Carryable } from '../carryable';
import { Item } from '../item';
import { Use } from './use';

export class Give implements Use {
  key: string;
  constructor() {
    this.key = 'give';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Give';
  }

  interact(mob: Mob, item: Item, giveTo: Mob | undefined): boolean {
    const carriedItem = mob.carrying;

    if (!carriedItem || carriedItem.id !== item.id || !giveTo) {
      return false;
    }

    return Carryable.fromItem(item)!.giveItem(mob, giveTo);
  }
}
