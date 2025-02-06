import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of community-related concepts.
 */
export class Communities implements ConceptHierarchy {
  /**
   * Retrieves concepts related to communities.
   *
   * @returns An array of community-related concepts, including options such as
   *          village, town, city, tribe, and guild.
   */
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'community',
      name: 'community',
      as_question: 'what community does <subject> belong to?'
    };
    const concepts: Concept[] = [topLevelConcept];

    const communityConcepts = [
      {
        id: 'village',
        name: 'village',
        as_question: 'does <subject> live in a village?',
        parent_concept: topLevelConcept
      },
      {
        id: 'town',
        name: 'town',
        as_question: 'does <subject> live in a town?',
        parent_concept: topLevelConcept
      },
      {
        id: 'city',
        name: 'city',
        as_question: 'does <subject> live in a city?',
        parent_concept: topLevelConcept
      },
      {
        id: 'tribe',
        name: 'tribe',
        as_question: 'is <subject> part of a tribe?',
        parent_concept: topLevelConcept
      },
      {
        id: 'guild',
        name: 'guild',
        as_question: 'is <subject> a member of a guild?',
        parent_concept: topLevelConcept
      }
    ] as const satisfies readonly Concept[];
    concepts.push(...communityConcepts);
    return concepts;
  }
}
