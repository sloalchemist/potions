import { Mob } from '../../mobs/mob';
import { Item } from '../item';

export interface Use {
  key: string;
  description(mob: Mob, item: Item): string;
  interact: (mob: Mob, item: Item, giveTo: Mob | undefined) => boolean;
}
