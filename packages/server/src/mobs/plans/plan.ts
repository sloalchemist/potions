import { Mob } from '../mob';

export interface Plan {
  execute(npc: Mob): boolean;
  utility(npc: Mob): number;
  description(): string;
  reaction(): string;
  type(): string;
}
