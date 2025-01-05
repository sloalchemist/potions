import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { Smashable } from '../smashable';
import { Use } from './use';

export class Smash implements Use {
  key: string;
  constructor() {
    this.key = 'smash';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Smash';
  }

  interact(mob: Mob, item: Item): boolean {
    Smashable.fromItem(item)!.smashItem(mob);

    return true;
  }
}
