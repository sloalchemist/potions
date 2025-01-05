import { mobFactory } from '../../mobs/mobFactory';
import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { OnTick } from './onTick';

export class SpawnMob implements OnTick {
  key: string;
  constructor() {
    this.key = 'spawn_mob';
  }

  onTick(item: Item, parameters: Record<string, string | number>): boolean {
    if (!item.position) {
      return false;
    }
    const mobType = parameters['type'] as string;
    const max = parameters['max'] as number;
    const rate = parameters['rate'] as number;
    const count = Mob.getCountOfType(mobType);

    if (count < max && Math.random() < rate) {
      mobFactory.makeMob(mobType, item.position);
    }

    return true;
  }
}
