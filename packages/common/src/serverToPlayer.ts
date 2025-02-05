import { FantasyDateI } from './fantasyDate';
import { HouseI } from './house';
import { ItemI } from './item';
import { MobI } from './mob';

export type ServerToPlayerMessageMap = {
  player_responses: { responses: string[] };
  player_attacks: { attacks: string[] };
  chat_confirm: { target: string };
  chat_close: { target: string };
  state: {
    mobs: MobI[];
    items: ItemI[];
    houses: HouseI[];
    date: FantasyDateI;
  };
};
