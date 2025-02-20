import { Mob } from '../../mobs/mob';
import { Carryable } from '../carryable';
import { Item } from '../item';
import { Use } from './use';

export class Unstash implements Use {
  key: string;
  constructor() {
    this.key = 'unstash';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Unstash';
  }

  interact(mob: Mob, item: Item): boolean {
    Carryable.fromItem(item)!.unstash(mob);
    return true;
  }
}
