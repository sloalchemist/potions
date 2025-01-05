import { Community, Item, Region, Graphable } from '@rt-potion/converse';
import { ServerWorldDescription } from '../services/gameWorld/worldMetadata';

export function buildGraphFromWorld(
  world: ServerWorldDescription
): Graphable[] {
  const socialWorld: Graphable[] = [];

  const regionMap: Record<string, Region> = {};
  for (const regionData of world.regions) {
    const region = new Region(
      regionData.id,
      regionData.name,
      regionData.description,
      regionData.parent ? regionMap[regionData.parent] : null,
      regionData.concepts
    );
    regionMap[regionData.id] = region;
    socialWorld.push(region);
  }

  for (const itemType of world.item_types) {
    socialWorld.push(
      new Item(itemType.type, itemType.description, regionMap['claw_island'])
    );
  }

  for (const community of world.communities) {
    socialWorld.push(
      new Community(
        community.id,
        community.name,
        community.description,
        regionMap['claw_island'],
        []
      )
    );
  }

  return socialWorld;
}
