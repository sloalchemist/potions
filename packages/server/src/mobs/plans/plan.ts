import { Mob } from '../mob';

export interface Plan {
  execute(npc: Mob): boolean;
  utility(npc: Mob): number;
  //desire(npc: NPC, world: ServerWorld): Desire[];
  description(): string;
  reaction(): string;
  type(): string;
}
