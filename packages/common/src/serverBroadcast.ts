import { Coord } from './coord';
import { FantasyDateI } from './fantasyDate';
import { ItemI } from './item';
import { MobI } from './mob';

export type AddMobData = { id: string; mob: MobI };
export type AddItemData = { id: string; item: ItemI };
export type DestroyItemData = { object_key: string; mob_key?: string };
export type PickupItemData = { item_key: string; mob_key: string };
export type GiveItemData = {
  item_key: string;
  from_key: string;
  to_key: string;
};
export type DropItemData = {
  item_key: string;
  mob_key: string;
  position: Coord;
};

export type StashItemData = {
  item_key: string;
  mob_key: string;
  position: Coord;
};

export type UnstashItemData = {
  item_key: string;
  mob_key: string;
};

export type DoingData = { id: string; action: string };
export type MoveData = { id: string; target: Coord; path: Coord[] };
export type DestroyMobData = { id: string };
export type PortalData = { mob_key: string; portalTo: string };
export type MobChangeData = {
  id: string;
  property: string;
  delta: number;
  new_value: number;
};
export type MobChangeFavoriteData = {
  id: string;
  property: string;
  new_value: string;
};
export type SpeakData = { id: string; message: string };
export type PotionEffectData = { id: string; type: string };
export type ItemChangeData = { id: string; property: string; value: number };
export type SetDatetimeData = { date: FantasyDateI };
export type WorldMetadata = {
  id: string;
  name: string;
};
export type ShowPortalMenuData = {
  mob_key: string;
  worlds: WorldMetadata[];
};

export type ScoreboardData = {
  scores: [string, number][];
};

export type BroadcastData =
  | { type: 'add_mob'; data: AddMobData }
  | { type: 'add_item'; data: AddItemData }
  | { type: 'destroy_item'; data: DestroyItemData }
  | { type: 'pickup_item'; data: PickupItemData }
  | { type: 'give_item'; data: GiveItemData }
  | {
      type: 'drop_item';
      data: DropItemData;
    }
  | { type: 'stash_item'; data: StashItemData }
  | { type: 'unstash_item'; data: UnstashItemData }
  | { type: 'doing'; data: DoingData }
  | { type: 'move'; data: MoveData }
  | { type: 'destroy_mob'; data: DestroyMobData }
  | { type: 'portal'; data: PortalData }
  | {
      type: 'mob_change';
      data: MobChangeData;
    }
  | { type: 'mob_change_fav_item'; data: MobChangeFavoriteData }
  | { type: 'speak'; data: SpeakData }
  | { type: 'potion_effect'; data: PotionEffectData }
  | {
      type: 'item_change';
      data: ItemChangeData;
    }
  | { type: 'set_datetime'; data: SetDatetimeData }
  | { type: 'show_portal_menu'; data: ShowPortalMenuData }
  | { type: 'scoreboard'; data: ScoreboardData }
  | { type: 'reload_page' };

export type ServerToBroadcastMessageMap = {
  tick: BroadcastData[];
};
