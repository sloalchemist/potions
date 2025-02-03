import { Concept, ConceptHierarchy } from './concept';

/**
 * Represents a hierarchy of event-related concepts.
 */
export class Events implements ConceptHierarchy {
  /**
   * Gets concepts related to the events of a subject.
   *
   * @returns A list of event-related concepts, including options such as
   *          festival, battle, harvest, hunt, marriage, and death.
   */
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'event',
      name: 'event',
      as_question: 'what happened to <subject>?'
    };
    const concepts: Concept[] = [topLevelConcept];

    const eventConcepts = [
      {
        id: 'festival',
        name: 'Festival',
        as_question: 'did <subject> attend a festival?',
        parent_concept: topLevelConcept
      },
      {
        id: 'battle',
        name: 'Battle',
        as_question: 'was <subject> involved in a battle?',
        parent_concept: topLevelConcept
      },
      {
        id: 'harvest',
        name: 'Harvest',
        as_question: 'did <subject> participate in a harvest?',
        parent_concept: topLevelConcept
      },
      {
        id: 'hunt',
        name: 'Hunt',
        as_question: 'did <subject> go on a hunt?',
        parent_concept: topLevelConcept
      },
      {
        id: 'marriage',
        name: 'Marriage',
        as_question: 'did <subject> attend a marriage?',
        parent_concept: topLevelConcept
      },
      {
        id: 'death',
        name: 'Death',
        as_question: 'was <subject> present at a death?',
        parent_concept: topLevelConcept
      }
    ] as const satisfies readonly Concept[];
    concepts.push(...eventConcepts);
    return concepts;
  }
}
