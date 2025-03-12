import { Item } from '../../items/item';
import { evaluateUtility } from '../../util/mathUtil';
import { Mob } from '../mob';
import { Plan } from './plan';

export class Vandalize implements Plan {
  smashTarget?: Item;
  target: string[];

  constructor(target: string[]) {
    this.target = target;
  }

  execute(npc: Mob): boolean {
    if (!this.smashTarget || !this.smashTarget.position || !npc.position)
      return true;

    npc.moveToOrExecute(
      this.smashTarget.position,
      2,
      () => {
        this.smashTarget!.interact(npc, 'smash');

        return false;
      },
      true
    );

    return false;
  }

  utility(npc: Mob): number {
    const smashTargetID = npc.findNClosestObjectIDs(this.target, 1, 5);

    if (!smashTargetID) {
      return -Infinity;
    }
    this.smashTarget = Item.getItem(smashTargetID[0])!;

    return evaluateUtility(Boolean(this.smashTarget), 26);
  }

  description(): string {
    return 'found something to smash';
  }

  reaction(): string {
    return 'Smash!';
  }

  type(): string {
    return 'vandalize';
  }
}
