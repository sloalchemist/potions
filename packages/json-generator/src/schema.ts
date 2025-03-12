import { z } from 'zod';

const coordSchema = z.object({
  x: z.number(),
  y: z.number()
});

const terrainTypeSchema = z.object({
  name: z.string(),
  id: z.number(),
  walkable: z.boolean()
});

const attributeSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number()])
});

const comparisonSchema = z.enum([
  'equals',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal'
]);

const interactionConditionSchema = z.object({
  attribute_name: z.string(),
  value: z.number(),
  comparison: comparisonSchema
});

const interactionTypeSchema = z.object({
  description: z.string(),
  action: z.string(),
  permissions: z
    .object({
      community: z.boolean().optional(),
      character: z.boolean().optional(),
      other: z.boolean().optional()
    })
    .optional(),
  while_carried: z.boolean(),
  while_carrying: z.string().optional(),
  requires_item: z.string().optional(),
  conditions: z.array(interactionConditionSchema).optional()
});

const tickActionsSchema = z.object({
  action: z.string(),
  parameters: z.record(z.union([z.number(), z.string()]))
});

const itemTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  carryable: z.boolean(),
  templated: z.boolean().optional(),
  show_template_at: z
    .object({
      x: z.number(),
      y: z.number()
    })
    .optional(),
  walkable: z.boolean().optional(),
  interactions: z.array(interactionTypeSchema),
  attributes: z.array(attributeSchema).optional(),
  on_tick: z.array(tickActionsSchema).optional(),
  drops_item: z.string().optional(),
  smashable: z.boolean().optional(),
  item_group: z.string().optional(),
  layout_type: z.string().optional(),
  open: z.boolean().optional(),
  flat: z.boolean().optional(),
  show_price_at: z
    .object({
      x: z.number(),
      y: z.number()
    })
    .optional()
});

const mobTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  name_style: z.string(),
  type: z.string(),
  speaker: z.boolean(),
  health: z.number(),
  speed: z.number(),
  attack: z.number(),
  defense: z.number(),
  gold: z.number(),
  community: z.string(),
  stubbornness: z.number(),
  bravery: z.number(),
  aggression: z.number(),
  industriousness: z.number(),
  adventurousness: z.number(),
  gluttony: z.number(),
  sleepy: z.number(),
  extroversion: z.number()
});

const communityConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
});

const allianceConfigSchema = z.array(z.string());

const houseConfigSchema = z.object({
  location: coordSchema,
  width: z.number(),
  height: z.number(),
  community: z.string()
});

const itemConfigSchema = z.object({
  type: z.string(),
  coord: coordSchema,
  community: z.string().optional(),
  lock: z.string().optional(),
  options: z.record(z.string()).optional()
});

const containerConfigSchema = z.object({
  type: z.string(),
  coord: coordSchema,
  community: z.string(),
  itemType: z.string(),
  count: z.number(),
  capacity: z.number()
});

const regionConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parent: z.string().nullable(),
  concepts: z.array(z.string())
});

const portalSchema = z.string();

const mobAggroBehaviorsSchema = z.object({
  aggressive_mobs: z.array(z.string()),
  hungry_mobs: z.array(z.string()),
  passive_mobs: z.array(z.string())
});

export const globalJsonSchema = z.object({
  terrain_types: z.array(terrainTypeSchema),
  item_types: z.array(itemTypeSchema),
  mob_types: z.array(mobTypeSchema),
  regions: z.array(regionConfigSchema),
  tiles: z.array(z.array(z.number())),
  communities: z.array(communityConfigSchema),
  alliances: z.array(allianceConfigSchema),
  houses: z.array(houseConfigSchema),
  items: z.array(itemConfigSchema),
  containers: z.array(containerConfigSchema),
  portals: z.array(portalSchema),
  mob_aggro_behaviors: mobAggroBehaviorsSchema
});

export type GlobalJson = z.infer<typeof globalJsonSchema>;
