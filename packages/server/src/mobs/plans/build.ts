import { Plan } from './plan';
import { Mob } from '../mob';
import { Item } from '../../items/item';
import { gameWorld } from '../../services/gameWorld/gameWorld';
import { Coord } from '@rt-potion/common';
import { calculateDistance } from '@rt-potion/common';
import * as path from 'path';
import * as fs from 'fs';
import { FindItem } from './means/findItem';

export class BuildFence implements Plan {
  private buildPosition: Coord | null = null;
  private material: Item | null = null;

  //   action done during build plan
  execute(npc: Mob): boolean {
    // find fence position
    this.buildPosition = this.findPosition();
    if (!this.buildPosition || !npc.position) return true;

    // pick up the log
    this.material = npc.findItem('log');

    // Move to the target position and build the fence
    const success = npc.moveToOrExecute(this.buildPosition, 1, () => {
      npc.needs.changeNeed('energy', -5);
      if (!this.material) {
        this.fenceItem = new Item('fence', this.targetPosition!);
        gameWorld.addItem(this.fenceItem);
      }
      return true;
    });

    return false;
  }

  //   returns a number to rep priority of action (higher -> more important)
  utility(npc: Mob): number {
    if (!npc.position) return -Infinity;

    // look for place to build, none if no spot found
    this.buildPosition = this.findPosition();
    if (!this.buildPosition) return -Infinity;

    // cahnge prioity based on distance
    const distance = calculateDistance(npc.position, this.buildPosition);
    return 100 - distance;
  }

  //   find a spot to connect a buildable (walls and fences currently)
  private findPosition(): any {
    const configPath = path.resolve(__dirname, '../../../../../global.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const items = config.items;

    for (const item of items) {
      if (item.type === 'fence') {
        const position = item.coord;
        const itemID = Item.getItemIDAt(position);
        if (!itemID) {
          return position;
        }
      }
    }

    return null;
  }

  description(): string {
    // currently only applicable to fences
    return 'Build something';
  }

  reaction(): string {
    return 'Building!';
  }

  type(): string {
    return 'Build';
  }
}
