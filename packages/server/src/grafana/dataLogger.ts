import { Mob } from '../mobs/mob';
import { Item } from '../items/item';
import { DB } from '../services/database';

export class DataLogger {
  static logData() {
    const num_mobs = Mob.getAllMobIDs().length as number;
    const num_items = Item.getAllItemIDs().length as number;
    const tick_id = DB.prepare(
      `
            SELECT tick FROM ticks;
        `
    ).get() as { tick: number };
    if (tick_id !== null) {
      DB.prepare(
        `
                INSERT INTO grafanadata (tick_id, num_mobs, num_item)
                VALUES (:tick_id, :num_mobs, :num_items);
                `
      ).run({
        tick_id: tick_id.tick,
        num_mobs: num_mobs,
        num_items: num_items
      });
    }
  }

  static SQL = `
        CREATE TABLE grafanadata (
            tick_id INTEGER NOT NULL PRIMARY KEY,
            num_mobs INTEGER NULL,
            num_items INTEGER NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
        );
    `;
}
