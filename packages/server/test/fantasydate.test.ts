import { initializeServerDatabase } from '../src/services/database';
import { createTables } from '../src/generate/generateWorld';
import { FantasyDate } from '../src/date/fantasyDate';

describe('FantasyDate', () => {
  test('initial date should be 1/1/0', () => {
    // test setup
    // clear previous tests
    jest.clearAllMocks();

    // empty database
    initializeServerDatabase('data/test.db', true);
    // create headers/tables
    createTables();

    // set global tick to 0 in DB
    FantasyDate.initialDate();

    // get the current date from the currently stored tick value in DB (should be 0)
    // this constructs a FantasyDate object in which we set init_date equal to
    let init_date = FantasyDate.currentDate();

    // OUR BUG: this should construct a FantasyDate with day = 1 and month = 1 instead of 0 for better clarity
    // CURRENT: 0/0/0 0 'oclock
    // EXPECTED: 1/1/0 0'oclock
    // so that, our expected day and month would be 1 instead of 0
    expect(init_date.day).toBe(1);
    expect(init_date.month).toBe(1);
    // all other fields should be 0
    expect(init_date.year).toBe(0);
    expect(init_date.hour).toBe(0);
    expect(init_date.minute).toBe(0);
    expect(init_date.global_tick).toBe(0);
  });
});
