import { DB } from '../../services/database';
import { Mob } from '../mob';

export type NeedType = 'satiation' | 'max_energy' | 'energy' | 'social';

const decayRate = -0.1;
const NEEDS_UPDATE_INTERVAL = 50; // Only update needs every 50 ticks

export class Needs {
  mob: Mob;
  private lastUpdateTick: number = 0;

  constructor(mob: Mob) {
    this.mob = mob;
  }

  getNeed(need: NeedType): number {
    const needs = DB.prepare(
      `
            SELECT ${need} as need_value
            FROM mobView
            WHERE id = :id
            `
    ).get({ id: this.mob.id }) as { need_value: number };

    return needs.need_value;
  }

  changeNeed(need: NeedType, value: number) {
    DB.prepare(
      `
            UPDATE mobs
            SET ${need} = MIN(100, MAX(0, ${need} + :value))
            WHERE id = :id
        `
    ).run({ id: this.mob.id, value });
  }

  tick() {
    const currentTick = this.mob.current_tick;

    // Only update needs periodically to reduce database load
    if (currentTick - this.lastUpdateTick < NEEDS_UPDATE_INTERVAL) {
      return;
    }

    // Calculate actual decay based on time passed
    const ticksPassed = currentTick - this.lastUpdateTick;
    const totalDecay = decayRate * ticksPassed;

    // Batch all need updates into a single query
    DB.prepare(
      `
      UPDATE mobs
      SET 
        satiation = MIN(100, MAX(0, satiation + :decay)),
        max_energy = MIN(100, MAX(0, max_energy + :decay)),
        energy = MIN(100, MAX(0, energy + :decay)),
        social = MIN(100, MAX(0, social + :decay))
      WHERE id = :id
      `
    ).run({
      id: this.mob.id,
      decay: totalDecay
    });

    this.lastUpdateTick = currentTick;
  }
}
