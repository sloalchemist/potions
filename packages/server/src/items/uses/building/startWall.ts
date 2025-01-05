import { Item } from '../../item';
import { Use } from '../use';
import { itemGenerator } from '../../itemGenerator';
import { Mob } from '../../../mobs/mob';

export class StartWall implements Use {
  key: string = 'start_wall';

  description(_mob: Mob, _item: Item): string {
    return 'Start building a wall';
  }

  interact(mob: Mob, item: Item): boolean {
    item.destroy();
    itemGenerator.createItem({
      type: 'partial-wall',
      position: mob.position
    });

    return true;
  }
}
