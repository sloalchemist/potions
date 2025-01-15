import { Coord } from './coord';

export type MobI = {
  id: string;
  position: Coord;
  type: string;
  subtype: string;
  target?: Coord;
  path: Coord[];
  name: string;
  maxHealth: number;
  carrying?: string;
  attributes: Record<string, number>;
  unlocks: string[];
  doing: string;
};
