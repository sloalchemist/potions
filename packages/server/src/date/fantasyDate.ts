import { pubSub } from '../services/clientCommunication/pubsub';
import { DB } from '../services/database';

export const MINUTES_IN_HOUR = 4 * 12;
export const HOURS_IN_DAY = 12;
export const DAYS_IN_MONTH = 12; // Holidays in last two days of every month
export const MONTHS_IN_YEAR = 4;

export class FantasyDate {
  day: number;
  month: number;
  year: number;

  hour: number;
  minute: number;

  global_tick: number;

  constructor(
    day: number,
    month: number,
    year: number,
    hour: number,
    minute: number,
    global_tick: number
  ) {
    this.day = day;
    this.month = month;
    this.year = year;
    this.hour = hour;
    this.minute = minute;
    this.global_tick = global_tick;
  }

  time(): number {
    return (this.hour * MINUTES_IN_HOUR + this.minute) / MINUTES_IN_HOUR;
  }

  toString(): string {
    return `${this.day}/${this.month}/${this.year} ${this.hour} o'clock`;
  }

  description(): string {
    let hourDescription = '';
    if (this.hour >= 3 && this.hour <= 5) {
      hourDescription = 'morning';
    } else if (this.hour > 5 && this.hour <= 7) {
      hourDescription = 'mid-day';
    } else if (this.hour > 7 && this.hour <= 10) {
      hourDescription = 'afternoon';
    } else if (this.hour >= 11 || this.hour <= 2) {
      hourDescription = 'night-time';
    } else if (this.hour > 10 && this.hour < 11) {
      hourDescription = 'dusk';
    } else if (this.hour > 2 && this.hour < 3) {
      hourDescription = 'dawn';
    }

    let dayDescription = '';
    if (this.day >= 2) {
      dayDescription = 'a working day';
    } else {
      dayDescription = 'a holiday';
    }

    let monthDescription = '';
    if (this.month == 0) {
      monthDescription = 'winter';
    } else if (this.month == 1) {
      monthDescription = 'spring';
    } else if (this.month == 2) {
      monthDescription = 'summer';
    } else {
      monthDescription = 'fall';
    }

    return `It's ${hourDescription} on ${dayDescription} in ${monthDescription}. `;
  }

  static currentDate(): FantasyDate {
    const tick = DB.prepare(
      `
            SELECT
            tick
            FROM ticks
            `
    ).get() as { tick: number };

    const minute = tick.tick % MINUTES_IN_HOUR;
    const hour = Math.floor(tick.tick / MINUTES_IN_HOUR) % HOURS_IN_DAY;
    const day =
      (Math.floor(tick.tick / (MINUTES_IN_HOUR * HOURS_IN_DAY)) %
        DAYS_IN_MONTH) +
      1;
    const month =
      (Math.floor(
        tick.tick / (MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_MONTH)
      ) %
        MONTHS_IN_YEAR) +
      1;
    const year = Math.floor(
      tick.tick /
        (MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_MONTH * MONTHS_IN_YEAR)
    );

    return new FantasyDate(day, month, year, hour, minute, tick.tick);
  }

  static runTick(): void {
    DB.prepare(
      `
            UPDATE ticks
            SET tick = tick + 1
            `
    ).run();

    const tick = DB.prepare(
      `
        SELECT tick FROM ticks;
      `
    ).get() as { tick: number };

    const minute = tick.tick % MINUTES_IN_HOUR;

    if (minute === 0) {
      pubSub.setDateTime(FantasyDate.currentDate());
    }
  }

  static initialDate(): void {
    DB.prepare(
      `
            INSERT INTO ticks
            (tick)
            VALUES
            (0);
            `
    ).run();
  }
}
