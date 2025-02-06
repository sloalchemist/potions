import { Concept, ConceptHierarchy } from './concept';

export class Personality implements ConceptHierarchy {
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'personality',
      name: 'personality',
      as_question: 'what does <subject> act like?'
    };
    const concepts: Concept[] = [topLevelConcept];

    return concepts;
  }
}
