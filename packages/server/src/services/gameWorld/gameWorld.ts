import { Coord } from '@rt-potion/common';
import { Item } from '../../items/item';
import { FantasyDate } from '../../date/fantasyDate';

export interface GameWorld {
  spawnCoord(): Coord;
  isWalkable(coord: Coord): boolean;
  generatePath(
    unlocks: string[],
    start: Coord,
    end: Coord,
    fuzzy: boolean
  ): Coord[];

  getPortalLocation(): Coord;
  getPortal(): Item;

  currentDate(): FantasyDate;
}

export function initializeGameWorld(world: GameWorld): void {
  gameWorld = world;
}
export let gameWorld: GameWorld;
