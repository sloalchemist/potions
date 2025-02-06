import { Belief } from '../belief';

/**
 * Represents existing knowledge in the knowledge graph.
 */
export interface ExistingKnowledge {
  getConcept(): string;
  getKnowledge(): Belief[];
}
