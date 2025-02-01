import { Mob } from '../../../mobs/mob';
import { Container } from '../../container';
import { Item } from '../../item';
import { Use } from '../use';

export class AddItem implements Use {
  key: string;
  constructor() {
    this.key = 'add_item';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Add item to basket';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!item.validateOwnership(mob, this.key)) {
      return false;
    }

    if (!mob.carrying) {
      return false;
    }
    const container = Container.fromItem(item);

    if (!container) {
      return false;
    }

    return container.placeItem(mob);
  }
}
