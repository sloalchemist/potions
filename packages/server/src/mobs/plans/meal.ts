import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Means, PlanMeans } from './planMeans';
import { FindItem } from './means/findItem';
import { UseItem } from './means/useItem';
import { Eat } from '../../items/uses/eat';
import { GetFromBasket } from './means/getFromBasket';
import { AskForItem } from './means/askForItem';
import { itemGenerator } from '../../items/itemGenerator';
import { Item } from '../../items/item';

export class Meal extends PlanMeans {
  constructor(npc: Mob) {
    const means: Means[] = [];
    const edibleItemTypes = itemGenerator.getEdibleItemTypes();

    for (const itemType of edibleItemTypes) {
      means.push(new FindItem([itemType.type], 'pickup'));
      means.push(new UseItem([itemType.type], Eat.KEY));
      means.push(new AskForItem([itemType.type]));
      const basketID = npc.getBasket(itemType.type);
      if (basketID) {
        means.push(new GetFromBasket(Item.getItem(basketID)!));
      }
    }
    super(means);
  }

  benefit(npc: Mob): number {
    const hungerLevel =
      ((100 - npc.needs.getNeed('satiation')) / 100) *
      npc.personality.traits[PersonalityTraits.Gluttony];

    return hungerLevel;
  }

  description(): string {
    return `eating a meal`;
  }

  reaction(): string {
    return `Time for a meal!`;
  }

  type(): string {
    return 'meal';
  }
}
