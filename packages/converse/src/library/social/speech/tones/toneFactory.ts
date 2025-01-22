import { Compliment } from './compliment';
import { Insult } from './insult';
import { Joking } from './joking';
import { Neutral } from './neutral';

export const neutralTone = new Neutral();
export const jokingTone = new Joking();
export const complimentingTone = new Compliment();
export const insultingTone = new Insult();
export const potentialTones = [
  neutralTone,
  jokingTone,
  complimentingTone,
  insultingTone
] as const;
