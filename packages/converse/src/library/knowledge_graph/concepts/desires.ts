import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of desire-related concepts.
 */
export class Desires implements ConceptHierarchy {
  /**
   * Retrieves concepts related to the desires of a subject.
   *
   * @returns An array of desire-related concepts, including options such as
   *          like and dislike.
   */
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'desire',
      name: 'desire',
      as_question: "What are <subject>'s likes and dislikes?"
    };
    const concepts: Concept[] = [topLevelConcept];

    const desireConcepts = [
      {
        id: 'like',
        name: 'like',
        as_question: 'what do they like?',
        parent_concept: topLevelConcept
      },
      {
        id: 'dislike',
        name: 'dislike',
        as_question: 'what do they dislike?',
        parent_concept: topLevelConcept
      }
    ] as const satisfies readonly Concept[];
    concepts.push(...desireConcepts);
    return concepts;
  }
}
