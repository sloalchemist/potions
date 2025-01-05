import { Mob } from '../mob';
import { PlanMeans } from './planMeans';
import { FindItem } from './means/findItem';

export class AcquireWealth extends PlanMeans {
  constructor() {
    super([new FindItem(['gold'], 'pickup')]);
  }

  benefit(_npc: Mob): number {
    return 100;
  }

  description(): string {
    return 'found some gold';
  }

  reaction(): string {
    return 'I found some gold!';
  }

  type(): string {
    return 'get rich';
  }
}
