import { Belief } from '../belief';
import { Desire } from '../desire';
import { KnowledgeGraph } from '../knowledgeGraph';
import { Noun } from '../noun';

/**
 * Represents an entity that can be graphed in the knowledge graph.
 */
export interface Graphable {
  getNoun(): Noun;
  getBeliefs(): Belief[];
  getDesires(): Desire[];
}

/**
 * Construct a knowledge graph from a list of graphable objects.
 *
 * @param graphables - List of graphable objects to construct the graph from.
 * @returns The constructed knowledge graph.
 *
 * This function constructs a knowledge graph by iterating over the list of
 * graphable objects and adding their respective nouns, beliefs, and desires to
 * the graph.
 */
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
