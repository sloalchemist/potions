import { Use } from '../use';
import { Item } from '../../item';
import { Mob } from '../../../mobs/mob';
import { Create } from '../create';

export class CreateMarket implements Use {
  key: string;
  type: string;

  constructor() {
    this.key = 'create_market';
    this.type = 'market-stand';
  }

  description(_mob: Mob, _item: Item): string {
    return 'Create market';
  }

  interact(mob: Mob, item: Item): boolean {
    console.log("Created Market")
    return Create.createItemFrom(item, mob, this.type);
  }
}
