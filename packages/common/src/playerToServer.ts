import { Coord } from './coord';

export type PlayerToServerMessageMap = {
  chat_request: { mob_key: string };
  speak: { response: number };
  interact: { item_key: string; action: string; give_to: string | null };
  join: { name: string; subtype: string };
  move: { target: Coord };
};
