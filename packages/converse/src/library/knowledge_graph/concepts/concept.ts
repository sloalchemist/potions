export interface Concept {
  id: string;
  name: string;
  as_question: string;
  parent_concept?: Concept;
}

export interface ConceptHierarchy {
  getConcepts(): Concept[];
}
