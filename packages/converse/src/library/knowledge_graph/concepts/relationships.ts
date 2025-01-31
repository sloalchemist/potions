import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of relationship-related concepts.
 */
export class Relationships implements ConceptHierarchy {
  /**
   * Retrieves concepts related to relationships.
   *
   * @returns An array of relationship-related concepts, including options such as
   *          sibling, spouse, parent, child, grandparent, grandchild, and friend.
   */
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'relationship',
      name: 'relationship',
      as_question: 'Do you know who is related to <subject>?'
    };
    const concepts: Concept[] = [topLevelConcept];

    const relationshipConcepts = [
      {
        id: 'sibling',
        name: 'sister',
        as_question: 'Does <subject> have any siblings?',
        parent_concept: topLevelConcept
      },
      {
        id: 'spouse',
        name: 'wife',
        as_question: "Who is <subject>'s spouse?",
        parent_concept: topLevelConcept
      },
      {
        id: 'parent',
        name: 'mother',
        as_question: "Who is <subject>'s parent?",
        parent_concept: topLevelConcept
      },
      {
        id: 'child',
        name: 'daughter',
        as_question: 'Does <subject> have any children?',
        parent_concept: topLevelConcept
      },
      {
        id: 'grandparent',
        name: 'grandmother',
        as_question: "Who are <subject>'s grandparents?",
        parent_concept: topLevelConcept
      },
      {
        id: 'grandchild',
        name: 'grandchild',
        as_question: 'Does <subject> have any grandchildren?',
        parent_concept: topLevelConcept
      },
      {
        id: 'friend',
        name: 'friend',
        as_question: "Who are <subject>'s friends?",
        parent_concept: topLevelConcept
      }
    ] as const satisfies readonly Concept[];
    concepts.push(...relationshipConcepts);
    return concepts;
  }
}
