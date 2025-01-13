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
    return false; // originally set to true to allow possible future entry into the portal
  }
}
