import { Coord, equals } from '@rt-potion/common';
import { Community } from './community';
import { itemGenerator } from '../items/itemGenerator';
import { v4 as uuidv4 } from 'uuid';
import { DB } from '../services/database';

export interface HouseData {
  id: string;
  top_left_x: number;
  top_left_y: number;
  width: number;
  height: number;
  community_id: string;
}

export class House {
  id: string;
  top_left: Coord;
  width: number;
  height: number;
  community_id: string;

  constructor(
    key: string,
    top_left: Coord,
    width: number,
    height: number,
    community_id: string
  ) {
    this.id = key;
    this.top_left = top_left;
    this.width = width;
    this.height = height;
    this.community_id = community_id;
  }

  center(): Coord {
    return {
      x: this.top_left.x + Math.floor(this.width / 2),
      y: this.top_left.y + Math.floor(this.height / 2)
    };
  }

  static findLeastPopulatedHouse(community_id: string): string | undefined {
    const house_id = DB.prepare(
      `
            SELECT 
                houses.id, COUNT(*)
            FROM houses
            LEFT JOIN mobs ON mobs.house_id = houses.id
            WHERE houses.community_id = :community_id
            GROUP BY houses.id
            ORDER BY COUNT(*) ASC
        `
    ).get({ community_id: community_id }) as { id: string };

    if (!house_id) {
      return undefined;
    }

    return house_id.id;
  }

  static makeHouse(
    top_left: Coord,
    width: number,
    height: number,
    village: Community
  ): House {
    const id = uuidv4();
    const doorPos = {
      x: top_left.x + Math.floor(width / 2),
      y: top_left.y + height
    };
    const house = new House(id, top_left, width, height, village.id);

    DB.prepare(
      `
            INSERT INTO houses (id, top_left_x, top_left_y, width, height, community_id)
            VALUES (:id, :top_left_x, :top_left_y, :width, :height, :community_id);
            `
    ).run({
      id: id,
      top_left_x: top_left.x,
      top_left_y: top_left.y,
      width,
      height,
      community_id: village.id
    });

    itemGenerator.createItem({
      type: 'door',
      position: doorPos,
      ownedBy: village,
      house,
      lock: village.id
    });

    for (let y = top_left.y; y <= top_left.y + height; y++) {
      itemGenerator.createItem({
        type: 'wall',
        position: { x: top_left.x, y },
        ownedBy: village,
        house
      });
      itemGenerator.createItem({
        type: 'wall',
        position: { x: top_left.x + width, y },
        ownedBy: village,
        house
      });
    }

    for (let x = top_left.x + 1; x < top_left.x + width; x++) {
      const coord1 = { x, y: top_left.y };
      if (!equals(coord1, doorPos)) {
        itemGenerator.createItem({
          type: 'wall',
          position: coord1,
          ownedBy: village,
          house
        });
      }
      const coord2 = { x, y: top_left.y + height };
      if (!equals(coord2, doorPos)) {
        itemGenerator.createItem({
          type: 'wall',
          position: coord2,
          ownedBy: village,
          house
        });
      }
    }

    return house;
  }

  static SQL: string = `
        CREATE TABLE houses (
            id TEXT PRIMARY KEY,
            top_left_x INTEGER NOT NULL,
            top_left_y INTEGER NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            community_id TEXT NOT NULL,
            FOREIGN KEY (community_id) REFERENCES community (id) ON DELETE CASCADE
        );
    `;
}
