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

    const message = `Greetings from the Deep… The sea whispers of forgotten treasures and ancient secrets hidden in the abyss. As you drift through the waters of Oozon, keep your eyes sharp. May the waves guide you.`;
    mob.sendMessage(`${message}`);

    return true;
  }
}
