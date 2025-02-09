import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { Use } from './use';

export class EnterPortal implements Use {
  key: string;
  worlds: string[];

  constructor() {
    this.key = 'enter';

    // TODO: populate available worlds from DB
    this.worlds = ['Valoron', 'Oozon'];
  }

  description(_mob: Mob, _item: Item): string {
    return 'Enter portal';
  }

  interact(mob: Mob, item: Item): boolean {
    if (this.isNearPortal(mob, item)) {
      this.showWorldSelection(mob);
      return true;
    }
    return false;
  }

  /**
   * Checks if the mob is near the portal (this server-side check is
   * used to prevent cheating)
   * @param mob - The mob to check
   * @param item - The item (portal) to check
   * @returns True if the mob is near the portal, false otherwise
   */
  private isNearPortal(mob: Mob, item: Item): boolean {
    if (!item.position) {
      return false;
    }

    return (
      mob.position &&
      Math.abs(mob.position.x - item.position.x) <= 2 &&
      Math.abs(mob.position.y - item.position.y) <= 2
    );
  }

  private showWorldSelection(mob: Mob): void {
    console.log(mob.name, 'showWorldSelection');
  }
}
