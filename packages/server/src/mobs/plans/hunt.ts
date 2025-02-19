import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Plan } from './plan';
import { Community } from '../../community/community';
import globalData from '../../../data/global.json';

export class Hunt implements Plan {
  enemy: Mob | null = null;

  execute(npc: Mob): boolean {
    if (!this.enemy || !this.enemy.position || !npc.position) return true;

    const success = npc.moveToOrExecute(this.enemy.position, 1, () => {
      // attack/fight each other
      this.enemy!.changeHealth(Math.floor(Math.random() * -1 * npc._attack));
      npc.changeHealth(Math.floor(Math.random() * -1 * this.enemy!._attack));

      /*
      // get slowEnemy debuff count
      const mobDebuffs = DB.prepare(
        `SELECT slowEnemy FROM mobs WHERE id = :id`
      ).get({ id: npc.id }) as { slowEnemy: number };

      slowEnemyCounter = mobDebuffs.slowEnemy;
      if (slowEnemyCounter <= 0) {
        // no slowEnemy debuff available to use, continue normally
        continue;
      } else {
        // decrement slowEnemy count (1 usage)
        npc.changeSlowEnemy(-1);
        // decrease targeted enemy's speed
        console.log(this.enemy!._speed);
        const speedDelta = this.enemy!._speed * -0.5;
        const speedDuration = 15;
        this.enemy!.changeEffect(speedDelta, speedDuration, 'speed');
      }
      */

      return false;
    });

    if (success) {
      this.enemy = null;
      return true; // giving up because can't reach enemy
    }

    return false;
  }

  utility(npc: Mob): number {
    const { passive_mobs, hungry_mobs, aggressive_mobs } =
      globalData.mob_aggro_behaviors;
    if (!npc.position || passive_mobs.includes(npc.type)) return -Infinity;

    const visionMulitple = npc.action == this.type() ? 2 : 1;
    const closerEnemyID = npc.findClosestEnemyID(
      npc.community_id,
      npc.visionDistance * visionMulitple
    );

    if (!closerEnemyID) return -Infinity;

    this.enemy = Mob.getMob(closerEnemyID)!;

    var utility =
      npc.personality.traits[PersonalityTraits.Aggression] *
      (npc._attack / this.enemy._attack);

    if (hungry_mobs.includes(npc.type) && npc.needs.getNeed('satiation') < 10) {
      utility = 100;
      return utility;
    }
    if (Community.getFavor(npc.community_id, this.enemy.community_id) < 0) {
      utility = 100;
      return utility;
    }
    if (aggressive_mobs.includes(npc.type)) {
      utility = 100;
      return utility;
    }

    return utility;
  }

  description(): string {
    return `hunting ${this.enemy?.name}, a ${this.enemy?.type}`;
  }

  reaction(): string {
    return `I'm going to attack ${this.enemy?.name}!`;
  }

  type(): string {
    return 'hunt';
  }
}
