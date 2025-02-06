import { Noun } from './noun';

/**
 * Represents the type of a desire.
 */
export type DesireType = 'like' | 'dislike' | 'love';

/**
 * Represents a desire in the knowledge graph.
 */
export interface Desire {
  person?: Noun;
  item: Noun;
  benefit: DesireType;
}
