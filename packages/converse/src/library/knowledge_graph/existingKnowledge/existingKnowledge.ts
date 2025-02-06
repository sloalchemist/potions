import { Belief } from '../belief';

export interface ExistingKnowledge {
  getConcept(): string;
  getKnowledge(): Belief[];
}
