import { Concept, ConceptHierarchy } from './concept';

export class Lore implements ConceptHierarchy {
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'lore',
      name: 'lore',
      as_question: 'what lore or mythology do you know surrounding <subject>?'
    };
    const concepts: Concept[] = [topLevelConcept];

    return concepts;
  }
}
