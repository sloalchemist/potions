import { Noun } from './noun';

export type DesireType = 'like' | 'dislike' | 'love';

export interface Desire {
  person?: Noun;
  item: Noun;
  benefit: DesireType;
}
