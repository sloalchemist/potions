import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { Use } from './use';

export class EnterPortal implements Use {
  key: string;
  constructor() {
    this.key = 'enter';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Enter portal';
  }

  interact(mob: Mob, _item: Item): boolean {
    console.log('Enter portal', this.key, mob.name);
    mob.destroy();

    return true;
  }
}
