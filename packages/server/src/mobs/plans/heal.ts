import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { PlanMeans } from './planMeans';
import { FindItem } from './means/findItem';
import { UseItem } from './means/useItem';
import { Drink } from '../../items/uses/drink';
import { AskForItem } from './means/askForItem';
import { PurchaseItem } from './means/purchaseItem';
import { logistic } from '../../util/mathUtil';
import { logger } from '../../util/logger';

export class Heal extends PlanMeans {
  constructor() {
    super([
      new UseItem(['potion'], Drink.KEY),
      new FindItem(['potion'], 'pickup'),
      new PurchaseItem(),
      new AskForItem(['potion'])
    ]);
  }

  benefit(npc: Mob): number {
    if (!npc || !Mob.getMob(npc.id)) {
      logger.error(
        `${npc.name} is no longer valid or does not exist in the database.`
      );
      return -Infinity; // Exit early
    }
    if (npc.health >= 100) {
      // If health is full, no need to heal
      return -Infinity;
    }

    const healCoefficient = 1 - logistic(npc.health / 100, 10, 0.5);
    const benefit =
      2 *
      healCoefficient *
      (100 - npc.personality.traits[PersonalityTraits.Bravery]);

    return benefit;
  }

  description(): string {
    return `I'm looking for a potion to heal myself`;
  }

  reaction(): string {
    return 'I need a heal.';
  }

  type(): string {
    return 'heal';
  }
}
