import { Plan } from './plan';
import { Mob } from '../mob';
import { Item } from '../../items/item';
import { gameWorld } from '../../services/gameWorld/gameWorld';
import { Coord } from '@rt-potion/common';
import { calculateDistance } from '@rt-potion/common';

export class BuildFence implements Plan {
  private buildPosition: Coord | null = null;
  private material: Item | null = null;

  //   action done during build plan
  execute(npc: Mob): boolean {
    if (!this.buildPosition || !npc.position) return true;

    // Move to the target position and build the fence
    const success = npc.moveToOrExecute(this.buildPosition, 1, () => {
      npc.needs.changeNeed('energy', -5);
      if (!this.material) {
        this.fenceItem = new Item('fence', this.targetPosition!);
        gameWorld.addItem(this.fenceItem);
      }
      return true;
    });

    return success;
  }

  //   returns a number to rep priority of action (higher -> more important)
  utility(npc: Mob): number {
    if (!npc.position) return -Infinity;

    // look for place to build, none if no spot found
    this.buildPosition = this.findPosition(npc);
    if (!this.buildPosition) return -Infinity;

    // cahnge prioity based on distance
    const distance = calculateDistance(npc.position, this.buildPosition);
    return 100 - distance;
  }

  //   find a spot to connect a buildable (walls and fences currently)
  private findPosition(npc: Mob): Coord | null {
    const position: Coord{0, 0}; //find fence pos here
    return position;
  }

  description(): string {
    // currently only applicable to fences
    return 'Build something';
  }

  reaction(): string {
    return 'Building!';
  }

  type(): string {
    return 'build';
  }
}
