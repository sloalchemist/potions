import { Coord } from './coord';

export type ItemI = {
  id: string;
  name: string;
  type: string;
  subtype: string;
  position: Coord;
  attributes: Record<string, string | number>;
  templateType?: string;
  house?: string;
  lock?: string;
  carried_by?: string;
  ownedBy?: string;
};
