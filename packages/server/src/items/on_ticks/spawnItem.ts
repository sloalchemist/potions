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
    const radius = parameters['radius'] as number;
    const globalCount = Item.countTypeOfItem(itemType);
    const localCount = Item.countTypeOfItemInRadius(itemType, item.position, radius);
    
    const globalMax = parameters['global_max'] as number;
    const localMax = parameters['local_max'] as number;
    const rate = parameters['rate'] as number;

    if (globalCount < globalMax && localCount < localMax && Math.random() < rate) {
      itemGenerator.createItem({
        type: itemType,
        position: item.position
      });
    }

    return true;
  }
}
