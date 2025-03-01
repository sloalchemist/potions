import { Coord } from './coord';

export type MobI = {
  personalities: Record<string, number>;
  id: string;
  position: Coord;
  type: string;
  subtype: string;
  target?: Coord;
  path: Coord[];
  name: string;
  maxHealth: number;
  community_id: string;
  carrying?: string;
  attributes: Record<string, number>;
  unlocks: string[];
  doing: string;
  favorabilities: Record<string, number>;
};
