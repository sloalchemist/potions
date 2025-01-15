import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class Retrieve implements Use {
  key: string;
  constructor() {
    this.key = 'retrieve_item';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Retrieve item from stand';
  }

  interact(mob: Mob, item: Item): boolean {
    const stand = Purchasable.fromItem(item);

    if (!stand) {
      return false;
    }

    return stand.retrieveItem(mob);
  }
}
