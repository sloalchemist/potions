import { floor, Coord, calculateDistance } from '@rt-potion/common';
import { UsesRegistry } from './uses/usesRegistry';
import { OnTickRegistry } from './on_ticks/onTickRegistry';
import { DB } from '../services/database';
import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Community } from '../community/community';
import { House } from '../community/house';
import { pubSub } from '../services/clientCommunication/pubsub';
import { gameWorld } from '../services/gameWorld/gameWorld';
import { ItemType } from '../services/gameWorld/worldMetadata';

function shuffleArray(array: Coord[]): Coord[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export interface ItemData {
  id: string;
  type: string;
  subtype: string;
  position_x: number;
  position_y: number;
  house_id?: string;
  lock?: string;
  drops_item?: string; // i was here :3
  owned_by?: string;
}

export interface ItemAttributeData {
  attribute: string;
  value: string | number;
}

type ItemAttributes = Record<string, string | number>;

interface ItemParams {
  id: string;
  position?: Coord;
  itemType: ItemType;
  subtype?: string;
  lock?: string;
  ownedBy?: Community;
  house?: House;
  attributes: Record<string, string | number>;
  carriedBy?: Mob;
  drops_item?: string; //i was here :3
}

export class Item {
  public readonly id: string;
  public position?: Coord;
  public readonly itemType: ItemType;
  public readonly type: string;
  public readonly drops_item;
  private attributes: ItemAttributes = {};

  public readonly owned_by?: string;

  public readonly lock?: string;
  public readonly house?: string;
  public readonly subtype?: string;

  private constructor({
    id,
    position,
    itemType,
    subtype,
    lock,
    ownedBy,
    house,
    attributes = {}
  }: ItemParams) {
    this.id = id;
    this.position = position;
    this.itemType = itemType;
    this.type = itemType.type;
    this.lock = lock;
    this.subtype = subtype;
    this.house = house?.id;
    this.owned_by = ownedBy?.id;
    this.drops_item = itemType.drops_item;

    for (const [key, value] of Object.entries(attributes)) {
      this.attributes[key] = value;
    }
  }

  static loadFromDB(
    itemData: ItemData,
    itemAttributeData: ItemAttributeData[]
  ): Item {
    const attributes = itemAttributeData.reduce(
      (acc, { attribute, value }) => {
        acc[attribute] = value;
        return acc;
      },
      {} as Record<string, string | number>
    );
    const item = new Item({
      id: itemData.id,
      position: { x: itemData.position_x, y: itemData.position_y },
      itemType: itemGenerator.getItemType(itemData.type),
      subtype: itemData.subtype,
      lock: itemData.lock,
      ownedBy: itemData.owned_by
          ? Community.getVillage(itemData.owned_by)
          : undefined,
      attributes: attributes
    });

    return item;
  }

  static insertIntoDB(item: ItemParams) {
    // console.log(`Inserting ${item.id} into DB with ownership: ${item.ownedBy?.id}`);
    DB.prepare(
      `
            INSERT INTO items (id, type, subtype, position_x, position_y, owned_by, house_id, lock)
            VALUES (:id, :type, :subtype, :position_x, :position_y, :owned_by, :house_id, :lock);
            `
    ).run({
      id: item.id,
      type: item.itemType.type,
      subtype: item.subtype,
      position_x: item.position ? item.position.x : null,
      position_y: item.position ? item.position.y : null,
      owned_by: item.ownedBy?.id,
      house_id: item.house?.id,
      lock: item.lock
    });

    const attributes: Record<string, string | number> = {};
    if (item.itemType.attributes) {
      for (const attribute of item.itemType.attributes) {
        attributes[attribute.name] = attribute.value;
      }
    }

    for (const [key, value] of Object.entries(item.attributes)) {
      attributes[key] = value;
    }

    for (const [key, value] of Object.entries(attributes)) {
      DB.prepare(
        `
                INSERT INTO item_attributes (item_id, attribute, value)
                VALUES (:item_id, :attribute, :value);
                `
      ).run({ item_id: item.id, attribute: key, value });
    }

    if (item.carriedBy) {
      const carriedItem = Item.getItem(item.id);
      item.carriedBy.carrying = carriedItem;
    }

    pubSub.addItem(item.id);
  }

  static getItemIDAt(coord: Coord): string | undefined {
    const itemData = DB.prepare(
      `
            SELECT 
                items.id
            FROM items
            WHERE position_x = :x AND position_y = :y
            `
    ).get({ x: coord.x, y: coord.y }) as { id: string };

    if (!itemData) {
      return undefined;
    }

    return itemData.id;
  }

  static getItem(key: string): Item | undefined {
    const itemData = DB.prepare(
      `
            SELECT 
                items.id,
                items.type,
                items.subtype,
                items.position_x,
                items.position_y,
                mobs.id as carried_by,
                items.lock,
                items.owned_by
            FROM items
            LEFT JOIN mobs ON mobs.carrying_id = items.id
            WHERE items.id = :id;
            `
    ).get({ id: key }) as ItemData;

    if (!itemData) {
      return undefined;
    }

    const attributes = DB.prepare(
      `
            SELECT attribute, value
            FROM item_attributes
            WHERE item_id = :id;
            `
    ).all({ id: key }) as ItemAttributeData[];

    const item = Item.loadFromDB(itemData, attributes);

    return item;
  }

  static countTypeOfItem(type: string): number {
    const count = DB.prepare(
      `
            SELECT COUNT(*) AS number FROM items where type = :type
            `
    ).get({ type }) as { number: number };
    return count.number;
  }

  static countTypeOfItemInRadius(
    type: string,
    position: Coord,
    radius: number
  ): number {
    // Get all items of the specified type
    const itemLocs = DB.prepare(
      `
        SELECT position_x, position_y FROM items WHERE type = :type AND position_x NOT NULL AND position_y NOT NULL
      `
    ).all({ type }) as { position_x: number; position_y: number }[];

    // Turn x, y data into Coord data
    const itemLocsAsCoords: Coord[] = itemLocs.map((loc) => ({
      x: loc.position_x,
      y: loc.position_y
    }));

    // Filter out items that are outside of the radius
    const itemsLocsInRadius: Coord[] = itemLocsAsCoords.filter(
      (loc) => calculateDistance(position, loc) <= radius
    );

    return itemsLocsInRadius.length;
  }

  static findEmptyPosition(position: Coord, maxRadius: number = 50): Coord {
    const flooredCoord = floor(position);

    if (Item.getItemIDAt(flooredCoord) === undefined) {
      return flooredCoord;
    }

    let radius = 1;

    while (radius <= maxRadius) {
      // Collect all possible positions within the current radius
      let positions: Coord[] = [];

      for (let i = flooredCoord.x - radius; i <= flooredCoord.x + radius; i++) {
        for (
          let j = flooredCoord.y - radius;
          j <= flooredCoord.y + radius;
          j++
        ) {
          positions.push({ x: i, y: j });
        }
      }

      // Shuffle the positions to randomize the order of checking
      positions = shuffleArray(positions);

      // Check each position in the randomized order
      for (const pos of positions) {
        if (Item.getItemIDAt(pos) === undefined && gameWorld.isWalkable(pos)) {
          return pos;
        }
      }

      radius += 1;
    }

    throw new Error(`No empty position found within radius ${maxRadius}`);
  }

  setAttribute<T extends string | number>(key: string, value: T): void {
    const currentValue = this.attributes[key];
    if (currentValue && currentValue === value) {
      return;
    }
    this.attributes[key] = value;
    DB.prepare(
      `
        UPDATE item_attributes
        SET value = :value
        WHERE item_id = :id and attribute = :key;
      `
    ).run({ id: this.id, key, value });
    if (typeof value === 'number') {
      pubSub.changeItemAttribute(this.id, key, value);
    }
  }

  changeAttributeBy(key: string, change: number): void {
    const currentValue = this.attributes[key];
    if (typeof currentValue !== 'number') {
      throw new Error(
        `Attribute ${key} is not a number and cannot be incremented.`
      );
    }
    const newValue = currentValue + change;
    this.attributes[key] = newValue;
    DB.prepare(
      `
        UPDATE item_attributes
        SET value = value + :change
        WHERE item_id = :id and attribute = :key;
      `
    ).run({ id: this.id, key, change });
    pubSub.changeItemAttribute(this.id, key, newValue);
  }

  getAttribute<T extends string | number>(key: string): T {
    return this.attributes[key] as T;
  }

  hasAttribute(key: string): boolean {
    return this.attributes[key] !== undefined;
  }

  tick() {
    if (!this.itemType.on_tick) {
      return;
    }
    for (const tick of this.itemType.on_tick) {
      const onTick = OnTickRegistry.instance.getOnTick(tick.action);
      if (!onTick) {
        throw new Error(`Unknown on tick: ${tick.action} for item ${this.id}`);
      }
      onTick.onTick(this, tick.parameters);
    }
  }

  static getAllItemIDs(): string[] {
    const result = DB.prepare(
      `
                SELECT 
                    id
                FROM
                items;
                `
    ).all() as { id: string }[];
    //console.log('starting item ticks');
    return result.map((row) => row.id);
  }

  destroy(): void {
    DB.prepare(
      `
            DELETE FROM 
            items
            WHERE id = :id;
            `
    ).run({ id: this.id });

    pubSub.destroy(this);
  }

  interact(
    mob: Mob,
    action: string,
    giveTo: Mob | undefined = undefined
  ): void {
    const use = UsesRegistry.instance.getUse(action);
    use.interact(mob, this, giveTo);
  }

  /**
   * Checks if the given mob has permission to interact with this item.
   * Logs a warning if the mob is unauthorized.
   * @param mob The mob attempting the interaction.
   * @param interaction The interaction attempted.
   * @returns True if the mob is authorized, false otherwise.
   */
  validateOwnership(mob: Mob, interaction: string): boolean {
    // console.log(`${item.type} belongs to ${item.owned_by}`);
    // if no one owns the item or if the mob owns it, return true
    if (!this.owned_by || mob.community_id === this.owned_by) return true;

    console.warn(
        `Mob ${mob.name} (${mob.id}) from ${mob.community_id} community ` +
        `is not authorized to ${interaction} from ${this.type} owned by ${this.owned_by}`
    );
    return false;
  }

  static SQL = `
        CREATE TABLE items (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            subtype TEXT,
            position_x INTEGER,
            position_y INTEGER,
            lock TEXT,
            house_id TEXT REFERENCES houses (id) ON DELETE SET NULL,
            owned_by TEXT REFERENCES community (id) ON DELETE SET NULL,
            UNIQUE (position_x, position_y)
        );

        CREATE TABLE item_attributes (
            item_id TEXT NOT NULL,
            attribute TEXT NOT NULL,
            value NUMERIC NOT NULL,
            PRIMARY KEY (item_id, attribute),
            FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
        );
    `;
}
