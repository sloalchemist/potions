import { Mob } from '../mobs/mob';
import { Item } from '../items/item';
import { DB } from '../services/database';
import { collectDefaultMetrics, Registry, Counter, Gauge } from 'prom-client';
import { createServer } from 'http';

export class DataLogger {
  private static register = new Registry();

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

  private static tickCounter = new Counter({
    name: 'num_ticks',
    help: 'Number of ticks elapsed since start'
  });

  static {
    collectDefaultMetrics({ register: DataLogger.register });
    this.register.registerMetric(this.mobGauge);
    this.register.registerMetric(this.itemGauge);
    this.register.registerMetric(this.tickGauge);
    this.register.registerMetric(this.tickCounter);
  }

  static logData() {
    const num_mobs = Mob.getAllMobIDs().length as number;
    const num_items = Item.getAllItemIDs().length as number;
    const tick_id = DB.prepare(
      `
            SELECT tick FROM ticks;
        `
    ).get() as { tick: number };

    if (tick_id !== null) {
      this.mobGauge.set(num_mobs);
      this.itemGauge.set(num_items);
      this.tickGauge.set(tick_id.tick);
      this.tickCounter.inc(1);
    }
  }

  static getMetrics() {
    return this.register.metrics();
  }

  static startMetricsServer(port: number = 3030) {
    // createServer(async (req, res) => {
    //   if (req.url === '/metrics') {
    //     res.writeHead(200, { 'Content-Type': this.register.contentType });
    //     res.end(await this.getMetrics());
    //   } else {
    //     res.writeHead(404, { 'Content-Type': 'text/plain' });
    //   }
    // }).listen(port, () => {
    //   console.log(
    //     `Prometheus metrics available at http://localhost:${port}/metrics`
    //   );
    // });
  }
}
