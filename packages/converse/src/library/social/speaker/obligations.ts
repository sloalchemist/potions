import { DB } from '../../database';
import { Item } from './item';
import { Speaker } from './speaker';

export class Obligations {
  private mob: Speaker;

  constructor(mob: Speaker) {
    this.mob = mob;
  }

  obligate(owed: Speaker, amount: number, item: Item, byTick: number) {
    DB.prepare(
      `
        INSERT INTO
        obligations (owed_id, owing_id, amount, item_id, by_tick)
        SELECT :owed_id, :owing_id, :amount, :item_id, tick + :by_tick
        FROM fantasy_date
        `
    ).run({
      owed_id: owed.id,
      owing_id: this.mob.id,
      amount,
      item_id: item.id,
      by_tick: byTick
    });
  }

  given(givenBy: Speaker, item: Item, amount: number): number {
    const obligation = DB.prepare(
      `
      SELECT id, amount
      FROM obligations
      WHERE owing_id = :owing_id AND owed_id = :owed_id AND item_id = :item_id
      `
    ).get({
      owing_id: this.mob.id,
      owed_id: givenBy.id,
      item_id: item.id
    }) as { id: string; amount: number } | undefined;

    if (!obligation) {
      return 0;
    }

    const deductedAmount = Math.min(obligation.amount, amount);
    const remainingAmount = obligation.amount - deductedAmount;

    if (remainingAmount > 0) {
      // Update the remaining amount in the obligations table
      DB.prepare(
        `
        UPDATE obligations
        SET amount = :remaining_amount
        WHERE id = :id
        `
      ).run({ remaining_amount: remainingAmount, id: obligation.id });
    } else {
      // Fulfill the obligation directly within the given method
      this.mob.relationships.modifyRelationship(givenBy, 10);
      DB.prepare(`DELETE FROM obligations WHERE id = :id`).run({
        id: obligation.id
      });
    }

    return deductedAmount;
  }

  tick() {
    // Fetch overdue obligations
    const overdueObligations = DB.prepare(
      `
      SELECT id, owed_id
      FROM obligations, fantasy_date
      WHERE owing_id = :owing_id AND by_tick <= tick
      `
    ).all({ owing_id: this.mob.id }) as { id: number; owed_id: string }[];

    if (overdueObligations.length === 0) {
      return;
    }

    // Extract obligation IDs
    const obligationIds = overdueObligations.map((obligation) => obligation.id);

    // Create placeholders for the query, e.g., (?, ?, ?)
    const placeholders = obligationIds.map(() => '?').join(', ');

    // Prepare and execute the DELETE statement
    const deleteStmt = DB.prepare(`
      DELETE FROM obligations
      WHERE id IN (${placeholders})
    `);
    deleteStmt.run(...obligationIds);

    // Update relationships for each overdue obligation
    const updateRelationship = DB.prepare(`
      UPDATE relationships 
      SET raw_affinity = raw_affinity + :delta
      WHERE noun_id = :mob_key AND with_noun_id = :with_mob
    `);

    for (const obligation of overdueObligations) {
      updateRelationship.run({
        mob_key: obligation.owed_id,
        with_mob: this.mob.id,
        delta: -20
      });
    }
  }
}
