import { Concept, ConceptHierarchy } from './concept';

export class Desires implements ConceptHierarchy {
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
