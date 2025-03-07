import { Coord } from './coord';

export type PlayerToServerMessageMap = {
  chat_request: { mob_key: string };
  fight_request: { mob_key: string };
  speak: { response: number };
  fight: { attack: number };
  interact: { item_key: string; action: string; give_to: string | null };
  join: { name: string; subtype: string; world_id?: string };
  move: { target: Coord };
  update_state: { name: string };
  cheat: { action: string };
  unhide: Record<string, never>;
};
