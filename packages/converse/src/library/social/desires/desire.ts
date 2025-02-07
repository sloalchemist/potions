import { Item } from '../speaker/item';
import { Speaker } from '../speaker/speaker';

/**
 * Interface representing a desire.
 */
export interface Desire {
  desiree: Speaker;
  desired: Item;
  benefit: number;
}
