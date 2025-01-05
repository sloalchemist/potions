import { Item } from '../../items/item';
import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { PlanMeans } from './planMeans';
import { FindItem } from './means/findItem';
import { DeliverItem } from './means/deliverItem';
import { GoToLastSeen } from './means/goToLastSeen';
import { Container } from '../../items/container';
import { logistic } from '../../util/mathUtil';

export class Gather extends PlanMeans {
  private target: Item | null = null;
  private readonly basket: Item;
  private readonly bonus: number;
  private readonly item_type: string;

  constructor(item_type: string, bonus: number, basket: Item) {
    super([
      new GoToLastSeen([item_type]),
      new FindItem([item_type], 'pickup'),
      new DeliverItem(basket, item_type)
    ]);
    if (basket.type !== 'basket') {
      throw new Error('Gather action requires a basket');
    }
    this.basket = basket;
    this.bonus = bonus;
    this.item_type = item_type;
  }

  benefit(npc: Mob): number {
    const container = Container.fromItem(this.basket);
    if (!container) {
      throw new Error('Basket has no container');
    }
    const items = container.getInventory();
    const percentFull = items / container.getCapacity();
    const percentFullAdjustment = 1 - logistic(percentFull, 5, 0.8);
    const utilityLevel =
      percentFullAdjustment *
      this.bonus *
      npc.personality.traits[PersonalityTraits.Industriousness];
    //console.log('gather benefit', utilityLevel, percentFull, percentFullAdjustment, this.bonus, npc.personality.traits[PersonalityTraits.Industriousness]);
    return utilityLevel;
  }
  /*
    desire(npc: NPC, world: ServerWorld): Desire[] {
        return [];
    }*/

  description(): string {
    return `gathering a ${this.item_type}`;
  }

  reaction(): string {
    return `Gathering ${this.item_type}!`;
  }

  type(): string {
    return 'gather';
  }
}
