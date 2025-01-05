import { Mob } from '../mob';
import { Plan as Plan } from './plan';

export interface Means {
  execute(npc: Mob): boolean;
  cost(npc: Mob): number;
}

export abstract class PlanMeans implements Plan {
  //abstract desire(npc: NPC, world: ServerWorld): Desire[];
  abstract benefit(npc: Mob): number;
  abstract description(): string;
  abstract reaction(): string;
  abstract type(): string;

  means: Means[] = [];
  selectedMeans: Means | null = null;

  constructor(means: Means[]) {
    this.means = means;
  }

  execute(npc: Mob): boolean {
    if (!this.selectedMeans) {
      return false;
    }
    const finished = this.selectedMeans.execute(npc);
    //console.log(`Executing ${this.selectedMeans.constructor.name} for ${npc.name} finished: ${finished}`);
    return finished;
  }

  utility(npc: Mob): number {
    const benefit = this.benefit(npc);

    let lowestCost = Infinity;
    this.selectedMeans = null;
    for (const mean of this.means) {
      const cost = mean.cost(npc);
      if (cost < lowestCost) {
        lowestCost = cost;
        this.selectedMeans = mean;
      }
    }

    if (!this.selectedMeans) {
      return -Infinity;
    }
    return benefit - lowestCost;
  }
}
