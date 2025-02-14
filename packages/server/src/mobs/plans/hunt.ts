import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Plan } from './plan';
import { Community } from '../../community/community';
import { fetchWorldSpecificData } from '../../util/githubPagesUtil';

export class Hunt implements Plan {
  enemy: Mob | null = null;
  globalData: any = null;

  constructor() {
    this.loadGlobalData();
  }

  async loadGlobalData() {
    try {
      this.globalData = await fetchWorldSpecificData('global');
    } catch (error) {
      console.error('Error loading world data:', error);
    }
  }

  execute(npc: Mob): boolean {
    if (!this.enemy || !this.enemy.position || !npc.position) return true;

    const success = npc.moveToOrExecute(this.enemy.position, 1, () => {
      this.enemy!.changeHealth(Math.floor(Math.random() * -1 * npc._attack));
      npc.changeHealth(Math.floor(Math.random() * -1 * this.enemy!._attack));

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
      this.globalData.mob_aggro_behaviors;
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
