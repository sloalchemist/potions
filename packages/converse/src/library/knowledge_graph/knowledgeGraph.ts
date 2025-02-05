import { Belief } from './belief';
import { Concept } from './concepts/concept';
import { Desire } from './desire';
import { Noun } from './noun';

/**
 * Represents a knowledge graph.
 */
export interface KnowledgeGraph {
  concepts: Concept[];
  beliefs: Belief[];
  nouns: Noun[];
  desires: Desire[];
}
