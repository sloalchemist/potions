import { ItemGenerator, itemGenerator } from '../items/itemGenerator';
import { DB } from '../services/database';
import { Coord } from '@rt-potion/common';
import { Community } from '../community/community';
import { House } from '../community/house';
import { FantasyDate } from '../date/fantasyDate';
import { Item } from '../items/item';
import { Personality } from '../mobs/traits/personality';
import { Mob } from '../mobs/mob';
import { DataLogger } from '../grafana/dataLogger';
import {
  ItemConfig,
  ServerWorldDescription
} from '../services/gameWorld/worldMetadata';

const schema = `
    ${Mob.SQL}
    ${Mob.effectsSQL}
    ${Personality.SQL}
    ${Community.SQL}
    ${Item.SQL}
    ${House.SQL}
    ${DataLogger.SQL}

    CREATE TABLE ticks (
        tick INTEGER NOT NULL
    );
`;

export function loadDefaults(global: ServerWorldDescription) {
  const { communities, alliances, houses, items, containers } = global;

  const itemTypes = [...global.item_types];
  ItemGenerator.initialize(itemTypes);

  // Create villages
  const communityMap: Record<string, Community> = {};
  communities.forEach((community: { id: string; name: string }) => {
    communityMap[community.id] = Community.makeVillage(
      community.id,
      community.name
    );
  });

  // Create alliances
  for (const alliance of alliances) {
    Community.makeAlliance(
      communityMap[alliance[0]],
      communityMap[alliance[1]]
    );
  }
  // First find unique pairs of communities
  // Super inefficient code but gets the job done. If anyone wants to improve
  // the code, please do so.
  var result: string[][] = [];
  for (var one in communities) {
    for (var two in communities) {
      if (!(one === two)) {
        if (
          !result.some(
            (pair) =>
              pair[0] === communities[two].id && pair[1] === communities[one].id
          )
        ) {
          result.push([communities[one].id, communities[two].id]);
        }
      }
    }
  }
  // Create favorabilities
  result.forEach((pair) => {
    Community.makeFavor(pair[0], pair[1], 0);
  });

  // Create houses
  houses.forEach(
    (house: {
      location: Coord;
      width: number;
      height: number;
      community: string;
    }) => {
      console.log(`Creating house at ${house.location}`);
      House.makeHouse(
        house.location,
        house.width,
        house.height,
        communityMap[house.community]
      );
    }
  );

  // Create items
  items.forEach((item: ItemConfig) => {
    console.log(`Creating item ${item.type} at ${JSON.stringify(item.coord)}`);
    itemGenerator.createItem({
      type: item.type,
      position: item.coord,
      ownedBy: item.community ? communityMap[item.community] : undefined,
      lock: item.lock,
      attributes: item.options
    });
  });

  // Create containers
  containers.forEach(
    (container: {
      type: string;
      coord: Coord;
      community: string;
      itemType: string;
      count: number;
      capacity: number;
    }) => {
      console.log(
        `Creating container ${container.type} at ${JSON.stringify(container.coord)}`
      );
      itemGenerator.createItem({
        type: container.type,
        position: container.coord,
        ownedBy: communityMap[container.community],
        attributes: {
          templateType: container.itemType,
          items: container.count,
          capacity: container.capacity
        }
      });
    }
  );

  FantasyDate.initialDate();
}

export function createTables() {
  DB.exec(schema);
}
