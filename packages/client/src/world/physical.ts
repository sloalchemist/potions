import { Coord } from '@rt-potion/common';
import { World } from './world';

export class Physical {
  position: Coord | null = null;
  angle: number = 0;
  dead: boolean = false;
  key: string;
  type: string;
  subtype: string | null = null;

  constructor(world: World, key: string, type: string, position: Coord | null) {
    this.key = key;
    this.type = type;
    if (position) {
      this.position = { x: position.x, y: position.y };
    }
  }

  tick(_world: World, _deltaTime: number) {
    if (this.dead) {
      return;
    }
  }
}
