import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Plan } from './plan';
import { Community } from '../../community/community';
import { DB } from '../../services/database';
import globalData from '../../../world_assets/global.json';
import { logger } from '../../util/logger';

export class Hunt implements Plan {
  enemy: Mob | null = null;

  execute(npc: Mob): boolean {
    if (!this.enemy || !this.enemy.position || !npc.position) return true;

    const success = npc.moveToOrExecute(this.enemy.position, 1, () => {
      // create damage values
      const enemyDamage = Math.floor(0.33 * -1 * npc._attack);
      const npcDamage = Math.floor(0.33 * -1 * this.enemy!._attack);

      // this formula means 100 armor gives ~30% damage reduction
      const adjustedEnemyDamage = Math.floor(
        enemyDamage * (0.3 + 0.7 * Math.exp(-this.enemy!._defense / 40))
      );

      const adjustedNpcDamage = Math.floor(
        npcDamage * (0.3 + 0.7 * Math.exp(-npc._defense / 40))
      );

      if (npc.damageOverTime > 0) {
        const poisonDelta = 1 * npc.damageOverTime;
        const poisonDuration = 5 * npc.damageOverTime;
        this.enemy!.changeEffect(poisonDelta, poisonDuration, 'poisoned');
      }

      // attack/fight each other
      this.enemy!.changeHealth(adjustedEnemyDamage);
      npc.changeHealth(adjustedNpcDamage);

      // get slowEnemy debuff count
      try {
        const mobDebuffs = DB.prepare(
          `SELECT slowEnemy FROM mobs WHERE id = :id`
        ).get({ id: npc.id }) as { slowEnemy: number };

        const slowEnemyCounter = mobDebuffs.slowEnemy;
        if (slowEnemyCounter > 0) {
          // decrement slowEnemy count (1 usage)
          npc.changeSlowEnemy(-1);
          // decrease targeted enemy's speed
          logger.log('Enemy speed:', this.enemy!._speed);
          const speedDelta = this.enemy!._speed * -0.5;
          const speedDuration = 15;
          this.enemy!.changeEffect(speedDelta, speedDuration, 'speed');
        }
      } catch {
        logger.log('Could not get slowEnemy in hunt');
      }

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
