import { Coord } from '@rt-potion/common';
import { world } from '../../../client/src/scenes/worldScene';

export function isItemPlacementValid(coord: Coord): boolean {
  const validTerrain = ['grass', 'dirt'];

  const terrainId = world.tiles[coord.y][coord.x]; // Get terrain type ID
  const terrainType = world.terrainTypes.get(terrainId); // Get terrain type

  // Check if terrain type is valid
  if (terrainType) {
    return validTerrain.includes(terrainType.name.toLowerCase());
  } else {
    return false;
  }
}
