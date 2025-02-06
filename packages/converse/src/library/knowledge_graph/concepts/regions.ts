import { Concept, ConceptHierarchy } from './concept';

export class Regions implements ConceptHierarchy {
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'region',
      name: 'region',
      as_question: 'where region is <subject> part of?'
    };
    const concepts: Concept[] = [topLevelConcept];

    return concepts;
  }
}
