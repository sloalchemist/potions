import { Coord } from '@rt-potion/common';
import { Mob } from './mob';
import { Physical } from './physical';
import { World } from './world';
import { InteractionType, ItemType } from '../worldDescription';

export class Item extends Physical {
  name?: string;
  carried_by?: string;
  currently_at: Mob[] = [];
  itemType: ItemType;
  attributes: Record<string, string | number> = {};
  a?: string;
  templateType?: string;
  house?: string;
  lock?: string;
  ownedByCommunity?: string;

  constructor(
    world: World,
    key: string,
    position: Coord | null,
    itemType: ItemType,
    ownedByCommunity?: string
  ) {
    super(world, key, itemType.type, position);
    this.itemType = itemType;
    this.ownedByCommunity = ownedByCommunity;

    if (position) {
      world.addItemToGrid(this);
    }
  }

  isWalkable(unlocks: string[]): boolean {
    if (this.lock) {
      return unlocks.includes(this.lock);
    }
    return this.itemType.walkable ? true : false;
  }

  isOwnedByCommunity(community_id?: string): boolean {
    return this.ownedByCommunity === community_id;
  }

  destroy(world: World) {
    if (this.position) {
      world.removeItemFromGrid(this);
    }
    if (this.carried_by) {
      world.mobs[this.carried_by].carrying = undefined;
    }
    delete world.items[this.key];
  }

  giveItem(world: World, from: Mob, to: Mob) {
    if (!from.carrying) {
      throw new Error('Mob is not carrying anything');
    }
    if (to.carrying) {
      throw new Error('Mob is already carrying something');
    }
    if (this.carried_by !== from.key) {
      throw new Error('Item is not being carried by mob');
    }

    //console.log('giving item', this.key, mob);
    from.carrying = undefined;
    to.carrying = this.key;
    this.carried_by = to.key;

    this.position = null;
  }

  pickup(world: World, mob: Mob) {
    mob.carrying = this.key;
    this.carried_by = mob.key;
    if (this.position) {
      world.removeItemFromGrid(this);
    }
    this.position = null;
  }

  drop(world: World, mob: Mob, position: Coord) {
    if (!mob.position) {
      throw new Error('Mob has no position');
    }
    mob.carrying = undefined;
    this.carried_by = undefined;
    this.position = position;
    world.addItemToGrid(this);
    // place in position determined by server
  }

  stash(world: World, mob: Mob, position: Coord) {
    if (!this.carried_by) {
      throw new Error('Must carry item being stashed');
    }
    console.log('stashing item', this.key, this.carried_by);
    mob.carrying = undefined;
    this.position = position;
    world.removeItemFromGrid(this);
    this.position = null;
    this.carried_by = undefined;
    world.addStoredItem(this); // Add to stored items
  }

  unstash(world: World, mob: Mob, position: Coord) {
    if (!mob.position) {
      throw new Error('Mob has no position');
    }
    this.carried_by = undefined;
    this.position = position;
    world.addItemToGrid(this);
    world.removeStoredItem(this); // Remove from stored items
  }

  tick(world: World, deltaTime: number) {
    super.tick(world, deltaTime);
  }

  conditionMet(interaction: InteractionType): boolean {
    let conditionsMet = true;
    if (interaction.conditions) {
      interaction.conditions.forEach((condition) => {
        const current_value = this.attributes[
          condition.attribute_name
        ] as number;
        switch (condition.comparison) {
          case 'equals':
            conditionsMet = conditionsMet && current_value === condition.value;
            break;
          case 'greater_than':
            conditionsMet = conditionsMet && current_value > condition.value;
            break;
          case 'less_than':
            conditionsMet = conditionsMet && current_value < condition.value;
            break;
          case 'greater_than_or_equal':
            conditionsMet = conditionsMet && current_value >= condition.value;
            break;
          case 'less_than_or_equal':
            conditionsMet = conditionsMet && current_value <= condition.value;
            break;
        }
      });
    }
    return conditionsMet;
  }
}
