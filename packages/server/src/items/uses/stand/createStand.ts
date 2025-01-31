import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Create } from '../create';

export class CreateStand implements Use {
  key: string;
  type: string;

  constructor() {
    this.key = 'create_stand';
    this.type = 'potion-stand';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Create stand';
  }

  interact(mob: Mob, item: Item): boolean {
    return Create.createItemFrom(item, mob, this.type);
  }
}
