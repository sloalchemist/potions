import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of feeling-related concepts.
 */
export class Feelings implements ConceptHierarchy {
  /**
   * Gets concepts related to the emotions of a subject.
   *
   * @returns A list of emotion-related concepts, including options such as
   *          happy, sad, angry, excited, scared, love, hate, and fear.
   */
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'feeling',
      name: 'feeling',
      as_question: 'how is <subject> feeling?'
    };
    const concepts: Concept[] = [topLevelConcept];

    const feelingConcepts = [
      {
        id: 'happy',
        name: 'happy',
        as_question: 'is <subject> feeling happy?',
        parent_concept: topLevelConcept
      },
      {
        id: 'sad',
        name: 'sad',
        as_question: 'is <subject> feeling sad?',
        parent_concept: topLevelConcept
      },
      {
        id: 'angry',
        name: 'angry',
        as_question: 'is <subject> feeling angry?',
        parent_concept: topLevelConcept
      },
      {
        id: 'excited',
        name: 'excited',
        as_question: 'is <subject> feeling excited?',
        parent_concept: topLevelConcept
      },
      {
        id: 'scared',
        name: 'scared',
        as_question: 'is <subject> feeling scared?',
        parent_concept: topLevelConcept
      },
      {
        id: 'love',
        name: 'love',
        as_question: 'is <subject> feeling love?',
        parent_concept: topLevelConcept
      },
      {
        id: 'hate',
        name: 'hate',
        as_question: 'is <subject> feeling hate?',
        parent_concept: topLevelConcept
      },
      {
        id: 'fear',
        name: 'fear',
        as_question: 'is <subject> feeling fear?',
        parent_concept: topLevelConcept
      }
    ] as const satisfies readonly Concept[];
    concepts.push(...feelingConcepts);
    return concepts;
  }
}
