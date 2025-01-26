import { Item } from '../../item';
import { Use } from '../use';
import { Mob } from '../../../mobs/mob';
import { Cauldron } from '../../cauldron';


export class DumpCauldron implements Use {
  key: string;
  constructor() {
    this.key = 'dump_cauldron';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Dump ingredient/s from cauldron';
  }

  interact(mob: Mob, item: Item): boolean {
    if (!mob.position) {
      return false;
    }

    const cauldron = Cauldron.fromItem(item);

    if (!cauldron) {
      return false;
    }

    return cauldron.DumpCauldron();
  }
}
