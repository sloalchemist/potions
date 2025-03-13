import { Mob } from '../mobs/mob';
import { Community } from '../community/community';
import { pubSub } from '../services/clientCommunication/pubsub';
import { DB } from '../services/database';
import { Item } from './item';
import { logger } from '../util/logger';

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

  // Destroy carryable item on the server side
  destroy(): void {
    console.log(`Destroying carryable item ${this.item.id}`);
    this.item.destroy();
  }

  /**
   * Function implements the giving of an item from one mob to another.
   * Performs checks and updates favorability accordingly as well.

   * @param from Giver of the item
   * @param to Receiver of the item
   * @returns Either 1) False in which the transfer fails, or 2) True in which the transfer succeeds
   */
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

    // Perform favorite item check
    if (this.item.type === to._favorite_item) {
      var community_1 = from.community_id;
      var community_2 = to.community_id;

      // If the mob is given their favorite item, increase favorability by 25
      Community.adjustFavor(community_1, community_2, 25);

      // Randomize their next favorite item afterwards
      to.changeFavoriteItem();
    }

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

      if (!position) {
        console.log(
          `No valid position nearby to drop item ${this.item.id} for mob ${mob.id}. Destroying item.`
        );
        this.item.destroy();
        return;
      }

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

    if (!position) {
      console.log(
        `No valid position nearby to drop item ${this.item.id} for mob ${mob.id}. Stash canceled.`
      );
      return false; // Stop execution if no valid space is found
    }

    const carriedItem = mob.carrying;

    logger.log('stash hit');
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

      if (!position) {
        console.log(
          `No valid position nearby to drop item ${this.item.id} for mob ${mob.id}. Unstash canceled`
        );
        return; // Stop execution if no valid space is found
      }

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
    if (mob.carrying) {
      const carriedItem = mob.carrying;
      Carryable.fromItem(carriedItem)!.stash(mob);
    }
    DB.prepare(
      `
            UPDATE items
            SET stored_by = NULL
            WHERE id = :item_id AND stored_by = :mob_id;
            `
    ).run({ item_id: this.item.id, mob_id: mob.id });

    mob.carrying = this.item;
    this.item.position = undefined;

    pubSub.unstashItem(this.item.id, mob.id);
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
