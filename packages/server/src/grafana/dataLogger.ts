import { Mob } from '../mobs/mob';
import { Item } from '../items/item';
import { DB } from '../services/database';
import client from "prom-client";
import { createServer } from "http"

export class DataLogger {
  private static register = new client.Registry();

  private static mobGauge = new client.Gauge({
    name: "num_mobs",
    help: "Number of mobs currently in the game",
  });

  private static itemGauge = new client.Gauge({
    name: "num_items",
    help: "Number of items currently in the game",
  });

  private static tickGauge = new client.Gauge({
    name: "current_tick",
    help: "Current tick value",
  });

  static {
    this.register.registerMetric(this.mobGauge);
    this.register.registerMetric(this.itemGauge);
    this.register.registerMetric(this.tickGauge);
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
    }
  }

  static getMetrics() {
    return this.register.metrics();
  }

  static startMetricsServer(port: number = 3030) {
    createServer(async (req, res) => {
      if (req.url === "/metrics") {
        res.writeHead(200, { "Content-Type": this.register.contentType });
        res.end(await this.getMetrics());
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
      }
    }).listen(port, () => {
      console.log(`Prometheus metrics available at http://localhost:${port}/metrics`);
    });
  }
}
