import { Mob } from '../../mobs/mob';
import { pubSub } from '../../services/clientCommunication/pubsub';
import { Item } from '../item';
import { Use } from './use';
import {
  WorldData, // ApiResponse,
  getWorldData
} from '../../services/authMarshalling';


export class EnterPortal implements Use {
  key: string;
  worlds: string[];
  world: string[];

  constructor() {
    this.key = 'enter';

    // TODO: populate available worlds from DB
    this.worlds = ['Valoron', 'Oozon'];

    //this.worldData = getWorldData();
    this.world = ['none', 'oops']
    this.initializeWorlds();
  }

   private async initializeWorlds() {
    console.log('hi')
    // TODO: populate available worlds from DB
    try {
      const result = await getWorldData();
      console.log(result.message); // "Get world data successfully."
      this.world = ['test1', 'test2']
      console.log(this.world)
    } catch (error) {
      console.error(error);
    }
  }

  async setWorlds() {
    try {
      const result = getWorldData();
      console.log(result)
    } catch (error) {
      console.error('Failed to set worlds:', error);
    }
  }
 

  description(_mob: Mob, _item: Item): string {
    return 'Enter portal';
  }

  interact(mob: Mob, item: Item): boolean {
    if (this.isNearPortal(mob, item)) {
      // Send message to client to show world selection
      pubSub.showPortalMenu(mob.id);

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
