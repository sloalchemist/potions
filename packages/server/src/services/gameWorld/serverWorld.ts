import { PathFinder, Coord } from '@rt-potion/common';
import { ItemGenerator } from '../../items/itemGenerator';
import { Item } from '../../items/item';
import { FantasyDate } from '../../date/fantasyDate';
import { Mob } from '../../mobs/mob';
import { mobFactory } from '../../mobs/mobFactory';
import { conversationTracker } from '../../mobs/social/conversationTracker';
import { GameWorld } from './gameWorld';
import { Carryable } from '../../items/carryable';
import { ServerWorldDescription } from './worldMetadata';
import { UsesRegistry } from '../../items/uses/usesRegistry';
import { OnTickRegistry } from '../../items/on_ticks/onTickRegistry';
import { DB } from '../database';
import { DataLogger } from '../../grafana/dataLogger';

export class ServerWorld implements GameWorld {
  private pathFinder: PathFinder;
  // export mobTypes and itemTypes as attributes to use in tests
  public mobTypes: ServerWorldDescription['mob_types'];
  public itemTypes: ServerWorldDescription['item_types'];

  constructor(worldDesc: ServerWorldDescription) {
    this.mobTypes = [...worldDesc.mob_types];
    this.itemTypes = [...worldDesc.item_types];
    mobFactory.loadTemplates([...worldDesc.mob_types]);
    this.pathFinder = new PathFinder(worldDesc.tiles, worldDesc.terrain_types);

    const itemTypes = [...worldDesc.item_types];

    ItemGenerator.initialize(itemTypes);

    UsesRegistry.load();
    OnTickRegistry.load();
  }

  generatePath(
    unlocks: string[],
    start: Coord,
    end: Coord,
    fuzzy: boolean
  ): Coord[] {
    return this.pathFinder.generatePath(unlocks, start, end, fuzzy);
  }

  spawnCoord(): Coord {
    return this.pathFinder.spawnCoord();
  }

  isWalkable(coord: Coord): boolean {
    return this.pathFinder.isWalkable([], coord.x, coord.y);
  }

  private runItemTicks(): void {
    const ids = Item.getAllItemIDs();
    this.pathFinder.clearBlockingItems();
    for (const id of ids) {
      const item = Item.getItem(id);
      if (!item) {
        continue;
      }

      if ((!item.itemType.walkable || item.lock) && item.position) {
        this.pathFinder.setBlockingItem(
          item.position.x,
          item.position.y,
          item.lock ? item.lock : 'block'
        );
      }
      item.tick();
    }
    Carryable.validateNoOrphanedItems();
  }

  private runMobTicks(deltaTime: number): void {
    const mob_ids = Mob.getAllMobIDs();

    for (const mob_id of mob_ids) {
      const mob = Mob.getMob(mob_id);
      if (mob) {
        mob.tick(deltaTime);
      }
    }
  }

  tick(deltaTime: number) {
    //const startTime = Date.now();
    this.runItemTicks();
    this.runMobTicks(deltaTime);

    conversationTracker.tick();
    FantasyDate.runTick();

    // log data for Prometheus
    DataLogger.logData();

    //const totalTime = Date.now() - startTime;
    //logger.log('time to tick', totalTime);
  }

  getPortalLocation(): Coord {
    const position = this.getPortal().position;
    if (!position) {
      throw new Error('No portal position found');
    }

    return position;
  }

  getPortal(): Item {
    const position = DB.prepare(
      `
          SELECT
              id
          FROM items
          WHERE type = 'portal'
          LIMIT 1`
    ).get() as { id: string };

    const portal = Item.getItem(position.id);

    if (!portal) {
      throw new Error('No portal found');
    }

    return portal;
  }

  currentDate(): FantasyDate {
    return FantasyDate.currentDate();
  }
}
