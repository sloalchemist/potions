import { DB } from '../database';

interface FantasyDate {
  date_description: string;
  tick: number;
}

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

export function set_current_date(date: FantasyDate) {
  DB.prepare(
    `
        UPDATE fantasy_date
        SET date_description = :date_description, tick = :tick
        `
  ).run({ date_description: date.date_description, tick: date.tick });
}
