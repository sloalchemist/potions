import { Coord, TerrainType } from '@rt-potion/common';

export type CommunityConfig = {
  id: string;
  name: string;
  description: string;
};

export type AllianceConfig = string[];

export type HouseConfig = {
  location: Coord;
  width: number;
  height: number;
  community: string;
};

export type ItemConfig = {
  type: string;
  coord: Coord;
  community?: string;
  lock?: string;
  options?: Record<string, string>; // Allow optional additional properties
};

export type ContainerConfig = {
  type: string;
  coord: Coord;
  community: string;
  itemType: string;
  count: number;
  capacity: number;
};

export type PortalConfig = {
  coord: Coord;
};

export type Comparison =
  | 'equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal';

export interface InteractionCondition {
  attribute_name: string;
  value: number;
  comparison: Comparison;
}

export interface InteractionType {
  description: string;
  action: string;
  while_carried: boolean;
  while_carrying?: string;
  requires_item?: string;
  conditions?: InteractionCondition[];
}

export interface Attribute {
  name: string;
  value: string | number;
}

export interface TickActions {
  action: string;
  parameters: Record<string, number | string>;
}

export interface ItemType {
  name: string;
  description: string;
  type: string;
  carryable: boolean;
  templated?: boolean;
  walkable?: boolean;
  interactions: InteractionType[];
  attributes?: Attribute[];
  on_tick?: TickActions[];
  drops_item?: string;
}

export interface MobType {
  name: string;
  description: string;
  name_style: string;
  type: string;
  speaker: boolean;
  health: number;
  speed: number;
  attack: number;
  gold: number;
  community: string;

  stubbornness: number;
  bravery: number;
  aggression: number;
  industriousness: number;
  adventurousness: number;
  gluttony: number;
  sleepy: number;
  extroversion: number;
}

export type MobAggroBehaviors = {
  passive_mobs: string[];
  hungry_mobs: string[];
  aggressive_mobs: string[];
};

export type RegionConfig = {
  id: string;
  name: string;
  description: string;
  parent: string | null;
  concepts: string[];
};

export interface ServerWorldDescription {
  terrain_types: TerrainType[];
  item_types: ItemType[];
  mob_types: MobType[];

  regions: RegionConfig[];
  tiles: number[][];
  communities: CommunityConfig[];
  alliances: AllianceConfig[];
  houses: HouseConfig[];
  items: ItemConfig[];
  containers: ContainerConfig[];
  mob_aggro_behaviors: MobAggroBehaviors;
}
