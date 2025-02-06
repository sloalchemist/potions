import { Item } from '../speaker/item';
import { Speaker } from '../speaker/speaker';

export interface Desire {
  desiree: Speaker;
  desired: Item;
  benefit: number;
}
