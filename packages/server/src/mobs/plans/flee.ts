import {
  addVectorAndMagnitude,
  getCoordinatesWithinRadius,
  normalizedSubtraction
} from '@rt-potion/common';
import { Mob } from '../mob';
import { PersonalityTraits } from '../traits/personality';
import { Plan } from './plan';
import { gameWorld } from '../../services/gameWorld/gameWorld';

export class Flee implements Plan {
  enemy: Mob | undefined = undefined;

  execute(npc: Mob): boolean {
    if (!this.enemy || !this.enemy.position || !npc.position) return true;

    // If the NPC is at the same position as the enemy, move to a random nearby position
    if (
      npc.position.x === this.enemy.position.x &&
      npc.position.y === this.enemy.position.y
    ) {
      npc.setMoveTarget(gameWorld.spawnCoord());
      return false;
    }

    // Calculate a position in the opposite direction of the enemy, 6 units away
    const fleeVector = normalizedSubtraction(npc.position, this.enemy.position);
    const oppositeFromEnemy = addVectorAndMagnitude(
      npc.position,
      fleeVector,
      6
    );

    // Get possible coordinates within a radius of 3 around the calculated flee point
    const coordsToCheck = getCoordinatesWithinRadius(oppositeFromEnemy, 3);

    // Iterate through potential coordinates and find the first walkable one
    for (const coord of coordsToCheck) {
      if (npc.setMoveTarget(coord)) {
        //logger.log(`${npc.name} fled to ${coord.x}, ${coord.y} away from ${this.enemy.name}`);
        return false; // Movement successful, action not yet complete
      }
    }

    // If no valid flee point was found, throw an error
    if (!oppositeFromEnemy) {
      throw new Error(`${npc.name} failed to flee from ${this.enemy.name}. 
            Flee point: ${JSON.stringify(oppositeFromEnemy)},
            NPC position: ${JSON.stringify(npc.position)},
            Enemy position: ${JSON.stringify(this.enemy.position)}`);
    }

    return false;
  }

  utility(npc: Mob): number {
    if (!npc.position) return -Infinity;

    const visionMulitple = npc.action == this.type() ? 2 : 1;
    // If fleeing, increase radius to 12
    const closerEnemyID = npc.findClosestEnemyID(
      npc.community_id,
      npc.visionDistance * visionMulitple
    );

    if (!closerEnemyID) return -Infinity;

    this.enemy = Mob.getMob(closerEnemyID)!;

    //logger.log(`fleeing eval ${npc.name} ${npc.personality.traits[PersonalityTraits.Bravery]} ${npc.attributes['health']} ${this.enemy.attributes['health']}`)
    const utility =
      (100 - npc.personality.traits[PersonalityTraits.Bravery]) *
      (this.enemy.health / npc.health);
    return utility;
  }

  /*desire(npc: NPC, world: ServerWorld): Desire[] {
        return [];
    }*/

  description(): string {
    return `Running away from ${this.enemy?.name}, a ${this.enemy?.type}`;
  }

  reaction(): string {
    return `I'm running away from ${this.enemy?.name}!`;
  }

  type(): string {
    return 'flee';
  }
}
