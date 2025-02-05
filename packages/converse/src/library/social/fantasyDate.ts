import { DB } from '../database';

interface FantasyDate {
  date_description: string;
  tick: number;
}

/**
 * Gets the current in-game fantasy date from the database.
 *
 * @returns The current fantasy date.
 */
export function current_date(): FantasyDate {
  return DB.prepare(
    `
        SELECT
        date_description,
        tick
        FROM fantasy_date
        `
  ).get() as FantasyDate;
}

/**
 * Sets the current fantasy date in the database.
 *
 * @param date - The fantasy date to set.
 */
export function set_current_date(date: FantasyDate): void {
  DB.prepare(
    `
        UPDATE fantasy_date
        SET date_description = :date_description, tick = :tick
        `
  ).run({ date_description: date.date_description, tick: date.tick });
}
