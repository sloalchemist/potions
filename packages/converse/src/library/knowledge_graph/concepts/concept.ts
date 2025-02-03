/**
 * Represents a concept in the knowledge graph.
 */
export interface Concept {
  id: string;
  name: string;
  as_question: string;
  parent_concept?: Concept;
}

/**
 * Represents a hierarchy of concepts.
 */
export interface ConceptHierarchy {
  getConcepts(): Concept[];
}
