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

const DEBUG_TO_CONSOLE = false;
const DEBUG_TO_FILE = false;
const DEBUG_MAKE_GRAPHS = false;
const DEBUG_FILE_PATH = path.join(__dirname, 'debug.log');
const MOB_METRICS_FILE_PATH = path.join(__dirname, 'graphs', 'mob_metrics.csv');
const TICK_METRICS_FILE_PATH = path.join(__dirname, 'graphs', 'tick_metrics.csv');

// Track the tick count
let tickCounter = 0;

// Ensure the graph directory exists and create the metrics files with headers if they don't exist
function initMetricsFiles() {
  try {
    fs.mkdirSync(path.join(__dirname, 'graphs'), { recursive: true });
    
    // Initialize mob metrics file
    if (!fs.existsSync(MOB_METRICS_FILE_PATH)) {
      fs.writeFileSync(MOB_METRICS_FILE_PATH, 'timestamp,mob_count,mob_tick_duration_ms\n');
    }
    
    // Initialize tick metrics file
    if (!fs.existsSync(TICK_METRICS_FILE_PATH)) {
      fs.writeFileSync(TICK_METRICS_FILE_PATH, 'tick_number,timestamp,total_tick_time_ms\n');
    }
  } catch (error) {
    console.error('Error initializing metrics files:', error);
  }
}

// Initialize the metrics files
initMetricsFiles();

// Function to log mob metrics to the dedicated CSV file
function logMobMetrics(mobCount: number, mobTickDuration: number) {
  if (!DEBUG_MAKE_GRAPHS) {
    return;
  }
  try {
    const timestamp = Date.now();
    const line = `${timestamp},${mobCount},${mobTickDuration.toFixed(2)}\n`;
    fs.appendFileSync(MOB_METRICS_FILE_PATH, line);
  } catch (error) {
    console.error('Error logging mob metrics:', error);
  }
}

// Function to log tick metrics to the dedicated CSV file
function logTickMetrics(tickNumber: number, totalTickTime: number) {
  if (!DEBUG_MAKE_GRAPHS) {
    return;
  }
  try {
    const timestamp = Date.now();
    const line = `${tickNumber},${timestamp},${totalTickTime.toFixed(2)}\n`;
    fs.appendFileSync(TICK_METRICS_FILE_PATH, line);
  } catch (error) {
    console.error('Error logging tick metrics:', error);
  }
}

// Define log entry types for structured logging
type LogEntry = {
  timestamp: number;
  type: string;
  message: string;
  data?: Record<string, any>;
};

function debugLog(message: string, data?: Record<string, any>) {
  const logEntry: LogEntry = {
    timestamp: Date.now(),
    type: 'debug',
    message,
    data
  };
  
  const formattedMessage = data 
    ? `${message} ${JSON.stringify(data)}`
    : message;

  if (DEBUG_TO_CONSOLE) {
    console.log(formattedMessage);
  }
  
  if (DEBUG_TO_FILE) {
    try {
      fs.mkdirSync(path.dirname(DEBUG_FILE_PATH), { recursive: true });
      fs.appendFileSync(DEBUG_FILE_PATH, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Error writing to debug file:', error);
    }
  }
}

// Performance logging helper
function measureTime(label: string, fn: () => void): number {
  if (!DEBUG_TO_CONSOLE && !DEBUG_TO_FILE) {
    fn();
    return 0;
  }
  
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  debugLog(`[PERF] ${label}`, { 
    label, 
    durationMs: parseFloat(duration.toFixed(2)) 
  });
  
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
      debugLog(`[DEBUG] Processing items`, { count: ids.length });

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
      debugLog(`[DEBUG] Processed blocking items`, { count: blockingItems });
    });

    measureTime('Validating items', () => {
      Carryable.validateNoOrphanedItems();
    });
  }

  private runMobTicks(deltaTime: number): number {
      const mob_ids = Mob.getAllMobIDs();
      const mobCount = mob_ids.length;
      debugLog(`[DEBUG] Processing mobs`, { count: mobCount });

      let processedMobs = 0;
      for (const mob_id of mob_ids) {
        const mob = Mob.getMob(mob_id);
        if (mob) {
          processedMobs++;
          mob.tick(deltaTime);
        }
      }
      debugLog(`[DEBUG] Successfully processed mobs`, { count: processedMobs });
      
      // Return the processed mob count for metrics tracking
      return processedMobs;
  }

  tick(deltaTime: number) {
    // Increment tick counter for this session
    tickCounter++;
    
    const totalStart = performance.now();
    debugLog('[TICK] Starting new tick cycle ========================');
    
    const itemTickTime = measureTime('Item ticks', () => this.runItemTicks());
    
    let mobCount = 0;
    const mobTickTime = measureTime('Mob ticks', () => {
      mobCount = this.runMobTicks(deltaTime);
    });
    
    // Log mob metrics to the dedicated CSV file
    logMobMetrics(mobCount, mobTickTime);
    
    const conversationTime = measureTime('Conversation tracker', () => conversationTracker.tick());
    const fantasyDateTime = measureTime('Fantasy date', () => FantasyDate.runTick());
    const dataLoggingTime = measureTime('Data logging', () => DataLogger.logData());

    const totalTime = performance.now() - totalStart;
    
    // Log tick metrics to the dedicated CSV file
    logTickMetrics(tickCounter, totalTime);
    
    debugLog(`[TICK] Total tick cycle time`, { 
      tickNumber: tickCounter,
      totalTimeMs: parseFloat(totalTime.toFixed(2)),
      itemTickTimeMs: parseFloat(itemTickTime.toFixed(2)), 
      mobTickTimeMs: parseFloat(mobTickTime.toFixed(2)),
      conversationTimeMs: parseFloat(conversationTime.toFixed(2)),
      fantasyDateTimeMs: parseFloat(fantasyDateTime.toFixed(2)),
      dataLoggingTimeMs: parseFloat(dataLoggingTime.toFixed(2))
    });
    
    debugLog('[TICK] End tick cycle ================================');
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
