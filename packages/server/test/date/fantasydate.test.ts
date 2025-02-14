import { FantasyDate, MINUTES_IN_HOUR } from '../../src/date/fantasyDate';
import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { pubSub } from '../../src/services/clientCommunication/pubsub';

beforeAll(() => {
  commonSetup();
});

describe('FantasyDate', () => {
  test('initial date should be 1/1/0', () => {
    FantasyDate.initialDate();
    const init_date = FantasyDate.currentDate();
    expect(init_date.day).toBe(1);
    expect(init_date.month).toBe(1);
    expect(init_date.year).toBe(0);
    expect(init_date.hour).toBe(0);
    expect(init_date.minute).toBe(0);
    expect(init_date.global_tick).toBe(0);
  });

  test('time should return the correct time', () => {
    const date = new FantasyDate(1, 1, 0, 3, 0, 0);
    expect(date.time()).toBe(3);
  });

  test('description should return the correct description for morning', () => {
    const date = new FantasyDate(2, 1, 0, 4, 0, 0);
    expect(date.description()).toBe("It's morning on a working day in spring. ");
  });

  test('description should return the correct description for mid-day', () => {
    const date = new FantasyDate(2, 1, 0, 6, 0, 0);
    expect(date.description()).toBe("It's mid-day on a working day in spring. ");
  });

  test('description should return the correct description for afternoon', () => {
    const date = new FantasyDate(2, 1, 0, 8, 0, 0);
    expect(date.description()).toBe(
      "It's afternoon on a working day in spring. "
    );
  });

  test('description should return the correct description for night-time', () => {
    const date = new FantasyDate(2, 1, 0, 11, 0, 0);
    expect(date.description()).toBe(
      "It's night-time on a working day in spring. "
    );
  });

  test('description should return the correct description for dusk', () => {
    const date = new FantasyDate(2, 1, 0, 10, 0, 0);
    expect(date.description()).toBe(
      "It's afternoon on a working day in spring. "
    );
  });

  test('description should return the correct description for dawn', () => {
    const date = new FantasyDate(2, 1, 0, 2, 0, 0);
    expect(date.description()).toBe(
      "It's night-time on a working day in spring. "
    );
  });

  test('description should return the correct description for holiday', () => {
    const date = new FantasyDate(1, 1, 0, 4, 0, 0);
    expect(date.description()).toBe("It's morning on a holiday in spring. ");
  });

  test('description should return the correct description for summer', () => {
    const date = new FantasyDate(2, 2, 0, 4, 0, 0);
    expect(date.description()).toBe("It's morning on a working day in summer. ");
  });

  test('description should return the correct description for fall', () => {
    const date = new FantasyDate(2, 3, 0, 4, 0, 0);
    expect(date.description()).toBe("It's morning on a working day in fall. ");
  });

  test('description should return the correct description for winter', () => {
    const date = new FantasyDate(2, 0, 0, 4, 0, 0);
    expect(date.description()).toBe(
      "It's morning on a working day in winter. "
    );
  });

  test('toString should return the correct string representation', () => {
    const date = new FantasyDate(1, 1, 0, 4, 0, 0);
    expect(date.toString()).toBe("1/1/0 4 o'clock");
  });

  test('runTick should call pubSub.setDateTime when minute is 0', () => {
    DB.prepare(`UPDATE ticks SET tick = ${MINUTES_IN_HOUR - 1}`).run();
    const setDateTimeSpy = jest.spyOn(pubSub, 'setDateTime');
    FantasyDate.runTick();
    expect(setDateTimeSpy).toHaveBeenCalledTimes(1);
    expect(setDateTimeSpy).toHaveBeenCalledWith(FantasyDate.currentDate());
  });
});

afterAll(() => {
  DB.close();
});
