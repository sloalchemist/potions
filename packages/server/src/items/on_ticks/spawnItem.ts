import { itemGenerator } from '../itemGenerator';
import { Item } from '../item';
import { OnTick } from './onTick';

export class SpawnItem implements OnTick {
  key: string;
  constructor() {
    this.key = 'spawn_item';
  }

  onTick(item: Item, parameters: Record<string, number | string>): boolean {
    if (!item.position) {
      return false;
    }

    const itemType = parameters['type'] as string;
    const count = Item.countTypeOfItem(itemType);
    const max = parameters['max'] as number;
    const rate = parameters['rate'] as number;

    if (count < max && Math.random() < rate) {
      itemGenerator.createItem({
        type: itemType,
        position: item.position
      });
    }

    return true;
  }
}
