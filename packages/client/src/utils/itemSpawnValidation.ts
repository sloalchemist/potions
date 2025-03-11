import { Coord } from '@rt-potion/common';
import { world } from '../scenes/worldScene';

export function isItemPlacementValid(
  coord: Coord,
  terrainHeight: number,
  terrainWidth: number
): boolean {
  const validTerrain = ['grass', 'dirt'];

  // Check if coordinates are within bounds
  if (
    coord.y < 0 ||
    coord.y >= terrainHeight ||
    coord.x < 0 ||
    coord.x >= terrainWidth
  ) {
    return false;
  }

  const terrainId = world.tiles[coord.y][coord.x]; // Get terrain type ID
  const terrainType = world.terrainTypes.get(terrainId); // Get terrain type

  // Check if terrain type is valid
  if (terrainType) {
    return validTerrain.includes(terrainType.name.toLowerCase());
  } else {
    return false;
  }
}
