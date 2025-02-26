import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Plan } from './plan';
import { Community } from '../../community/community';
import { DB } from '../../services/database';
import globalData from '../../../global.json';

export class Hunt implements Plan {
  enemy: Mob | null = null;

  execute(npc: Mob): boolean {
    if (!this.enemy || !this.enemy.position || !npc.position) return true;

    const success = npc.moveToOrExecute(this.enemy.position, 1, () => {
      try {
        // Verify enemy still exists
        const target = Mob.getMob(this.enemy!.id);
        if (!target) return true;

        // Get stats safely
        let npcAttack: number;
        let targetAttack: number;
        let targetDefense: number;
        let npcDefense: number;
        
        try {
          npcAttack = npc._attack;
          targetAttack = target._attack;
          targetDefense = target._defense;
          npcDefense = npc._defense;
        } catch (e) {
          // If we can't get stats, abandon the fight
          return true;
        }

        // create damage values
        const enemyDamage = Math.floor(Math.random() * -1 * npcAttack);
        const npcDamage = Math.floor(Math.random() * -1 * targetAttack);

        // this formula means 100 armor gives ~30% damage reduction
        const adjustedEnemyDamage = Math.floor(
          enemyDamage * (0.3 + 0.7 * Math.exp(-targetDefense / 40))
        );

        const adjustedNpcDamage = Math.floor(
          npcDamage * (0.3 + 0.7 * Math.exp(-npcDefense / 40))
        );

        // attack/fight each other
        target.changeHealth(adjustedEnemyDamage);
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
            const speedDelta = target._speed * -0.5;
            const speedDuration = 15;
            target.changeEffect(speedDelta, speedDuration, 'speed');
          }
        } catch {
          console.log('Could not get slowEnemy in hunt');
        }

        return false;
      } catch (e) {
        // If anything goes wrong, abandon the fight
        return true;
      }
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

    const potentialEnemy = Mob.getMob(closerEnemyID);
    if (!potentialEnemy) return -Infinity;

    this.enemy = potentialEnemy;

    try {
      const utility =
        npc.personality.traits[PersonalityTraits.Aggression] *
        (npc._attack / this.enemy._attack);

      if (hungry_mobs.includes(npc.type) && npc.needs.getNeed('satiation') < 10) {
        return 100;
      }
      if (Community.getFavor(npc.community_id, this.enemy.community_id) < 0) {
        return 100;
      }
      if (aggressive_mobs.includes(npc.type)) {
        return 100;
      }

      return utility;
    } catch (e) {
      // If we can't get stats, don't do this action
      return -Infinity;
    }
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
