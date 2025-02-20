import { TerrainType } from '@rt-potion/common';

export interface TextureLocation {
  x: number;
  y: number;
}

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

export interface InteractionPermission {
  community: boolean;
  // player: boolean;
  other: boolean;
}

export interface InteractionType {
  description: string;
  action: string;
  while_carried: boolean;
  while_carrying?: string;
  requires_item?: string;
  conditions?: InteractionCondition[];
  permissions?: InteractionPermission;
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
  type: string;
  item_group?: string;
  layout_type?: 'wall' | 'fence' | 'opens';
  carryable: boolean;
  smashable?: boolean;
  templated?: boolean;
  flat?: boolean;
  walkable?: boolean;
  interactions: InteractionType[];
  show_price_at?: TextureLocation;
  show_template_at?: TextureLocation;
  attributes?: Attribute[];
}

export interface MobType {
  name: string;
  type: string;
}

export interface WorldDescription {
  tiles: number[][];
  terrain_types: TerrainType[];
  item_types: ItemType[];
  mob_types: MobType[];
}

// export function parseWorldFromJson(json: string): WorldDescription {
//   const worldDescripton: WorldDescription = JSON.parse(JSON.stringify(json));
//   return worldDescripton;
// }

export function parseWorldFromJson(
  globaljson: string,
  specificjson: string
): WorldDescription {
  const globalDescription: WorldDescription = JSON.parse(
    JSON.stringify(globaljson)
  );
  const specificDescription: Partial<WorldDescription> = JSON.parse(
    JSON.stringify(specificjson)
  );
  const worldDescripton: WorldDescription = {
    ...globalDescription,
    ...specificDescription
  };
  return worldDescripton;
}
