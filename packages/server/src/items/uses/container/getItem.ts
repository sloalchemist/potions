import { Mob } from '../../../mobs/mob';
import { Item } from '../../item';
import { Use } from '../use';
import { Container } from '../../container';

export class GetItem implements Use {
  key: string;
  constructor() {
    this.key = 'get_item';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Get item from basket';
  }

  interact(mob: Mob, item: Item): boolean {
    if (item.validateOwnership(mob)) {
      return false;
    }

    const container = Container.fromItem(item);

    if (!container) {
      return false;
    }

    return container.retrieveItem(mob);
  }
}
