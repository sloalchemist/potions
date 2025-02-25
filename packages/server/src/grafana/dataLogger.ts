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
import { createServer } from 'http';
import 'dotenv/config';
import { getEnv } from '@rt-potion/common';
import { worldID } from '../services/setup';

export class DataLogger {
  private static register = new Registry();

  static tick_log = 0;

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
    help: 'Average number of latency of ticks per 10 seconds'
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
    DataLogger.tick_log++;
  }

  static logData() {
    const num_mobs = Mob.getAllMobIDs().length as number;
    const num_items = Item.getAllItemIDs().length as number;
    const tick_time = 10000 / DataLogger.tick_log;
    DataLogger.tick_log = 0;
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

  static startMetricsServer(port: number = 3030) {
    createServer(async (req, res) => {
      if (req.url === '/metrics') {
        res.writeHead(200, { 'Content-Type': this.register.contentType });
        res.end(await this.getMetrics());
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
      }
    }).listen(port, () => {
      console.log(
        `Prometheus metrics available at http://localhost:${port}/metrics`
      );
    });
  }
}

// Setup Connection To Pushgateway
export class DataPusher {
  private static gateway = new Pushgateway(getEnv('METRIC_URL'), {
    timeout: 5000, //Set the request timeout to 5000ms
    agent: new Agent({
      keepAlive: true
    })
  });

  private static lastPushTime = Date.now();

  // Load metrics under 'Metric'
  static {
    DataPusher.gateway
      .pushAdd({ jobName: `${worldID} Metrics` })
      .then()
      .catch((e) => console.log(e));
  }

  static pushData() {
    DataPusher.gateway
      .push({ jobName: `${worldID} Metrics` })
      .then()
      .catch((e) => console.log(e));
  }

  static pusherTimer() {
    //const now = Date.now();
    //const deltaTime = now - this.lastPushTime;
    DataLogger.logData();
    DataPusher.pushData();
    this.lastPushTime = Date.now();
  }
}
