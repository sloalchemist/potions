import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of lore-related concepts.
 */
export class Lore implements ConceptHierarchy {
  /**
   * Gets concepts related to the lore of a subject.
   *
   * @returns A list of concepts.
   */
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
