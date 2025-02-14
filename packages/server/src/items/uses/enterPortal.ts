import { WorldMetadata } from '@rt-potion/common';
import { Mob } from '../../mobs/mob';
import { getWorlds } from '../../services/authMarshalling';
import { pubSub } from '../../services/clientCommunication/pubsub';
import { Item } from '../item';
import { Use } from './use';

export class EnterPortal implements Use {
  key: string;
  worlds: WorldMetadata[];

  constructor() {
    this.key = 'enter';
    this.worlds = [];
    this.populateWorlds();
  }

  private async populateWorlds() {
    try {
      const result = await getWorlds();
      this.worlds = result.map((world) => ({
        id: world.id,
        name: world.world_id
      }));
    } catch (error) {
      console.error(error);
    }
  }

  description(_mob: Mob, _item: Item): string {
    return 'Enter portal';
  }

  interact(mob: Mob, item: Item): boolean {
    if (this.isNearPortal(mob, item)) {
      // Send message to client to show world selection
      pubSub.showPortalMenu(mob.id, this.worlds);

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
}
