import { DB } from '../../services/database';
import { Mob } from '../mob';

export type NeedType = 'satiation' | 'max_energy' | 'energy' | 'social';

const decayRate = -0.1;

export class Needs {
  mob: Mob;

  constructor(mob: Mob) {
    this.mob = mob;
  }

  getNeed(need: NeedType): number {
    const needs = DB.prepare(
      `
            SELECT ${need} as need_value
            FROM mobs
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
    this.changeNeed('satiation', decayRate);
    this.changeNeed('max_energy', decayRate);
    this.changeNeed('energy', decayRate);
    this.changeNeed('social', decayRate);
  }
}
