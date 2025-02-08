import {
  Coord,
  equals,
  floor,
  PathFinder,
  TerrainType
} from '@rt-potion/common';
import { Item } from './item';
import { Mob } from './mob';
import { SpriteHouse } from '../sprite/sprite_house';
import { WorldDescription } from '../worldDescription';

export class World {
  worldWidth!: number;
  worldHeight!: number;
  tiles!: number[][];

  mobGrid!: Map<string, Mob[]>;
  itemGrid!: Map<string, Item>;
  houseGrid!: Map<string, string>;

  terrainTypes!: Map<number, TerrainType>;

  mobs: Record<string, Mob> = {};
  items: Record<string, Item> = {};
  storedItems: Record<string, Item> = {};
  houses: Record<string, SpriteHouse> = {};

  private pathFinder?: PathFinder;

  // constructor
  constructor() {}


  load(worldDescription: WorldDescription) {
    this.pathFinder = new PathFinder(
      worldDescription.tiles,
      worldDescription.terrain_types
    );
    this.worldWidth = worldDescription.tiles.length;
    this.worldHeight = worldDescription.tiles[0].length;
    console.log('world size', this.worldWidth, this.worldHeight);
    this.tiles = worldDescription.tiles;
    //this.generateWalkable(mapData);

    this.mobGrid = new Map();
    for (let x = 0; x < this.worldWidth; x++) {
      for (let y = 0; y < this.worldHeight; y++) {
        //console.log('grid', x, y, isWalkable(this.tiles[x][y]));
        this.mobGrid.set(`${x},${y}`, []);
      }
    }

    this.itemGrid = new Map();

    this.terrainTypes = new Map();
    for (const td of worldDescription.terrain_types) {
      this.terrainTypes.set(td.id, td);
    }

    this.houseGrid = new Map();
  }

  tick(deltaTime: number) {
    for (const mob of Object.values(this.mobs)) {
      if (mob.dead) {
        mob.destroy(this);
      } else {
        mob.tick(this, deltaTime);
      }
    }
    for (const item of Object.values(this.items)) {
      item.tick(this, deltaTime);
    }
  }

  addHouseToGrid(house: string, position: Coord[]) {
    for (const pos of position) {
      this.houseGrid.set(`${pos.x},${pos.y}`, house);
    }
  }

  addMobToGrid(mob: Mob) {
    if (!mob.position) {
      throw new Error('Object has no position');
    }

    const coord = floor(mob.position);

    // Add to new position
    const newPos = `${coord.x},${coord.y}`;
    this.mobGrid.get(newPos)?.push(mob);
  }

  addItemToGrid(item: Item) {
    if (!item.position) {
      throw new Error('Object has no position');
    }

    const coord = floor(item.position);

    this.itemGrid.set(`${coord.x},${coord.y}`, item);
  }

  removeItemFromGrid(item: Item) {
    if (!item.position) {
      throw new Error('Object has no position');
    }
    const coord = floor(item.position);
    // Remove from old position
    const oldPos = `${coord.x},${coord.y}`;
    this.itemGrid.delete(oldPos);
  }

  removeMobFromGrid(mob: Mob) {
    if (!mob.position) {
      throw new Error('Object has no position');
    }
    const coord = floor(mob.position);
    // Remove from old position
    const oldPos = `${coord.x},${coord.y}`;
    this.mobGrid.get(oldPos)?.splice(this.mobGrid.get(oldPos)!.indexOf(mob), 1);
  }

  moveMob(mob: Mob, moveTo: Coord) {
    if (!mob.position) {
      throw new Error('Object has no position');
    }
    const flooredMob = floor(mob.position);
    const flooredMoveTo = floor(moveTo);
    if (equals(flooredMob, flooredMoveTo)) {
      return;
    }
    // Remove from old position
    const oldPos = `${flooredMob.x},${flooredMob.y}`;
    this.mobGrid.get(oldPos)?.splice(this.mobGrid.get(oldPos)!.indexOf(mob), 1);

    // Add to new position
    const newPos = `${flooredMoveTo.x},${flooredMoveTo.y}`;
    this.mobGrid.get(newPos)?.push(mob);
    //console.log('moved object', object, oldPos, newPos, x===newX, y===newY);
  }

  getItemAt(x: number, y: number): Item | undefined {
    const item = this.itemGrid.get(`${x},${y}`);
    return item || undefined;
  }

  getItemsAt(x: number, y: number, radius: number = 0): Item[] {
    // If radius is 0, we simply return objects at the exact position
    if (radius === 0) {
      const item = this.itemGrid.get(`${x},${y}`);
      return item ? [item] : [];
    }

    const itemsInRadius: Item[] = [];

    // Define the bounds of the square area around the (x, y) point that could potentially contain objects
    const minX = Math.max(0, x - radius);
    const maxX = Math.min(this.worldWidth - 1, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(this.worldHeight - 1, y + radius);

    // Iterate over all cells in the square area around (x, y)
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const item = this.itemGrid.get(`${i},${j}`);
        if (item) {
          itemsInRadius.push(item);
        }
      }
    }

    return itemsInRadius;
  }

  getMobsAt(x: number, y: number, radius: number = 0): Mob[] {
    // If radius is 0, we simply return objects at the exact position
    if (radius === 0) {
      return this.mobGrid.get(`${x},${y}`) || [];
    }

    const mobsInRadius: Mob[] = [];

    // Define the bounds of the square area around the (x, y) point that could potentially contain objects
    const minX = Math.max(0, x - radius);
    const maxX = Math.min(this.worldWidth - 1, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(this.worldHeight - 1, y + radius);

    // Iterate over all cells in the square area around (x, y)
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const objectsAtPosition = this.mobGrid.get(`${i},${j}`) || [];
        for (const object of objectsAtPosition) {
          // Calculate the Euclidean distance from (x, y) to the object's position
          const distance = Math.sqrt((i - x) ** 2 + (j - y) ** 2);
          if (distance <= radius) {
            mobsInRadius.push(object);
          }
        }
      }
    }

    return mobsInRadius;
  }

  generatePath(unlocks: string[], from: Coord, to: Coord) {
    if (!this.pathFinder) {
      throw new Error('Pathfinder not initialized');
    }
    this.pathFinder.clearBlockingItems();

    for (const item of Object.values(this.items)) {
      if (!item) {
        continue;
      }
      if (
        (!item.itemType.walkable || (item.lock && !item.itemType.open)) &&
        item.position
      ) {
        this.pathFinder.setBlockingItem(
          item.position.x,
          item.position.y,
          item.lock ? item.lock : 'block'
        );
      }
    }
    return this.pathFinder.generatePath(unlocks, from, to);
  }
}

export const world = new World();
