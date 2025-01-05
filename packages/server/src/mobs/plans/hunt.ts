import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Plan } from './plan';

export class Hunt implements Plan {
  enemy: Mob | null = null;

  execute(npc: Mob): boolean {
    if (!this.enemy || !this.enemy.position || !npc.position) return true;
    // Move toward the blob to attack

    const success = npc.moveToOrExecute(this.enemy.position, 1, () => {
      this.enemy!.changeHealth(Math.floor(Math.random() * -1 * npc.attack));
      npc.changeHealth(Math.floor(Math.random() * -1 * this.enemy!.attack));

      return false;
    });

    if (success) {
      this.enemy = null;
      return true; // giving up because can't reach enemy
    }

    return false;
  }

  utility(npc: Mob): number {
    if (!npc.position) return -Infinity;

    const visionMulitple = npc.action == this.type() ? 2 : 1;
    const closerEnemyID = npc.findClosestEnemyID(
      npc.community_id,
      npc.visionDistance * visionMulitple
    );

    if (!closerEnemyID) return -Infinity;

    this.enemy = Mob.getMob(closerEnemyID)!;

    const utility =
      npc.personality.traits[PersonalityTraits.Aggression] *
      (npc.attack / this.enemy.attack);

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
