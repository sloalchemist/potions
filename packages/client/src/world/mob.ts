import { Coord, followPath } from '@rt-potion/common';
import { Physical } from './physical';
import { World } from './world';

export class Mob extends Physical {
  _target?: Coord;
  path: Coord[] = [];
  name: string;
  maxHealth: number;
  dead: boolean = false;
  carrying?: string;
  attributes: Record<string, number> = {};
  personalities: Record<string, number> = {};
  unlocks: string[] = [];
  doing: string = '';

  constructor(
    world: World,
    key: string,
    name: string,
    type: string,
    maxHealth: number,
    position: Coord | null,
    attributes: Record<string, number>,
    personalities: Record<string, number>
  ) {
    super(world, key, type, position);
    this.name = name;
    this.maxHealth = maxHealth;
    if (position) {
      world.addMobToGrid(this);
    }

    for (const [key, value] of Object.entries(attributes)) {
      this.attributes[key] = value;
    }
    for (const [key, value] of Object.entries(personalities)) {
      this.personalities[key] = value;
    }
  }

  set target(value: Coord | undefined) {
    this._target = value;
  }

  get target() {
    return this._target;
  }

  destroy(world: World) {
    this.dead = true;
    //console.log('Destroying physical', this.key, this.position);
    if (this.position) {
      world.removeMobFromGrid(this);
    }
    delete world.mobs[this.key];
  }

  changePosition(world: World, newPosition: Coord) {
    //console.log('changePosition', this.position, newPosition);
    world.moveMob(this, newPosition);
    this.position = newPosition;
  }

  tick(world: World, deltaTime: number) {
    super.tick(world, deltaTime);

    if (!this.position) {
      return;
    }

    if (this.path.length > 0) {
      // check if next step is blocked
      const nextStep = this.path[0];
      const lastStep = this.path[this.path.length - 1];
      const nextItem = world.getItemAt(nextStep.x, nextStep.y);
      if (!!nextItem && !nextItem.isWalkable(this.unlocks)) {
        this.path = world.generatePath(this.unlocks, this.position, lastStep);
      }

      const [position, angle] = followPath(
        this.position,
        this.path,
        this.attributes['speed'],
        deltaTime
      );
      this.changePosition(world, position);
      this.angle = angle;
    }

    if (
      this.path.length === 0 &&
      this.target &&
      this.position &&
      this.target.x == this.position.x &&
      this.target.y == this.position.y
    ) {
      this.target = undefined;
    }
  }
}
