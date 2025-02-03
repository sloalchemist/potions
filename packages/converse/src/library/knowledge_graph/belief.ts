import { Noun } from './noun';

/**
 * Represents a belief in the knowledge graph.
 */
export interface Belief {
  id?: string;
  subject: Noun;
  related_to?: Noun;
  concept: string;
  name: string;
  description: string;
  trust: number;
}
