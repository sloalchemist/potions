import { Mob } from '../../mobs/mob';
import { Carryable } from '../carryable';
import { Item } from '../item';
import { Use } from './use';
import { pubSub } from '../../services/clientCommunication/pubsub';

export class Pickup implements Use {
  key: string;
  constructor() {
    this.key = 'pickup';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Pickup';
  }

  interact(mob: Mob, item: Item): boolean {
    const carryable = Carryable.fromItem(item);
    if (!item.position || !carryable) {
      return false;
    }
    if (item.type === 'gold') {
      mob.changeGold(item.getAttribute('amount'));
      item.destroy();
      pubSub.destroy(item);

      return true;
    }

    if (mob.carrying) {
      //drop item if currently carrying one
      Carryable.fromItem(mob.carrying)!.dropAtFeet(mob);
    }
    carryable.pickup(mob);

    return true;
  }
}
