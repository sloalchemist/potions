import { Belief } from '../belief';
import { Desire } from '../desire';
import { KnowledgeGraph } from '../knowledgeGraph';
import { Noun } from '../noun';

export interface Graphable {
  getNoun(): Noun;
  getBeliefs(): Belief[];
  getDesires(): Desire[];
}

export function constructGraph(graphables: Graphable[]): KnowledgeGraph {
  const beliefs: Belief[] = [];
  const nouns: Noun[] = [];
  const desires: Desire[] = [];

  for (const graphable of graphables) {
    nouns.push(graphable.getNoun());
    beliefs.push(...graphable.getBeliefs());
    desires.push(...graphable.getDesires());
  }

  return { concepts: [], nouns: nouns, beliefs: beliefs, desires: desires };
}
