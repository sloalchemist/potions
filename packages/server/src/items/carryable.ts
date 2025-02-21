import { Mob } from '../mobs/mob';
import { Community } from '../community/community';
import { pubSub } from '../services/clientCommunication/pubsub';
import { DB } from '../services/database';
import { Item } from './item';

export class Carryable {
  private item: Item;

  private constructor(item: Item) {
    this.item = item;
  }

  static fromItem(item: Item): Carryable | undefined {
    if (item.itemType.carryable) {
      return new Carryable(item);
    }

    return undefined;
  }

  giveItem(from: Mob, to: Mob): boolean {
    // Check if the recipient mob is already carrying an item
    if (to.carrying) {
      return false;
    }

    // Check if the two mobs are not allied before allowing the item transfer
    if (Community.isNotAllied(from.community_id, to.community_id)) {
      return false;
    }

    // Transfer the item from the sender to the recipient
    from.carrying = undefined;
    to.carrying = this.item;

    // Publish the item transfer event
    pubSub.giveItem(this.item.id, from.id, to.id);

    return true;
  }

  pickup(mob: Mob): void {
    DB.prepare(
      `
            UPDATE items
            SET position_x = NULL, position_y = NULL
            WHERE id = :item_id;
            `
    ).run({ item_id: this.item.id });

    mob.carrying = this.item;
    this.item.position = undefined;

    pubSub.pickupItem(this.item.id, mob.id);
  }

  dropAtFeet(mob: Mob): void {
    if (mob.position) {
      const position = Item.findEmptyPosition(mob.position);

      DB.prepare(
        `
                UPDATE items
                SET position_x = :position_x, position_y = :position_y
                WHERE id = :item_id;
                `
      ).run({
        item_id: this.item.id,
        position_x: position.x,
        position_y: position.y
      });

      mob.carrying = undefined;
      this.item.position = position;
    } else {
      throw new Error('Mob has no position');
    }
    if (!this.item.position) {
      throw new Error('Item has no position');
    }

    pubSub.dropItem(this.item.id, mob.id, this.item.position);
  }

  // stash carried item into inventory
  stash(mob: Mob): boolean {
    if (!mob.position) {
      return false;
    }
    const position = Item.findEmptyPosition(mob.position);
    const carriedItem = mob.carrying;

    console.log('stash hit');
    // carriedItem must exist and === item.id
    if (!carriedItem || carriedItem.id !== this.item.id) {
      return false;
    }

    DB.transaction((mobId, itemId) => {
      DB.prepare(
        `
          UPDATE items 
          SET stored_by = ?, position_x = NULL, position_y = NULL
          WHERE id = ?
      `
      ).run(mobId, itemId);

      DB.prepare(
        `
          UPDATE mobs
          SET carrying_id = NULL
          WHERE carrying_id = ? AND id = ?
      `
      ).run(itemId, mobId);
    })(mob.id, this.item.id);

    mob.carrying = undefined;
    pubSub.stashItem(this.item.id, mob.id, position);

    return true;
  }

  // unstash stored items (drops at feet), swtiches carried item with stored item if carried exists
  unstash(mob: Mob): void {
    if (mob.position) {
      const position = Item.findEmptyPosition(mob.position);

      DB.prepare(
        `
                UPDATE items
                SET position_x = :position_x, position_y = :position_y, stored_by = NULL
                WHERE id = :item_id;
                `
      ).run({
        item_id: this.item.id,
        position_x: position.x,
        position_y: position.y
      });

      this.item.position = position;
    } else {
      throw new Error('Mob has no position');
    }
    if (!this.item.position) {
      throw new Error('Item has no position');
    }

    pubSub.unstashItem(this.item.id, mob.id, this.item.position);
  }

  static validateNoOrphanedItems(): void {
    const result = DB.prepare(
      `
        SELECT COUNT(*) as orphans
        FROM items
        LEFT JOIN mobs ON mobs.carrying_id = items.id
        WHERE mobs.id IS NULL AND items.position_x IS NULL AND items.position_y IS NULL AND items.stored_by == NULL
        `
    ).get() as { orphans: number };

    const orphans = result.orphans;

    if (orphans > 0) {
      throw new Error(`${orphans} orphaned items found`);
    }
  }
}
