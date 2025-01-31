import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of profession-related concepts.
 */
export class Professions implements ConceptHierarchy {
  /**
   * Gets concepts related to the professions of a subject.
   *
   * @returns A list of profession-related concepts, including options such as
   *          villager, adventurer, and alchemist.
   */
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'profession',
      name: 'profession',
      as_question: 'what does <subject> do around here?'
    };
    const concepts: Concept[] = [topLevelConcept];

    const professionConcepts = [
      {
        id: 'villager',
        name: 'villager',
        as_question: 'is <subject> a villager?',
        parent_concept: topLevelConcept
      },
      {
        id: 'adventurer',
        name: 'adventurer',
        as_question: 'is <subject> an adventurer?',
        parent_concept: topLevelConcept
      },
      {
        id: 'alchemist',
        name: 'alchemist',
        as_question: 'is <subject> an alchemist?',
        parent_concept: topLevelConcept
      }
    ] as const satisfies readonly Concept[];
    concepts.push(...professionConcepts);
    return concepts;
  }
}
