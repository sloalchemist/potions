// to revert back to original file, see commit d8df201030dbeab882aabfeea9a15814aa639216

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
import fs from 'fs';
import path from 'path';

const DEBUG_TO_CONSOLE = true;
const DEBUG_TO_FILE = false;
const DEBUG_FILE_PATH = path.join(__dirname, 'debug.log');

function debugLog(message: string) {
  if (DEBUG_TO_CONSOLE) {
    console.log(message);
  }
  if (DEBUG_TO_FILE) {
    try {
      fs.mkdirSync(path.dirname(DEBUG_FILE_PATH), { recursive: true });
      fs.appendFileSync(DEBUG_FILE_PATH, message + '\n');
    } catch (error) {
      console.error('Error writing to debug file:', error);
    }
  }
}

// Performance logging helper
function measureTime(label: string, fn: () => void): number {
  if (!DEBUG_TO_CONSOLE && !DEBUG_FILE_PATH) {
    fn();
    return 0;
  }
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  debugLog(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  return duration;
}

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
    measureTime('Getting all item IDs', () => {
      const ids = Item.getAllItemIDs();
      debugLog(`[DEBUG] Processing ${ids.length} items`);

      measureTime('Clearing blocking items', () => {
        this.pathFinder.clearBlockingItems();
      });

      let blockingItems = 0;
      measureTime('Processing items', () => {
        for (const id of ids) {
          const item = Item.getItem(id);
          if (!item) {
            continue;
          }

          if ((!item.itemType.walkable || item.lock) && item.position) {
            blockingItems++;
            this.pathFinder.setBlockingItem(
              item.position.x,
              item.position.y,
              item.lock ? item.lock : 'block'
            );
          }
          item.tick();
        }
      });
      debugLog(`[DEBUG] Processed ${blockingItems} blocking items`);
    });

    measureTime('Validating items', () => {
      Carryable.validateNoOrphanedItems();
    });
  }

  private runMobTicks(deltaTime: number): void {
    measureTime('Mob ticks', () => {
      const mob_ids = Mob.getAllMobIDs();
      debugLog(`[DEBUG] Processing ${mob_ids.length} mobs`);

      let processedMobs = 0;
      for (const mob_id of mob_ids) {
        const mob = Mob.getMob(mob_id);
        if (mob) {
          processedMobs++;
          mob.tick(deltaTime);
        }
      }
      debugLog(`[DEBUG] Successfully processed ${processedMobs} mobs`);
    });
  }

  tick(deltaTime: number) {
    const totalStart = performance.now();
    debugLog('\n[TICK] Starting new tick cycle ========================');
    measureTime('Item ticks', () => this.runItemTicks());
    measureTime('Mob ticks', () => this.runMobTicks(deltaTime));
    measureTime('Conversation tracker', () => conversationTracker.tick());
    measureTime('Fantasy date', () => FantasyDate.runTick());
    measureTime('Data logging', () => DataLogger.logData());

    const totalTime = performance.now() - totalStart;
    debugLog(`[TICK] Total tick cycle time: ${totalTime.toFixed(2)}ms`);
    debugLog('[TICK] End tick cycle ================================\n');
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
