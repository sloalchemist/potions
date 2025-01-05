import { Coord } from '@rt-potion/common';
import { Item } from './item';
import { v4 as uuidv4 } from 'uuid';
import { Community } from '../community/community';
import { House } from '../community/house';
import { Eat } from './uses/eat';
import { Mob } from '../mobs/mob';
import { ItemType } from '../services/gameWorld/worldMetadata';

type CreateItemParams = {
  type: string;
  position?: Coord;
  subtype?: string;
  lock?: string;
  ownedBy?: Community;
  house?: House;
  attributes?: Record<string, string | number>;
  carriedBy?: Mob;
};

export class ItemGenerator {
  private indices: Record<string, number> = {};
  private itemTypes: Record<string, ItemType> = {};
  private edibleItemTypes: ItemType[] = [];

  constructor(itemTypes: ItemType[]) {
    for (const itemType of itemTypes) {
      this.itemTypes[itemType.type] = itemType;
      // Check if the item has an 'eat' interaction
      if (
        itemType.interactions.some(
          (interaction) => interaction.action === Eat.KEY
        )
      ) {
        this.edibleItemTypes.push(itemType);
      }
    }
  }

  public getItemType(type: string): ItemType {
    return this.itemTypes[type];
  }

  public getEdibleItemTypes(): ItemType[] {
    return this.edibleItemTypes;
  }

  public createItem({
    type,
    subtype,
    position,
    ownedBy,
    house,
    attributes,
    carriedBy,
    lock
  }: CreateItemParams) {
    this.indices[type] = (this.indices[type] || 0) + 1;
    const key = uuidv4();
    const itemType = this.itemTypes[type];
    if (!itemType) {
      throw new Error(`Unknown item type: ${type}`);
    }

    if (position) {
      position = Item.findEmptyPosition(position);
    }
    Item.insertIntoDB({
      id: key,
      position,
      itemType,
      subtype,
      lock,
      ownedBy,
      house,
      attributes: attributes || {},
      carriedBy
    });
  }

  static initialize(itemTypes: ItemType[]) {
    itemGenerator = new ItemGenerator(itemTypes);
  }
}
let itemGenerator: ItemGenerator;

export { itemGenerator };
