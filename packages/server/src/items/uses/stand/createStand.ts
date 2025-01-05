import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Purchasable } from '../../purchasable';

export class CreateStand implements Use {
  key: string;
  constructor() {
    this.key = 'create_stand';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Create stand';
  }

  interact(mob: Mob, item: Item): boolean {
    return Purchasable.createStandFromItem(item, mob);
  }
}
