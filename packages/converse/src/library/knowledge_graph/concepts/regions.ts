import { Concept, ConceptHierarchy } from './concept';

export class Regions implements ConceptHierarchy {
  /**
   * Gets concepts related to the region of a subject.
   *
   * @returns A list of region-related concepts.
   */
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
