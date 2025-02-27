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
  ownedByCommunity?: Community;
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

  get _itemTypes() {
    return this.itemTypes;
  }

  public getItemType(type: string): ItemType {
    if (!this.itemTypes[type]) {
      throw new Error(
        `Unknown item type: ${type}. 
        Your database likely saved an item from a version your code currently doesn't support. 
        Try emptying your supabase bucket`
      );
    }
    return this.itemTypes[type];
  }

  public getEdibleItemTypes(): ItemType[] {
    return this.edibleItemTypes;
  }

  public createItem({
    type,
    subtype,
    position,
    ownedByCommunity,
    house,
    attributes,
    carriedBy,
    lock
  }: CreateItemParams) {
    this.indices[type] = (this.indices[type] || 0) + 1;
    const key = uuidv4();
    const itemType = this.itemTypes[type];
    if (!itemType) {
      throw new Error(
        `Unknown item type: ${type}. 
        Your database likely saved an item from a version your code currently doesn't support. 
        Try emptying your supabase bucket`
      );
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
      ownedByCommunity,
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
