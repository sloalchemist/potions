import { mergeObjects } from 'json-merger';

import {
  terrainTypes,
  itemTypes,
  mobTypes,
  communities,
  alliances
} from './global_data';
import { tiles, houses, items, containers, regions } from './world_specific';

// Structure the merged data with labeled keys
export const globalData = mergeObjects([
  { tiles: tiles },
  { terrain_types: terrainTypes },
  { item_types: itemTypes },
  { mob_types: mobTypes },
  { communities: communities },
  { alliances: alliances },
  { houses: houses },
  { items: items },
  { containers: containers },
  { regions: regions }
]);


