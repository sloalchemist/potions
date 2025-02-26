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

    const message = `Greetings from the Deep… 
    
    The sea whispers of forgotten treasures and ancient secrets hidden in the abyss. As you drift through the waters of Oozon, keep your eyes sharp for sunken ships and shimmering pearls that might unlock the magic of this lost world. Not all is as it seems, though—some currents carry more than just seaweed and shells; there are mysteries to be unraveled and challenges to overcome.

    The Blobs are not alone in these waters, and neither are you. Forge alliances, gather resources, and explore what lies beneath the surface. The gold and glory of Oozon await those brave enough to dive deeper.

    May the waves guide you,
    An Alchemist of the Depths`;
    mob.sendMessage(`You read the message:\n"${message}"`);

    return true;
  }
}
