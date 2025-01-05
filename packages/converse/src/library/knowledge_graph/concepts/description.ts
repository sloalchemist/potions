import { Concept, ConceptHierarchy } from './concept';

export class Description implements ConceptHierarchy {
  getConcepts(): Concept[] {
    const topLevelConcept = {
      id: 'description',
      name: 'description',
      as_question: 'what does <subject> look like?'
    };
    const concepts: Concept[] = [topLevelConcept];

    // Add any specific description concepts if needed
    const descriptionConcepts: Concept[] = [
      // Example: { "id": "concept_appearance", "name": "appearance", "as_question": "what is the appearance of <subject>?", "parent_concept": topLevelConcept }
    ];
    concepts.push(...descriptionConcepts);
    return concepts;
  }
}
