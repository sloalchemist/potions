import { Plan } from './plan';
import { PersonalityTraits } from '../traits/personality';
import { Mob } from '../mob';
import { gameWorld } from '../../services/gameWorld/gameWorld';

export class Wander implements Plan {
  execute(npc: Mob): boolean {
    if (npc.isNotMoving()) {
      npc.setMoveTarget(gameWorld.spawnCoord());
    }
    return true;
  }

  utility(npc: Mob): number {
    return npc.personality.traits[PersonalityTraits.Adventurousness];
  }

  description(): string {
    return 'wandering around and greeting others';
  }

  reaction(): string {
    return 'I am wandering around';
  }

  type(): string {
    return 'wander';
  }
}
