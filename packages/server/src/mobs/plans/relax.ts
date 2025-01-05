import { Mob } from '../mob';
import { Plan } from './plan';

export class Relax implements Plan {
  execute(npc: Mob): boolean {
    npc.needs.changeNeed('energy', 10);
    npc.setMoveTarget(npc.position!);

    return false;
  }

  utility(npc: Mob): number {
    return npc.needs.getNeed('max_energy') - npc.needs.getNeed('energy');
  }

  description(): string {
    return 'Relaxing';
  }

  reaction(): string {
    return 'Relaxing...';
  }

  type(): string {
    return 'relax';
  }
}
