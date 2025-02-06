import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of personality-related concepts.
 */
export class Personality implements ConceptHierarchy {
  /**
   * Gets concepts related to the personality of a subject.
   *
   * @returns A list of personality-related concepts.
   */
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
