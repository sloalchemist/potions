import { Mob } from '../mobs/mob';
import { Item } from '../items/item';
import { DB } from '../services/database';
import { Agent } from 'https';
import {
  collectDefaultMetrics,
  Registry,
  Counter,
  Gauge,
  Pushgateway
} from 'prom-client';
import 'dotenv/config';
import { getEnv } from '@rt-potion/common';
import { logger } from '../util/logger';

export class DataLogger {
  private static register = new Registry();

  static tick_log: number[] = [];
  static timeSinceTick = Date.now();

  private static mobGauge = new Gauge({
    name: 'num_mobs',
    help: 'Number of mobs currently in the game'
  });

  private static itemGauge = new Gauge({
    name: 'num_items',
    help: 'Number of items currently in the game'
  });

  private static tickGauge = new Gauge({
    name: 'current_tick',
    help: 'Current tick value'
  });

  private static playerGuage = new Gauge({
    name: 'num_players',
    help: 'Number of players currently in this server'
  });

  private static tickCounter = new Counter({
    name: 'num_ticks',
    help: 'Number of ticks elapsed since start'
  });

  private static tickLatency = new Gauge({
    name: 'tick_latency',
    help: 'p90 of latency between ticks'
  });

  static {
    collectDefaultMetrics({ register: DataLogger.register });
    this.register.registerMetric(this.mobGauge);
    this.register.registerMetric(this.itemGauge);
    this.register.registerMetric(this.tickGauge);
    this.register.registerMetric(this.tickCounter);
    this.register.registerMetric(this.playerGuage);
    this.register.registerMetric(this.tickLatency);
  }

  static logTick() {
    this.tickCounter.inc(1);

    // Store backlog of tick latency
    const now = Date.now();
    DataLogger.tick_log.push(now - DataLogger.timeSinceTick);
    DataLogger.timeSinceTick = now;
  }

  static logData() {
    const num_mobs = Mob.getAllMobIDs().length as number;
    const num_items = Item.getAllItemIDs().length as number;
    DataLogger.tick_log.sort();
    let tick_time = 0;
    if (DataLogger.tick_log.length !== 0) {
      // Get p90 for latency
      tick_time =
        DataLogger.tick_log[Math.ceil((DataLogger.tick_log.length - 1) * 0.9)];
    }
    DataLogger.tick_log = [];
    const tick_id = DB.prepare(
      `
            SELECT tick FROM ticks;
      `
    ).get() as { tick: number };
    const num_players = DB.prepare(
      `
        SELECT COUNT(1) AS players from mobs WHERE action_type = 'player';
      `
    ).get() as { players: number };

    if (tick_id !== null) {
      this.mobGauge.set(num_mobs);
      this.itemGauge.set(num_items);
      this.tickGauge.set(tick_id.tick);
      this.playerGuage.set(num_players.players);
      this.tickLatency.set(tick_time);
    }
  }

  static getMetrics() {
    return this.register.metrics();
  }
}

// Setup Connection To Pushgateway
export function pushMetrics() {
  let gatewayURL: string;
  try {
    gatewayURL = getEnv('METRIC_URL');
  } catch {
    logger.log('ENV for pushgateway server not set disabling pushing metrics');
    return;
  }

  // Get world id to seperate worlds
  const worldID = process.argv.slice(2)[0];

  const gateway = new Pushgateway(gatewayURL, {
    timeout: 5000, //Set the request timeout to 5000ms
    agent: new Agent({
      keepAlive: true
    })
  });

  // Load metrics under World Name 'Metric'
  gateway
    .pushAdd({ jobName: `${worldID} Metrics` })
    .then()
    .catch((e) => logger.warn(`Failed to pushAdd metrics:`, e));

  function pushData() {
    gateway
      .push({ jobName: `${worldID} Metrics` })
      .then()
      .catch((e) => logger.warn(`Failed to push metrics:`, e));
  }

  function pusherTimer() {
    DataLogger.logData();
    pushData();
  }

  setInterval(pusherTimer, 10000);
}
