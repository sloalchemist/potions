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
    console.log("in interact");
    if (!mob.carrying) {
      return false;
    }

    const partialWallID = mob.findClosestObjectID(['partial-wall'], 3);

    if (!partialWallID) {
      return false;
    }

    const partialWall = Item.getItem(partialWallID)!;

    partialWall.changeAttributeBy('complete', 1);
    console.log("here");
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
