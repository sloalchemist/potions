import { Item } from '../../item';
import { Use } from '../use';
import { itemGenerator } from '../../itemGenerator';
import { Mob } from '../../../mobs/mob';

export class BuildWall implements Use {
  key: string = 'build_wall';

  description(_mob: Mob, _item: Item): string {
    return 'Building a wall';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!mob.carrying) {
      return false;
    }

    const partialWallID = mob.findNClosestObjectIDs(['partial-wall'], 1, 3);

    if (!partialWallID) {
      return false;
    }

    const partialWall = Item.getItem(partialWallID[0])!;

    partialWall.changeAttributeBy('complete', 1);
    item.destroy();

    if (partialWall.getAttribute<number>('complete') > 0) {
      const position = partialWall.position;
      partialWall.destroy();
      itemGenerator.createItem({
        type: 'wall',
        position
      });
    }
    return true;
  }
}
