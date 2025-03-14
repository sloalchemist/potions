import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Smashable } from '../../smashable';

export class DestroyStand implements Use {
  key: string;
  type: string;

  constructor() {
    this.key = 'destroy_stand';
    this.type = 'potion-stand';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Destroy stand';
  }

  interact(mob: Mob, item: Item): boolean {
    // Ensure that player owns the stand
    if (!item.validateOwnership(mob, this.key)) {
      return false;
    }
    const smashable = Smashable.fromItem(item);
    if (smashable) {
      smashable.smashItem(mob);
      return true;
    }
    return false;
  }
}
