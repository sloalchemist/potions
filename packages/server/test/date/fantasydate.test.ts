import { FantasyDate, MINUTES_IN_HOUR } from '../../src/date/fantasyDate';
import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { pubSub } from '../../src/services/clientCommunication/pubsub';

beforeAll(() => {
  commonSetup();
});

describe('FantasyDate', () => {
  test('initial date should be 1/1/0', () => {
    // set global tick to 0 in DB
    FantasyDate.initialDate();

    let init_date = FantasyDate.currentDate();

    expect(init_date.day).toBe(1);
    expect(init_date.month).toBe(1);

    expect(init_date.year).toBe(0);
    expect(init_date.hour).toBe(0);
    expect(init_date.minute).toBe(0);
    expect(init_date.global_tick).toBe(0);
  });

  test('runTick should call pubSub.setDateTime when minute is 0', () => {
    // set global tick to a value that will result in minute being 0 after incrementing
    DB.prepare(`
      UPDATE ticks
      SET tick = ${MINUTES_IN_HOUR - 1}
    `).run();

    // mock pubSub.setDateTime to verify it's called
    const setDateTimeSpy = jest.spyOn(pubSub, 'setDateTime');

    // run the tick
    FantasyDate.runTick();

    // verify pubSub.setDateTime was called
    expect(setDateTimeSpy).toHaveBeenCalledTimes(1);
    expect(setDateTimeSpy).toHaveBeenCalledWith(FantasyDate.currentDate());
  });
});

afterAll(() => {
  DB.close();
});
