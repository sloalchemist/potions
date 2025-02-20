import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { Use } from './use';

export class Read implements Use {
  key: string;

  constructor() {
    this.key = 'read';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Read';
  }

  interact(mob: Mob, item: Item): boolean {
    if (item.type !== 'message-in-bottle') {
      return false;
    }

    const message = "some message here (replace)"; 
    mob.sendMessage(`You read the message: "${message}"`);

    return true;
  }
}
