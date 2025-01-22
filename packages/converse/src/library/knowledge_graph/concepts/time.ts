import { Concept, ConceptHierarchy } from './concept';

export class Time implements ConceptHierarchy {
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'time',
      name: 'time',
      as_question: 'what is happening at what time?'
    };
    const concepts: Concept[] = [topLevelConcept];

    const timeConcepts = [
      {
        id: 'time_distant_past',
        name: 'distant past',
        as_question: 'did <subject> happen a long time ago?',
        parent_concept: topLevelConcept
      },
      {
        id: 'time_past',
        name: 'past',
        as_question: 'did <subject> happen before now?',
        parent_concept: topLevelConcept
      },
      {
        id: 'time_present',
        name: 'present',
        as_question: 'is <subject> happening now?',
        parent_concept: topLevelConcept
      },
      {
        id: 'time_future',
        name: 'future',
        as_question: 'will <subject> happen after now?',
        parent_concept: topLevelConcept
      },
      {
        id: 'time_distant_future',
        name: 'distant future',
        as_question: 'will <subject> happen a long time from now?',
        parent_concept: topLevelConcept
      }
    ] as const;
    concepts.push(...timeConcepts);
    return concepts;
  }
}
