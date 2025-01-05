import { Item } from '../item';

export interface OnTick {
  key: string;
  onTick(item: Item, parameters: Record<string, string | number>): boolean;
}
